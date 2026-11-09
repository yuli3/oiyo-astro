/** True when the browser can create a WebGL context (kept out of the lazy 3D chunk so the check costs nothing). */
export function canUseWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}
