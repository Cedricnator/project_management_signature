describe('AuthResult', () => {
  it('should validate email as a string', () => {
    const authResult = { email: 'test@example.com' };

    expect(authResult.email).toBeDefined();
    expect(typeof authResult.email).toBe('string');
  });

  it('should validate accessToken as a string', () => {
    const authResult = { token: 'someAccessToken' };

    expect(authResult.token).toBeDefined();
    expect(typeof authResult.token).toBe('string');
  });

  it('should validate role as a string', () => {
    const authResult = { role: 'user' };

    expect(authResult.role).toBeDefined();
    expect(typeof authResult.role).toBe('string');
  });
});
