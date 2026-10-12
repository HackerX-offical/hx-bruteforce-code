export interface CredentialPair {
  userId: string;
  password: string;
}

export interface CheckpointData {
  currentUserId: number;
  currentPassword: number;
  totalTested: number;
  foundCredentials: CredentialPair[];
  lastUpdated: string;
}

export function parseCheckpoint(raw: string): CheckpointData {
  const data = JSON.parse(raw) as Partial<CheckpointData>;
  return {
    currentUserId: data.currentUserId ?? 0,
    currentPassword: data.currentPassword ?? 0,
    totalTested: data.totalTested ?? 0,
    foundCredentials: data.foundCredentials ?? [],
    lastUpdated: data.lastUpdated ?? new Date(0).toISOString(),
  };
}

export function serializeCheckpoint(data: CheckpointData): string {
  return JSON.stringify(data, null, 4);
}
