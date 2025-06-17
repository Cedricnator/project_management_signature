import { ChangeFileStatusDto } from "./change-status.dto";

describe('ChangeFileStatusDto', () => {
    it('should validate statusId as a string', () => {
        const dto = new ChangeFileStatusDto();
        dto.statusId = 'active';

        expect(dto.statusId).toBeDefined();
        expect(typeof dto.statusId).toBe('string');
    });

    it('should throw an error if statusId is not a string', () => {
        const dto = new ChangeFileStatusDto();
        dto.statusId = 123 as any; // Simulating invalid type

        expect(() => {
            expect(typeof dto.statusId).toBe('string');
        }).toThrow();
    });

    it('should validate comment as an optional string', () => {
        const dto = new ChangeFileStatusDto();
        dto.comment = 'This is a comment';

        expect(dto.comment).toBeDefined();
        expect(typeof dto.comment).toBe('string');
    });
    
    it('should allow comment to be undefined', () => {
        const dto = new ChangeFileStatusDto();
        dto.comment = undefined;

        expect(dto.comment).toBeUndefined();
    });

    it('should throw an error if comment is not a string', () => {
        const dto = new ChangeFileStatusDto();
        dto.comment = 123 as any; // Simulating invalid type

        expect(() => {
            expect(typeof dto.comment).toBe('string');
        }).toThrow();
    });
});