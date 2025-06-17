import { AccountRole, type Account } from '@/types'
import { API_ROUTE } from '@/utils/const'
import { logger } from '@/utils/logger'
import axios from 'axios'
import { defineStore } from 'pinia'
import { userResponseToAccount, type UserResponseDto } from './dto/UserResponseDto'

export const useSessionStore = defineStore('session', {
    state: () => ({
        token: {} as string,
        account: {} as Account,
    }),
    actions: {
        async login() {
            try {
                interface NewLogin {
                    email: string
                    password: string
                }

                interface loginResponseDto {
                    email: string
                    role: string
                    token: string
                }

                const newlogin: NewLogin = {
                    email: 'pedro.lopez@signature.com',
                    password: '123456789',
                }

                const header = {}

                const response = await axios.post<loginResponseDto>(
                    `${API_ROUTE}/auth/login`,
                    newlogin,
                )

                logger.info('[auth]', 'login response:', response)

                if (response.status == 200) {
                    const responseLogin = response.data

                    this.token = responseLogin.token

                    this.getUserByEmail(responseLogin.email)
                }
            } catch (error) {}
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
