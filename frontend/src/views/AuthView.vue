<script setup lang="ts"></script>

<template>
    <main>
        <div class="flex bg-white p-5 font-bold">
            <p class="flex">Firma Digital</p>
        </div>
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
                <button class="bg-blue-700 w-[350px] mt-10 rounded-full px-2 py-2 cursor-pointer text-white">Iniciar Sesión</button>
                </div>
                </div>
            </form>
        </div>
    </main>
</template>
