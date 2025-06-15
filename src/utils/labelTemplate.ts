
/**
 * Access a nested property in an object using a dot-separated string.
 * e.g., get(obj, 'a.b.c') -> obj.a.b.c
 */
function get(obj: Record<string, any>, path: string, def: any = undefined): any {
  if (!obj) return def;
  const fullPath = path
    .replace(/\[/g, '.')
    .replace(/]/g, '')
    .split('.')
    .filter(Boolean);

  let current = obj;
  for (const step of fullPath) {
    if (current === undefined || current === null) return def;
    current = current[step];
  }
  return current !== undefined ? current : def;
}


/**
 * Replaces placeholders in a template string with values from an object.
 * Placeholders are in the format {key} or {nested.key}.
 * If a key is not found, it is replaced with an empty string.
 *
 * @param template The template string, e.g., "Node: {label} ({id})"
 * @param data The object containing values to substitute.
 * @param fallback A fallback string to return if the resolved template is empty.
 * @returns The resolved string.
 */
export function resolveLabelTemplate(
  template: string,
  data: Record<string, any>,
  fallback: string
): string {
  if (!template || typeof template !== "string") return fallback;

  const resolved = template.replace(/\{([^}]+)\}/g, (match, key) => {
    const value = get(data, key.trim());
    return value !== undefined && value !== null ? String(value) : "";
  });

  return resolved.trim() ? resolved : fallback;
}
