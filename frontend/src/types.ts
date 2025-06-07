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

export interface Document {
    documentId: number
}
