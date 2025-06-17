import type { ToastType } from "./stores/ToastStore"

export enum AccountRole {
    user = 'Usuario',
    admin = 'Administrador',
    supervisor = 'Supervisor',
}

export interface Account {
    accountId: string
    role: AccountRole
    username: string
    email: string
}

export enum DocumentStatus {
    valid = 'Validado',
    invalid = 'Por validar',
    approved = 'Aprobado',
    rejected = 'Rechazado',
    signed = 'Firmado',
    deleted = 'Eliminado',
    pending_review = 'Por validar',
}

export interface Document {
    documentId: string
    documentName: string
    state: DocumentStatus
    createdBy: string
    validatedBy?: string | null
    description: string
    commentary?: string | null
}

export interface ProcededDocument {
    documentId: string
    supervisorCommentary?: string | null
    processedAt: Date
    status: DocumentStatus
}

export interface UploadDocumentDto {
    name: string
    description: string
    commentary?: string | null
}

export interface UpdateDocumentDto extends UploadDocumentDto {
    documentId: string
}

export interface DocumentHistory {
    documentHistoryId: string
    documentId: string
    changedBy: string
    action: DocumentStatus
    createdAt: Date
    commentary?: string | null
}

export enum ButtonType {
    filled = 'filled',
    outlined = 'outlined',
}

export interface Result<T = void> {
    success: boolean,
    message: string,
    data?: T
    type: ToastType
}