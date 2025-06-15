
/**
 * Split label field input ('name,label', "name-label", "name label", "name_label", etc.)
 * and join the fields for a node/edge using its attributes.
 */
export function resolveLabel(joinFieldStr: string, attributes: Record<string, any>, fallback: string): string {
  if (!joinFieldStr || typeof joinFieldStr !== "string") return fallback;
  // Split on comma, dash, underscore, or whitespace
  const fields = joinFieldStr.split(/[\s,\\-_]+/).filter(Boolean);
  if (!fields.length) return fallback;
  const values = fields.map(f => {
    // Try exact attribute, else empty
    const v = attributes && (attributes[f] !== undefined ? attributes[f] : attributes[f.toLowerCase()]);
    return v !== undefined && v !== null && String(v).length > 0 ? String(v) : "";
  }).filter(v => v !== "");
  return values.length ? values.join(" ") : fallback;
}
