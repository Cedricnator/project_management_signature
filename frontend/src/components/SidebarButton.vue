<script setup lang="ts">
const props = withDefaults(
    defineProps<{
        label: string
        iconName: string
        to?: string | null
        rotation?:  0 | number
        danger?: boolean | null
    }>(),
    {
        rotation: 0,
        danger: false
    },
)
</script>

<template>
    <div>
        <button
            class="flex w-full justify-start items-center p-2 rounded-lg hover:bg-primary hover:text-text-white group border-b-1" 
            :class="{'text-red-800': danger, 'text-text-dark': !danger}"
        >
            <div class="flex justify-center flex-1">
                <font-awesome-icon :icon="iconName" size="lg" :rotation="props.rotation!" />
            </div>
            <div class="flex flex-7">
                <span class="ms-3">{{ props.label }}</span>
            </div>
        </button>
    </div>
</template>
