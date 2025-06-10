import { AccountRole, type Account } from '@/types'
import { defineStore } from 'pinia'

export const useSessionStore = defineStore('session', {
    state: () => ({
        token: {} as string,
        account: {} as Account,
    }),
    actions: {
        async login() {
            try {
                const currentAccount: Account = {
                    accountId: '1000',
                    role: AccountRole.user,
                    username: 'Cucharoth',
                    email: 'cucha@roth.rs',
                }
                this.account = currentAccount
                this.token = ''
            } catch (error) {}
        },

        async logout() {},

        async renewToken() {},
    },
    persist: true,
})
