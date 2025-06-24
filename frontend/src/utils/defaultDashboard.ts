import { AccountRole } from '@/types'

export function getDefaultDashboard(role: AccountRole): string {
    switch (role) {
        case AccountRole.admin:
            return '/admin/dashboard'
        case AccountRole.supervisor:
            return '/supervisor/dashboard'
        case AccountRole.user:
        default:
            return '/user/dashboard'
    }
}
