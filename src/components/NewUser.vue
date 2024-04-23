<script setup>
      import { PlusIcon } from '@heroicons/vue/24/outline';
      import { UserPlusIcon } from '@heroicons/vue/20/solid'
</script>


<template>
      <div class="w-auto mx-auto h-auto py-20 relative rounded-lg text-center ">
            <UserPlusIcon class="mx-auto h-10 w-10 text-gray-200" />
            <h3 class="mt-2 text-sm font-semibold text-gray-900">Nouveau client ?</h3>
            <p class="mt-1 text-sm text-gray-500">Cliquez sur le bouton ci-dessous pour ajouter votre nouveau client</p>
            <div class="mt-6">
                  <router-link :to="{path: '/clients/fiche/creation'}" type="button" class="inline-flex items-center rounded-md bg-rose-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                        <PlusIcon class="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                        Ajouter un client
                  </router-link>
            </div>
      </div>
</template>

