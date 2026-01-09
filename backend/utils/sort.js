export function getSort(query, allowed, defaultSort = { sortBy: "fechaCreacion", sortDir: "desc" }) {
  const sortBy = String(query.sortBy || defaultSort.sortBy);
  let sortDir = String(query.sortDir || defaultSort.sortDir).toLowerCase();

  if (!allowed.includes(sortBy)) return defaultSort;
  if (sortDir !== "asc" && sortDir !== "desc") sortDir = defaultSort.sortDir;

  return { sortBy, sortDir };
}
