import type { ToastType } from "./stores/ToastStore"

export enum AccountRole {
    user = 'user',
    admin = 'admin',
    supervisor = 'supervisor',
}

export const AccountRoleLabel: Record<AccountRole, string> = {
    [AccountRole.user]: 'Usuario',
    [AccountRole.admin]: 'Administrador',
    [AccountRole.supervisor]: 'Supervisor',
}

export interface Account {
    accountId: string
    role: AccountRole
    username: string
    email: string
}

export interface AdminUser {
    email: string
    firstName: string
    lastName: string
    role: AccountRole
}

export interface NewUser {
    email: string
    firstName: string
    lastName: string
    password: string
    role: AccountRole
}

export interface EditUser {
    newRole: AccountRole
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
    originalName: string
}

export interface ProcededDocument {
    documentId: string
    supervisorCommentary?: string
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
    icon = 'icon',
}

export interface Result<T = void> {
    success: boolean,
    message: string,
    data?: T
    type: ToastType
}