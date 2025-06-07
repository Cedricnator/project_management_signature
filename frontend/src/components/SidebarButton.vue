<script setup lang="ts">
const props = withDefaults(
    defineProps<{
        label: string
        iconName: string
        to?: string | null
        rotation?: number | null
    }>(),
    {
        rotation: 0,
    },
)
</script>

<template>
    <div>
        <button
            href="#"
            class="flex w-full justify-start items-center p-2 text-text-dark rounded-lg hover:bg-primary hover:text-text-white group border-b-1"
        >
            <div class="flex justify-center flex-1">
                <font-awesome-icon :icon="iconName" size="lg" :rotation="props.rotation" />
            </div>
            <div class="flex flex-7">
                <span class="ms-3">{{ props.label }}</span>
            </div>
        </button>
    </div>
</template>
