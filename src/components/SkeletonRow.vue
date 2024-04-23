<template>
     <li class="relative flex justify-between gap-x-6 px-4 py-5" v-for="n in 6">
        <div class="flex min-w-0 gap-x-4 items-center animate-pulse">
            <span class="bg-gray-300 h-12 w-12 rounded-full"></span>
            
            <div class="min-w-0 flex-auto">
                <span class="bg-gray-300 w-32 h-4 block rounded-xl"></span>
                <span class="bg-gray-300 w-12 h-3 block rounded-xl mt-2"></span>
            </div>
        </div>

        <div class="flex shrink-0 items-center gap-x-4 animate-pulse">
            <div class="flex flex-none items-center gap-x-4">
                <span class="bg-gray-300 w-32 h-8 block rounded-xl"></span>
                <span class="bg-gray-300 w-32 h-8 block rounded-xl"></span>
            </div>
        </div>
    </li>
</template>