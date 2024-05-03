<script setup>
    import { computed, ref, watch } from 'vue'
    import { useChoixStore } from '../stores/choix'
    import { useRencontresStore } from '../stores/rencontres'
    import { usePropositionsStore } from '../stores/propositions'
    import { useUserStore } from '../stores/user'
    import { useClientsStore } from '../stores/clients'
	import { EnvelopeIcon, AtSymbolIcon, CheckIcon, XMarkIcon} from '@heroicons/vue/24/outline'
    import { TransitionRoot, TransitionChild, Dialog,  DialogTitle } from '@headlessui/vue'
    import SkeletonRow from './SkeletonRow.vue';
    import PortraitClient from './PortraitClient.vue';
    import CourrierClient from './CourrierClient.vue';

    import moment from "moment";
    import fr from 'moment/dist/locale/fr';
    moment.updateLocale('fr', fr);

    //#region VARIABLES
	const uri = import.meta.env.VITE_URL;
    const props = defineProps(['client', 'name']);
    
    const choixStore = useChoixStore();
    const userStore = useUserStore();
    const rencontresStore = useRencontresStore();
    const propositionsStore = usePropositionsStore();
    const clientsStore = useClientsStore();

    const isOpen = ref(false);

    const choices = ref([]);
    const demandes = ref([]);
    const communs = ref([]);
    const rencontres = ref([]);
    const propositions = ref([]);

    const choicesLoaded = ref(false);
    const demandesLoaded = ref(false);
    const communsLoaded = ref(false);
    const rencontresLoaded = ref(false);
    const propositionsLoaded = ref(false);

    const fallbackImage = `${uri}/storage/img/cli/vide.webp`;
    const rencontre_ref = ref(null);

    const active_tab = ref('communs')
    const tabs = ref([
		{ name: `Choix communs`, slug: 'communs', href: '#' },
		{ name: `Choix de`, slug: 'choix', href: '#' },
		{ name: `Ont choisi`, slug: 'demande', href: '#' },
		{ name: 'Propositions', slug: 'propositions', href: '#' },
		{ name: 'Rencontres', slug: 'rencontres', href: '#' },
	])

    const isModalOpened = ref(false);
    const generateBase64 = ref(false);
    const stateToast = ref(false);

    const popupCourrier = ref(false);
    //#endregion

    //#region METHODS
    const name = computed(() => props.name);

    function findDuplicatePairs(array, key){
        const seen = new Set();
        return array.filter(item => {
            const value = key.split('.').reduce((obj, prop) => obj[prop], item);
            if (!seen.has(value)) {
                seen.add(value);
                return true;
            }
            return false;
        });
    }

    function findNonMatchingPairs(communs, rencontres) {
        // This will store all non-matches
        let nonMatches = [];

        // Loop through each object in the communs array
        for (const choix of communs) {
            // Destructure to get the ids from the current choix object
            const { idCli_choix, idCli1_choix } = choix;
            let matchFound = false;

            // Check if there's a matching pair in rencontres array
            for (const rencontre of rencontres) {
                // Destructure to get the ids from the current rencontre object
                const { idCli_renc, idCli1_renc } = rencontre;

                // Check for match in both possible orders
                if ((idCli_choix === idCli_renc && idCli1_choix === idCli1_renc) || 
                    (idCli_choix === idCli1_renc && idCli1_choix === idCli_renc)) {
                    matchFound = true;
                    break; // Stop searching if a match is found
                }
            }

            // If no match is found, add this choix to nonMatches
            if (!matchFound) {
                nonMatches.push(choix);
            }
        }

        // Return all the non-matches found
        return nonMatches;
    }

    const fetchRencontresData = () => {
        choicesLoaded.value = false;
        demandesLoaded.value = false;
        rencontresLoaded.value = false;
        communsLoaded.value = false;
        propositionsLoaded.value = false;
        
        name.value = props.name;
        choixStore.getChoices(props.client)
        .then(res => {
            choices.value = res.choices; 
            demandes.value = res.demandes;

            choicesLoaded.value = true;
            demandesLoaded.value = true;

            let temp = findDuplicatePairs(res.communs, 'client.id_cli');
            rencontresStore.getRencontres(props.client)
            .then(res => {
                rencontres.value = res.rencontres; 
                communs.value = findNonMatchingPairs(temp, rencontres.value);
                rencontresLoaded.value = true;
                communsLoaded.value = true;

                propositionsStore.getPropositions(props.client)
                .then(res => {
                    propositions.value = res.propositions;
                    propositionsLoaded.value = true;
                })
                .catch(err => {
                    console.error(err);
                }) 
            })
            .catch(err => {
                console.error(err);
            }) 
        })
        .catch(err => {
            console.error(err);
        }) 
    } 

    function setIsOpen(value, rencontre) {
        isOpen.value = value;
        if(rencontre){
            rencontre_ref.value = rencontre;
        }
    }

    function setComment(type){
        let res = '';
        switch (type)
            {
                case 'Z':
                    res = 'Non créée';
                    break;
                case 'N':
                    res = 'En cours';
                    break;
                case 'L':
                    res = 'Ne l\'a pas vu(e)';
                    break;
                case 'P':
                    res = 'Se poursuit';
                    break;
                case 'R':
                    res = 'Pas de suite Madame';
                    break;
                case 'S':
                    res = 'Pas de suite Monsieur';
                    break;
                case 'I':
                    res = 'Madame pas encore décidée';
                    break;
                case 'J':
                    res = 'Monsieur pas encore décidé';
                    break;
                case 'A':
                    res = 'N\'a pas marché';
                    break;
            }
        return(res);

    }

    const handleUpdateRencontre = () => {
        rencontresStore.updateRencontre(rencontre_ref.value)
        .then(res => {
            isOpen.value = false;
            console.log(res);
        })
        .catch(err => console.log(err))
    }

    const handleCreateRencontre = (id) => {
        let client = props.client
        let autre = id;


		let data = {
            idUtil_renc: userStore.userLog.id_util,
			idCli_renc: client,
			idCli1_renc: autre,
            statut_renc: 'Z',
			dateCre_renc: moment().format('YYYY-MM-DD'),
		}
		
		rencontresStore.createRencontre(data)
		.then(res => {
			console.log(res);
		})
		.catch(err => console.error(err))
    }

	function handleImageError(event) {
        event.target.src = fallbackImage;
	}

    const handeUpdateChoice = (idChoix, state) => {
        let data = {
            id_choix: idChoix,
            dateRes_choix: moment().format('YYYY-MM-DD'),
            res_choix: state ? 1 : 0
        }

        choixStore.updateChoice(data)
        .then(res => console.log(res))
        .catch(err => console.error(err))
    }

    const handeUpdateProposition = (idProp, state) => {
        let data = {
            id_prop: idProp,
            idUtil_choix: userStore.userLog.id_util,
            dateRes_Prop: moment().format('YYYY-MM-DD'),
            res_prop: state ? 1 : 0
        }

        propositionsStore.updateProposition(data)
        .then(res => console.log(res))
        .catch(err => console.error(err))
    }

    const handleMail = (e) => {
        console.log(e);
        if(window.confirm("Êtes-vous sûr de vouloir envoyer un mail au client ?")){
            let data = {
                base64: e.file,
                filename: `${props.name}`
            }

            clientsStore.sendPortraitMail(e.email, data)
            .then(res => {
                stateToast.value = true;
                setTimeout(() => {
                    stateToast.value = false;
                }, 3000)
            })
            .catch(err => console.error(err))
        }
    }

    watch(() => props.client, fetchRencontresData, {immediate: true});
    //#endregion
</script>

<template>
    <div class="bg-gray-50 p-4 shadow-sm ring-1 ring-gray-900/5 sm:rounded-b-xl overflow-hidden">
        <div class="relative border-b border-gray-200 pb-5 sm:pb-0">
            <div class="md:flex md:items-center md:justify-between">
                <h3 class="text-base font-semibold leading-6 text-gray-900"></h3>
            </div>
            <div class="mt-4">
                <div class="sm:hidden">
                    <label for="current-tab" class="sr-only">Select a tab</label>
                    <select id="current-tab" name="current-tab"
                        class="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600">
                        <option v-for="tab in tabs" :key="tab.name" :selected="tab.current"
                            @click="active_tab = tab.slug">{{ tab.name }}</option>
                    </select>
                </div>
                <div class="hidden sm:block">
                    <nav class="-mb-px flex space-x-8">
                        <a @click="active_tab = tab.slug" v-for="tab in tabs" :key="tab.name" :href="tab.href"
                            :class="[active_tab == tab.slug ? 'border-rose-500 text-rose-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700', 'whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium']"
                            :aria-current="tab.current ? 'page' : undefined">
                            {{tab.name + ' '}} {{ tab.slug === 'choix' ? name : (tab.slug === 'demande' ? name : '') }}
                        </a>
                    </nav>
                </div>
            </div>
        </div>

        <!-- #region CHOIX COMMUNS -->
        <div class="space-y-10 divide-y divide-gray-900/10 mt-10" v-if="active_tab === 'communs'">
            <ul v-if="communs.length > 0" role="list" class="divide-y divide-gray-100 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl max-w-[80%]">
                <li v-if="communsLoaded" v-for="commun in communs" :key="commun.id_choix" class="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6">
                    <div v-if="commun.client" class="flex min-w-0 gap-x-4">
                        <img @error="event => handleImageError(event)" class="h-12 w-12 flex-none rounded-full bg-gray-50 object-cover" :src="`${uri}/storage/img/cli/${commun.client.id_cli}.webp`" alt="" />
                        <div class="min-w-0 flex-auto">
                            <p class="text-sm font-semibold leading-6 text-gray-900">
                                <a class="flex gap-2 items-center">
                                    {{ commun.client.nom_cli + ' ' + commun.client.pNoms_cli }}
                                </a>
                            </p>
                            <p class="mt-1 flex text-xs leading-5 text-gray-500">
                                Réf. {{ commun.client.ref_cli }}
                            </p>
                        </div>
                    </div>
                    <div class="flex shrink-0 items-center gap-x-4">
                        <div v-if="commun.client" class="flex flex-none items-center gap-x-4">
                            <a @click="handleCreateRencontre(commun.client.id_cli)" class="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                Initier une rencontre
                            </a>
                        </div>
                    </div>
                </li>

                <SkeletonRow v-else/>
            </ul>     
            <div v-else-if="communsLoaded">
                <p class="text-gray-500 text-center py-4">Aucun choix communs de possible pour le moment...</p>
            </div>
            <ul v-else role="list" class="divide-y divide-gray-100 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl max-w-[80%]">
                <SkeletonRow />
            </ul>
        </div>
        <!-- #endregion -->

        <!-- #region CHOIX -->
        <div class="space-y-10 divide-y divide-gray-900/10 mt-10" v-if="active_tab === 'choix'">
            <ul v-if="choices.length > 0" role="list" class="divide-y divide-gray-100 bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl max-w-[80%]">
                <li v-if="choicesLoaded" v-for="choice in choices" :key="choice.id_choix" class="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6">
                    <div v-if="choice.client" class="flex min-w-0 gap-x-4">
                        <img @error="event => handleImageError(event)" class="h-12 w-12 flex-none rounded-full bg-gray-50 object-cover" :src="`${uri}/storage/img/cli/${choice.client.id_cli}.webp`" alt="" />
                        <div class="min-w-0 flex-auto">
                            <p class="text-sm font-semibold leading-6 text-gray-900">
                                <a class="flex gap-2 items-center">
                                    {{ choice.client.nom_cli + ' ' + choice.client.pNoms_cli }}
                                    <span :class="[choice.res_choix === 1 ? 'text-green-700 bg-green-50 ring-green-600/20' : (choice.res_choix === 0 ? 'text-red-800 bg-red-50 ring-red-600/20' : 'text-gray-600 bg-gray-50 ring-gray-500/10'), 'rounded-md whitespace-nowrap mt-0.5 px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset']">
                                        {{ 
                                            choice.res_choix === 1 ? `Acceptée le ${moment(choice.dateRes_choix).format('ll')}` 
                                            : choice.res_choix === 0 ? `Refusée le ${moment(choice.dateRes_choix).format('ll')}`  
                                            : choice.res_choix === null && choice.dateEnv_choix ? `Envoyée le ${moment(choice.dateEnv_choix).format('ll')}` : 'Aucune proposition' 
                                        }}
                                    </span>
                                </a>
                            </p>
                            <p class="mt-1 flex text-xs leading-5 text-gray-500">
                                Réf. {{ choice.client.ref_cli }}
                            </p>
                        </div>
                    </div>
                    <div class="flex shrink-0 items-center gap-x-4">
                        <div v-if="choice.client" class="flex flex-none items-center gap-x-2">
                            <a class="relative cursor-pointer group rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                <AtSymbolIcon class="w-5 h-5"/>
                                <span class="w-max group-hover:opacity-100 duration-300 ease-out opacity-0 absolute -top-1 left-1/2 pointer-events-none bg-gray-700 text-white px-4 py-1 rounded-md -translate-y-full -translate-x-1/2">Envoyer un mail</span>
                            </a>

                            <a @click="popupCourrier = true" class="relative cursor-pointer group rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                <EnvelopeIcon class="w-5 h-5"/>
                                <span class="w-max group-hover:opacity-100 duration-300 ease-out opacity-0 absolute -top-1 left-1/2 pointer-events-none bg-gray-700 text-white px-4 py-1 rounded-md -translate-y-full -translate-x-1/2">Envoyer un courrier</span>
                            </a>
                        </div>
                    </div>
                </li>

                <SkeletonRow v-else/>
            </ul>
            <div v-else-if="choicesLoaded">
                <p class="text-gray-500 text-center py-4">Aucun choix réalisé(e) par {{ name }}...</p>
            </div>
        </div>
        <!-- #endregion -->

        <!-- #region DEMANDE -->
        <div class="space-y-10 divide-y divide-gray-900/10 mt-10" v-if="active_tab === 'demande'">
            <ul v-if="demandes.length > 0" role="list" class="divide-y divide-gray-100 bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl max-w-[80%]">
                <li v-if="demandesLoaded" v-for="demande in demandes" :key="demande.id_choix" class="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6">
                    <div v-if="demande.client" class="flex min-w-0 gap-x-4">
                        <img @error="event => handleImageError(event)" class="h-12 w-12 flex-none rounded-full bg-gray-50 object-cover" :src="`${uri}/storage/img/cli/${demande.client.id_cli}.webp`" alt="" />
                        <div class="min-w-0 flex-auto">
                            <p class="text-sm font-semibold leading-6 text-gray-900">
                                <a class="flex gap-2 items-center">
                                    {{ demande.client.nom_cli + ' ' + demande.client.pNoms_cli }}
                                    <span :class="[demande.res_choix === 1 ? 'text-green-700 bg-green-50 ring-green-600/20' : (demande.res_choix === 0 ? 'text-red-800 bg-red-50 ring-red-600/20' : 'text-gray-600 bg-gray-50 ring-gray-500/10'), 'rounded-md whitespace-nowrap mt-0.5 px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset']">
                                        {{ 
                                            demande.res_choix === 1 ? `Acceptée le ${moment(demande.dateRes_choix).format('ll')}` 
                                            : demande.res_choix === 0 ? `Refusée le ${moment(demande.dateRes_choix).format('ll')}`  
                                            : demande.res_choix === null && demande.dateEnv_choix ? `Envoyée le ${moment(demande.dateEnv_choix).format('ll')}` : 'Aucune proposition' 
                                        }}
                                    </span>
                                </a>
                            </p>
                            <p class="mt-1 flex text-xs leading-5 text-gray-500">
                                Réf. {{ demande.client.ref_cli }}
                            </p>
                        </div>
                    </div>
                    <div class="flex shrink-0 items-center gap-x-4">
                        <div v-if="demande.client" class="flex flex-none items-center gap-x-2">
                            <a class="relative cursor-pointer group rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                <AtSymbolIcon class="w-5 h-5"/>
                                <span class="w-max group-hover:opacity-100 duration-300 ease-out opacity-0 absolute -top-1 left-1/2 pointer-events-none bg-gray-700 text-white px-4 py-1 rounded-md -translate-y-full -translate-x-1/2">Envoyer un mail</span>
                            </a>

                            <a @click="popupCourrier = true" class="relative cursor-pointer group rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                <EnvelopeIcon class="w-5 h-5"/>
                                <span class="w-max group-hover:opacity-100 duration-300 ease-out opacity-0 absolute -top-1 left-1/2 pointer-events-none bg-gray-700 text-white px-4 py-1 rounded-md -translate-y-full -translate-x-1/2">Envoyer un courrier</span>
                            </a>

                            <a v-if="demande.res_choix === null" @click="handeUpdateChoice(demande.id_choix, true)" class="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-green-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                <CheckIcon class="w-5 h-5"/>
                            </a>

                            <a v-if="demande.res_choix === null" @click="handeUpdateChoice(demande.id_choix, false)" class="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-red-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                <XMarkIcon class="w-5 h-5"/>
                            </a>
                        </div>
                    </div>
                </li>

                <SkeletonRow v-else/>
            </ul>
            <div v-else-if="demandesLoaded">
                <p class="text-gray-500 text-center py-4">Aucun choix réalisés concernant {{ name }}...</p>
            </div>
        </div>
        <!-- #endregion -->

        <!-- #region PROPOSITION -->
        <div class="space-y-10 divide-y divide-gray-900/10 mt-10" v-if="active_tab === 'propositions'">
            <ul v-if="propositions.length > 0" role="list" class="divide-y divide-gray-100 bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl max-w-[80%]">
                <li v-if="propositionsLoaded" v-for="proposition in propositions" :key="proposition.id_prop" class="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6">
                    <div v-if="proposition.client" class="flex min-w-0 gap-x-4">
                        <img @error="event => handleImageError(event)" class="h-12 w-12 flex-none rounded-full bg-gray-50 object-cover" :src="`${uri}/storage/img/cli/${proposition.client.id_cli}.webp`" alt="" />
                        <div class="min-w-0 flex-auto">
                            <p class="text-sm font-semibold leading-6 text-gray-900">
                                <a class="flex gap-2 items-center">
                                    {{ proposition.client.nom_cli + ' ' + proposition.client.pNoms_cli }}
                                </a>
                            </p>
                            <p class="mt-1 flex text-xs leading-5 text-gray-500">
                                Réf. {{ proposition.client.ref_cli }}
                            </p>
                        </div>
                    </div>
                    <div class="flex shrink-0 items-center gap-x-4">
                        <div v-if="proposition.client" class="flex flex-none items-center gap-x-2">
                            <a class="relative cursor-pointer group rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                <AtSymbolIcon class="w-5 h-5"/>
                                <span class="w-max group-hover:opacity-100 duration-300 ease-out opacity-0 absolute -top-1 left-1/2 pointer-events-none bg-gray-700 text-white px-4 py-1 rounded-md -translate-y-full -translate-x-1/2">Envoyer un mail</span>
                            </a>

                            <a @click="popupCourrier = true" class="relative cursor-pointer group rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                <EnvelopeIcon class="w-5 h-5"/>
                                <span class="w-max group-hover:opacity-100 duration-300 ease-out opacity-0 absolute -top-1 left-1/2 pointer-events-none bg-gray-700 text-white px-4 py-1 rounded-md -translate-y-full -translate-x-1/2">Envoyer un courrier</span>
                            </a>

                            <a @click="handeUpdateProposition(proposition.id_prop, true)" class="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-green-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                <CheckIcon class="w-5 h-5"/>
                            </a>

                            <a @click="handeUpdateProposition(proposition.id_prop, false)" class="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-red-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                <XMarkIcon class="w-5 h-5"/>
                            </a>
                        </div>
                    </div>
                </li>

                <SkeletonRow v-else/>
            </ul>
            <div v-else-if="propositionsLoaded">
                <p class="text-gray-500 text-center py-4">Aucune proposition de l'agence.</p>
            </div>
        </div>
        <!-- #endregion -->

        <!-- #region RENCONTRES -->
        <div class="space-y-10 divide-y divide-gray-900/10 mt-10" v-if="active_tab === 'rencontres'">
            <ul v-if="rencontres.length > 0" role="list" class="divide-y divide-gray-100 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl max-w-[80%]">
                <li v-if="rencontresLoaded" v-for="rencontre in rencontres" :key="rencontre.id_renc" class="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6">
                    <div v-if="rencontre.laureat" class="flex min-w-0 gap-x-4">
                        <img @error="event => handleImageError(event)" class="h-12 w-12 flex-none rounded-full bg-gray-50 object-cover" :src="`${uri}/storage/img/cli/${rencontre.laureat.id_cli}.webp`" alt="" />
                        <div class="min-w-0 flex-auto">
                            <p class="text-sm font-semibold leading-6 text-gray-900">
                                <a class="flex gap-2 items-center">
                                    {{ rencontre.laureat.nom_cli + ' ' + rencontre.laureat.pNoms_cli }}
                                </a>
                            </p>
                            <p class="mt-1 flex text-xs leading-5 text-gray-500">
                                Réf. {{ rencontre.laureat.ref_cli }}
                            </p>
                        </div>
                    </div>
                    <div class="flex shrink-0 items-center gap-x-4">
                        <div v-if="rencontre.laureat" class="flex flex-none items-center gap-x-4">
                            <span @click="setIsOpen(true, rencontre)" class="text-xs underline cursor-pointer">{{ setComment(rencontre.statut_renc) }}</span>
                        </div>
                    </div>
                </li>
                <SkeletonRow v-else/>
            </ul>
            <div v-else-if="rencontresLoaded">
                <p class="text-gray-500 text-center py-4">Aucune rencontre n'a eu lieu...</p>
            </div>

            <TransitionRoot appear :show="isOpen" as="template">
                <Dialog as="div" @close="setIsOpen(false)" class="relative z-10">
                    <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
                        <div class="fixed inset-0 bg-black/25" />
                    </TransitionChild>

                    <div class="fixed inset-0 overflow-y-auto">
                        <div class="flex min-h-full items-center justify-center p-4 text-center">
                            <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
                                <DialogPanel class="w-full max-w-xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900 text-center">
                                        Résumé de la rencontre
                                    </DialogTitle>
                                    <div class="mt-4">
                                        <div class="grid grid-cols-6 gap-x-4">
                                            <div class="col-span-3">
                                                <img class="aspect-[3/2] w-full rounded-2xl object-cover" :src="`${uri}/storage/img/cli/${props.client}.webp`" alt="" />
                                            </div>

                                            <div class="col-span-3">
                                                <img class="aspect-[3/2] w-full rounded-2xl object-cover" :src="`${uri}/storage/img/cli/${rencontre_ref.laureat.id_cli}.webp`" alt="" />
                                            </div>

                                            <div class="col-span-3 mt-4">
                                                <label for="comm_renc" class="block text-center text-xs font-medium leading-6 text-gray-700">Comm. - {{ name }} </label>
                                                <div class="mt-1">
                                                    <textarea v-model="rencontre_ref.comm_renc" id="comm_renc" name="comm_renc" rows="3" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6"/>
                                                    <div class="flex gap-x-2 mt-1">
                                                        <a class="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                                            <AtSymbolIcon class="w-5 h-5"/>
                                                        </a>
                                                        <a class="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                                            <EnvelopeIcon @click="popupCourrier = true" class="w-5 h-5"/>
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="col-span-3 mt-4">
                                                <label for="comm1_renc" class="block text-center text-xs font-medium leading-6 text-gray-700">Comm. - {{ rencontre_ref.laureat.sexe_cli === 'F' ? 'Mme' : 'Mr' }} {{ rencontre_ref.laureat.nom_cli }}</label>
                                                <div class="mt-1">
                                                    <textarea v-model="rencontre_ref.comm1_renc" id="comm1_renc" name="comm_renc1" rows="3" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6"/>
                                                    <div class="flex justify-end gap-x-2 mt-1">
                                                        <a class="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                                            <AtSymbolIcon class="w-5 h-5"/>
                                                        </a>
                                                        <a class="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                                            <EnvelopeIcon @click="popupCourrier = true" class="w-5 h-5"/>
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="col-span-full my-6">
                                                <div class="flex gap-2 items-center ">
                                                    <label for="cheveux_cli" class="block text-sm font-medium leading-6 text-gray-900">Statut</label>
                                                    <select name="statut_renc" id="statut_renc" v-model="rencontre_ref.statut_renc"
                                                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6">
                                                        <option value="Z">Non créée</option>
                                                        <option value="N">En cours</option>
                                                        <option value="L">Ne l'a pas vu(e)</option>
                                                        <option value="P">Se poursuit</option>
                                                        <option value="R">Pas de suite Madame</option>
                                                        <option value="S">Pas de suite Monsieur</option>
                                                        <option value="I">Madame pas encore décidée</option>
                                                        <option value="J">Monsieur pas encore décidé</option>
                                                        <option value="A">N'a pas marché</option>
                                                    </select>
                                                </div>

                                                <span class="text-[14px] text-gray-700 text-center block font-medium mt-2">
                                                    Rencontre créée le {{  moment(rencontre_ref.dateCre_renc).format('ll')  }} par {{ rencontre_ref.idUtil_renc }}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="mt-4 justify-center gap-2 flex">
                                        <button type="button" class="inline-flex gap-2 items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50" @click="setIsOpen(false)" >
                                            Fermer
                                        </button>

                                        <button type="button" class="inline-flex justify-center rounded-md border border-transparent bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-400 duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2" @click="handleUpdateRencontre">
                                            Modifier
                                        </button>
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </TransitionRoot>
        </div>        
        <!-- #endregion -->

        <!-- #region PORTRAIT CLIENT -->
        <PortraitClient :client="client" :isOpen="isModalOpened" :generate="generateBase64" @base64generated="handleMail" @modal-close="isModalOpened = false"/>
        <!-- #endregion -->

        <!-- #region COURRIER CLIENT -->
        <CourrierClient :client="client" :isOpen="popupCourrier" @modal-close="popupCourrier = false"/>
        <!-- #endregion -->

        <Toast :state="stateToast" title="Portrait client envoyé avec succès"/>
    </div>
</template>