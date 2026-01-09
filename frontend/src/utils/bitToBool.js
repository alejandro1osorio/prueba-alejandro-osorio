export function bitToBool(value) {
  if (value === null || value === undefined) return false;

  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;

  // Buffer serializado por JSON: { type: 'Buffer', data: [0|1] }
  if (typeof value === "object" && Array.isArray(value.data)) {
    return value.data[0] === 1;
  }

  // Strings
  const v = String(value).toLowerCase().trim();
  return v === "1" || v === "true" || v === "yes";
}
