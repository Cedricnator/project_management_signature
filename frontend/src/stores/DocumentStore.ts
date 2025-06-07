import type { Account } from '@/types'
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
    const documents: Document[] = []
    return documents
}
