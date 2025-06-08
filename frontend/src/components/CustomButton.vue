<script setup lang="ts">
import { ButtonType } from '@/types'
import { computed } from 'vue'

const props = withDefaults(
    defineProps<{
        label: string
        color?: string
        buttonType?: ButtonType
        onClick?: () => void
        loading?: boolean
    }>(),
    {
        color: 'primary',
        buttonType: ButtonType.filled,
        onClick: () => {},
        loading: false,
    },
)

const buttonClasses = computed(() => {
    const base = 'rounded-2xl px-4 py-2 w-full font-semibold transition-all duration-200 shadow-md'

    const filled = `bg-${props.color} hover:bg-blue-800 text-white`
    const outlined = `border border-${props.color}-600 text-${props.color}-600 hover:text-white hover:bg-primary`

    return `${base} ${props.buttonType === ButtonType.filled ? filled : outlined}`
})
</script>

<template>
    <button
        :disabled="loading"
        :class="[buttonClasses, loading ? 'opacity-60 cursor-not-allowed' : '']"
        @click="onClick"
    >
        <span v-if="loading">Cargando...</span>
        <span v-else class="text-nowrap">{{ label }}</span>
    </button>
</template>
