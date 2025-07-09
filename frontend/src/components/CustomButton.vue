<script setup lang="ts">
import { ButtonType } from '@/types'
import { computed } from 'vue'
import { FwbSpinner } from 'flowbite-vue'

const props = withDefaults(
    defineProps<{
        label: string
        color?: string
        buttonType?: ButtonType
        onClick?: () => void
        loading?: boolean
        iconName?: null | string
    }>(),
    {
        color: 'supervisor:bg-[var(--color-primary)] user:bg-[var(--color-primary)] admin:bg-[var(--color-primary)]',
        buttonType: ButtonType.filled,
        onClick: () => {},
        loading: false,
    },
)

const buttonClasses = computed(() => {
    const base = 'rounded-2xl px-4 py-2 w-full font-semibold transition-all duration-200 shadow-2xl'

    const filled = `${props.color} user:hover:bg-[var(--color-primary-800)] supervisor:hover:bg-[var(--color-primary-800)] admin:hover:bg-[var(--color-primary-800)] text-white`
    const outlined = `border space-x-3 hover:text-white hover:bg-[var(--color-primary)]`
    const icon = `transition-all duration-200 shadow-2xl p-2 w-10 h-10 flex items-center justify-center admin:text-[var(--color-primary)] hover:text-white admin:hover:bg-[var(--color-primary)]` 
    switch (props.buttonType) {
        case ButtonType.filled:
            return `${base} ${filled}`
        case ButtonType.outlined:
            return `${base} ${outlined}`
        case ButtonType.icon:
            return `${icon} rounded-full`
        default:
            return base
    }
})
</script>

<template>
    <button
        :disabled="loading"
        :class="[buttonClasses, loading ? 'opacity-60 cursor-not-allowed' : '']"
        @click="onClick"
    >
        <span v-if="loading">
            <fwb-spinner size="8" />
        </span>
        <template v-else>
            <div v-if="props.buttonType !== ButtonType.icon" class="flex space-x-3 flex-nowrap justify-center">
                <span v-if="iconName != null">
                    <font-awesome-icon :icon="props.iconName" size="lg" />
                </span>
                <span class="text-nowrap">
                    {{ props.label }}
                </span>
            </div>
            <div v-else>
                <font-awesome-icon :icon="props.iconName" size="xl" />
            </div>
        </template>
    </button>
    
</template>
