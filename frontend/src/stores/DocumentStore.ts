import { DocumentStatus, type Document, type DocumentHistory, type UploadDocumentDto } from '@/types'
import { defineStore } from 'pinia'

export const useDocumentStore = defineStore('document', {
    state: () => ({
        documents: [] as Document[],
    }),
    actions: {
        async getAllDocuments() {
            this.documents = mockDocuments()
        },

        async getDocumentByDocumentId(documentId: string) {},

        async getDocumentHistoryByDocumentId(documentId: string) {
            return mockDocumentHistory().sort(
                (a, b) => b.createdAt.getDate() - a.createdAt.getDate(),
            )
        },

        async uploadDocument(uploadDocumentDto: UploadDocumentDto, file: File){
            // dosomething
        }
    },
})

function mockDocumentHistory() {
    const documentHistory: DocumentHistory[] = [
        {
            documentHistoryId: 'dh-001',
            documentId: 'd-001',
            changedBy: 'user-001',
            action: DocumentStatus.valid,
            createdAt: new Date('2025-06-01T10:00:00Z'),
            commentary: 'Initial validation successful.',
        },
        {
            documentHistoryId: 'dh-002',
            documentId: 'd-001',
            changedBy: 'user-002',
            action: DocumentStatus.invalid,
            createdAt: new Date('2025-06-02T12:00:00Z'),
            commentary: 'Missing signature.',
        },
        {
            documentHistoryId: 'dh-003',
            documentId: 'd-001',
            changedBy: 'user-001',
            action: DocumentStatus.valid,
            createdAt: new Date('2025-06-03T14:00:00Z'),
            commentary: 'Approved by manager.',
        },
        {
            documentHistoryId: 'dh-004',
            documentId: 'd-001',
            changedBy: 'user-003',
            action: DocumentStatus.invalid,
            createdAt: new Date('2025-06-03T15:00:00Z'),
            commentary: 'Wrong document format.',
        },
        {
            documentHistoryId: 'dh-005',
            documentId: 'd-003',
            changedBy: 'user-001',
            action: DocumentStatus.valid,
            createdAt: new Date('2025-06-04T09:00:00Z'),
        },
    ]
    return documentHistory
}

function mockDocuments(): Document[] {
    const documents: Document[] = [
        {
            documentId: '1',
            documentName: 'Contrato',
            state: DocumentStatus.valid,
            createdBy: '1',
            validatedBy: '2',
        },
        {
            documentId: '2',
            documentName: 'Informe',
            state: DocumentStatus.invalid,
            createdBy: '1',
            validatedBy: null,
        },
        {
            documentId: '3',
            documentName: 'Factura',
            state: DocumentStatus.valid,
            createdBy: '1',
            validatedBy: '3',
        },
        {
            documentId: '4',
            documentName: 'Contrato',
            state: DocumentStatus.invalid,
            createdBy: '1',
            validatedBy: null,
        },
        {
            documentId: '5',
            documentName: 'Informe',
            state: DocumentStatus.valid,
            createdBy: '1',
            validatedBy: '4',
        },
        {
            documentId: '6',
            documentName: 'Factura',
            state: DocumentStatus.invalid,
            createdBy: '1',
            validatedBy: null,
        },
        {
            documentId: '7',
            documentName: 'Acta',
            state: DocumentStatus.valid,
            createdBy: '1',
            validatedBy: '2',
        },
        {
            documentId: '8',
            documentName: 'Contrato',
            state: DocumentStatus.valid,
            createdBy: '1',
            validatedBy: '2',
        },
        {
            documentId: '9',
            documentName: 'Informe',
            state: DocumentStatus.invalid,
            createdBy: '1',
            validatedBy: null,
        },
        {
            documentId: '10',
            documentName: 'Factura',
            state: DocumentStatus.valid,
            createdBy: '1',
            validatedBy: '3',
        },
        {
            documentId: '11',
            documentName: 'Acta',
            state: DocumentStatus.invalid,
            createdBy: '1',
            validatedBy: null,
        },
        {
            documentId: '12',
            documentName: 'Contrato',
            state: DocumentStatus.valid,
            createdBy: '1',
            validatedBy: '1',
        },
        {
            documentId: '13',
            documentName: 'Informe',
            state: DocumentStatus.invalid,
            createdBy: '1',
            validatedBy: null,
        },
        {
            documentId: '14',
            documentName: 'Factura',
            state: DocumentStatus.valid,
            createdBy: '1',
            validatedBy: '4',
        },
        {
            documentId: '15',
            documentName: 'Acta',
            state: DocumentStatus.invalid,
            createdBy: '1',
            validatedBy: null,
        },
        {
            documentId: '16',
            documentName: 'Contrato',
            state: DocumentStatus.valid,
            createdBy: '1',
            validatedBy: '2',
        },
        {
            documentId: '17',
            documentName: 'Informe',
            state: DocumentStatus.invalid,
            createdBy: '1',
            validatedBy: null,
        },
        {
            documentId: '18',
            documentName: 'Factura',
            state: DocumentStatus.valid,
            createdBy: '1',
            validatedBy: '3',
        },
        {
            documentId: '19',
            documentName: 'Acta',
            state: DocumentStatus.invalid,
            createdBy: '1',
            validatedBy: null,
        },
        {
            documentId: '20',
            documentName: 'Contrato',
            state: DocumentStatus.valid,
            createdBy: '1',
            validatedBy: '2',
        },
    ]
    return documents
}
