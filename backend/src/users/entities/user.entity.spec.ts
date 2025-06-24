import { User } from "./user.entity"

describe('User', () => {
    it('should create instance of user entity', () => {
        const user = new User();
        expect(user).toBeInstanceOf(User);
    })
})