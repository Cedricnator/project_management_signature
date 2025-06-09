<script lang="ts" setup>
import { ref } from 'vue'
import {
    FwbButton,
    FwbModal,
    FwbTimeline,
    FwbTimelineBody,
    FwbTimelineContent,
    FwbTimelineItem,
    FwbTimelinePoint,
    FwbTimelineTime,
    FwbTimelineTitle,
} from 'flowbite-vue'
import { computed } from 'vue'
import type { Document, DocumentHistory } from '@/types'
import { onMounted } from 'vue'
import { useDocumentStore } from '@/stores/DocumentStore'
import CustomButton from '@/components/CustomButton.vue'

const props = defineProps<{
    isShowModal: boolean
    document?: Document | null
}>()

const documentStore = useDocumentStore()
var isShowModal = computed(() => props.isShowModal)
const documentHistory = ref<DocumentHistory[]>()

const emit = defineEmits<{
    (e: 'close'): void
}>()

function handleClose() {
    emit('close')
}

const fetchDocumentHistory = async () => {
    documentHistory.value = await documentStore.getDocumentHistoryByDocumentId(
        props.document!.documentId,
    )
}

onMounted(() => {
    fetchDocumentHistory()
})
</script>

<template>
    <fwb-modal v-if="isShowModal && document" @close="handleClose" class="bg-primary">
        <template #header>
            <div class="flex items-center text-lg text-white font-bold">
                Historial {{ document.documentName }}
            </div>
        </template>
        <template #body>
            <div class="border-gray-500 border-l">
                <fwb-timeline class="border-gray-500">
                    <fwb-timeline-item v-for="entry in documentHistory">
                        <fwb-timeline-point class="text-white" />
                        <fwb-timeline-content>
                            <fwb-timeline-time class="text-white">
                                {{ entry.createdAt.toLocaleString() }}
                            </fwb-timeline-time>
                            <fwb-timeline-title>
                                {{ entry.action }}
                            </fwb-timeline-title>
                            <fwb-timeline-body>
                                {{ entry.commentary }}
                            </fwb-timeline-body>
                        </fwb-timeline-content>
                    </fwb-timeline-item>
                </fwb-timeline>
            </div>
        </template>
        <template #footer>
            <div class="flex justify-between">
                <CustomButton label="Continuar" :onClick="handleClose" />
            </div>
        </template>
    </fwb-modal>
</template>
