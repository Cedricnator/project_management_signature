export enum AccountRole {
    user = 'Usuario',
    admin = 'Administrador',
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
}

export interface Document {
    documentId: string
    documentName: string
    state: DocumentStatus
    createdBy: string
    validatedBy?: string | null
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