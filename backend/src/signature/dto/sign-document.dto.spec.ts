import { SignDocumentDto } from './sign-document.dto';

describe('SignDocumentDto', () => {
  it('should validate documentId and userId as UUIDs', () => {
    const dto = new SignDocumentDto();
    dto.documentId = '123e4567-e89b-12d3-a456-426614174000';
    dto.comment = 'This is a comment';

    expect(dto.documentId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it('should allow comment to be optional', () => {
    const dto = new SignDocumentDto();
    dto.documentId = '123e4567-e89b-12d3-a456-426614174000';
    dto.comment = undefined;

    expect(dto.comment).toBeUndefined();
  });

  it('should throw an error if documentId or userId is not a valid UUID', () => {
    const dto = new SignDocumentDto();
    dto.documentId = 'invalid-uuid';

    expect(() => {
      expect(dto.documentId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    }).toThrow();
  });

  it('should throw an error if documentId is not a valid UUID', () => {
    const dto = new SignDocumentDto();
    dto.documentId = 'invalid-uuid';

    expect(() => {
      expect(dto.documentId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    }).toThrow();
  });
});
