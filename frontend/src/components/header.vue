<script setup lang="ts">
import router from '@/router'
import AccountCard from '@/components/AccountCard.vue'
import { onMounted } from 'vue'
import { useSessionStore } from '@/stores/SessionStore'

const sessionStore = useSessionStore()

onMounted(() => {})
</script>

<template>
    <div class="flex w-full">
        <div class="md:flex flex-1 hidden"></div>
        <div class="flex min-w-60 md:min-w-90 p-3 justify-center align-center">
            <AccountCard :account="sessionStore.account" />
        </div>
    </div>
</template>
