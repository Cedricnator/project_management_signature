<script lang="ts">
import { defineComponent } from 'vue';
import Imagen from '@/assets/image-removebg-preview 1.png'

export default defineComponent({
    data(){
        return{
            image: Imagen as string 
        }
    }
})


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
            <form>
                <div class="flex justify-center items-center">
                <div class="mt-10">
                <label for="text" class="text-xs font-text">Correo Electrónico</label> <br>
                <span>
               <font-awesome-icon :icon="['fas', 'envelope']" />
               </span>
                <input class="w-[350px] pl-2 border-b-2 border-gray-400 focus:border-blue-600 outline-none font-text mb-10" placeholder="Ingresa tu correo electronico"> <br>
                
                <label for="text" class="text-xs font-text">Contraseña</label> <br>
                <span>
               <font-awesome-icon :icon="['fas', 'lock']" />
               </span>
                <input class="w-[350px] pl-2 border-b-2 border-gray-400 focus:border-blue-600 outline-none font-text" placeholder="Ingresa tu contraseña"> <br>
                <div class="flex flex-col">
                    <a href="#" class="font-text text-gray-400 text-right pt-3 text-sm">¿Olvidaste tu contraseña?</a>
                <button class="bg-blue-700 w-[350px] mt-10 rounded-full px-2 py-2 cursor-pointer text-white">Iniciar Sesión</button>
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
