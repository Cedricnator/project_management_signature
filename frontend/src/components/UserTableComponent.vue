<script setup lang="ts">
import type { Document } from '@/types'
import { computed, ref, watch } from 'vue'

const props = defineProps<{
    documents: Document[]
}>()

const searchQuery = ref('')
const allDocuments = computed(() => props.documents)

const currentPage = ref(1)
const itemsPerPage = 8

const filteredDocuments = computed(() => {
    const query = searchQuery.value.toLowerCase()

    let docs = allDocuments.value.filter((doc) => doc.documentName.toLowerCase().includes(query))

    if (sortKey.value) {
        docs = docs.slice().sort((a, b) => {
            const valA = a[sortKey.value!].toString().toLowerCase()
            const valB = b[sortKey.value!].toString().toLowerCase()

            if (valA < valB) return sortAsc.value ? -1 : 1
            if (valA > valB) return sortAsc.value ? 1 : -1
            return 0
        })
    }

    return docs
})

const totalPages = computed(() => Math.ceil(filteredDocuments.value.length / itemsPerPage))

const paginatedDocuments = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage
    const end = start + itemsPerPage
    return filteredDocuments.value.slice(start, end)
})

const sortKey = ref<'documentName' | 'state' | null>(null)
const sortAsc = ref(true)

function sortBy(key: 'documentName' | 'state') {
    if (sortKey.value === key) {
        // toggle asc/desc
        sortAsc.value = !sortAsc.value
    } else {
        sortKey.value = key
        sortAsc.value = true
    }
}

/**
 * moves to first page when searching, so it doesn't show empty pages.
 */
watch(searchQuery, () => {
    currentPage.value = 1
})
</script>

<template>
    <div class="flex flex-col h-full w-full overflow-x-auto shadow-md sm:rounded-lg">
        <div class="flex pb-4 bg-white dark:bg-gray-900 justify-end">
            <label for="table-search" class="sr-only">Search</label>
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
                    class="block pt-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Buscar documento.."
                />
            </div>
        </div>
        <table
            class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 overflow-auto"
        >
            <thead
                class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
            >
                <tr>
                    <th
                        @click="sortBy('documentName')"
                        scope="col"
                        class="px-6 py-3 cursor-pointer"
                    >
                        Nombre
                        <span v-if="sortKey === 'documentName'">
                            {{ sortAsc ? '▲' : '▼' }}
                        </span>
                    </th>
                    <th @click="sortBy('state')" scope="col" class="px-6 py-3 cursor-pointer">
                        Estado
                        <span v-if="sortKey === 'state'">
                            {{ sortAsc ? '▲' : '▼' }}
                        </span>
                    </th>
                    <th scope="col" class="px-6 py-3">Acciones</th>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for="document in paginatedDocuments"
                    :key="document.documentId"
                    class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                    <th
                        scope="row"
                        class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                    >
                        {{ document.documentName }}
                    </th>
                    <td class="px-6 py-4">{{ document.state }}</td>
                    <td class="px-6 py-4">
                        <a
                            href="#"
                            class="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                            >Edit</a
                        >
                    </td>
                </tr>
            </tbody>
        </table>
        <nav
            class="flex items-center flex-column flex-wrap md:flex-row justify-between pt-4"
            aria-label="Table navigation"
        >
            <span
                class="text-sm font-normal text-gray-500 dark:text-gray-400 mb-4 md:mb-0 block w-full md:inline md:w-auto"
                >Mostrando
                <span class="font-semibold text-gray-900 dark:text-white"
                    >1-{{ itemsPerPage }}</span
                >
                de
                <span class="font-semibold text-gray-900 dark:text-white">{{
                    allDocuments.length
                }}</span></span
            >
            <ul class="inline-flex -space-x-px rtl:space-x-reverse text-sm h-8">
                <li>
                    <button
                        :disabled="currentPage === 1"
                        @click="currentPage -= 1"
                        class="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                    >
                        Previous
                    </button>
                </li>
                <li v-for="page in totalPages" :key="page">
                    <button
                        @click="currentPage = page"
                        :class="[
                            'px-3 h-8 flex items-center justify-center leading-tight',
                            page === currentPage
                                ? 'text-white bg-blue-600 rounded'
                                : 'text-gray-500 bg-black hover:text-gray-700',
                        ]"
                    >
                        {{ page }}
                    </button>
                </li>
                <li>
                    <button
                        :disabled="currentPage === totalPages"
                        @click="currentPage++"
                        class="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                    >
                        Next
                    </button>
                </li>
            </ul>
        </nav>
    </div>
</template>
