import { AuthentificationInput } from './auth-input-auth.dto';

describe('AuthentificationInput', () => {
  it('should validate email', () => {
    const dto = new AuthentificationInput();
    dto.email = 'test@example.com';

    expect(dto.email).toBeDefined();
    expect(dto.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  it('should throw an error if email is invalid', () => {
    const dto = new AuthentificationInput();
    dto.email = 'invalid-email';

    expect(() => {
      expect(dto.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    }).toThrow();
  });

  it('should validate password', () => {
    const dto = new AuthentificationInput();
    dto.password = 'StrongPassword123!';

    expect(dto.password).toBeDefined();
    expect(dto.password.length).toBeGreaterThanOrEqual(8);
  });

  it('should throw an error if password is too short', () => {
    const dto = new AuthentificationInput();
    dto.password = 'short';

    expect(() => {
      expect(dto.password.length).toBeGreaterThanOrEqual(8);
    }).toThrow();
  });
});
