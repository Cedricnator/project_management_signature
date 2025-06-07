import { DocumentStatus, type Document } from '@/types'
import { defineStore } from 'pinia'

export const useDocumentStore = defineStore('document', {
    state: () => ({
        documents: [] as Document[],
    }),
    actions: {
        async getAllDocuments() {
            this.documents = mockDocuments()
        },

        async getDocumentByDocumentId(documentId: number) {},
    },
})

function mockDocuments(): Document[] {
    const documents: Document[] = [
        {
            documentId: 1,
            documentName: 'Contrato',
            state: DocumentStatus.valid,
            createdBy: 1,
            validatedBy: 2,
        },
        {
            documentId: 2,
            documentName: 'Informe',
            state: DocumentStatus.invalid,
            createdBy: 1,
            validatedBy: null,
        },
        {
            documentId: 3,
            documentName: 'Factura',
            state: DocumentStatus.valid,
            createdBy: 1,
            validatedBy: 3,
        },
        {
            documentId: 4,
            documentName: 'Contrato',
            state: DocumentStatus.invalid,
            createdBy: 1,
            validatedBy: null,
        },
        {
            documentId: 5,
            documentName: 'Informe',
            state: DocumentStatus.valid,
            createdBy: 1,
            validatedBy: 4,
        },
        {
            documentId: 6,
            documentName: 'Factura',
            state: DocumentStatus.invalid,
            createdBy: 1,
            validatedBy: null,
        },
        {
            documentId: 7,
            documentName: 'Acta',
            state: DocumentStatus.valid,
            createdBy: 1,
            validatedBy: 2,
        },
        {
            documentId: 8,
            documentName: 'Contrato',
            state: DocumentStatus.valid,
            createdBy: 1,
            validatedBy: 2,
        },
        {
            documentId: 9,
            documentName: 'Informe',
            state: DocumentStatus.invalid,
            createdBy: 1,
            validatedBy: null,
        },
        {
            documentId: 10,
            documentName: 'Factura',
            state: DocumentStatus.valid,
            createdBy: 1,
            validatedBy: 3,
        },
        {
            documentId: 11,
            documentName: 'Acta',
            state: DocumentStatus.invalid,
            createdBy: 1,
            validatedBy: null,
        },
        {
            documentId: 12,
            documentName: 'Contrato',
            state: DocumentStatus.valid,
            createdBy: 1,
            validatedBy: 1,
        },
        {
            documentId: 13,
            documentName: 'Informe',
            state: DocumentStatus.invalid,
            createdBy: 1,
            validatedBy: null,
        },
        {
            documentId: 14,
            documentName: 'Factura',
            state: DocumentStatus.valid,
            createdBy: 1,
            validatedBy: 4,
        },
        {
            documentId: 15,
            documentName: 'Acta',
            state: DocumentStatus.invalid,
            createdBy: 1,
            validatedBy: null,
        },
        {
            documentId: 16,
            documentName: 'Contrato',
            state: DocumentStatus.valid,
            createdBy: 1,
            validatedBy: 2,
        },
        {
            documentId: 17,
            documentName: 'Informe',
            state: DocumentStatus.invalid,
            createdBy: 1,
            validatedBy: null,
        },
        {
            documentId: 18,
            documentName: 'Factura',
            state: DocumentStatus.valid,
            createdBy: 1,
            validatedBy: 3,
        },
        {
            documentId: 19,
            documentName: 'Acta',
            state: DocumentStatus.invalid,
            createdBy: 1,
            validatedBy: null,
        },
        {
            documentId: 20,
            documentName: 'Contrato',
            state: DocumentStatus.valid,
            createdBy: 1,
            validatedBy: 2,
        },
    ]
    return documents
}
