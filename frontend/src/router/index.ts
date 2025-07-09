import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import AuthView from '@/views/AuthView.vue'
import DashboardView from '@/views/user/UserDashboardView.vue'
import DocumentsView from '@/views/user/UserDocumentsView.vue'
import UserView from '@/views/UserView.vue'
import UserHistory from '@/views/user/UserHistory.vue'
import SupervisorView from '@/views/SupervisorView.vue'
import SupervisorDashboardView from '@/views/supervisor/SupervisorDashboardView.vue'
import AdminView from '@/views/AdminView.vue'
import AdminDashboard from '@/views/admin/AdminDashboardView.vue'
import { useSessionStore } from '@/stores/SessionStore'
import { AccountRole } from '@/types'
import { ToastType, useToastStore } from '@/stores/ToastStore'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'landing-page',
            component: HomeView,
            meta: {
                requireAuth: false,
            },
        },
        {
            path: '/auth',
            name: 'auth',
            component: AuthView,
            meta: {
                requireAuth: false,
            },
            beforeEnter: () => {
                const sessionStore = useSessionStore()
                const isLoggedIn = !!sessionStore.token
                const userRole = sessionStore.account?.role

                if (isLoggedIn) {
                    switch (userRole) {
                        case 'user':
                            return { name: 'user-dashboard' }
                        case 'admin':
                            return { name: 'admin-dashboard' }
                        case 'supervisor':
                            return { name: 'supervisor-dashboard' }
                        default:
                            return { name: 'user-dashboard' }
                    }
                }

                return true
            },
        },
        {
            path: '/user',
            component: UserView,
            redirect: { path: '/user/dashboard' },
            children: [
                {
                    path: 'dashboard',
                    name: 'user-dashboard',
                    component: DashboardView,
                    meta: {
                        requireAuth: true,
                    },
                },
                {
                    path: 'documents',
                    name: 'user-documents',
                    component: DocumentsView,
                    meta: {
                        requireAuth: true,
                    },
                },
                {
                    path: 'history',
                    name: 'user-history',
                    component: UserHistory,
                    meta: {
                        requireAuth: true,
                    },
                },
            ],
        },
        {
            path: '/supervisor',
            component: SupervisorView,
            redirect: { path: '/supervisor/dashboard' },
            children: [
                {
                    path: 'dashboard',
                    name: 'supervisor-dashboard',
                    component: SupervisorDashboardView,
                    meta: {
                        requireAuth: true,
                    },
                },
                {
                    path: 'documents',
                    name: 'user-documents',
                    component: DocumentsView,
                    meta: {
                        requireAuth: true,
                    },
                },
            ],
        },
        {
            path: '/admin',
            component: AdminView,
            redirect: { path: '/admin/dashboard' },
            children: [
                {
                    path: 'dashboard',
                    name: 'admin-dashboard',
                    component: AdminDashboard,
                    meta: {
                        requireAuth: true,
                    },
                },
            ],
        },
    ],
})

router.beforeEach((to, from) => {
    const sessionStore = useSessionStore()

    const isLoggedIn = !!sessionStore.token
    const userRole = sessionStore.account?.role
    const toastStore = useToastStore()

    // If route requires auth and user is not logged in
    if (to.meta.requireAuth && !isLoggedIn) {
        toastStore.addToast(ToastType.warning, 'Por favor inicie sesión.')
        return { name: 'auth' }
    }

    const roleRestrictedPaths: Record<string, AccountRole[]> = {
        '/user': [AccountRole.user],
        '/admin': [AccountRole.admin],
        '/supervisor': [AccountRole.supervisor],
    }

    // Match path prefix to check if user role is valid
    const matchedPrefix = Object.keys(roleRestrictedPaths).find((prefix) =>
        to.path.startsWith(prefix),
    )
    if (matchedPrefix) {
        const allowedRoles = roleRestrictedPaths[matchedPrefix]
        if (!allowedRoles.includes(userRole)) {
            toastStore.addToast(ToastType.warning, 'Acceso Restringido.')
            return { name: 'auth' }
        }
    }

    return true
}) 

export default router
