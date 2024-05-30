<script setup>
    import { ref, watch } from "vue"
    import { useRoute } from 'vue-router'
    import { useAgencesStore } from '../stores/agences'

    const agencesStore = useAgencesStore()
    const route = useRoute()

    const agence = ref(null)
    const users = ref([
        {
            name: 'Responsable',
            agents: []
        },
        {
            name: 'Conseillers',
            agents: [],
        }
    ]);


    const fetchConseiller = () => {
        agencesStore.getAgence(route.params.id)
        .then(res => {
            agence.value = res.agence;
            
            users.value[0].agents = [res.responsable];
            users.value[1].agents = res.conseillers;
        })
        .catch(err => {
            console.error(err);
        }) 
    }
    watch(() => route.params.id, fetchConseiller, {immediate: true});
</script>

<template>
    <div class="h-screen border-r border-r-gray-100 flex-1 overflow-y-auto pb-24">
        <div class="px-8 py-10 w-full" v-if="agence">
            <div class="px-4 sm:px-0">
                <h3 class="text-base font-semibold leading-7 text-gray-900">Agence</h3>
                <p class="mt-1 max-w-2xl text-sm leading-6 text-gray-500">{{ agence.lib_agence }}</p>
            </div>
            <div class="mt-6 border-t border-gray-100">
                <dl class="divide-y divide-gray-100">
                    <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                        <dt class="text-sm font-medium leading-6 text-gray-900">Adresse</dt>
                        <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{{ agence.adr_agence }} {{ agence.ville_agence }}, {{ agence.cp_agence }} </dd>
                    </div>

                    <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                        <dt class="text-sm font-medium leading-6 text-gray-900">Horaires</dt>
                        <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{{ agence.hor_agence }}</dd>
                    </div>
                    
                    <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                        <dt class="text-sm font-medium leading-6 text-gray-900">Adresse e-mail</dt>
                        <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                            <a class="text-rose underline" :href="`mailto:${agence.mail_agence}`">{{ agence.mail_agence }}</a>
                        </dd>
                    </div>

                    <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                        <dt class="text-sm font-medium leading-6 text-gray-900">Téléphone de l'agence</dt>
                        <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                            <a class="text-rose underline" :href="`tel:${agence.tel_agence}`">{{ agence.tel_agence }}</a>
                        </dd>
                    </div>

                    <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                        <dt class="text-sm font-medium leading-6 text-gray-900">Portable de l'agence</dt>
                        <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                            <a class="text-rose underline" :href="`tel:${agence.port_agence}`">{{ agence.port_agence }}</a>
                        </dd>
                    </div>

                    <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                        <dt class="text-sm font-medium leading-6 text-gray-900">Fax de l'agence</dt>
                        <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                            <a class="text-rose underline" :href="`tel:${agence.fax_agence}`">{{ agence.fax_agence }}</a>
                        </dd>
                    </div>

                    <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                        <dt class="text-sm font-medium leading-6 text-gray-900">Siren de l'agence</dt>
                        <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                            {{ agence.siren_agence }}
                        </dd>
                    </div>
                </dl>
            </div>
        </div> 

        <div class="px-4 sm:px-6 lg:px-8 mt-12" v-if="users">
            <div class="sm:flex sm:items-center">
                <div class="sm:flex-auto">
                    <h1 class="text-base font-semibold leading-6 text-gray-900">Utilisateurs</h1>
                    <p class="mt-2 text-sm text-gray-700">Liste des comptes associés à l'agence.</p>
                </div>
                <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <button type="button" class="block rounded-md bg-rose px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600">Ajouter un utilisateur</button>
                </div>
            </div>
            <div class="mt-8 flow-root">
                <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <table class="min-w-full">
                        <thead class="bg-white">
                            <tr>
                                <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3">ID</th>
                                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Nom</th>
                                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Prenom</th>
                                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Rôle</th>
                                <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-3">
                                    <span class="sr-only">Edit</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody class="bg-white">
                            <template v-for="user in users" :key="user.name">
                                <tr class="border-t border-gray-200">
                                    <th colspan="5" scope="colgroup" class="bg-gray-50 py-2 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3">{{ user.name }}</th>
                                </tr>
                                <tr v-for="(agent, personIdx) in user.agents" :class="[personIdx === 0 ? 'border-gray-300' : 'border-gray-200', 'border-t']">
                                    <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-3">{{ agent.ID }}</td>
                                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ agent.nom }}</td>
                                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ agent.prenom }}</td>
                                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ agent.role }}</td>
                                    <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                                        <a href="#" class="text-rose hover:text-rose-400">Modifier</a>
                                    </td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
