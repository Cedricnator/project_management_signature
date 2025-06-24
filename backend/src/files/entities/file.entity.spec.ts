import { File } from "./file.entity";

describe('FileEntity', () => {
    it('should create a instance of file', () => {
        const file = new File();
        expect(file).toBeDefined();
        expect(file).toBeInstanceOf(File);
    });
})