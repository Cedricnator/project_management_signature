<script setup lang="ts">
import router from '@/router';

const props = withDefaults(
    defineProps<{
        label: string
        iconName: string
        to: string
        rotation?:  null | number
        danger?: boolean | null
    }>(),
    {
        danger: false,
        to: '/'
    },
)
</script>

<template>
    <div>
        <button
            @click="router.push({name: props.to})"
            class="flex w-full justify-start items-center p-2 rounded-lg hover:bg-primary hover:text-text-white group border-b-1" 
            :class="{'text-red-800': danger, 'text-text-dark': !danger}"
        >
            <div class="flex justify-center flex-1">
                <font-awesome-icon v-if="rotation == null" :icon="iconName" size="lg" />
                <font-awesome-icon v-else :icon="iconName" size="lg" :rotation="props.rotation" />
            </div>
            <div class="flex flex-7">
                <span class="ms-3">{{ props.label }}</span>
            </div>
        </button>
    </div>
</template>
