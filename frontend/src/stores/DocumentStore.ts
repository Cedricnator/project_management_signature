import { mockDocumentHistory, mockDocuments } from '@/components/mocks/mocks'
import {
    DocumentStatus,
    type Document,
    type DocumentHistory,
    type Result,
    type UploadDocumentDto,
} from '@/types'
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

        async getFileByDocumentId(documentId: string) {
            return new File([''], 'contrato.pdf')
        },

        async uploadDocument(uploadDocumentDto: UploadDocumentDto, file: File) {
            return { success: true, message: 'Documento subido con éxito' } as Result
        },
    },
})



