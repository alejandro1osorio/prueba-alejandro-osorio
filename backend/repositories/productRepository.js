import { pool, withTransaction } from "../config/db.js";

export async function listPaged({ offset, pageSize, filters, sort }) {
  const where = [];
  const params = [];

  // ✅ Filtros parametrizados (seguros)
  if (filters.search) {
    where.push("p.nombre LIKE ?");
    params.push(`%${filters.search}%`);
  }

  if (filters.idCategoria) {
    where.push("p.idCategoria = ?");
    params.push(filters.idCategoria);
  }

  if (Number.isFinite(filters.precioMin)) {
    where.push("p.precio >= ?");
    params.push(filters.precioMin);
  }

  if (Number.isFinite(filters.precioMax)) {
    where.push("p.precio <= ?");
    params.push(filters.precioMax);
  }

  if (filters.activo !== undefined) {
    where.push("p.activo = ?");
    params.push(filters.activo ? 1 : 0);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  // ✅ sort whitelist (evita inyección)
  const sortMap = {
    nombre: "p.nombre",
    precio: "p.precio",
    fechaCreacion: "p.fechaCreacion"
  };

  const safeSortBy = sortMap[sort?.sortBy] ? sort.sortBy : "fechaCreacion";
  const safeSortDir = String(sort?.sortDir).toLowerCase() === "asc" ? "ASC" : "DESC";

  const orderBy = `${sortMap[safeSortBy]} ${safeSortDir}`;

  // ✅ Blindaje total limit/offset (números) + clamp
  const safeLimit = Number.isFinite(Number(pageSize))
    ? Math.max(1, Math.min(100, parseInt(pageSize, 10)))
    : 10;

  const safeOffset = Number.isFinite(Number(offset))
    ? Math.max(0, parseInt(offset, 10))
    : 0;

  // total
  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS total FROM productos p ${whereSql}`,
    params
  );
  const total = Number(countRows[0]?.total || 0);

  // ✅ LIMIT/OFFSET incrustados como int (evita ER_WRONG_ARGUMENTS)
  const itemsSql = `
    SELECT
      p.idProducto,
      p.nombre,
      p.descripcion,
      p.sku,
      p.precio,
      p.stock,
      p.activo,
      p.fechaCreacion,
      p.fechaModificacion,
      p.idCategoria,
      c.nombre AS categoriaNombre
    FROM productos p
    INNER JOIN categorias c ON c.idCategoria = p.idCategoria
    ${whereSql}
    ORDER BY ${orderBy}
    LIMIT ${safeLimit} OFFSET ${safeOffset}
  `;

  const [items] = await pool.execute(itemsSql, params);

  return { items, total };
}

export async function getById(id) {
  const [rows] = await pool.execute(
    `
    SELECT
      p.idProducto,
      p.nombre,
      p.descripcion,
      p.sku,
      p.precio,
      p.stock,
      p.activo,
      p.fechaCreacion,
      p.fechaModificacion,
      p.idCategoria,
      c.nombre AS categoriaNombre
    FROM productos p
    INNER JOIN categorias c ON c.idCategoria = p.idCategoria
    WHERE p.idProducto = ?
    `,
    [id]
  );
  return rows[0] || null;
}

export async function create({ nombre, descripcion, sku, precio, stock, activo = true, idCategoria }) {
  const [result] = await pool.execute(
    `
    INSERT INTO productos (nombre, descripcion, sku, precio, stock, activo, idCategoria)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [nombre, descripcion || null, sku || null, precio, stock, activo ? 1 : 0, idCategoria]
  );
  return result.insertId;
}

export async function update(id, { nombre, descripcion, sku, precio, stock, activo = true, idCategoria }) {
  await pool.execute(
    `
    UPDATE productos
    SET nombre = ?, descripcion = ?, sku = ?, precio = ?, stock = ?, activo = ?, idCategoria = ?
    WHERE idProducto = ?
    `,
    [nombre, descripcion || null, sku || null, precio, stock, activo ? 1 : 0, idCategoria, id]
  );
}

export async function softDelete(id) {
  await pool.execute(`UPDATE productos SET activo = 0 WHERE idProducto = ?`, [id]);
}

export async function bulkInsertValidatingCategories(products) {
  if (!products.length) return { inserted: 0, failed: 0, errors: [] };

  return withTransaction(async (conn) => {
    const errors = [];
    let inserted = 0;
    let failed = 0;

    const categoryIds = [...new Set(products.map((p) => p.idCategoria))];
    const placeholders = categoryIds.map(() => "?").join(",");

    const [catRows] = await conn.execute(
      `SELECT idCategoria FROM categorias WHERE idCategoria IN (${placeholders})`,
      categoryIds
    );

    const existing = new Set(catRows.map((r) => r.idCategoria));

    for (let i = 0; i < products.length; i++) {
      const p = products[i];

      if (!existing.has(p.idCategoria)) {
        failed++;
        errors.push({ fila: i + 2, motivo: `IdCategoria no existe: ${p.idCategoria}` });
        continue;
      }

      try {
        await conn.execute(
          `
          INSERT INTO productos (nombre, descripcion, sku, precio, stock, activo, idCategoria)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          `,
          [p.nombre, p.descripcion || null, p.sku || null, p.precio, p.stock, p.activo ? 1 : 0, p.idCategoria]
        );
        inserted++;
      } catch (err) {
        failed++;
        errors.push({
          fila: i + 2,
          motivo: err?.code === "ER_DUP_ENTRY" ? "SKU duplicado" : "Error insertando fila"
        });
      }
    }

    return { inserted, failed, errors };
  });
}
