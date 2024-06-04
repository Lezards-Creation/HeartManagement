<script setup>
    import { ref, watch } from "vue"
    import { useRoute } from 'vue-router'
    import { useAgencesStore } from '../stores/agences'    
    import {
        CalendarIcon,
        XMarkIcon,
        ChevronDownIcon,
        PhoneIcon,
        DevicePhoneMobileIcon,
        PrinterIcon,
        AtSymbolIcon,
        BuildingOffice2Icon,
        MapPinIcon,
        PencilIcon,
    } from '@heroicons/vue/24/outline'
    import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'



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
            <div class="lg:flex lg:items-center lg:justify-between">
                <div class="min-w-0 flex-1">
                    <h2 class="mt-2 text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">{{ agence.lib_agence}}</h2>
                
                    <div class="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:gap-x-6 gap-y-3">
                        <div class="flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:gap-x-6 gap-y-3"> 
                            <div v-if="agence.adr_agence" class="mt-2 flex items-center text-sm text-gray-500">
                                <MapPinIcon class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                                {{ agence.adr_agence }}
                            </div>
                            <div v-if="agence.hor_agence" class="mt-2 flex items-center text-sm text-gray-500">
                                <CalendarIcon class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                                {{ agence.hor_agence }}
                            </div>
                        </div>
                        
                        <div class="flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:gap-x-6 gap-y-3">
                            <div v-if="agence.mail_agence" class="mt-2 flex items-center text-sm text-gray-500">
                                <AtSymbolIcon class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                                <a class="hover:text-rose" :href="`mailto:${agence.mail_agence}`">{{ agence.mail_agence }}</a>
                            </div>
    
                            <div v-if="agence.tel_agence" class="mt-2 flex items-center text-sm text-gray-500">
                                <PhoneIcon class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                                <a class="hover:text-rose" :href="`tel:${agence.tel_agence}`">{{ agence.tel_agence }}</a>
                            </div>
    
                            <div v-if="agence.port_agence" class="mt-2 flex items-center text-sm text-gray-500">
                                <DevicePhoneMobileIcon class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                                <a class="hover:text-rose" :href="`tel:${agence.port_agence}`">{{ agence.port_agence }}</a>
                            </div>
    
                            <div v-if="agence.fax_agence" class="mt-2 flex items-center text-sm text-gray-500">
                                <PrinterIcon class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                                <a class="hover:text-rose" :href="`fax:${agence.fax_agence}`">{{ agence.fax_agence }}</a>
                            </div>
    
                            <div v-if="agence.siren_agence" class="mt-2 flex items-center text-sm text-gray-500">
                                <BuildingOffice2Icon class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                                SIRET {{ agence.siren_agence }}
                            </div>
                        </div>
                    </div>  
                </div>
                <div class="mt-5 flex lg:ml-4 lg:mt-0">
                    <span class="hidden sm:block">
                        <button type="button" class="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                        <PencilIcon class="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                        Modifier
                        </button>
                    </span>

                    <span class="sm:ml-3">
                        <button type="button" class="inline-flex items-center rounded-md bg-rose px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600">
                        <XMarkIcon class="-ml-0.5 mr-1.5 h-5 w-5 text-white" aria-hidden="true" />
                            Supprimer
                        </button>
                    </span>

                    <!-- Dropdown -->
                    <Menu as="div" class="relative ml-3 sm:hidden">
                        <MenuButton class="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:ring-gray-400">
                        More
                        <ChevronDownIcon class="-mr-1 ml-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                        </MenuButton>

                        <transition enter-active-class="transition ease-out duration-200" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
                        <MenuItems class="absolute right-0 z-10 -mr-1 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <MenuItem v-slot="{ active }">
                            <a href="#" :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']">Edit</a>
                            </MenuItem>
                            <MenuItem v-slot="{ active }">
                            <a href="#" :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']">View</a>
                            </MenuItem>
                        </MenuItems>
                        </transition>
                    </Menu>
                </div>
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
