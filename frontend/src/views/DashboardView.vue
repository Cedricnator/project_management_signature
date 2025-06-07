<script setup lang="ts">
import TableComponent from '@/components/UserTableComponent.vue';
import { computed, onMounted } from 'vue';
import { useDocumentStore } from '@/stores/DocumentStore'

const documentStore = useDocumentStore();
const documents = computed(() => documentStore.documents);

const fetchDocuments = () => {
    documentStore.getAllDocuments();
}

onMounted(() => {
    fetchDocuments();
})

</script>

<template>

    <div class="flex h-full w-full p-4 border rounded-3xl">
        <TableComponent :documents="documents"/>
    </div>
</template>
