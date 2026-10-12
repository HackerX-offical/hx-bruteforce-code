import { isLoginSuccess } from './loginSuccess';

describe('isLoginSuccess', () => {
  it('detects marker in URL', () => {
    expect(isLoginSuccess('https://lab.example/mobiledashboard', '', 200, ['mobiledashboard'])).toBe(
      true,
    );
  });

  it('returns false for obvious login page', () => {
    expect(
      isLoginSuccess('https://lab.example/login', '<form>sign in</form>', 200, ['dashboard']),
    ).toBe(false);
  });
});
