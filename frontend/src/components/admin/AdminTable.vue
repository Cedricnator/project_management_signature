<script setup lang="ts">
import { useToastStore } from '@/stores/ToastStore'
import type { Account, AdminUser } from '@/types'
import { ButtonType } from '@/types'
import { computed, ref, watch } from 'vue'
import CustomButton from '@/components/CustomButton.vue'
import AdminUserModal from '@/components/admin/AdminUserModal.vue';
import DeleteUserModal from '@/components/admin/DeleteUserModal.vue'
import { AccountRoleLabel } from '@/types'

const props = defineProps<{
    users: AdminUser[]
}>()

const toastStore = useToastStore()

const allUsers = computed(() => props.users)
const searchQuery = ref('')
const isCreateUserModal = ref(false)
const isDeleteUserModal = ref(false)
const currentPage = ref(1)
const currentUser = ref<AdminUser>()
const itemsPerPage = 6

const sortKey = ref<'email' | 'lastName' | 'role' | null>(null)
const sortAsc = ref(true)

const filteredUsers = computed(() => {
    const query = searchQuery.value.toLowerCase()

    let users = allUsers.value.filter((user) => user.email.toLowerCase().includes(query))

    if (sortKey.value) {
        users = users.slice().sort((a, b) => {
            const valA = a[sortKey.value!].toString().toLowerCase()
            const valB = b[sortKey.value!].toString().toLowerCase()

            if (valA < valB) return sortAsc.value ? -1 : 1
            if (valA > valB) return sortAsc.value ? 1 : -1
            return 0
        })
    }

    return users
})

const totalPages = computed(() => Math.ceil(filteredUsers.value.length / itemsPerPage))

const paginatedUsers = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage
    const end = start + itemsPerPage
    return filteredUsers.value.slice(start, end)
})

function sortBy(key: 'email' | 'lastName' | 'role') {
    if (sortKey.value === key) {
        // toggle asc/desc
        sortAsc.value = !sortAsc.value
    } else {
        sortKey.value = key
        sortAsc.value = true
    }
}

function handleEditUser(user: AdminUser) {
    currentUser.value = user
    isCreateUserModal.value = true
}

function handleDeleteUser(user: AdminUser) {
    currentUser.value = user
    isDeleteUserModal.value = true
}

/**
 * moves to first page when searching, so it doesn't show empty pages.
 */
watch(searchQuery, () => {
    currentPage.value = 1
})
</script>

<template>
    <AdminUserModal :isOpen="isCreateUserModal" :user="currentUser" @close="isCreateUserModal = false"/>
    <DeleteUserModal :isOpen="isDeleteUserModal" :user="currentUser" @close="isDeleteUserModal = false"/>
    <div class="flex flex-col h-full w-full overflow-x-auto sm:rounded-lg">
        <div class="grid grid-cols-1 md:grid-cols-2 pb-4 bg-white">
            <p class="font-semibold text-2xl">Usuarios</p>
            <div class="flex md:justify-end">
                <div class="relative mt-1">
                    <div
                        class="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none"
                    >
                        <svg
                            class="w-4 h-4 text-gray-500 dark:text-gray-400"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 20 20"
                        >
                            <path
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                            />
                        </svg>
                    </div>
                    <input
                        v-model="searchQuery"
                        type="text"
                        id="table-search"
                        class="block mr-1 pt-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:text-text-dark dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Buscar usuario.."
                    />
                </div>
            </div>
        </div>
        <table class="w-full text-sm text-left rtl:text-right text-gray-500">
            <thead class="text-xs text-text-white uppercase bg-gray-600">
                <tr>
                    <th
                        @click="sortBy('email')"
                        scope="col"
                        class="px-2 py-2 md:px-6 md:py-3 cursor-pointer md:min-w-10 md:max-w-10"
                    >
                        Email
                        <span v-if="sortKey === 'email'">
                            {{ sortAsc ? '▲' : '▼' }}
                        </span>
                    </th>
                    <th
                        @click="sortBy('lastName')"
                        scope="col"
                        class="px-2 py-2 md:px-6 md:py-3 cursor-pointer min-w-30 md:min-w-10 md:max-w-10"
                    >
                        Apellido
                        <span v-if="sortKey === 'lastName'">
                            {{ sortAsc ? '▲' : '▼' }}
                        </span>
                    </th>
                    <th
                        @click="sortBy('role')"
                        scope="col"
                        class="px-2 py-2 md:px-6 md:py-3 cursor-pointer min-w-30 md:min-w-10 md:max-w-10"
                    >
                        Rol
                        <span v-if="sortKey === 'role'">
                            {{ sortAsc ? '▲' : '▼' }}
                        </span>
                    </th>
                    <th scope="col" class="px-2 py-2 md:px-6 md:py-3 min-w-40"><p class="flex justify-center">Acciones</p></th>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for="user in paginatedUsers"
                    :key="user.email"
                    class="bg-white border-b text-text-dark dark:border-gray-700 border-gray-200 hover:bg-gray-300"
                >
                    <th
                        scope="row"
                        class="md:min-w-10 md:max-w-20 px-2 py-3 md:px-6 md:py-3 font-medium text-text-dark overflow-hidden"
                    >
                        {{ user.email }}
                    </th>
                    <td class="max-w-[5rem] px-2 py-3 md:px-6 md:py-3 md:min-w-10 md:max-w-10">
                        {{ user.lastName }}
                    </td>
                    <td class="max-w-[5rem] px-2 py-3 md:px-6 md:py-3 min-w-20 md:min-w-10 md:max-w-10">
                        {{ AccountRoleLabel[user.role] }}
                    </td>
                    <td class="max-w-[6rem] px-2 py-3 md:px-6 md:py-3">
                        <div class="flex flex-wrap md:flex-nowrap gap-2 justify-center">
                            <div class="flex grow max-w-sm">
                                <CustomButton
                                    label="Editar rol"
                                    :buttonType="ButtonType.outlined"
                                    :onClick="() => handleEditUser(user)"
                                    iconName="fa-solid fa-pen-to-square"
                                />
                            </div>
                            <div>
                                <CustomButton label="test" :buttonType="ButtonType.icon" :onClick="() => handleDeleteUser(user)" iconName="fa-solid fa-trash-can"/>
                            </div>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
        <nav
            class="flex items-center flex-column flex-wrap md:flex-row justify-between pt-4"
            aria-label="Table navigation"
        >
            <span
                class="text-sm font-normal text-text-dark mb-4 md:mb-0 block w-full md:inline md:w-auto"
                >Mostrando
                <span class="font-bold text-text-dark">1-{{ itemsPerPage }}</span>
                de
                <span class="font-bold text-text-dark">{{ allUsers.length }}</span></span
            >
            <ul class="inline-flex -space-x-px rtl:space-x-reverse text-sm h-8">
                <li>
                    <button
                        :disabled="currentPage === 1"
                        @click="currentPage -= 1"
                        class="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-white bg-gray-600 rounded-s-lg hover:bg-primary"
                    >
                        Anterior
                    </button>
                </li>
                <li v-for="page in totalPages" :key="page">
                    <button
                        @click="currentPage = page"
                        :class="[
                            'px-3 h-8 flex items-center justify-center leading-tight',
                            page === currentPage
                                ? 'text-white bg-primary rounded'
                                : 'text-white bg-gray-600 hover:bg-primary',
                        ]"
                    >
                        {{ page }}
                    </button>
                </li>
                <li>
                    <button
                        :disabled="currentPage === totalPages"
                        @click="currentPage++"
                        class="flex items-center justify-center px-3 h-8 rounded-e-lg leading-tight text-white bg-gray-600 hover:bg-primary"
                    >
                        Siguiente
                    </button>
                </li>
            </ul>
        </nav>
    </div>
</template>
