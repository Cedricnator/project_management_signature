import { mockDocumentHistory, mockDocuments, mockUserDocumentHistory } from '@/components/mocks/mocks'
import {
    AccountRole,
    DocumentStatus,
    type Account,
    type DocumentHistory,
    type Document as CustomDocument,
    type UploadDocumentDto,
    type UpdateDocumentDto,
    type Result,
} from '@/types'
import { defineStore } from 'pinia'
import { useSessionStore } from './SessionStore'
import { API_ROUTE } from '@/utils/const'
import axios from 'axios'
import { logger } from '@/utils/logger'
import {
    documentResponseToDocument,
    type GetDocumentResponseDto,
} from './dto/GetDocumentResponseDto'
import {
    uploadDocumentResponseToDocument,
    type UploadDocumentResponseDto,
} from './dto/UploadDocumentResultDto'
import {
    responseToDocumentHistory,
    type UserHistoryResponseDto,
} from './dto/UserHistoryResponseDto'
import { ToastType } from './ToastStore'
import api from '@/utils/axios'
import {
    updateDocumentResponseToDocument,
    type UpdateDocumentResponseDto,
} from './dto/UpdateDocumentResultDto'

export const useUserStore = defineStore('user', {
    state: () => ({
        documents: [] as CustomDocument[],
        documentHistory: [] as DocumentHistory[],
    }),
    actions: {
        async getUserDocumentsHistoryByUserId(userId: string) {
            try {
                const sessionStore = useSessionStore()

                const headers = {
                    Authorization: `Bearer ${sessionStore.token}`,
                }

                const response = await axios.get<UserHistoryResponseDto[]>(
                    `${API_ROUTE}/files/users/${sessionStore.account.accountId}/history`,
                    { headers },
                )

                logger.info('[USER_HISTORY]', 'documents: ', response)

                if (response.status == 200) {
                    this.documentHistory = response.data.map((data) =>
                        responseToDocumentHistory(data),
                    )
                }
            } catch (error) {
                logger.error('[USER_HISTORY]', error)
            }
        },
        async getAllUserDocumentsByUserId() {
            try {
                const sessionStore = useSessionStore()

                const headers = {
                    Authorization: `Bearer ${sessionStore.token}`,
                    'Content-Type': 'application/form-data',
                }

                const response = await axios.get<GetDocumentResponseDto[]>(
                    `${API_ROUTE}/files/users/${sessionStore.account.accountId}`,
                    { headers },
                )

                logger.info('[DOCS]', 'documents: ', response)

                if (response.status == 200) {
                    this.documents = response.data.map((data) => documentResponseToDocument(data))
                }
            } catch (error) {
                logger.error('[DOCS]', error)
                this.documents = []
            }
        },

        async uploadDocument(uploadDocumentDto: UploadDocumentDto, file: File) {
            try {
                logger.info('[UPLOAD_DOC]', 'document to save: ', uploadDocumentDto)

                const sessionStore = useSessionStore()
                const userStore = useUserStore()

                const headers = {
                    Authorization: `Bearer ${sessionStore.token}`,
                }

                const formData = new FormData()

                formData.append('file', file)
                formData.append('description', uploadDocumentDto.description)
                formData.append('name', uploadDocumentDto.name)
                if (uploadDocumentDto.commentary) {
                    formData.append('comment', uploadDocumentDto.commentary)
                }

                const response = await axios.post<UploadDocumentResponseDto>(
                    `${API_ROUTE}/files/upload/`,
                    formData,
                    {
                        headers,
                    },
                )

                logger.info('[UPLOAD_DOC]', 'document_response: ', response)

                if (response.status == 201) {
                    const currentDocument: CustomDocument = uploadDocumentResponseToDocument(
                        response.data,
                    )

                    this.documents.push(currentDocument)

                    return {
                        success: true,
                        message: 'Documento subido con éxito.',
                        type: ToastType.success,
                    } as Result
                }
                return { success: false, message: response.statusText, type: ToastType.warning }
            } catch (error: any) {
                logger.error('[UPLOAD_DOC]', error)
                return { success: false, message: error.message, type: ToastType.error } as Result
            }
        },
        async updateDocument(updateDocumentDto: UpdateDocumentDto, file: File) {
            try {
                const formData = new FormData()

                formData.append('file', file)
                formData.append('description', updateDocumentDto.description)
                formData.append('name', updateDocumentDto.name)
                if (updateDocumentDto.commentary) {
                    formData.append('comment', updateDocumentDto.commentary)
                }
                
                const response = await api.patch<UpdateDocumentResponseDto>(
                    `${API_ROUTE}/files/${updateDocumentDto.documentId}/`,
                    formData,
                )

                logger.info('[UPDATE_DOC]', 'document_response: ', response)

                if (response.status == 200) {
                    const currentDocument: CustomDocument = updateDocumentResponseToDocument(
                        response.data,
                    )

                    this.handleUpdateDocumentResponse(currentDocument)

                    return {
                        success: true,
                        message: 'Documento editado con éxito.',
                        type: ToastType.success,
                    } as Result
                }
                return { success: false, message: response.statusText, type: ToastType.warning }
            } catch (error: any) {
                logger.error('[UPDATE_DOC]', error)
                return { success: false, message: error.message, type: ToastType.error } as Result
            }
        },
        async downloadDocument(customDocument: CustomDocument) {
            try {
                const sessionStore = useSessionStore()

                const headers = {
                    Authorization: `Bearer ${sessionStore.token}`,
                }
                const response = await axios.get(
                    `${API_ROUTE}/files/${customDocument.documentId}/download`,
                    {
                        headers,
                        responseType: 'blob',
                    },
                )

                logger.info('[DOWNLOAD_DOC]', 'response: ', response)

                if (response.status == 200) {
                    const blob = new Blob([response.data])
                    const url = window.URL.createObjectURL(blob)

                    const link = document.createElement('a')
                    link.href = url

                    // Optional: Set the download filename
                    link.download = `${customDocument.documentName}.pdf`

                    document.body.appendChild(link)
                    link.click()
                    link.remove()

                    // Clean up the object URL
                    window.URL.revokeObjectURL(url)
                    return {
                        success: true,
                        message: 'Documento descargado con éxito.',
                        type: ToastType.success,
                    } as Result
                }
                return {
                    success: false,
                    message: response.statusText,
                    type: ToastType.warning,
                } as Result
            } catch (error: any) {
                logger.error('[DOWNLOAD_DOC]', error)
                return { success: false, message: error.message, type: ToastType.warning } as Result
            }
        },
        handleUpdateDocumentResponse(updated: CustomDocument) {
            const idx = this.documents.findIndex((doc) => doc.documentId === updated.documentId)

            if (idx !== -1) {
                this.documents[idx] = { ...updated }
            } else {
                this.documents.push({ ...updated })
            }
        },
    },
    persist: true,
})


