<script setup>
    import { ref, computed } from 'vue';
    import { useRouter } from 'vue-router';
    import { Menu, MenuButton, MenuItem, MenuItems, TransitionRoot, TransitionChild, Dialog, DialogTitle, DialogPanel } from '@headlessui/vue'
    import { ChevronDownIcon, TrashIcon, UserPlusIcon, FolderPlusIcon, XMarkIcon } from '@heroicons/vue/24/outline'
    import { useMessageStore } from '../stores/messages';
    import { useAgencesStore } from "../stores/agences";
    import { useClientsStore } from '../stores/clients';
    import moment from "moment";
    import fr from 'moment/dist/locale/fr';

    moment.updateLocale('fr', fr);

    const router = useRouter();

    const uri = import.meta.env.VITE_URL;

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

    const stateToast = ref(false);
    const newlyClient = ref(0);

    const open = ref(false);
    const clientViewed = ref(null);

    const fetchMessages = () => {
        messageStore.getMessages()
        .then(res => {
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
        return new Promise((resolve, reject) => {
            stateToast.value = false;
            dataCreation.value.type_cli = type;
            dataCreation.value.mail_cli = obj.mail_site;
            dataCreation.value.nl_cli = obj.nl_site;
            dataCreation.value.sexe_cli = obj.sexe_site;
            
            let data = {
                celib_cli: false,
                veuf_cli: false,
                div_cli: false,
                sep_cli: false,
                instDiv_cli: false,
            }

            if(obj.ec_site == 1){
                data.veuf_cli = true;
            }

            if(obj.ec_site == 2){
                data.div_cli = true;
            }

            if(obj.ec_site == 3){
                data.sep_cli = true;
            }

            if(obj.ec_site == 4){
                data.celib_cli = true;
            }
            dataCreation.value.situation_cli = data;
            
            dataCreation.value.idAgence_cli = obj.idAgence_site;
            clientsStore.createClient(dataCreation.value)
            .then(res => {
                stateToast.value = true;
                if(res.arr){
                    newlyClient.value = res.arr.id_cli


                    let status = type === 'contact' ? 2 : 1
                    messageStore.updateMessageStatus(status, obj.id_site)
                    .then(res => {
                        fetchMessages();
                        resolve(res);
                    })                
                    .catch(err => {})
                }
            })
            .catch(err => console.error(err))
        })
    }

    const handleDeleteMessage = (id) => {
        messageStore.deleteMessage(id)
        .then(res => {
            console.log(res);
            fetchMessages();
        })
        .catch(err => console.error(err))
    }

    const viewFiche = (ref) => {
        clientsStore.getClientByRef(ref)
        .then(res => {
            open.value = true;
            console.log(res);
            clientViewed.value = res.client[0];
        })
    }

    const goToFicheClient = () => {
		open.value = false;
		router.push({name: 'Client', params: {id: clientViewed.value.id_cli}})
	}

    const getStatus = (e) => {
        if(e == 1){
            return 'Veuf(ve)';
        }

        if(e == 2){
            return 'Divorcé(e)';
        }

        if(e == 3){
            return 'Séparé(e)';
        }

        if(e == 4){
            return 'Célibataire';
        }
    }

    const bulkCreatingFiche = (type) => {
        if(selectedPeople.value.length){
            selectedPeople.value.forEach(async (el) => {
                await handleCreationFiche(el, type)
            })
        }
    }

    const bulkDeletingMessage = () => {
        console.log(selectedPeople.value);
        if(selectedPeople.value.length){
            selectedPeople.value.forEach(el => {
                handleDeleteMessage(el.id_site)
            })
        }
    }

    function calculateAge(dateString) {
		let today = new Date()
		let birthDate = new Date(dateString)
		let age = today.getFullYear() - birthDate.getFullYear()
		let monthDifference = today.getMonth() - birthDate.getMonth()
		if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
			age--
		}
		return age
	}
</script>

<template>
    <div class="px-4 sm:px-6 lg:px-8">
        <div class="border-b border-gray-200 pb-5 sm:flex sm:items-center sm:justify-between mt-12">
            <div>
                <h3 class="text-3xl font-semibold leading-6 text-gray-900 mb-6">Demandes du site internet</h3>
                <p class="text-pretty text-base font-normal text-gray-500 mb-2 w-4/6">Accédez en un coup d’œil à l’historique complet des formulaires envoyés par vos prospects via votre site, pour transformer chaque demande en dossier qualifié au sein de votre agence matrimoniale :</p>
                <p class="text-pretty text-base font-normal text-gray-500 w-4/6">Grâce à cette interface, vous ne laissez plus échapper aucune opportunité : chaque envoi de formulaire est centralisé, analysé et transformé en dossier pertinent, pour un suivi ultra-réactif et personnalisé.</p>
            </div>
        </div>

        <div class="mt-8 flow-root">
            <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8 h-[90vh] pb-32 overflow-auto">
                    <div class="relative">
                        <div v-if="selectedPeople.length > 0" class="absolute left-14 top-0 flex h-12 items-center space-x-3 bg-white sm:left-12">
                            <button @click="bulkCreatingFiche('contact')" type="button" class="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white">Enregistrer en tant que contact</button>
                            <button @click="bulkCreatingFiche('prospect')" type="button" class="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white">Enregistrer en tant que prospect</button>
                            <button @click="bulkDeletingMessage()" type="button" class="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white">Supprimer la sélection</button>
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
                                <tr v-for="message in messages" :key="message.id_site" :class="[selectedPeople.includes(message) && 'bg-gray-50']">
                                    <td class="relative px-7 sm:w-12 sm:px-6">
                                        <div v-if="selectedPeople.includes(message)" class="absolute inset-y-0 left-0 w-0.5 bg-rose-600"></div>
                                        <div v-if="message.statut_site === 1" class="absolute inset-y-0 left-0 w-1 bg-blue-600"></div>
                                        <div v-if="message.statut_site === 2" class="absolute inset-y-0 left-0 w-1 bg-green-600"></div>
                                        <input type="checkbox" class="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" :value="message" v-model="selectedPeople" />
                                    </td>
                                    <td :class="['whitespace-nowrap py-4 pr-3 text-sm font-medium', selectedPeople.includes(message) ? 'text-rose-600' : 'text-gray-900']">
                                        {{ moment(message.tps_site).format('ll') }}
                                    </td>
                                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        <a class="underline hover:text-rose" :href="`mailto:${message.mail_site}`">{{ message.mail_site }}</a>
                                    </td>
                                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        <a class="underline hover:text-rose" :href="`tel:${message.tel_site}`">{{ message.tel_site }}</a>
                                    </td>
                                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        {{ message.nl_site ? 'Oui' : 'Non' }}
                                    </td>
                                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        {{ message.sexe_site }}
                                    </td>
                                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        {{ getStatus(message.ec_site) }}
                                    </td>
                                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        {{ message.rd_site ? 'Oui' : 'Non' }}
                                    </td>
                                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        <span @click="viewFiche(message.refCliquee_site)" class="underline cursor-pointer hover:text-rose">{{ message.refCliquee_site }}</span>
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

      <!-- #region SIDEBAR FICHE -->
      <TransitionRoot as="template" :show="open">
            <Dialog class="relative z-50" @close="open = false">
                <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
                    <div class="fixed inset-0 bg-black backdrop-blur-sm bg-opacity-50 transition-opacity" />
                </TransitionChild>
                <div class="fixed inset-0" />

                <div class="fixed inset-0 overflow-hidden">
                    <div class="absolute inset-0 overflow-hidden">
                    <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
                        <TransitionChild as="template" enter="transform transition ease-in-out duration-500 sm:duration-700" enter-from="translate-x-full" enter-to="translate-x-0" leave="transform transition ease-in-out duration-500 sm:duration-700" leave-from="translate-x-0" leave-to="translate-x-full">
                        <DialogPanel class="pointer-events-auto w-screen max-w-2xl">
                            <div class="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                                <div class="px-4 py-6 sm:px-6">
                                    <div class="flex items-start justify-between">
                                        <DialogTitle class="text-base font-semibold leading-6 text-gray-900">Profil client</DialogTitle>
                                        <div class="ml-3 flex h-7 items-center">
                                            <button type="button" class="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-rose-500" @click="open = false">
                                                <span class="absolute -inset-2.5" />
                                                <span class="sr-only">Close panel</span>
                                                <XMarkIcon class="h-6 w-6" aria-hidden="true" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <!-- Main -->
                                <div class="divide-y divide-gray-200" v-if="clientViewed">
                                    <div class="pb-6">
                                        <div class="h-24 bg-rose sm:h-20 lg:h-28" />
                                        <div class="-mt-12 flow-root px-4 sm:-mt-8 sm:flex sm:items-end sm:px-6 lg:-mt-16">
                                            <div>
                                                <div class="-m-1 flex">
                                                    <div class="inline-flex overflow-hidden rounded-lg border-4 border-white">
                                                    <img class="h-24 w-24 flex-shrink-0 sm:h-40 sm:w-40 lg:h-48 lg:w-48 object-cover" :src="`${uri}/storage/img/cli/${clientViewed.id_cli}.webp`" alt="" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="mt-6 sm:ml-6 sm:flex-1">
                                                <div>
                                                    <div class="flex items-center">
                                                        <h3 class="text-xl font-bold text-gray-900 sm:text-2xl">{{ clientViewed.pNoms_cli }} {{ clientViewed.nom_cli }}</h3>
                                                    </div>
                                                    <p class="text-sm text-gray-500">{{clientViewed.ville_cli}}, {{ calculateAge(clientViewed.dateNaiss_cli) }} ans</p>
                                                </div>
                                                <div class="mt-5 flex flex-wrap space-y-3 sm:space-x-3 sm:space-y-0">
                                                    <button type="button" class="inline-flex w-full flex-shrink-0 items-center justify-center rounded-md px-3 py-2 text-sm font-semibold ring-1 ring-gray-300 shadow-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 sm:flex-1">Envoyer un mail</button>
                                                    <button @click="goToFicheClient()" type="button" class="inline-flex w-full flex-shrink-0 items-center justify-center rounded-md px-3 py-2 text-sm font-semibold ring-1 ring-gray-300 shadow-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 sm:flex-1">Voir en détail</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="px-4 py-5 sm:px-0 sm:py-0">
                                        <dl class="space-y-8 sm:space-y-0 sm:divide-y sm:divide-gray-200">
                                            <div class="sm:flex sm:px-6 sm:py-5">
                                                <dt class="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">Taille</dt>
                                                <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">{{ clientViewed.taille_cli }} cm</dd>
                                            </div>
                                            
                                            <div class="sm:flex sm:px-6 sm:py-5">
                                                <dt class="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">Poids</dt>
                                                <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">{{ clientViewed.poid_cli }} kg</dd>
                                            </div>

                                            <div class="sm:flex sm:px-6 sm:py-5">
                                                <dt class="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">Enfants</dt>
                                                <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">{{ clientViewed.nbEnf_cli }}</dd>
                                            </div>

                                            <div class="sm:flex sm:px-6 sm:py-5">
                                                <dt class="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">Profession</dt>
                                                <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">{{ clientViewed.prof_cli }}</dd>
                                            </div>
                                            
                                            <div class="sm:flex sm:px-6 sm:py-5">
                                                <dt class="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">Caractère</dt>
                                                <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">
                                                    <p>{{ clientViewed.desc_cli }}</p>
                                                </dd>
                                            </div>
                                            
                                            <div class="sm:flex sm:px-6 sm:py-5">
                                                <dt class="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">Goûts / loisirs</dt>
                                                <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">
                                                    <p>{{ clientViewed.interets_cli }}</p>
                                                </dd>
                                            </div>

                                            <div class="sm:flex sm:px-6 sm:py-5">
                                                <dt class="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">Milieu d'éducation</dt>
                                                <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">
                                                    <p>{{ clientViewed.milieu_cli }}</p>
                                                </dd>
                                            </div>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </DialogPanel>
                        </TransitionChild>
                    </div>
                    </div>
                </div>
            </Dialog>
        </TransitionRoot>
        <!-- #endregion -->

    <Toast :state="stateToast" title="Fiche client ajouté">
            <router-link :to="{name: 'Client', params: {id: newlyClient}}" class="inline-block mt-2 rounded-md bg-rose-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 duration-300 ease-out">
                Voir la fiche
            </router-link>
        </Toast>
</template>