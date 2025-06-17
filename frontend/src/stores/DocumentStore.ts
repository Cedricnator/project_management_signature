import { mockDocumentHistory, mockDocuments } from '@/components/mocks/mocks'
import {
    DocumentStatus,
    type Document,
    type DocumentHistory,
    type ProcededDocument,
    type Result,
    type UploadDocumentDto,
} from '@/types'
import { logger } from '@/utils/logger'
import { defineStore } from 'pinia'
import { useSessionStore } from './SessionStore'
import { API_ROUTE } from '@/utils/const'
import axios from 'axios'
import type { UploadDocumentResponseDto } from './dto/UploadDocumentResultDto'
import { useUserStore } from './UserStore'

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
            return new File(['something something'], 'contrato.pdf', { type: 'application/pdf' })
        },

        

        async processDocument(processedDocument: ProcededDocument) {
            logger.info('[DOC_STORE]', 'Processed document: ', processedDocument)
            return { success: true, message: 'Documento procesado con éxito' } as Result
        },
    },
})



