<script setup lang="ts">
import { watch, ref, computed } from 'vue'
import CustomButton from '../CustomButton.vue'
import type { UploadDocumentDto, Document, Result, UpdateDocumentDto } from '@/types'
import { useDocumentStore } from '@/stores/DocumentStore'
import { sleep } from '@/utils/timeout';
import { useToastStore } from '@/stores/ToastStore';
import { useUserStore } from '@/stores/UserStore';
import { FwbSpinner } from 'flowbite-vue'

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

const userStore = useUserStore()
const toastStore = useToastStore()
const documentStore = useDocumentStore()
const actionClicked = ref<'create' |'edit'>("create")

const name = ref('')
const description = ref('')
const comentario = ref('')
const file = ref<File | null>(null)


const loading = ref(true)

watch(
    () => props.isOpen,
    async (open) => {
        if (open && props.document) {
        const getFileResult = await documentStore.getFileByDocumentId(props.document)
        if (!getFileResult.success) toastStore.addToast(getFileResult.type, getFileResult.message)
        name.value = props.document.documentName
        description.value = props.document.description
        comentario.value = props.document.commentary ?? ''
        file.value = getFileResult.data ?? null
        loading.value = false
    } else if (open) {
        // If it's a new document
        name.value = ''
        description.value = ''
        comentario.value = ''
        file.value = null
        loading.value = false
    }
    },
    { immediate: true }
)

const isEditMode = computed(() => !!props.document)

const errors = ref({
    name: '',
    description: '',
    comentario: null,
    file: '',
})

const validateForm = () => {
    let valid = true
    errors.value = { name: '', description: '', comentario: null, file: '' }

    if (!name.value.trim()) {
        errors.value.name = 'El nombre del documento es obligatorio.'
        valid = false
    } else if (name.value.length < 3) {
        errors.value.name = 'El nombre debe tener al menos 3 caracteres.'
        valid = false
    } else if (name.value.length > 100) {
        errors.value.name = 'El nombre no puede tener más de 100 caracteres.'
        valid = false
    }

    if (!description.value.trim()) {
        errors.value.description = 'La descripción es obligatoria.'
        valid = false
    } else if (description.value.length < 10) {
        errors.value.description = 'La descripción debe tener al menos 10 caracteres.'
        valid = false
    } else if (description.value.length > 255) {
        errors.value.name = 'El nombre no puede tener más de 200 caracteres.'
        valid = false
    }

    if (!file.value) {
        errors.value.file = 'Debe subir un documento PDF.'
        valid = false
    } else if (file.value.size > 5 * 1024 * 1024) {
        // 5 MB limit
        errors.value.file = 'El archivo no puede superar los 5 MB.'
        valid = false
    }

    return valid
}

function handleFileChange(event: Event) {
    const target = event.target as HTMLInputElement
    file.value = target.files?.[0] || null
}

const handleSubmit = async () => {
    if (validateForm()) {
        actionClicked.value == 'create' ? handleUpload() : handleEdit()
        closeModal()
    }
}

const handleUpload = async () => {
    const uploadDocumentDto: UploadDocumentDto = {
        name: name.value,
        description: description.value,
        commentary: comentario.value || null,
    }
    const result: Result = await userStore.uploadDocument(uploadDocumentDto, file.value!)
    toastStore.addToast(result.type, result.message)
}

const handleEdit = async () => {
    const updateDocument: UpdateDocumentDto = {
        documentId: props.document?.documentId!,
        name: name.value,
        description: description.value,
        commentary: comentario.value || null
    }
    const result: Result = await userStore.updateDocument(updateDocument, file.value!)
    toastStore.addToast(result.type, result.message)
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
        <div class="relative p-4 w-full max-w-xl max-h-full">
            <!-- Modal content -->
            <div class="relative bg-white rounded-lg shadow-sm">
                <!-- Modal header -->
                <div
                    class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200"
                >   
                    <h3 v-if="!isEditMode" class="text-lg font-semibold text-gray-900">Subir nuevo documento</h3>
                    <h3 v-else class="text-lg font-semibold text-gray-900">Editar documento</h3>

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
                <div v-if="loading" class="flex justify-center items-center min-h-100">
                    <fwb-spinner size="8" />
                </div>

                <form v-else class="p-4 md:p-5" @submit.prevent="handleSubmit">
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
                            />
                            <p v-if="errors.name" class="text-red-500 text-sm mt-1">
                                {{ errors.name }}
                            </p>
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
                            ></textarea>
                            <p v-if="errors.description" class="text-red-500 text-sm mt-1">
                                {{ errors.description }}
                            </p>
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
                                v-model="comentario"
                                rows="4"
                                class="block p-2.5 w-full text-sm text-text-dark bg-gray-200 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Escriba su comentario aquí"
                                maxlength="255"
                            ></textarea>
                            <p v-if="errors.comentario" class="text-red-500 text-sm mt-1">
                                {{ errors.comentario }}
                            </p>
                        </div>

                        <!-- File Upload -->
                        <div class="col-span-2">
                            <div class="flex items-center justify-center w-full">
                                <label
                                    for="dropzone-file"
                                    class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                                >
                                    <div
                                        class="flex flex-col items-center justify-center pt-5 pb-6"
                                    >
                                        <svg
                                            class="w-8 h-8 mb-4 text-gray-500"
                                            fill="none"
                                            viewBox="0 0 20 16"
                                        >
                                            <path
                                                stroke="currentColor"
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="2"
                                                d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                                            />
                                        </svg>
                                        <p class="mb-2 text-sm text-gray-500">
                                            <span class="font-semibold"
                                                >Click o arrastre para subir documento</span
                                            >
                                        </p>
                                        <p class="text-xs text-gray-500">PDF</p>
                                    </div>
                                    <input
                                        id="dropzone-file"
                                        type="file"
                                        accept="application/pdf"
                                        class="hidden"
                                        @change="handleFileChange"
                                    />
                                    <span v-if="file != null">
                                        {{ file.name }}
                                    </span>
                                </label>
                            </div>
                            <p v-if="errors.file" class="text-red-500 text-sm mt-2">
                                {{ errors.file }}
                            </p>
                        </div>
                    </div>

                    <!-- Submit Button -->
                    <CustomButton v-if="!isEditMode" type="submit" label="Agregar documento" @click="actionClicked = 'create'"/>
                    <CustomButton v-else type="submit" label="Editar documento" @click="actionClicked = 'edit'"/>
                </form>
            </div>
        </div>
    </div>
</template>
