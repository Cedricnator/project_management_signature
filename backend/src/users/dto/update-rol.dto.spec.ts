import { validateSync } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

describe('CreateUserDto', () => {
  it('should validate user data correctly', () => {
    const dto = new CreateUserDto();
    dto.firstName = 'John';
    dto.lastName = 'Doe';
    dto.password = 'strongpassword123';
    dto.email = 'john.doe@example.com';
    const errors = validateSync(dto);
    expect(errors.length).toBe(0);
  });
});
