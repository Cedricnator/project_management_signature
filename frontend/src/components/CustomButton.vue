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
        color: 'primary',
        buttonType: ButtonType.filled,
        onClick: () => {},
        loading: false,
    },
)

const buttonClasses = computed(() => {
    const base = 'rounded-2xl px-4 py-2 w-full font-semibold transition-all duration-200 shadow-2xl'

    const filled = `supervisor:bg-[var(--color-primary)] user:bg-[var(--color-primary)] user:hover:bg-[var(--color-primary-800)] supervisor:hover:bg-[var(--color-primary-800)] text-white`
    const outlined = `border border-${props.color}-600 text-${props.color}-600 hover:text-white hover:bg-[var(--color-primary)]`

    return `${base} ${props.buttonType === ButtonType.filled ? filled : outlined}`
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
        <div v-else class="flex space-x-3 flex-nowrap justify-center">
            <span v-if="iconName != null">
                <font-awesome-icon :icon="props.iconName" size="lg" />
            </span>
            <span class="text-nowrap">
                {{ props.label }}
            </span>
        </div>
    </button>
    
</template>
