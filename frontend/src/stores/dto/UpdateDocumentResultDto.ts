import { DocumentStatus, type Document } from '@/types'

export interface UpdateDocumentResponseDto {
    id: string
    name: string
    description: string
    currentStatusId: string
    filePath: string
    fileSize: number
    mimetype: string
    originalFilename: string
    filename: string
    fileHash: string
    createdAt: Date
    updatedAt: Date
}

export function updateDocumentResponseToDocument(uploadDocument: UpdateDocumentResponseDto) {
    const document: Document = {
        documentId: uploadDocument.id,
        documentName: uploadDocument.name,
        description: uploadDocument.description,
        state: parseDocumentStatus(uploadDocument.currentStatusId),
        createdBy: '',
        validatedBy: '',
        commentary: null,
        originalName: uploadDocument.originalFilename,
    }
    return document
}

export function parseDocumentStatus(documentStatus: string) {
    switch (documentStatus) {
        case '01974b23-bc2f-7e5f-a9d0-73a5774d2778':
            return DocumentStatus.pending_review
        case '01974b23-d84d-7319-95b3-02322c982216':
            return DocumentStatus.approved
        case '01974b23-e943-7308-8185-1556429b9ff1':
            return DocumentStatus.rejected
        case '01974b24-093b-7014-aa21-9f964b822156':
            return DocumentStatus.deleted
        default:
            return DocumentStatus.pending_review
    }
}
