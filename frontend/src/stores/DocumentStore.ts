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
import {
    responseToDocumentHistory,
    type UserHistoryResponseDto,
} from './dto/UserHistoryResponseDto'
import { DocumentHistoryResponse } from './dto/DocumentHistoryResponseDto'

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
            try {
                const response = await api.get<DocumentHistoryResponse>(
                    `${API_ROUTE}/files/${documentId}/history`,
                )
                logger.info('[DOC_HISTORY]', 'response: ', response)

                if (response.status == 200) {
                    const documentHistory: DocumentHistory[] = DocumentHistoryResponse.fromJson(
                        response.data,
                    ).toDocumentHistory()
                    return {
                        success: true,
                        message: 'Historial obtenido con éxito',
                        data: documentHistory,
                        type: ToastType.success,
                    } as Result<DocumentHistory[]>
                }
                return {
                    success: false,
                    message: response.statusText,
                    type: ToastType.warning,
                } as Result<DocumentHistory[]>
            } catch (error: any) {
                logger.error('[UPDATE_DOC]', error)
                return {
                    success: false,
                    message: error.message,
                    type: ToastType.error,
                } as Result<DocumentHistory[]>
            }
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



