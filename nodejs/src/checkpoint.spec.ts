import { parseCheckpoint, serializeCheckpoint } from './checkpoint';

describe('checkpoint', () => {
  it('round-trips checkpoint JSON', () => {
    const data = {
      currentUserId: 42,
      currentPassword: 100,
      totalTested: 99,
      foundCredentials: [{ userId: 'u', password: 'p' }],
      lastUpdated: '2026-01-01T00:00:00.000Z',
    };
    const back = parseCheckpoint(serializeCheckpoint(data));
    expect(back).toEqual(data);
  });

  it('fills defaults for partial JSON', () => {
    const back = parseCheckpoint('{}');
    expect(back.totalTested).toBe(0);
    expect(back.foundCredentials).toEqual([]);
  });
});
