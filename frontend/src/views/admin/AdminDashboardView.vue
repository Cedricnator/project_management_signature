<script setup lang="ts">
import { computed, ref } from 'vue'
import { onMounted } from 'vue'
import { useAdminStore } from '@/stores/AdminStore'
import AdminTable from '@/components/admin/AdminTable.vue'
import { ButtonType } from '@/types'
import CustomButton from '@/components/CustomButton.vue';

const adminStore = useAdminStore()

const isCreateUserModal = ref(false)

const users = computed(() => adminStore.users)


const createUserModal = () => {
    isCreateUserModal.value = true
}

const fetchUser = async () => {
    adminStore.getAllUsers()
}

onMounted(() => {
    fetchUser()
})
</script>

<template>
    <div class="p-4 grow">
        <div
            class="flex flex-col h-full w-full p-4 rounded-3xl overflow-auto bg-white shadow-xl/10"
        >
            <div class="flex grow mb-4 p-1 md:p-5">
                <div v-if="users.length == 0" class="flex grow justify-center items-center">
                    No hay usuarios disponibles.
                </div>
                <AdminTable v-else :users="users" />
            </div>
            <div class="flex md:min-h-30 justify-end">
                <div class="flex md:mr-5 md:w-2/5 items-center justify-end">
                    <CustomButton label="Crear usuario" iconName="fa-solid fa-plus" :onClick="createUserModal" />
                </div>
            </div>
        </div>
    </div>
</template>
