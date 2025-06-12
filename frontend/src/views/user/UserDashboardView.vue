<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useDocumentStore } from '@/stores/DocumentStore';
import CustomButton from '@/components/CustomButton.vue';
import TableComponent from '@/components/user/UserTableComponent.vue';
import router from '@/router';
import UserAddDocumentModal from '@/components/user/UserAddDocumentModal.vue';

const documentStore = useDocumentStore();
const documents = computed(() => documentStore.documents);
const isShowModalAddDoc = ref(false)

const fetchDocuments = () => {
    documentStore.getAllDocuments();
}

function openDocModal() {
    isShowModalAddDoc.value = true
}

onMounted(() => {
    fetchDocuments();
})

</script>

<template>
    <UserAddDocumentModal :isOpen="isShowModalAddDoc" @close="isShowModalAddDoc = false"/>
    <div class="p-4 grow">
        <div class="flex flex-col h-full w-full p-4 rounded-3xl overflow-auto bg-white shadow-xl/10">
            <div class="flex grow mb-4 p-1 md:p-5">
                <TableComponent :documents="documents"/>
            </div>
            <div class="flex md:min-h-30 justify-end">
                <div class="flex md:mr-5 md:w-2/5 items-center justify-end">
                    <CustomButton class="mr-2 md:mr-5" label="Ver historial" :onClick="() => router.push({name: 'user-history'})" />
                    <CustomButton label="Agregar documento" iconName="fa-solid fa-plus" :onClick="openDocModal" />
                </div>
            </div>
        </div>
    </div>
    
</template>
