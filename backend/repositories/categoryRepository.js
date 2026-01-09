import { pool } from "../config/db.js";

export async function list({ activo } = {}) {
  const where = [];
  const params = [];

  if (activo !== undefined) {
    where.push("activo = ?");
    params.push(activo ? 1 : 0);
  }

  const sql = `
    SELECT idCategoria, nombre, descripcion, activo, fechaCreacion, fechaModificacion
    FROM categorias
    ${where.length ? "WHERE " + where.join(" AND ") : ""}
    ORDER BY nombre ASC
  `;

  const [rows] = await pool.execute(sql, params);
  return rows;
}

export async function getById(id) {
  const [rows] = await pool.execute(
    `SELECT idCategoria, nombre, descripcion, activo, fechaCreacion, fechaModificacion
     FROM categorias WHERE idCategoria = ?`,
    [id]
  );
  return rows[0] || null;
}

export async function findByName(nombre) {
  const [rows] = await pool.execute(
    `SELECT idCategoria, nombre FROM categorias WHERE nombre = ? LIMIT 1`,
    [nombre]
  );
  return rows[0] || null;
}

export async function create({ nombre, descripcion = null, activo = true }) {
  const [result] = await pool.execute(
    `INSERT INTO categorias (nombre, descripcion, activo) VALUES (?, ?, ?)`,
    [nombre, descripcion || null, activo ? 1 : 0]
  );
  return result.insertId;
}

export async function update(id, { nombre, descripcion = null, activo = true }) {
  await pool.execute(
    `UPDATE categorias SET nombre = ?, descripcion = ?, activo = ? WHERE idCategoria = ?`,
    [nombre, descripcion || null, activo ? 1 : 0, id]
  );
}

export async function softDelete(id) {
  await pool.execute(`UPDATE categorias SET activo = 0 WHERE idCategoria = ?`, [id]);
}
