<script setup lang="ts" >
import { useDocumentStore } from '@/stores/DocumentStore';
import { computed } from 'vue';
import { onMounted } from 'vue';
import router from '@/router';
import TableComponent from '@/components/supervisor/SupervisorTable.vue';
import CustomButton from '@/components/CustomButton.vue';

const documentStore = useDocumentStore();

const documents = computed(() => documentStore.documents)

const fetchDocuments = () => {
    documentStore.getAllDocuments();
}

onMounted(() => {
    fetchDocuments();
})

</script>

<template>
    <div class="p-4 grow">
        <div class="flex flex-col h-full w-full p-4 rounded-3xl overflow-auto bg-white shadow-xl/10">
            <div class="flex grow mb-4 p-1 md:p-5">
                <TableComponent :documents="documents"/>
            </div>
            <div class="flex md:min-h-30 justify-end">
                <div class="flex md:mr-5 md:w-2/5 items-center justify-end">
                    <CustomButton color="supervisor-primary" class="mr-2 md:mr-5" label="Ver historial" :onClick="() => router.push({name: 'user-history'})" />
                </div>
            </div>
        </div>
    </div>
</template>
