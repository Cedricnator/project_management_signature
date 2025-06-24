import { UserResponseDto } from "./user-response.dto"

describe('UserResponseDTO', () => {
    it('should create instance of user response dto', () => {
        const userResponseDto = new UserResponseDto();
        expect(userResponseDto).toBeInstanceOf(UserResponseDto);
    })
})