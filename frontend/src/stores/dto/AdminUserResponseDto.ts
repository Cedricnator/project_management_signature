import type { AdminUser } from '@/types'
import { mapAccountRole } from './UserResponseDto'

export class AdminUserResponseDto {
    constructor(
        public email: string,
        public firstName: string,
        public lastName: string,
        public role: string,
    ) {}

    toAdminUser(): AdminUser {
        const adminUser: AdminUser = {
            email: this.email,
            firstName: this.firstName,
            lastName: this.lastName,
            role: mapAccountRole(this.role),
        }
        return adminUser
    }

    static fromJson(json: {
        email: string
        firstName: string
        lastName: string
        role: string
    }): AdminUserResponseDto {
        return new AdminUserResponseDto(json.email, json.firstName, json.lastName, json.role)
    }
}
