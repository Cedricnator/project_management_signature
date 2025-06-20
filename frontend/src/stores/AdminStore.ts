import type { Account, AdminUser, Result } from '@/types'
import api from '@/utils/axios'
import { API_ROUTE } from '@/utils/const'
import { logger } from '@/utils/logger'
import { defineStore } from 'pinia'
import { ToastType } from './ToastStore'
import { AdminUserResponseDto } from './dto/AdminUserResponseDto'

export const useAdminStore = defineStore('admin', {
    state: () => ({
        users: [] as AdminUser[],
    }),
    actions: {
        async getAllUsers() {
            try {
                const response = await api.get<AdminUserResponseDto[]>(`${API_ROUTE}/users`)
                logger.info('[GET_USERS]', 'response: ', response)

                if (response.status == 200) {
                    this.users = response.data.map((u) =>
                        AdminUserResponseDto.fromJson(u).toAdminUser(),
                    )

                    return {
                        success: true,
                        message: 'Usuarios obtenidos con éxito',
                        type: ToastType.success,
                    } as Result
                }
            } catch (error: any) {
                logger.error('[GET_USERS]', error)
                return {
                    success: false,
                    message: error.message,
                    type: ToastType.error,
                } as Result
            }
        },
    },
})
