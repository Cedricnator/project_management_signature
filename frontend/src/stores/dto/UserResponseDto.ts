import { AccountRole, type Account } from '@/types'

export interface UserResponseDto {
    id: string
    firstName: string
    lastName: string
    email: string
    role: string
}

export function userResponseToAccount(userResponse: UserResponseDto) {
    const account: Account = {
        accountId: userResponse.id,
        role: mapAccountRole(userResponse.role),
        username: userResponse.firstName,
        email: userResponse.email,
    }
    return account
}

export function mapAccountRole(roleResponse: string) {
    switch (roleResponse) {
        case 'user':
            return AccountRole.user
        case 'admin':
            return AccountRole.admin
        case 'supervisor':
            return AccountRole.supervisor
        default:
            return AccountRole.user
    }
}
