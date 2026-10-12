/** Heuristic success detection for lab/login forms — configurable markers only. */
export function isLoginSuccess(
  responseUrl: string,
  body: string | undefined,
  status: number,
  successMarkers: string[],
): boolean {
  const markers = successMarkers.length > 0 ? successMarkers : ['dashboard'];
  const urlLower = responseUrl.toLowerCase();
  for (const m of markers) {
    if (urlLower.includes(m.toLowerCase())) return true;
  }
  if (body && typeof body === 'string') {
    const bodyLower = body.toLowerCase();
    for (const m of markers) {
      if (bodyLower.includes(m.toLowerCase())) return true;
    }
    if (status === 200 && !bodyLower.includes('login') && !bodyLower.includes('sign in')) {
      return true;
    }
  }
  return false;
}
