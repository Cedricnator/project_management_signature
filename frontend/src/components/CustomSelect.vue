<script setup lang="ts">
interface Option {
    value: string | number
    name: string
}

const props = defineProps<{
    modelValue: string | number | null
    options: Option[]
    placeholder?: string
    label?: string
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: string | number | null): void
}>()

function onChange(event: Event) {
    const target = event.target as HTMLSelectElement
    emit('update:modelValue', target.value === '' ? null : target.value)
}
</script>

<template>
    <label class="block w-full">
        <span v-if="label" class="text-sm font-medium text-gray-900 mb-1">{{ label }}</span>

        <!-- The native select element -->
        <select
            class="block w-full px-3 py-2 text-sm border rounded-md bg-white focus:outline-none focus:ring-black focus:border-black"
            :value="modelValue"
            @change="onChange"
        >
            <!-- Optional placeholder -->
            <option v-if="placeholder" disabled value="">
                {{ placeholder }}
            </option>

            <!-- Dynamically‑generated options -->
            <option
                class="hover:bg-black"
                v-for="opt in options"
                :key="opt.value"
                :value="opt.value"
            >
                {{ opt.name }}
            </option>
        </select>
    </label>
</template>
