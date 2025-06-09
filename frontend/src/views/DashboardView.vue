<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useDocumentStore } from '@/stores/DocumentStore';
import CustomButton from '@/components/CustomButton.vue';
import TableComponent from '@/components/user/UserTableComponent.vue';
import router from '@/router';

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
    <div class="p-4 grow">
        <div class="flex flex-col h-full w-full p-4 rounded-3xl overflow-auto bg-white shadow-xl/10">
            <div class="flex grow mb-4 p-1 md:p-5">
                <TableComponent :documents="documents"/>
            </div>
            <div class="flex md:min-h-30 justify-end">
                <div class="flex md:mr-5 md:w-2/5 items-center justify-end">
                    <CustomButton class="mr-2 md:mr-5" label="Ver historial" :onClick="() => router.push({name: 'user-history'})" />
                    <CustomButton label="Agregar documento" />
                </div>
            </div>
        </div>
    </div>
    
</template>
