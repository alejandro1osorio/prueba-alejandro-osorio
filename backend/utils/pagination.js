export function getPagination(query) {
  const page = Math.max(1, Number(query.page || 1));
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize || 10)));
  const offset = (page - 1) * pageSize;
  return { page, pageSize, offset };
}
