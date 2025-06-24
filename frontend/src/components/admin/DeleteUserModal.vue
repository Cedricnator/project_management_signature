<script setup lang="ts">
import { useAdminStore } from '@/stores/AdminStore'
import { useToastStore } from '@/stores/ToastStore'
import { ButtonType, AccountRoleLabel, type AdminUser } from '@/types'
import { ref } from 'vue'
import CustomButton from '@/components/CustomButton.vue'

const props = defineProps<{
    isOpen: boolean
    user?: AdminUser
}>()

const emit = defineEmits<{
    (e: 'close'): void
}>()

function closeModal() {
    emit('close')
}

const adminStore = useAdminStore()
const toastStore = useToastStore()

const handleDelete = async () => {
    const response = await adminStore.deleteUser(props.user!)

    toastStore.addToast(response.type, response.message)

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
                    <h3 class="text-lg font-semibold text-gray-900">Eliminar usuario</h3>

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
                <div class="p-4 md:p-5">
                    <div class="grid gap-2 mb-10 grid-cols-2">
                        <div class="col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-1"
                                >Email</label
                            >
                            <input
                                type="text"
                                :value="user?.email"
                                readonly
                                class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                            />
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1"
                                >Nombre</label
                            >
                            <input
                                type="text"
                                :value="user?.firstName"
                                readonly
                                class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                            />
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1"
                                >Apellido</label
                            >
                            <input
                                type="text"
                                :value="user?.lastName"
                                readonly
                                class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                            />
                        </div>

                        <div class="col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                            <input
                                type="text"
                                :value="AccountRoleLabel[user?.role!]"
                                readonly
                                class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                            />
                        </div>
                    </div>
                    <div class="flex justify-between">
                        <div class="flex grow max-w-3xs">
                            <CustomButton
                                type="submit"
                                label="Eliminar Usuario"
                                iconName="fa-solid fa-trash-can"
                                color="bg-red-800"
                                @click="handleDelete"
                            />
                        </div>
                        <div class="flex grow max-w-3xs">
                            <CustomButton
                                type="submit"
                                label="Cancelar"
                                :buttonType="ButtonType.outlined"
                                @click="closeModal"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
