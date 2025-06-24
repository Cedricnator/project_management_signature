import { DocumentStatusType } from "./document_status_type.entity"

describe('DocumentStatustType', () => {
    it('should create a new document status type', () => {
        const documentStatusType = new DocumentStatusType();
        expect(documentStatusType).toBeDefined()
    })

    it('should create properties', () => {
        const documentStatusType = new DocumentStatusType();

        const testId = crypto.randomUUID();
        const status = 'Pendiente';
        const createdAt = new Date();
        const updatedAt = new Date();

        documentStatusType.id = testId;
        documentStatusType.status = status;
        documentStatusType.createdAt = createdAt;
        documentStatusType.updatedAt = updatedAt;

        expect(documentStatusType.id).toBe(testId);
        expect(documentStatusType.status).toBe(status);
        expect(documentStatusType.createdAt).toBe(createdAt);
        expect(documentStatusType.updatedAt).toBe(updatedAt);
    });
}) 