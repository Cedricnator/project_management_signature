<script setup lang="ts">
import type { Document } from '@/types'
import { DocumentStatus } from '@/types'
import { ButtonType } from '@/types'
import { computed, ref, watch } from 'vue'
import CustomButton from '../CustomButton.vue'
import UserDocumentHistoryModal from '@/components/user/UserDocumentHistoryModal.vue'
import UserAddDocumentModal from './UserAddDocumentModal.vue'
import { useUserStore } from '@/stores/UserStore';

const props = defineProps<{
    documents: Document[]
}>()

const userStore = useUserStore()
const isShowModalAddDoc = ref(false)
const isShowModal = ref(false)
const searchQuery = ref('')
const allDocuments = computed(() => props.documents)
const currentDocument = ref()

const currentPage = ref(1)
const itemsPerPage = 6

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

function handleDocumentHistoryModal(document: Document) {
    currentDocument.value = document
    isShowModal.value = true
}

function handleCloseModal() {
    isShowModal.value = false
}

function openDocModal() {
    isShowModalAddDoc.value = true
}

function handleEditDoc(document: Document) {
    currentDocument.value = document
    isShowModalAddDoc.value = true
}

function handleDownload(document: Document) {
    userStore.downloadDocument(document)
}

const showModal = computed(() => isShowModal.value)

/**
 * moves to first page when searching, so it doesn't show empty pages.
 */
watch(searchQuery, () => {
    currentPage.value = 1
})
</script>

<template>
    <UserDocumentHistoryModal
        v-if="isShowModal"
        :isShowModal="showModal.valueOf()"
        @close="handleCloseModal"
        :document="currentDocument"
    />
    <UserAddDocumentModal :isOpen="isShowModalAddDoc" @close="isShowModalAddDoc = false" :document="currentDocument"/>
    <div class="flex flex-col h-full w-full overflow-x-auto sm:rounded-lg">
        <div class="grid grid-cols-1 md:grid-cols-2 pb-4 bg-white">
            <p class="font-semibold text-2xl">Documentos</p>
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
                        class="block pt-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:text-text-dark dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Buscar documento.."
                    />
                </div>
            </div>
        </div>
        <table class="w-full text-sm text-left rtl:text-right text-gray-500 overflow-auto">
            <thead class="text-xs text-text-white uppercase bg-gray-600">
                <tr>
                    <th
                        @click="sortBy('documentName')"
                        scope="col"
                        class="px-6 py-3 cursor-pointer md:min-w-10 md:max-w-10"
                    >
                        Nombre
                        <span v-if="sortKey === 'documentName'">
                            {{ sortAsc ? '▲' : '▼' }}
                        </span>
                    </th>
                    <th
                        @click="sortBy('state')"
                        scope="col"
                        class="px-6 py-3 cursor-pointer md:min-w-10 md:max-w-10"
                    >
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
                    class="bg-white border-b text-text-dark dark:border-gray-700 border-gray-200 hover:bg-gray-300"
                >
                    <th
                        scope="row"
                        class="md:min-w-10 md:max-w-10 px-6 py-4 font-medium text-text-dark text-ellipsis"
                    >
                        {{ document.documentName }}
                    </th>
                    <td class="max-w-[5rem] px-6 py-4 md:min-w-10 md:max-w-10">
                        {{ document.state }}
                    </td>
                    <td class="max-w-[10rem] px-6 py-4">
                        <div class="flex flex-wrap md:flex-nowrap gap-2 justify-start">
                            <CustomButton
                                label="Ver historial"
                                :buttonType="ButtonType.outlined"
                                :onClick="() => handleDocumentHistoryModal(document)"
                            />
                            <CustomButton v-if="document.state != DocumentStatus.approved" label="Editar" iconName="fa-solid fa-pen-to-square" :onClick="() => handleEditDoc(document)"/>
                            <CustomButton label="Descargar" iconName="fa-solid fa-file-arrow-down" :onClick="() => handleDownload(document)"/>
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
                <span class="font-bold text-text-dark">{{ allDocuments.length }}</span></span
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
