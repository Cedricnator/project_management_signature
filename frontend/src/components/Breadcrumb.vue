<script setup lang="ts">
import { FwbBreadcrumb, FwbBreadcrumbItem } from 'flowbite-vue'
</script>

<template>
    <fwb-breadcrumb>
        <fwb-breadcrumb-item home
            ><router-link :to="{ name: 'user-dashboard' }">Dashboard</router-link>
        </fwb-breadcrumb-item>
        <fwb-breadcrumb-item>
            <router-link :to="{ name: 'user-documents' }">Documents</router-link>
        </fwb-breadcrumb-item>
        <fwb-breadcrumb-item>
            <router-link to="">Dashboard</router-link>
        </fwb-breadcrumb-item>
    </fwb-breadcrumb>
</template>
