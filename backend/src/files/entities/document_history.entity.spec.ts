import { DocumentHistory } from './document_history.entity';
import { File } from './file.entity';
import { DocumentStatusType } from './document_status_type.entity';
import 'reflect-metadata';

describe('DocumentHistory Entity', () => {
  describe('Instance Creation', () => {
    it('should create an instance of DocumentHistory', () => {
      const documentHistory = new DocumentHistory();
      
      expect(documentHistory).toBeInstanceOf(DocumentHistory);
      expect(documentHistory).toBeDefined();
    });

    it('should allow setting properties', () => {
      const documentHistory = new DocumentHistory();
      const testId = '123e4567-e89b-12d3-a456-426614174000';
      const testComment = 'Test comment';
      const testDate = new Date();

      documentHistory.id = testId;
      documentHistory.documentId = testId;
      documentHistory.statusId = testId;
      documentHistory.changedBy = testId;
      documentHistory.comment = testComment;
      documentHistory.createdAt = testDate;
      documentHistory.updatedAt = testDate;

      expect(documentHistory.id).toBe(testId);
      expect(documentHistory.documentId).toBe(testId);
      expect(documentHistory.statusId).toBe(testId);
      expect(documentHistory.changedBy).toBe(testId);
      expect(documentHistory.comment).toBe(testComment);
      expect(documentHistory.createdAt).toBe(testDate);
      expect(documentHistory.updatedAt).toBe(testDate);
    });

    it('should allow setting relationship objects', () => {
      const documentHistory = new DocumentHistory();
      const mockFile = new File();
      const mockStatus = new DocumentStatusType();

      documentHistory.document = mockFile;
      documentHistory.status = mockStatus;

      expect(documentHistory.document).toBe(mockFile);
      expect(documentHistory.status).toBe(mockStatus);
    });
  });

  describe('Entity Metadata', () => {
    it('should have primary key metadata', () => {
      const keys = Reflect.getMetadataKeys(DocumentHistory.prototype, 'id');
      expect(keys.length).toBeGreaterThan(0);
    });

    it('should have column metadata for all properties', () => {
      const properties = ['documentId', 'statusId', 'changedBy', 'comment', 'createdAt', 'updatedAt'];
      
      properties.forEach(property => {
        const keys = Reflect.getMetadataKeys(DocumentHistory.prototype, property);
        expect(keys.length).toBeGreaterThan(0);
      });
    });

    it('should have relationship metadata', () => {
      const documentKeys = Reflect.getMetadataKeys(DocumentHistory.prototype, 'document');
      const statusKeys = Reflect.getMetadataKeys(DocumentHistory.prototype, 'status');
      
      expect(documentKeys.length).toBeGreaterThan(0);
      expect(statusKeys.length).toBeGreaterThan(0);
    });
  });

  describe('Property Types', () => {
    it('should have correct property types', () => {
      const documentHistory = new DocumentHistory();
      
      // Test string properties
      documentHistory.id = 'test-id';
      documentHistory.documentId = 'test-document-id';
      documentHistory.statusId = 'test-status-id';
      documentHistory.changedBy = 'test-changed-by';
      documentHistory.comment = 'test-comment';
      
      expect(typeof documentHistory.id).toBe('string');
      expect(typeof documentHistory.documentId).toBe('string');
      expect(typeof documentHistory.statusId).toBe('string');
      expect(typeof documentHistory.changedBy).toBe('string');
      expect(typeof documentHistory.comment).toBe('string');
    });

    it('should handle Date properties', () => {
      const documentHistory = new DocumentHistory();
      const testDate = new Date();
      
      documentHistory.createdAt = testDate;
      documentHistory.updatedAt = testDate;
      
      expect(documentHistory.createdAt).toBeInstanceOf(Date);
      expect(documentHistory.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Entity Structure', () => {
    it('should have all required properties defined', () => {
      const documentHistory = new DocumentHistory();
      const requiredProperties = [
        'id', 'documentId', 'statusId', 'changedBy', 
        'comment', 'createdAt', 'updatedAt', 'document', 'status'
      ];

      requiredProperties.forEach(property => {
        expect(documentHistory.hasOwnProperty(property) || property in documentHistory).toBeTruthy();
      });
    });

    it('should be serializable', () => {
      const documentHistory = new DocumentHistory();
      documentHistory.id = 'test-id';
      documentHistory.documentId = 'test-document-id';
      documentHistory.statusId = 'test-status-id';
      documentHistory.changedBy = 'test-user-id';
      documentHistory.comment = 'test comment';
      documentHistory.createdAt = new Date();
      documentHistory.updatedAt = new Date();

      expect(() => JSON.stringify(documentHistory)).not.toThrow();
      
      const serialized = JSON.stringify(documentHistory);
      expect(serialized).toContain('test-id');
      expect(serialized).toContain('test comment');
    });
  });
});