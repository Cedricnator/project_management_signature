<script setup lang="ts">
import type { Account, AccountRole } from '@/types'

const props = defineProps<{
    account: Account
}>()
</script>

<template>
    <div class="flex grow items-center border">
        <div class="flex w-full items-center">
            <div
                class="flex grow min-w-14 min-h-14 max-w-18 max-h-18 md:min-h-18 md:min-w-18 border rounded-full justify-center items-center"
            >
                <img src="" alt="#" />
            </div>
            <div class="flex w-full flex-col p-2 justify-start border">
                <div class="flex grow truncate">
                    <p class="text-primary">{{ account.role }}</p>
                </div>
                <div class="flex grow truncate">
                    <p class="font-bold">{{ account.username }}</p>
                </div>
                <div class="flex grow truncate">
                    <p>{{ account.email }}</p>
                </div>
            </div>
        </div>
    </div>
</template>
