<script setup lang="ts">
import { useAccountFormValidation } from '@/composables/useAdminUserFormValidation'
import { useToastStore } from '@/stores/ToastStore'
import { AccountRole, type AdminUser, type NewUser } from '@/types'
import { computed, ref, watch } from 'vue'
import CustomButton from '@/components/CustomButton.vue'
import CustomSelect from '@/components/CustomSelect.vue'
import { useAdminStore } from '@/stores/AdminStore'

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
// composable
const { email, firstName, lastName, role, password, confirmPassword, errors, validate } = useAccountFormValidation()
const loading = ref(true)
const actionClicked = ref<'create' |'edit'>("create")

const adminUserRoles = [ {
    value: AccountRole.user, name: 'Usuario'
}, {value: AccountRole.supervisor, name: 'Supervisor'}]


const handleSubmit = async () => {
    if (!validate(props.user)) return
    
    const response = actionClicked.value == 'create' ? await handleCreate() : await handleEdit()
    toastStore.addToast(response.type, response.message)
    
    closeModal()
}

const handleCreate = async () => {
    const newUser: NewUser = {
        email: email.value,
        firstName: firstName.value,
        lastName: lastName.value,
        password: password.value,
        role: role.value
    }
    return await adminStore.createUser(newUser)
}

const handleEdit = async () => {
    return await adminStore.editRole(email.value, role.value)
}

const isEditMode = computed(() => !!props.user)

watch(
    () => props.isOpen,
    async (open) => {
        if (open && props.user) {
            email.value = props.user.email
            firstName.value = props.user.firstName
            lastName.value = props.user.lastName
            role.value = props.user.role
            password.value = 'isEditMode'
            confirmPassword.value = 'isEditMode'
            loading.value = false
        } else if (open) {
            // email.value = ''
            // firstName.value = ''
            // lastName.value = ''
            // password.value = ''
            // confirmPassword.value = ''
            // role.value = AccountRole.user
            // loading.value = false
        }
    },
    { immediate: true },
)
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
                    <h3 v-if="isEditMode" class="text-lg font-semibold text-gray-900">
                        Editar rol
                    </h3>
                    <h3 v-else class="text-lg font-semibold text-gray-900">Crear Usuario</h3>

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
                    <div class="grid gap-4 mb-10 grid-cols-2">
                        <!-- Email -->
                        <div class="col-span-2">
                            <label for="email" class="block mb-2 text-sm font-medium text-gray-900">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                v-model="email"
                                class="block p-2.5 w-full text-sm text-text-dark bg-gray-200 rounded-lg border border-gray-300 focus:ring-black focus:border-black"
                                placeholder="Ingrese email"
                                maxlength="100"
                                autocomplete="off"
                                :disabled="isEditMode"
                            />
                            <p v-if="errors.email" class="text-red-500 text-sm mt-1">
                                {{ errors.email }}
                            </p>
                        </div>

                        <!-- Password -->
                        <div v-if="!isEditMode" class="col-span-2">
                            <label for="password" class="block mb-2 text-sm font-medium text-gray-900">
                                Contraseña
                            </label>
                            <input
                                type="password"
                                id="password"
                                v-model="password"
                                class="block p-2.5 w-full text-sm text-text-dark bg-gray-200 rounded-lg border border-gray-300 focus:ring-black focus:border-black"
                                placeholder="Ingrese contraseña"
                                maxlength="8"
                                autocomplete="off"
                                :disabled="isEditMode"
                            />
                            <p v-if="errors.password" class="text-red-500 text-sm mt-1">
                                {{ errors.password }}
                            </p>
                        </div>

                        <!-- RepeatPassword -->
                        <div v-if="!isEditMode" class="col-span-2">
                            <label for="confirm-password" class="block mb-2 text-sm font-medium text-gray-900">
                                Confirmar contraseña
                            </label>
                            <input
                                type="password"
                                id="confirm-password"
                                v-model="confirmPassword"
                                class="block p-2.5 w-full text-sm text-text-dark bg-gray-200 rounded-lg border border-gray-300 focus:ring-black focus:border-black"
                                placeholder="Ingrese contraseña"
                                maxlength="8"
                                autocomplete="off"
                                :disabled="isEditMode"
                            />
                            <p v-if="errors.confirmPassword" class="text-red-500 text-sm mt-1">
                                {{ errors.confirmPassword }}
                            </p>
                        </div>

                        <!-- firstName -->
                        <div class="col-span-2">
                            <label
                                for="fistName"
                                class="block mb-2 text-sm font-medium text-gray-900"
                            >
                                Nombre
                            </label>
                            <input
                                type="text"
                                id="fistName"
                                v-model="firstName"
                                rows="4"
                                class="block p-2.5 w-full text-sm text-text-dark bg-gray-200 rounded-lg border border-gray-300 focus:ring-black focus:border-black"
                                placeholder="Ingrese nombre"
                                maxlength="20"
                                :disabled="isEditMode"
                            ></input>
                            <p v-if="errors.firstName" class="text-red-500 text-sm mt-1">
                                {{ errors.firstName }}
                            </p>
                        </div>

                        <!-- lastName -->
                        <div class="col-span-2">
                            <label
                                for="lastName"
                                class="block mb-2 text-sm font-medium text-gray-900"
                            >
                                Apellido
                            </label>
                            <input
                                type="text"
                                id="lastName"
                                v-model="lastName"
                                rows="4"
                                class="block p-2.5 w-full text-sm text-text-dark bg-gray-200 rounded-lg border border-gray-300 focus:ring-black focus:border-black"
                                placeholder="Ingrese apellido"
                                maxlength="20"
                                :disabled="isEditMode"
                            ></input>
                            <p v-if="errors.lastName" class="text-red-500 text-sm mt-1">
                                {{ errors.lastName }}
                            </p>
                        </div>

                        <!-- role -->
                        <div class="col-span-2">
                            <CustomSelect
                                v-model="role"
                                :options="adminUserRoles"
                                label="Rol"
                                placeholder="Seleccione rol"
                            />
                            <p v-if="errors.role" class="text-red-500 text-sm mt-1">
                                {{ errors.role }}
                            </p>
                        </div>
                    </div>

                    <!-- Submit Button -->
                    <div class="flex justify-center">
                        <div v-if="!isEditMode" class="flex grow">
                            <CustomButton
                                type="submit"
                                label="Crear Usuario"
                                iconName="fa-solid fa-plus"
                                @click="() => (actionClicked = 'create')"
                            />
                        </div>
                        <div v-else class="flex grow">
                            <CustomButton
                                type="submit"
                                label="Editar rol"
                                iconName="fa-solid fa-pen-to-square"
                                @click="() => (actionClicked = 'edit')"
                            />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>
