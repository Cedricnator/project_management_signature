import { SignDocument } from "./account-document.entity"

describe('AccuntDocument', () => {
    it('should create instance of account document', () => {
        const signDocument = new SignDocument();
        expect(signDocument).toBeInstanceOf(SignDocument);
    })
})