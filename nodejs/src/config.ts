export interface BruteforceConfig {
  baseUrl: string;
  loginUrl: string;
  userField: string;
  passField: string;
  submitField: string;
  submitValue: string;
  successMarkers: string[];
  idStart: number;
  idEnd: number;
  passStart: number;
  passEnd: number;
}

function numEnv(name: string, fallback: number): number {
  const v = process.env[name];
  if (v === undefined || v === '') return fallback;
  const n = Number(v);
  if (!Number.isFinite(n)) throw new Error(`Invalid number for ${name}`);
  return n;
}

export function loadConfig(): BruteforceConfig {
  const baseUrl = process.env.HBF_BASE_URL?.replace(/\/$/, '');
  if (!baseUrl) {
    throw new Error(
      'HBF_BASE_URL is required. Set only for systems you are authorized to test.',
    );
  }
  const markers =
    process.env.HBF_SUCCESS_MARKERS?.split(',').map((s) => s.trim()).filter(Boolean) ??
    ['dashboard'];

  return {
    baseUrl,
    loginUrl: process.env.HBF_LOGIN_URL ?? `${baseUrl}/`,
    userField: process.env.HBF_USER_FIELD ?? 'LoginId',
    passField: process.env.HBF_PASS_FIELD ?? 'LoginPassword',
    submitField: process.env.HBF_SUBMIT_FIELD ?? 'command',
    submitValue: process.env.HBF_SUBMIT_VALUE ?? 'SIGN IN',
    successMarkers: markers,
    idStart: numEnv('HBF_ID_START', 1000000000),
    idEnd: numEnv('HBF_ID_END', 1000000009),
    passStart: numEnv('HBF_PASS_START', 11111),
    passEnd: numEnv('HBF_PASS_END', 11115),
  };
}
