import { AccountRole, type Account, type NewLogin, type Result } from '@/types'
import { API_ROUTE } from '@/utils/const'
import { logger } from '@/utils/logger'
import axios from 'axios'
import { defineStore } from 'pinia'
import { userResponseToAccount, type UserResponseDto } from './dto/UserResponseDto'
import api from '@/utils/axios'
import type { LoginResponseDto } from './dto/LoginResponseDto'
import { ToastType } from './ToastStore'

export const useSessionStore = defineStore('session', {
    state: () => ({
        token: '' as string,
        account: {} as Account,
    }),
    actions: {
        async login(newLogin: NewLogin) {
            try {
                // const newlogin: NewLogin = {
                //     email: 'pedro.lopez@signature.com',
                //     // email: 'supervisor@signature.com',
                //     // email: 'admin@signature.com',
                //     password: '123456789',
                // }

                const response = await api.post<LoginResponseDto>(
                    `${API_ROUTE}/auth/login`,
                    newLogin,
                )

                logger.info('[AUTH]', 'login response:', response)

                if (response.status == 200) {
                    const responseLogin = response.data

                    this.token = responseLogin.token

                    this.getUserByEmail(responseLogin.email)

                    return {
                        success: true,
                        message: 'Se ha iniciado sesión con éxito.',
                        type: ToastType.success,
                    } as Result
                }
                return {
                    success: false,
                    message: response.statusText,
                    type: ToastType.warning,
                } as Result
            } catch (error: any) {
                logger.error('[AUTH]', error)
                return {
                    success: false,
                    message: error.message,
                    type: ToastType.error,
                } as Result
            }
        },

        async getUserByEmail(email: string) {
            try {
                const headers = {
                    Authorization: `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                }

                const data = {
                    email: email,
                }

                const response = await axios.get<UserResponseDto>(
                    `${API_ROUTE}/users/email/${data.email}`,
                    { headers },
                )

                logger.info('[AUTH]', 'getUserResponse: ', response)

                if (response.status == 200) {
                    const userResponse = response.data

                    this.account = userResponseToAccount(userResponse)
                }
            } catch (error) {
                logger.error('[auth]', error)
            }
        },

        async logout() {},

        async renewToken() {},
    },
    persist: true,
})
