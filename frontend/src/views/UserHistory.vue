<script setup lang="ts">
import { FwbSpinner } from 'flowbite-vue'
import { useSessionStore } from '@/stores/SessionStore'
import { useUserStore } from '@/stores/UserStore'
import { ref } from 'vue'
import { onMounted } from 'vue'
import { computed } from 'vue'
import UserHistoryTable from '@/components/user/UserHistoryTable.vue'

const loading = ref(true)
const userStore = useUserStore()
const sessionStore = useSessionStore()

const userDocumentHistory = computed(() => userStore.documentHistory)

const fetchUserHistory = async () => {
    await userStore.getUserDocumentsHistoryByUserId(sessionStore.account.accountId)
    loading.value = false
}

onMounted(() => {
    fetchUserHistory()
})
</script>

<template>
    <div class="p-4 grow">
        <div
            class="flex flex-col h-full w-full p-4 rounded-3xl overflow-auto bg-white shadow-xl/10"
        >
            <div v-if="loading" class="flex w-full grow justify-center items-center">
                <fwb-spinner size="8" />
            </div>
            <div v-else class="md:p-5">
                <UserHistoryTable :documentsHistory="userDocumentHistory" />
            </div>
        </div>
    </div>
</template>
