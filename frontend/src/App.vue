<script setup lang="ts">
import { RouterView } from 'vue-router'
import ToastContainer from '@/components/ToastContainer.vue';
import api from './utils/axios';

</script>

<template>
  <ToastContainer />
  <RouterView />
</template>

