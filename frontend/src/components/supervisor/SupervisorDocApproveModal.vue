<script setup lang="ts">
import { watch, ref, computed } from 'vue'
import CustomButton from '../CustomButton.vue'
import {
    type UploadDocumentDto,
    type Document,
    type Result,
    DocumentStatus,
    type ProcededDocument,
} from '@/types'
import { useDocumentStore } from '@/stores/DocumentStore'
import { sleep } from '@/utils/timeout'
import { FwbToast } from 'flowbite-vue'
import { ToastType, useToastStore } from '@/stores/ToastStore'

const props = defineProps<{
    isOpen: boolean
    document?: Document
}>()

const emit = defineEmits<{
    (e: 'close'): void
}>()

function closeModal() {
    emit('close')
}

const actionClicked = ref('')
const toastStore = useToastStore()
const documentStore = useDocumentStore()
const name = ref('')
const description = ref('')
const comentario = ref('')
const supervisorCommentary = ref('')
const file = ref<File | null>(null)

const loading = ref(true)

watch(
    () => props.isOpen,
    async (open) => {
        if (open && props.document) {
            const currentFile = await documentStore.getFileByDocumentId(props.document.documentId)
            name.value = props.document.documentName
            description.value = props.document.description
            comentario.value = props.document.commentary ?? ''
            file.value = currentFile
            sleep(500)
            loading.value = false
        }
    },
    { immediate: true },
)

const handleSubmit = async () => {
    if (!actionClicked.value) return

    const docStatus =
        actionClicked.value == 'approve' ? DocumentStatus.approved : DocumentStatus.rejected

    const processedDocument: ProcededDocument = {
        documentId: props.document?.documentId!,
        processedAt: new Date(),
        supervisorCommentary: supervisorCommentary.value || null,
        status: docStatus,
    }
    const result = await documentStore.processDocument(processedDocument)
    const toastType = result.success ? ToastType.success : ToastType.warning
    toastStore.addToast(toastType, result.message)

    closeModal()
}
</script>

<template>
    <div v-if="isOpen" class="fixed inset-0 z-40 bg-black opacity-20"></div>
    <!-- Main modal -->

    <div
        v-if="isOpen"
        @click.self="closeModal"
        id="crud-modal"
        tabindex="-1"
        class="fixed flex overflow-y-auto overflow-x-hidden z-50 justify-center items-center w-full inset-0 h-[calc(100%-1rem)] max-h-full opacity-100"
    >
        <div class="relative p-4 w-full max-w-2xl max-h-full">
            <!-- Modal content -->
            <div class="relative bg-white rounded-lg shadow-sm">
                <!-- Modal header -->
                <div
                    class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200"
                >
                    <h3 class="text-lg font-semibold text-gray-900">Procesar documento</h3>

                    <button
                        @click="closeModal"
                        type="button"
                        class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                        data-modal-toggle="crud-modal"
                    >
                        <svg
                            class="w-3 h-3"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 14 14"
                        >
                            <path
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                            />
                        </svg>
                        <span class="sr-only">Close modal</span>
                    </button>
                </div>
                <!-- Modal body -->
                <form class="p-4 md:p-5" @submit.prevent="handleSubmit">
                    <div class="grid gap-4 mb-4 grid-cols-2">
                        <!-- Name -->
                        <div class="col-span-2">
                            <label for="name" class="block mb-2 text-sm font-medium text-gray-900">
                                Nombre del documento
                            </label>
                            <input
                                type="text"
                                id="name"
                                v-model="name"
                                class="bg-gray-200 border border-gray-300 text-text-black text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                placeholder="Ingrese nombre del documento"
                                maxlength="100"
                                autocomplete="off"
                                disabled
                            />
                        </div>

                        <!-- Description -->
                        <div class="col-span-2">
                            <label
                                for="description"
                                class="block mb-2 text-sm font-medium text-gray-900"
                            >
                                Descripción
                            </label>
                            <textarea
                                id="description"
                                v-model="description"
                                rows="4"
                                class="block p-2.5 w-full text-sm text-text-dark bg-gray-200 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Escriba su descripción aquí"
                                maxlength="255"
                                disabled
                            ></textarea>
                        </div>

                        <div v-if="comentario != ''" class="col-span-2">
                            <label
                                for="commentary"
                                class="block mb-2 text-sm font-medium text-gray-900"
                            >
                                Comentario documento
                            </label>
                            <textarea
                                id="commentary"
                                v-model="comentario"
                                rows="4"
                                class="block p-2.5 w-full text-sm text-text-dark bg-gray-200 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Escriba su comentario aquí"
                                maxlength="255"
                                disabled
                            ></textarea>
                        </div>
                        <div class="flex col-span-2 gap-2">
                            <label class="block mb-2 text-sm font-medium text-gray-900">
                                Documento:
                            </label>
                            <span class="text-sm font-semibold text-[var(--color-primary)]">
                                {{ file?.name }}
                            </span>
                        </div>
                        <div class="col-span-2">
                            <label
                                for="commentary"
                                class="block mb-2 text-sm font-medium text-gray-900"
                            >
                                Comentario
                            </label>
                            <textarea
                                id="commentary"
                                v-model="supervisorCommentary"
                                rows="4"
                                class="block p-2.5 w-full text-sm text-text-dark supervisor:bg-[var(--color-background)] rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Escriba su comentario aquí"
                                maxlength="255"
                            ></textarea>
                        </div>
                    </div>

                    <!-- Submit Button -->
                    <div class="flex justify-between">
                        <div class="flex">
                            <CustomButton
                                type="submit"
                                label="Aprobar documento"
                                iconName="fa-solid fa-check-circle"
                                @click="() => (actionClicked = 'approve')"
                            />
                        </div>
                        <div class="flex">
                            <CustomButton
                                type="submit"
                                label="Rechazar documento"
                                iconName="fa-solid fa-circle-xmark"
                                @click="() => (actionClicked = 'reject')"
                                color="bg-red-800"
                            />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>
