import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import AuthView from '@/views/AuthView.vue'
import DashboardView from '@/views/DashboardView.vue'
import DocumentsView from '@/views/DocumentsView.vue'
import UserView from '@/views/UserView.vue'
import UserHistory from '@/views/UserHistory.vue'

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
    ],
})

export default router
