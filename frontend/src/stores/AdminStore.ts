import type { Account, AccountRole, AdminUser, NewUser, Result } from '@/types'
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
                return {
                    success: false,
                    message: response.statusText,
                    type: ToastType.warning,
                } as Result
            } catch (error: any) {
                logger.error('[GET_USERS]', error)
                return {
                    success: false,
                    message: error.message,
                    type: ToastType.error,
                } as Result
            }
        },
        async createUser(newUser: NewUser) {
            try {
                const response = await api.post<AdminUserResponseDto>(`${API_ROUTE}/users`, {
                    ...newUser,
                })
                logger.info('[CREATE_USER]', 'response: ', response)

                if (response.status == 201) {
                    // this.users.push(AdminUserResponseDto.fromJson(response.data).toAdminUser())

                    return {
                        success: true,
                        message: 'Usuario creado con éxito',
                        type: ToastType.success,
                    } as Result
                }
                return {
                    success: false,
                    message: response.statusText,
                    type: ToastType.warning,
                } as Result
            } catch (error: any) {
                logger.error('[CREATE_USER]', error)
                return {
                    success: false,
                    message: error.message,
                    type: ToastType.error,
                } as Result
            }
        },
        async editRole(userEmail: string, newRole: AccountRole) {
            try {
                const data = {
                    newRole: newRole,
                    email: userEmail,
                }
                const response = await api.post<AdminUserResponseDto>(
                    `${API_ROUTE}/users/change-role`,
                    {
                        data,
                    },
                )
                logger.info('[EDIT_USER]', 'response: ', response)

                if (response.status == 200) {
                    // this.users.push(AdminUserResponseDto.fromJson(response.data).toAdminUser())

                    return {
                        success: true,
                        message: 'Usuario creado con éxito',
                        type: ToastType.success,
                    } as Result
                }
                return {
                    success: false,
                    message: response.statusText,
                    type: ToastType.warning,
                } as Result
            } catch (error: any) {
                logger.error('[EDIT_USER]', error)
                return {
                    success: false,
                    message: error.message,
                    type: ToastType.error,
                } as Result
            }
        },
    },
})
