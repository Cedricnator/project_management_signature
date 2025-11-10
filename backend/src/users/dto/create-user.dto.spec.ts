import { validateSync } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

describe('CreateUserDto', () => {
  it('should valite user data', () => {
    const userDto = new CreateUserDto();
    userDto.firstName = 'John';
    userDto.lastName = 'Doe';
    userDto.password = 'strongpassword123';
    userDto.email = 'john.doe@example.com';

    const errors = validateSync(userDto);
    expect(errors.length).toBe(0);
  });
});
