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
        <div class="flex flex-1">testo</div>
        <div class="flex min-w-60 md:min-w-90 p-3 justify-center align-center bg-green-300">
            <AccountCard :account="sessionStore.account" />
        </div>
    </div>
</template>
