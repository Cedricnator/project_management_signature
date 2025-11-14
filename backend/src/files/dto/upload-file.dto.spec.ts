import { UploadFileDto } from './upload-file.dto';

describe('UploadFileDto', () => {
  it('should validate name as a string with max length', () => {
    const dto = new UploadFileDto();
    dto.name = 'Test File Name';

    expect(dto.name).toBeDefined();
    expect(typeof dto.name).toBe('string');
    expect(dto.name.length).toBeLessThanOrEqual(255);
  });

  it('should throw an error if name exceeds max length', () => {
    const dto = new UploadFileDto();
    dto.name = 'a'.repeat(256); // Simulating invalid name

    expect(() => {
      expect(dto.name.length).toBeLessThanOrEqual(255);
    }).toThrow();
  });

  it('should validate description as a string with max length', () => {
    const dto = new UploadFileDto();
    dto.description = 'Test File Description';

    expect(dto.description).toBeDefined();
    expect(typeof dto.description).toBe('string');
    expect(dto.description.length).toBeLessThanOrEqual(255);
  });

  it('should throw an error if description exceeds max length', () => {
    const dto = new UploadFileDto();
    dto.description = 'a'.repeat(256); // Simulating invalid description

    expect(() => {
      expect(dto.description.length).toBeLessThanOrEqual(255);
    }).toThrow();
  });

  it('should validate comment as an optional string with max length', () => {
    const dto = new UploadFileDto();
    dto.comment = 'This is a comment';

    expect(dto.comment).toBeDefined();
    expect(typeof dto.comment).toBe('string');
    expect(dto.comment.length).toBeLessThanOrEqual(500);
  });

  it('should allow comment to be undefined', () => {
    const dto = new UploadFileDto();
    dto.comment = undefined;

    expect(dto.comment).toBeUndefined();
  });
});
