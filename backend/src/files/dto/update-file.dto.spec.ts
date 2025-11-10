import { UpdateFileDto } from './update-file.dto';

describe('UpdateFileDto', () => {
  it('should validate name', () => {
    const dto = new UpdateFileDto();
    dto.name = 'Updated File Name';

    expect(dto.name).toBeDefined();
    expect(dto.name).toBe('Updated File Name');
  });

  it('should validate description', () => {
    const dto = new UpdateFileDto();
    dto.description = 'Updated File Description';

    expect(dto.description).toBeDefined();
    expect(dto.description).toBe('Updated File Description');
  });

  it('should validate comment', () => {
    const dto = new UpdateFileDto();
    dto.comment = 'Updated File Comment';

    expect(dto.comment).toBeDefined();
    expect(dto.comment).toBe('Updated File Comment');
  });

  it('should allow name, description, and comment to be optional', () => {
    const dto = new UpdateFileDto();
    dto.name = undefined;
    dto.description = undefined;
    dto.comment = undefined;

    expect(dto.name).toBeUndefined();
    expect(dto.description).toBeUndefined();
    expect(dto.comment).toBeUndefined();
  });
});
