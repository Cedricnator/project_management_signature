import { DocumentStatus, type DocumentHistory } from '@/types'
import { parseDocumentStatus } from './GetDocumentResponseDto'

interface History {
    id: string
    statusId: string
    comment: string
    changedBy: string
    createdAt: Date
}

interface Document {
    id: string
    documentName: string
    currentStatus: string
}

export class DocumentHistoryResponse {
    constructor(
        public document: Document,
        public history: History[],
    ) {}

    toDocumentHistory(): DocumentHistory[] {
        return this.history.map(
            (h): DocumentHistory => ({
                documentHistoryId: h.id,
                documentId: this.document.id,
                changedBy: h.changedBy,
                action: parseDocumentStatus(h.statusId),
                createdAt: new Date(h.createdAt),
                commentary: h.comment ?? null,
            }),
        )
    }

    static fromJson(json: { document: Document; history: History[] }): DocumentHistoryResponse {
        return new DocumentHistoryResponse(json.document, json.history)
    }
}
