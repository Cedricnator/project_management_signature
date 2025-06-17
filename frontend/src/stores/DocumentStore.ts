import { mockDocumentHistory, mockDocuments } from '@/components/mocks/mocks'
import {
    DocumentStatus,
    type Document as CustomDocument,
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
import api from '@/utils/axios'
import { ToastType } from './ToastStore'

export const useDocumentStore = defineStore('document', {
    state: () => ({
        documents: [] as CustomDocument[],
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

        async getFileByDocumentId(currentDocument: CustomDocument) {
            try {
                const response = await api.get(
                    `${API_ROUTE}/files/${currentDocument.documentId}/download`,
                    {
                        responseType: 'blob',
                    },
                )
                logger.info('[GET_DOC]', 'response: ', response)

                if (response.status == 200) {
                    // Best‑effort MIME from server, fallback to PDF
                    const mime = response.headers['content-type'] ?? 'application/pdf'
                    const file = new File([response.data], `${currentDocument.documentName}.pdf`, {
                        type: mime,
                        lastModified: Date.now(),
                    })
                    return {
                        success: true,
                        message: 'Documento obtenido con éxito',
                        data: file,
                        type: ToastType.success,
                    } as Result<File>
                }
                return {
                    success: false,
                    message: response.statusText,
                    type: ToastType.warning,
                } as Result<File>
            } catch (error: any) {
                logger.error('[UPDATE_DOC]', error)
                return {
                    success: false,
                    message: error.message,
                    type: ToastType.error,
                } as Result<File>
            }
        },

        async processDocument(processedDocument: ProcededDocument) {
            logger.info('[DOC_STORE]', 'Processed document: ', processedDocument)
            return { success: true, message: 'Documento procesado con éxito' } as Result
        },
    },
})



