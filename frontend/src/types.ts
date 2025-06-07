export enum AccountRole {
    user = 'Usuario',
    admin = 'Administrador',
}

export interface Account {
    accountId: number
    role: AccountRole
    username: string
    email: string
}

export enum DocumentStatus {
    valid = 'Validado',
    invalid = 'Por validar',
}

export interface Document {
    documentId: number
    documentName: string
    state: DocumentStatus
    createdBy: number
    validatedBy?: number | null
}
