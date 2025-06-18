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
import {
    documentResponseToDocument,
    type GetDocumentResponseDto,
} from './dto/GetDocumentResponseDto'
import { RejectDocumentDto } from './dto/RejectDocumentDto'

export const useDocumentStore = defineStore('document', {
    state: () => ({
        documents: [] as CustomDocument[],
    }),
    actions: {
        async getAllDocuments() {
            try {
                const response = await api.get<GetDocumentResponseDto[]>(`${API_ROUTE}/files`)

                logger.info('[ALL_DOCS]', 'response: ', response)

                if (response.status == 200) {
                    const allDocuments: CustomDocument[] = response.data.map((data) =>
                        documentResponseToDocument(data),
                    )

                    this.documents = allDocuments
                }
            } catch (error: any) {
                logger.error('[ALL_DOCS]', error)
                this.documents = []
            }
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
                    const file = new File([response.data], `${currentDocument.originalName}`, {
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

        async approveDocument(processedDocument: ProcededDocument) {
            try {
                const sessionStore = useSessionStore()

                const data = {
                    documentId: processedDocument.documentId,
                    userId: sessionStore.account.accountId,
                    comment: processedDocument.supervisorCommentary,
                }

                const response = await api.post(`${API_ROUTE}/signature`, { ...data })

                logger.info('[PROCESS_DOC]', 'response: ', response)

                if (response.status == 200) {
                    return {
                        success: true,
                        message: 'Documento rechazado con éxito',
                        type: ToastType.success,
                    } as Result
                }
                return {
                    success: false,
                    message: response.statusText,
                    type: ToastType.warning,
                } as Result
            } catch (error: any) {
                logger.error('[PROCESS_DOC]', error)
                return {
                    success: false,
                    message: error.message,
                    type: ToastType.error,
                } as Result
            }
        },

        async rejectDocument(processedDocument: ProcededDocument) {
            try {
                const data = new RejectDocumentDto(
                    processedDocument.status,
                    processedDocument.supervisorCommentary,
                )

                const response = await api.patch(
                    `${API_ROUTE}/files/${processedDocument.documentId}/status`,
                    { ...data },
                )

                logger.info('[PROCESS_DOC]', 'response: ', response)

                if (response.status == 200) {
                    return {
                        success: true,
                        message: 'Documento aprobado con éxito',
                        type: ToastType.success,
                    } as Result
                }
                return {
                    success: false,
                    message: response.statusText,
                    type: ToastType.warning,
                } as Result
            } catch (error: any) {
                logger.error('[PROCESS_DOC]', error)
                return {
                    success: false,
                    message: error.message,
                    type: ToastType.error,
                } as Result
            }
        },

        async getPreview(documentId: string) {
            try {
                const response = await api.get(`${API_ROUTE}/files/${documentId}/stream`, {
                    responseType: 'arraybuffer',
                })
                logger.info('[DOC_PREVIEW]', 'response: ', response)
                if (response.status == 200) {
                    const mime = response.headers['application/pdf'] ?? 'application/pdf' // fallback
                    const url = URL.createObjectURL(new Blob([response.data], { type: mime }))
                    window.open(url, '_blank')

                    return {
                        success: true,
                        message: 'Documento obtenido con éxito',
                        type: ToastType.success,
                    } as Result
                }
                return {
                    success: false,
                    message: response.statusText,
                    type: ToastType.warning,
                } as Result
            } catch (error: any) {
                logger.error('[DOC_PREVIEW]', error)
                return {
                    success: false,
                    message: error.message,
                    type: ToastType.error,
                } as Result
            }
        },
    },
})



