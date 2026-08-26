// Recursively collects all primitive values (string/number/boolean) from an object
// or array, flattening nested structures. Returns an array of lowercased strings.
// Used by API-response counters to scan for tokens (e.g. "aktiv", "elektronisch")
// without guessing the exact field name.
export function collectValues(obj) {
  const values = [];
  const walk = (v) => {
    if (v === null || v === undefined) return;
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
      values.push(String(v));
    } else if (Array.isArray(v)) {
      v.forEach(walk);
    } else if (typeof v === 'object') {
      Object.values(v).forEach(walk);
    }
  };
  walk(obj);
  return values.map((s) => s.toLowerCase());
}
