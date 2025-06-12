import { mockDocumentHistory, mockDocuments, mockUserDocumentHistory } from '@/components/mocks/mocks'
import { AccountRole, DocumentStatus, type Account, type DocumentHistory, type Document } from '@/types'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => ({
        documents: [] as Document[],
        documentHistory: [] as DocumentHistory[],
    }),
    actions: {
        async getUserDocumentsHistoryByUserId(userId: string) {
            this.documentHistory = mockUserDocumentHistory().sort(
                (a, b) => b.createdAt.getDate() - a.createdAt.getDate(),
            )
        },
        async getAllUserDocumentsByUserId(userId: string) {
            this.documents = mockDocuments()
        }
    },
    persist: true,
})


