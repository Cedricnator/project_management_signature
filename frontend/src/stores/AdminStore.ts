import type { Account, AccountRole, AdminUser, EditUser, NewUser, Result } from '@/types'
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
                    this.users.push(AdminUserResponseDto.fromJson(response.data).toAdminUser())

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
                const data: EditUser = {
                    newRole: newRole,
                    email: userEmail,
                }
                const response = await api.patch(`${API_ROUTE}/users/change-role`, {
                    ...data,
                })
                logger.info('[EDIT_USER]', 'response: ', response)

                if (response.status == 200) {
                    this.handleEditRole(userEmail, newRole)

                    return {
                        success: true,
                        message: 'Usuario modificado con éxito',
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
        async deleteUser(user: AdminUser) {
            try {
                const response = await api.delete(`${API_ROUTE}/users/email/${user.email}`)
                logger.info('[DELETE_USER]', 'response: ', response)

                if (response.status == 204) {
                    this.handleDeleteUser(user.email)

                    return {
                        success: true,
                        message: 'Usuario eliminado con éxito',
                        type: ToastType.success,
                    } as Result
                }
                return {
                    success: false,
                    message: response.statusText,
                    type: ToastType.warning,
                } as Result
            } catch (error: any) {
                logger.error('[DELETE_USER]', error)
                return {
                    success: false,
                    message: error.message,
                    type: ToastType.error,
                } as Result
            }
        },
        handleDeleteUser(userEmail: string) {
            const index = this.users.findIndex((user) => user.email === userEmail)
            if (index === -1) {
                logger.error('[DELETE_USER]', 'could not find user in pinia store.')
                return
            }

            this.users.splice(index, 1)
        },

        handleEditRole(userEmail: string, newRole: AccountRole) {
            const index = this.users.findIndex((user) => user.email === userEmail)
            if (index === -1) {
                logger.error('[EDIT_USER]', 'could not find user in pinia store.')
                return
            }

            this.users[index].role = newRole
        },
    },
})
