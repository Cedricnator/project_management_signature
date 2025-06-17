import type { DocumentHistory } from '@/types'
import { parseDocumentStatus } from '@/stores/dto/UploadDocumentResultDto'

export interface UserHistoryResponseDto {
    id: string
    documentId: string
    statusId: string
    changedBy: string
    comment: string
    createdAt: Date
    updatedAt: Date
}

export function responseToDocumentHistory(response: UserHistoryResponseDto) {
    const documentHistory: DocumentHistory = {
        documentHistoryId: response.id,
        documentId: response.documentId,
        action: parseDocumentStatus(response.statusId),
        changedBy: response.changedBy,
        createdAt: response.createdAt,
        commentary: response.comment,
    }
    return documentHistory
}
