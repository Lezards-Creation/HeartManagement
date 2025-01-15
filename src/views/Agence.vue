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
    import { Menu, MenuButton, MenuItem, MenuItems, TransitionRoot, TransitionChild, Dialog, DialogTitle, DialogPanel } from '@headlessui/vue'

    const agencesStore = useAgencesStore()
    const route = useRoute()
    const openPopupUser = ref(false);
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
                
                    <div class="mt-2 flex flex-col sm:mt-2 sm:flex-row sm:flex-wrap sm:gap-x-6 gap-y-1">
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
                    <button @click="() => { openPopupUser = true; }" type="button" class="block rounded-md bg-rose px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600">Ajouter un utilisateur</button>
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

    <!-- #region POPUP Création Utilisateur -->
	<TransitionRoot :show="openPopupUser" as="template" appear>
		<Dialog as="div" class="relative z-50" @close="openPopupUser = false">
			<TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
				<div class="fixed inset-0 bg-black backdrop-blur-sm bg-opacity-50 transition-opacity" />
			</TransitionChild>

			<div class="fixed inset-0 z-10 w-screen overflow-y-auto p-4 sm:p-6 md:p-20">
				<TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="ease-in duration-200" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
					<DialogPanel class="mx-auto max-w-xl transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition-all">
						<div class="px-12 py-8">
							<div class="mx-auto max-w-2xl text-center">
								<h2 class="text-2xl font-bold tracking-tight text-rose">Ajouter un utilsateur</h2>
							</div>

                            <div class="pb-12 mt-6">
                                <div class="mt-10 grid grid-cols-1 gap-x-3 gap-y-4 sm:grid-cols-6">
                                    <div class="sm:col-span-3">
                                        <label for="nom_util" class="block text-sm/6 font-medium text-gray-900">Nom</label>
                                        <div class="mt-2">
                                            <input type="text" name="nom_util" id="nom_util" class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 ring-1 ring-inset ring-gray-300  placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
                                        </div>
                                    </div>

                                    <div class="sm:col-span-3">
                                        <label for="prenom_util" class="block text-sm/6 font-medium text-gray-900">Prénom</label>
                                        <div class="mt-2">
                                            <input type="text" name="prenom_util" id="prenom_util" class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 ring-1 ring-inset ring-gray-300  placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
                                        </div>
                                    </div>

                                    <div class="sm:col-span-full">
                                        <label for="role" class="block text-sm/6 font-medium text-gray-900">Rôle</label>
                                        <div class="mt-2 grid grid-cols-1">
                                            <select id="role" name="role" class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 ring-1 ring-inset ring-gray-300  focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
                                                <option>Agent</option>
                                                <option>Administrateur</option>
                                                <option>Comptable</option>
                                            </select>
                                            <svg class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
                                                <path fill-rule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>

                                    <div class="col-span-full">
                                        <label for="mdp_util" class="block text-sm/6 font-medium text-gray-900">Mot de passe</label>
                                        <div class="mt-2">
                                            <input type="password" name="mdp_util" id="mdp_util" class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 ring-1 ring-inset ring-gray-300  placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
                                        </div>
                                    </div>

                                    <div class="col-span-full">
                                        <label for="verif_mdp" class="block text-sm/6 font-medium text-gray-900">Vérification de mot de passe</label>
                                        <div class="mt-2">
                                            <input type="password" name="verif_mdp" id="verif_mdp" class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 ring-1 ring-inset ring-gray-300  placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="mt-3 flex justify-end gap-x-3">
                                <button @click="() => { openPopupUser = true }" type="button"
                                    class="inline-flex gap-2 items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                                    Annuler
                                </button>
                                <button type="button"
                                    class="inline-flex gap-2 items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                                    Valider
                                </button>
                            </div>
						</div>
					</DialogPanel>
				</TransitionChild>
			</div>
		</Dialog>
	</TransitionRoot>
    <!-- #endregion -->
</template>
