<script setup lang="ts">
import type { Document, DocumentHistory } from '@/types'
import { ButtonType } from '@/types'
import { computed, ref, watch } from 'vue'
import CustomButton from '../CustomButton.vue'

const props = defineProps<{
    documentsHistory: DocumentHistory[]
}>()

const searchQuery = ref('')
const allDocumentsHistory = computed(() => props.documentsHistory)

const currentPage = ref(1)
const itemsPerPage = 10

const totalPages = computed(() => Math.ceil(allDocumentsHistory.value.length / itemsPerPage))

const paginatedDocuments = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage
    const end = start + itemsPerPage
    return allDocumentsHistory.value.slice(start, end)
})

/**
 * moves to first page when searching, so it doesn't show empty pages.
 */
watch(searchQuery, () => {
    currentPage.value = 1
})
</script>

<template>
    <div class="flex flex-col h-full w-full overflow-x-auto sm:rounded-lg">
        <div class="grid grid-cols-1 md:grid-cols-2 pb-4 bg-white">
            <p class="font-semibold text-2xl">Historial</p>
        </div>
        <table class="w-full text-sm text-left rtl:text-right text-gray-500 overflow-auto">
            <thead class="text-xs text-text-white uppercase bg-gray-600">
                <tr>
                    <th scope="col" class="px-6 py-3 cursor-pointer md:min-w-10 md:max-w-10">
                        Cambiado por
                    </th>
                    <th scope="col" class="px-6 py-3 cursor-pointer md:min-w-10 md:max-w-10">
                        Estado
                    </th>
                    <th scope="col" class="px-6 py-3">Fecha</th>
                    <th scope="col" class="px-6 py-3">Comentario</th>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for="documentHistory in paginatedDocuments"
                    :key="documentHistory.documentId"
                    class="bg-white border-b text-text-dark dark:border-gray-700 border-gray-200 hover:bg-gray-300"
                >
                    <th
                        scope="row"
                        class="md:min-w-10 md:max-w-10 px-6 py-4 font-medium text-text-dark whitespace-nowrap"
                    >
                        {{ documentHistory.changedBy }}
                    </th>
                    <td class="max-w-[5rem] px-6 py-4 md:min-w-10 md:max-w-10">
                        {{ documentHistory.action }}
                    </td>
                    <td class="max-w-[5rem] px-6 py-4 md:min-w-10 md:max-w-10">
                        {{ documentHistory.createdAt.toLocaleString() }}
                    </td>
                    <td class="max-w-[5rem] px-6 py-4 md:min-w-10 md:max-w-10">
                        {{ documentHistory.commentary }}
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
                <span class="font-bold text-text-dark">{{ allDocumentsHistory.length }}</span></span
            >
            <ul class="inline-flex -space-x-px rtl:space-x-reverse text-sm h-8">
                <li>
                    <button
                        :disabled="currentPage === 1"
                        @click="currentPage -= 1"
                        class="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-white bg-gray-600 rounded-s-lg hover:bg-primary"
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
                        Next
                    </button>
                </li>
            </ul>
        </nav>
    </div>
</template>
