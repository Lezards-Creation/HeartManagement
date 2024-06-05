<script setup>
    import { ref, computed } from 'vue';
    import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
    import { ChevronDownIcon, TrashIcon, UserPlusIcon, FolderPlusIcon } from '@heroicons/vue/24/outline'
    import { useMessageStore } from '../stores/messages';
    import { useAgencesStore } from "../stores/agences";
    import { useClientsStore } from '../stores/clients';
    import moment from "moment";
    import fr from 'moment/dist/locale/fr';

    moment.updateLocale('fr', fr);

    const messageStore = useMessageStore();
    const messages = ref(null)

	const agencesStore = useAgencesStore();
	const agences = ref({});

    const clientsStore = useClientsStore();

    const selectedPeople = ref([])
    const indeterminate = computed(() => selectedPeople.value.length > 0 && selectedPeople.value.length < messages.length)

    const dataCreation = ref({
        idAgence_cli: 0,
        ref_cli: '',
        nom_cli: '',
        pNoms_cli: '',
        sexe_cli: '0',
        type_cli : 'adherent',
        duree_cli: 1,
        adr_cli : '',
        cp_cli : '',
        ville_cli : '',
        telPri_cli : '',
        affTelPri_cli : 0,
        telPro_cli : '',
        affTelPro_cli : 0,
        telGsm_cli : '',
        affTelGsm_cli : 0,
        mail_cli : '',
        nl_cli : 0,
        situation_cli: {
            celib_cli: false,
            veuf_cli: false,
            div_cli: false,
            sep_cli: false,
            instDiv_cli: false,
        },
        desCelib_cli: 0,
        desVeuf_cli: 0,
        desDiv_cli: 0,
        desSep_cli: 0,
        desAge_cli_min: 0,
        desAge_cli_max: 0,
        desNbEn_cli: 0,
        desPhy_cli: '',
        desCaract_cli: '',
        desReg_cli: 0,
        desInst_cli: 0,
        desProf_cli: 0,
        desCarctIndisp_cli: '',
        msRech_cli: '_0',
        msRechPrec_cli: '',
    });

    const fetchMessages = () => {
        messageStore.getMessages()
        .then(res => {
            console.log(res)
            messages.value = res.messages
        })
        .catch(err => console.error(err))
    }
    fetchMessages();

    const fetchAgences = () => {
		agencesStore.getAgences()
		.then((res) => {
			if(res.agences.length > 0){
				res.agences.forEach(agence => {
					if(agence.id_agence !== 0){
                        agences.value[agence.id_agence] = agence.lib_agence
					}

				});
			}
		})
		.catch(err => {
			console.error(err)
		})
	}
	fetchAgences();

    const handleCreationFiche = (obj, type) => {
        dataCreation.value.type_cli = type;
        dataCreation.value.mail_cli = obj.mail_site;
        dataCreation.value.nl_cli = obj.nl_site;
        dataCreation.value.sexe_cli = obj.sexe_site;
        dataCreation.value.idAgence_cli = obj.idAgence_site;
        dataCreation.value.situation_cli = obj.ec_site;

        clientsStore.createClient(dataCreation.value)
        .then(res => {
            stateToast.value = true;
            if(res.arr){
                newlyClient.value = res.arr.id_cli
            }
        })
        .catch(err => console.error(err))
    }

    const handleDeleteMessage = (id) => {
        messageStore.deleteMessage(id)
        .then(res => {
            console.log(res);
            fetchMessages();
        })
        .catch(err => console.error(err))
    }
</script>

<template>
    <div class="px-4 sm:px-6 lg:px-8">
        <div class="border-b border-gray-200 pb-5 sm:flex sm:items-center sm:justify-between mt-12">
            <div>
                <h3 class="text-3xl font-semibold leading-6 text-gray-900">Demandes du site internet</h3>
            </div>
        </div>

        <div class="mt-8 flow-root">
            <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8 h-[90vh] pb-32 overflow-auto">
                    <div class="relative">
                        <div v-if="selectedPeople.length > 0" class="absolute left-14 top-0 flex h-12 items-center space-x-3 bg-white sm:left-12">
                            <button type="button" class="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white">Enregistrer en tant que contact</button>
                            <button type="button" class="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white">Enregistrer en tant que prospect</button>
                            <button type="button" class="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white">Supprimer la sélection</button>
                        </div>
                        <table class="min-w-full table-fixed divide-y divide-gray-300" v-if="messages">
                            <thead>
                                <tr>
                                    <th scope="col" class="relative px-7 sm:w-12 sm:px-6">
                                        <input type="checkbox" class="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" :checked="indeterminate || selectedPeople.length === messages.length" :indeterminate="indeterminate" @change="selectedPeople = $event.target.checked ? messages.map((p) => p.id_site) : []" />
                                    </th>
                                    <th scope="col" class="min-w-[12rem] py-3.5 pr-3 text-left text-sm font-semibold text-gray-900">Date</th>
                                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">E-mail</th>
                                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Téléphone</th>
                                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Newsletter</th>
                                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Sexe</th>
                                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Situation</th>
                                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Rel° durable</th>
                                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Réf. cliquée</th>
                                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Agence</th>
                                    <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-3">
                                        <span class="sr-only">Edit</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200 bg-white">
                                <tr v-for="message in messages" :key="message.id_site" :class="[selectedPeople.includes(message.id_site) && 'bg-gray-50']">
                                    <td class="relative px-7 sm:w-12 sm:px-6">
                                        <div v-if="selectedPeople.includes(message.id_site)" class="absolute inset-y-0 left-0 w-0.5 bg-rose-600"></div>
                                        <input type="checkbox" class="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" :value="message.id_site" v-model="selectedPeople" />
                                    </td>
                                    <td :class="['whitespace-nowrap py-4 pr-3 text-sm font-medium', selectedPeople.includes(message.id_site) ? 'text-rose-600' : 'text-gray-900']">
                                        {{ moment(message.tps_site).format('ll') }}
                                    </td>
                                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        {{ message.mail_site }}
                                    </td>
                                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        {{ message.tel_site }}
                                    </td>
                                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        {{ message.nl_site ? 'Oui' : 'Non' }}
                                    </td>
                                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        {{ message.sexe_site }}
                                    </td>
                                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        {{ message.ec_site }}
                                    </td>
                                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        {{ message.rd_site ? 'Oui' : 'Non' }}
                                    </td>
                                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        <span class="underline cursor-pointer hover:text-rose">{{ message.refCliquee_site }}</span>
                                    </td>
                                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        {{ agences[message.idAgence_site] }}
                                    </td>
                                    <td class="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                                        <Menu as="div" class="relative inline-block text-left">
                                            <div>
                                            <MenuButton class="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                                                Options
                                                <ChevronDownIcon class="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
                                            </MenuButton>
                                            </div>

                                            <transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
                                            <MenuItems class="absolute right-0 z-10 mt-2 w-70 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                <div class="py-1">
                                                <MenuItem v-slot="{ active }" @click="handleCreationFiche(message, 'contact')">
                                                    <a href="#" :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'group flex items-center px-4 py-2 text-sm']">
                                                        <UserPlusIcon class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                                                        Ajouter aux contacts
                                                    </a>
                                                </MenuItem>
                                                <MenuItem v-slot="{ active }" @click="handleCreationFiche(message, 'prospect')">
                                                    <a href="#" :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'group flex items-center px-4 py-2 text-sm']">
                                                    <FolderPlusIcon class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                                                    Ajouter aux prospects
                                                    </a>
                                                </MenuItem>
                                                </div>
                                                
                                                <div class="py-1">
                                                <MenuItem v-slot="{ active }" @click="handleDeleteMessage(message.id_site)">
                                                    <a href="#" :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'group flex items-center px-4 py-2 text-sm']">
                                                    <TrashIcon class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                                                    Supprimer
                                                    </a>
                                                </MenuItem>
                                                </div>
                                            </MenuItems>
                                            </transition>
                                        </Menu>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>