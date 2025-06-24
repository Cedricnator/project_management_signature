<script setup lang="ts">
import Imagen from '@/assets/image-removebg-preview 1.png'
import { useSessionStore } from '@/stores/SessionStore'
import { useToastStore } from '@/stores/ToastStore'
import type { NewLogin } from '@/types'
import { sleep } from '@/utils/timeout'
import { ref } from 'vue'
import router from '@/router';
import { getDefaultDashboard } from '@/utils/defaultDashboard'

const image = Imagen as string

const toastStore = useToastStore()
const sessionStore = useSessionStore()
const email = ref('')
const password = ref('')
const emailError = ref('')
const passwordError = ref('')

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateForm(){
  emailError.value = !email.value ? 'Correo requerido' : ''
  if (email.value && !emailRegex.test(email.value)) {
    emailError.value = 'Correo no válido'
  }

  passwordError.value = !password.value ? 'Contraseña requerida' : ''

  return !emailError.value && !passwordError.value

}

async function onSubmit(event: Event){
    event.preventDefault()
    if(!validateForm()) return

    const newLogin: NewLogin = {
        email: email.value,
        password: password.value
    }

    const response = await sessionStore.login(newLogin);
    toastStore.addToast(response.type, response.message)
    if (response.success) {
        await sleep(500)
        const redirectPath = getDefaultDashboard(sessionStore.account.role)
        router.push(redirectPath)
    }
}
</script>

<template>
    <main>
        <div class="flex bg-white p-5 font-bold">
            <p class="flex">Firma Digital</p>
        </div>
        <div class="flex ml-30">
        <div class="w-[600px]">
            <h1 class="mt-10 text-center mr-55 font-bold text-2xl font-text">Iniciar Sesión</h1>
            <h3 class="text-center mr-58 mb-10 text-blue-800 font-text font-bold text-sm">Bienvenido de vuelta</h3>
            <form @submit="onSubmit">
                <div class="flex justify-center items-center">
                    <div class="mt-10">
                        <label for="text" class="text-xs font-text">Correo Electrónico</label> <br>
                        <span>
                            <font-awesome-icon :icon="['fas', 'envelope']" />
                        </span>
                        <input v-model="email" class="w-[350px] pl-2 border-b-2 border-gray-400 focus:border-blue-600 outline-none font-text" placeholder="Ingresa tu correo electronico"> <br>
                        <p v-if="emailError"  class="text-red-600 text-xs mb-3">{{ emailError }}</p>
                        
                        <label for="text" class="text-xs font-text">Contraseña</label> <br>
                        <span>
                            <font-awesome-icon :icon="['fas', 'lock']" />
                        </span>
                        <input 
                            v-model="password"
                            type="password"
                            class="w-[350px] pl-2 border-0 outline-0 focus:outline-0 focus:border-b-2 focus:border-blue-600 focus:ring-0 border-b-2 border-gray-400 outline-none font-text"
                            placeholder="Ingresa tu contraseña"
                            maxlength="9"
                            >
                        </input>
                        <br>
                        <p v-if="passwordError" class="text-red-600 text-xs mb-3">{{ passwordError }}</p>
                        <div class="flex flex-col">
                            <button type="submit" class="bg-blue-700 w-[350px] mt-10 rounded-full px-2 py-2 cursor-pointer text-white">Iniciar Sesión</button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
            <div class="bg-blue-950 w-[450px] justify-end flex flex-col rounded-lg text-white items-center pb-5 h-[600px]">
                <img :src="image" alt="" class="h-68 mt-10">
                <h1 class="text-center font-text text-2xl font-bold mt-20">Iniciar Sesión en Firma Digital</h1>
                <p class="mb-20 text-center mr-18">Comienza a gestionar tus documentos</p>
            </div>
        </div>
    </main>
</template>
