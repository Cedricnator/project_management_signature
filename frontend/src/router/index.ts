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

export default router
