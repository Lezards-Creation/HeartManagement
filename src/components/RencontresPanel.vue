<script setup>
    import { computed, ref, watch } from 'vue'
    import { useChoixStore } from '../stores/choix'
    import { useRencontresStore } from '../stores/rencontres'
    import { usePropositionsStore } from '../stores/propositions'
    import { useUserStore } from '../stores/user'
    import { useClientsStore } from '../stores/clients'
    import { useRouter } from 'vue-router'
	import { PrinterIcon, AtSymbolIcon, CheckIcon, XMarkIcon, UsersIcon, BoltIcon, HomeModernIcon, ArrowRightCircleIcon, ArrowLeftCircleIcon} from '@heroicons/vue/24/outline'
    import { TransitionRoot, TransitionChild, Dialog, DialogTitle, DialogPanel } from '@headlessui/vue'
    import SkeletonRow from './SkeletonRow.vue';
    import CourrierClient from './CourrierClient.vue';

    import moment from "moment";
    import fr from 'moment/dist/locale/fr';
    moment.updateLocale('fr', fr);

    //#region VARIABLES
	const uri = import.meta.env.VITE_URL;
    const props = defineProps(['client', 'name', 'mail']);
    const router = useRouter();
    const choixStore = useChoixStore();
    const userStore = useUserStore();
    const rencontresStore = useRencontresStore();
    const propositionsStore = usePropositionsStore();
    const clientsStore = useClientsStore();

    const isOpen = ref(false);
    const open = ref(false);

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

    const secondaryNavigation = [
        { name: 'Choix en communs', slug: 'communs', href: '#', icon: UsersIcon, current: true },
        { name: 'Choix de', href: '#', slug: 'choix', icon: ArrowRightCircleIcon, current: false },
        { name: 'Ont choisi', href: '#', slug: 'demande', icon: ArrowLeftCircleIcon, current: false },
        { name: 'Propositions', href: '#', slug: 'propositions', icon: HomeModernIcon, current: false },
        { name: 'Rencontres', href: '#', slug: 'rencontres', icon: BoltIcon, current: false },
    ]

    const stateToast = ref(false);

    const popupCourrier = ref(false);
    const currentType = ref('');
    const targetClient = ref(null);
    const isInverse = ref(false);
    const generateBase64Courrier = ref(false);

    const clientViewed = ref(null);

    const creatingRencontre = ref(false);
    
    //#endregion

    //#region METHODS
    const name = computed(() => props.name);

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
            rencontresStore.getRencontre(props.client)
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
            fetchRencontresData();
        })
        .catch(err => console.log(err))
    }

    const handleCreateRencontre = (id) => {
        creatingRencontre.value = true;
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
            creatingRencontre.value = false;
            fetchRencontresData();
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
        .then(res => {
            console.log(res)
            fetchRencontresData();
        })
        .catch(err => console.error(err))
    }

    const handeUpdateProposition = (idProp, state) => {
        let data = {
            id_prop: idProp,
            dateRes_prop: moment().format('YYYY-MM-DD'),
            res_prop: state ? 1 : 0
        }

        propositionsStore.updateProposition(data)
        .then(res => {
            console.log(res)
            fetchRencontresData();
        })
        .catch(err => console.error(err))
    }

    const handleMail = (e) => {
        let data = {
            subject: e.subject,
            base64: e.file,
            filename: e.name
        }

        clientsStore.sendMail(e.email, data)
        .then(res => {
            stateToast.value = true;
            setTimeout(() => {
                stateToast.value = false;
            }, 3000)
        })
        .catch(err => console.error(err))
    }

    const handleSendingAttachment = (obj, type, inverse, mail) => {
        // popupCourrier.value = true; 
        // currentType.value = type; 
        // targetClient.value = obj; 

        // let email;
        // if(mail){
        //     email = mail
        // } else {
        //     email = !inverse ? obj.mail_cli : inverse.mail_cli
        // }
        
        // generateBase64Courrier.value = { 
        //     state: true, 
        //     email: email,
        // }

        // if(inverse){
        //     isInverse.value = inverse;
        // }
    }

    const handlePrint = (obj, type, inverse) => {
        popupCourrier.value = true; 
        currentType.value = type; 
        targetClient.value = obj;
        
        if(inverse){
            isInverse.value = inverse;
        }
    }

    const closeCourrierPDF = () => {
        popupCourrier.value = false;
        currentType.value = '';
        targetClient.value = null;
        isInverse.value = false;
        generateBase64Courrier.value = false;
    }

    const handleOpeningFiche = (target) => {
        clientViewed.value = target;
        open.value = true;
    }

    const goToFicheClient = () => {
		open.value = false;

		router.push({name: 'Client', params: {id: clientViewed.value.id_cli}})
	}

    const setColorName = (client) => {
		let color = 'rgb(17 24 39)'
		if(!client.libre_cli){
			color = 'rgb(17 24 39)';
			if(client.probPaie_cli){
				color = 'rgb(249, 115, 22)';
			}
		}


		let anc_adh = false;
		let a = moment(client.insc_cli).add(client.duree_cli, 'M');
		let b = moment();
		if (!b.isBefore(a)){
			anc_adh = true;
		} 
		
		if(client.prosp_cli || client.cont_cli || anc_adh){
			color = 'rgb(239,68,68)'
		}

		return color;
	}
	
	const setColorTag = (client) => {
		let color = 'rgb(12, 159, 67)';
		if(!client.libre_cli){
			color = 'rgb(17 24 39)';
			if(client.probPaie_cli){
				color = 'rgb(17, 24, 39)';
			}
		} else {
			if(client.probPaie_cli){
				color = 'rgb(249, 115, 22)';
			}
		}

		let anc_adh = false;
		let a = moment(client.insc_cli).add(client.duree_cli, 'M');
		let b = moment();
		if (!b.isBefore(a)){
			anc_adh = true;
		} 

		if(client.prosp_cli || client.cont_cli || anc_adh){
			color = 'rgb(17, 24, 39)';

			if(!client.libre_cli){
				color = 'rgb(239,68,68)';
			}

			if(client.probPaie_cli){
				color = 'rgb(249, 115, 22)';
			}
		}

		return color;
	}

    watch(() => props.client, fetchRencontresData, {immediate: true});
    //#endregion
</script>

<template>
    <div class="">
        <div class="lg:flex lg:gap-x-16">
            <div class="px-4 sm:px-6 lg:flex-auto lg:px-0">
                <div class="mx-auto max-w-2xl space-y-16 sm:space-y-20 lg:mx-0 lg:max-w-none">
                    <!-- #region CHOIX COMMUNS -->
                    <div>
                        <h2 class="px-4 text-base font-medium leading-7 text-gray-900 sm:px-6 lg:px-8 mb-2 flex items-center gap-2">
                            <UsersIcon class="text-rose w-5 h-5"/>
                            Choix communs
                        </h2>
                        <div class="bg-white shadow-sm ring-1 ring-inset ring-gray-900/5 sm:rounded-xl md:col-span-2">
                            <ul v-if="communs.length > 0" role="list" class="divide-y divide-gray-100 bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                                <li v-if="communsLoaded" v-for="commun in communs" :key="commun.id_choix" class="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6">
                                    <div v-if="commun.client" class="flex min-w-0 gap-x-4">
                                        <img @error="event => handleImageError(event)" class="h-12 w-12 flex-none rounded-full bg-gray-50 object-cover" :src="`${uri}/storage/img/cli/${commun.client.id_cli}.webp`" alt="" />
                                        <div class="min-w-0 flex-auto">
                                            <p class="text-sm font-semibold leading-6 text-gray-900">
                                                <a class="flex gap-2 items-center" :style="`color: ${setColorName(commun.client)}`">
                                                    {{ commun.client.nom_cli + ' ' + commun.client.pNoms_cli }}
                                                </a>
                                            </p>
                                            <p class="mt-1 flex text-xs leading-5" :style="`color: ${setColorTag(commun.client)}`">
                                                Réf. {{ commun.client.ref_cli }}
                                            </p>
                                        </div>
                                    </div>
                                    <div class="flex shrink-0 items-center gap-x-4">
                                        <div v-if="commun.client" class="flex flex-none items-center gap-x-4">
                                            <a @click="handleCreateRencontre(commun.client.id_cli)" :class="creatingRencontre ? 'active opacity-75 pointer-events-none' : false" class="hidden group rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:flex items-center gap-2">
                                                Initier une rencontre
                                                <svg class="hidden animate-spin h-4 w-4 text-gray-500 group-[.active]:inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            </a>
                                        </div>
                                    </div>
                                </li>
                                <SkeletonRow v-else/>
                            </ul>
                            <div v-else-if="communsLoaded">
                                <p class="text-gray-500 text-center py-4">Aucun choix communs de possible pour le moment...</p>
                            </div>
                            <ul v-else role="list" class="divide-y divide-gray-100 overflow-hidden bg-white shadow-sm ring-1 ring-inset ring-gray-900/5 sm:rounded-xl">
                                <SkeletonRow />
                            </ul>
                        </div>
                    </div>
                    <!-- #endregion -->

                    <!-- #region CHOIX -->
                    <div>
                        <h2 class="px-4 text-base font-medium leading-7 text-gray-900 sm:px-6 lg:px-8 mb-2 flex items-center gap-2">
                            <ArrowRightCircleIcon class="text-rose w-5 h-5"/>
                            Choix de {{ name }}
                        </h2>
                        <div class="bg-white shadow-sm ring-1 ring-inset ring-gray-900/5 sm:rounded-xl md:col-span-2">
                            <ul v-if="choices.length > 0" role="list" class="divide-y divide-gray-100">
                                <li v-if="choicesLoaded" v-for="choice in choices" :key="choice.id_choix" class="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6">
                                    <div v-if="choice.client" class="flex min-w-0 gap-x-4">
                                        <img @error="event => handleImageError(event)" class="h-10 w-10 2xl:h-12 2xl:w-12 flex-none rounded-full bg-gray-50 object-cover" :src="`${uri}/storage/img/cli/${choice.client.id_cli}.webp`" alt="" />
                                        <div class="min-w-0 flex-auto">
                                            <p class="text-sm font-semibold 2xl:leading-6 text-gray-900">
                                                <a class="flex gap-x-2 items-center flex-wrap text-xs 2xl:text-sm" :style="`color: ${setColorName(choice.client)}`">
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
                                            <p class="mt-1 flex text-xs leading-5" :style="`color: ${setColorTag(choice.client)}`">
                                                Réf. {{ choice.client.ref_cli }}
                                            </p>
                                        </div>
                                    </div>
                                    <div class="flex shrink-0 items-center gap-x-4">
                                        <div v-if="choice.client" class="flex flex-none items-center gap-x-2">
                                            <button @click="handleOpeningFiche(choice.client)" type="button" class="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                                                Voir la fiche
                                            </button>
                                            <a @click="handleSendingAttachment(choice.client, 'choix')" class="relative cursor-pointer group rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                                <AtSymbolIcon class="w-5 h-5"/>
                                                <span class="w-max group-hover:opacity-100 duration-300 ease-out opacity-0 absolute -top-1 left-1/2 pointer-events-none bg-gray-700 text-white px-4 py-1 rounded-md -translate-y-full -translate-x-1/2">Envoyer un mail</span>
                                            </a>
                                            <a @click="handlePrint(client, 'choix', choice.client)" class="relative cursor-pointer group rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                                <PrinterIcon class="w-5 h-5"/>
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
                    </div>
                    <!-- #endregion -->

                    <!-- #region DEMANDE -->
                    <div>
                        <h2 class="px-4 text-base font-medium leading-7 text-gray-900 sm:px-6 lg:px-8 mb-2 flex items-center gap-2">
                            <ArrowLeftCircleIcon class="text-rose w-5 h-5"/>
                            Ont choisi {{ name }}
                        </h2>
                        <div class="bg-white shadow-sm ring-1 ring-inset ring-gray-900/5 sm:rounded-xl md:col-span-2">
                            <ul v-if="demandes.length > 0" role="list" class="divide-y divide-gray-100 bg-white shadow-sm ring-1 ring-inset ring-gray-900/5 sm:rounded-xl">
                                <li v-if="demandesLoaded" v-for="demande in demandes" :key="demande.id_choix" class="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6">
                                    <div v-if="demande.client" class="flex min-w-0 gap-x-4">
                                        <img @error="event => handleImageError(event)" class="h-10 w-10 2xl:h-12 2xl:w-12 flex-none rounded-full bg-gray-50 object-cover" :src="`${uri}/storage/img/cli/${demande.client.id_cli}.webp`" alt="" />
                                        <div class="min-w-0 flex-auto">
                                            <p class="text-sm font-semibold 2xl:leading-6 text-gray-900">
                                                <a class="flex gap-x-2 items-center flex-wrap text-xs 2xl:text-sm" :style="`color: ${setColorName(demande.client)}`">
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
                                            <p class="mt-1 flex text-xs leading-5" :style="`color: ${setColorTag(demande.client)}`">
                                                Réf. {{ demande.client.ref_cli }}
                                            </p>
                                        </div>
                                    </div>
                                    <div class="flex shrink-0 items-center gap-x-4">
                                        <div v-if="demande.client" class="flex flex-none items-center gap-x-2">
                                            <button @click="handleOpeningFiche(demande.client)" type="button" class="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                                                Voir la fiche
                                            </button>
                                            <a @click="handleSendingAttachment(demande.client, 'choix', false, mail)" class="relative cursor-pointer group rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                                <AtSymbolIcon class="w-5 h-5"/>
                                                <span class="w-max group-hover:opacity-100 duration-300 ease-out opacity-0 absolute -top-1 left-1/2 pointer-events-none bg-gray-700 text-white px-4 py-1 rounded-md -translate-y-full -translate-x-1/2">Envoyer un mail</span>
                                            </a>
                                            <a @click="handlePrint(demande.client, 'choix')" class="relative cursor-pointer group rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                                <PrinterIcon class="w-5 h-5"/>
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
                    </div>
                    <!-- #endregion -->

                    <!-- #region PROPOSITION -->
                    <div>
                        <h2 class="px-4 text-base font-medium leading-7 text-gray-900 sm:px-6 lg:px-8 mb-2 flex items-center gap-2">
                            <HomeModernIcon class="text-rose w-5 h-5"/>
                            Propositions
                        </h2>
                        <div class="bg-white shadow-sm ring-1 ring-inset ring-gray-900/5 sm:rounded-xl md:col-span-2">
                            <ul v-if="propositions.length > 0" role="list" class="divide-y divide-gray-100 bg-white shadow-sm ring-1 ring-inset ring-gray-900/5 sm:rounded-xl">
                                <li v-if="propositionsLoaded" v-for="proposition in propositions" :key="proposition.id_prop" class="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6">
                                    <div v-if="proposition.client" class="flex min-w-0 gap-x-4">
                                        <img @error="event => handleImageError(event)" class="h-12 w-12 flex-none rounded-full bg-gray-50 object-cover" :src="`${uri}/storage/img/cli/${proposition.client.id_cli}.webp`" alt="" />
                                        <div class="min-w-0 flex-auto">
                                            <p class="text-xs 2xl:text-sm font-semibold 2xl:leading-6 text-gray-900">
                                                <a class="flex gap-x-2 items-center flex-wrap" :style="`color: ${setColorName(proposition.client)}`">
                                                    {{ proposition.client.nom_cli + ' ' + proposition.client.pNoms_cli }}
                                                    <span :class="[proposition.res_prop  === 1 ? 'text-green-700 bg-green-50 ring-green-600/20' : (proposition.res_prop  === 0 ? 'text-red-800 bg-red-50 ring-red-600/20' : 'text-gray-600 bg-gray-50 ring-gray-500/10'), 'rounded-md whitespace-nowrap mt-0.5 px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset']">
                                                        {{
                                                            proposition.res_prop  === 1 ? `Acceptée le ${moment(proposition.dateRes_prop).format('ll')}`
                                                            : proposition.res_prop  === 0 ? `Refusée le ${moment(proposition.dateRes_prop).format('ll')}`
                                                            : proposition.res_prop  === null && proposition.dateEnv_choix ? `Envoyée le ${moment(proposition.dateEnv_prop).format('ll')}` : 'Aucune proposition'
                                                        }}
                                                    </span>
                                                </a>
                                            </p>
                                            <p class="mt-1 flex text-xs leading-5" :style="`color: ${setColorTag(proposition.client)}`">
                                                Réf. {{ proposition.client.ref_cli }}
                                            </p>
                                        </div>
                                    </div>
                                    <div class="flex shrink-0 items-center gap-x-4">
                                        <div v-if="proposition.client" class="flex flex-none items-center gap-x-2">
                                            <button @click="handleOpeningFiche(proposition.client)" type="button" class="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                                                Voir la fiche
                                            </button>
                        
                                            <a @click="handleSendingAttachment(proposition.client, 'prop', false, mail)" class="relative cursor-pointer group rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                                <AtSymbolIcon class="w-5 h-5"/>
                                                <span class="w-max group-hover:opacity-100 duration-300 ease-out opacity-0 absolute -top-1 left-1/2 pointer-events-none bg-gray-700 text-white px-4 py-1 rounded-md -translate-y-full -translate-x-1/2">Envoyer un mail</span>
                                            </a>
                                            <a @click="handlePrint(proposition.client, 'prop')" class="relative cursor-pointer group rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                                <PrinterIcon class="w-5 h-5"/>
                                                <span class="w-max group-hover:opacity-100 duration-300 ease-out opacity-0 absolute -top-1 left-1/2 pointer-events-none bg-gray-700 text-white px-4 py-1 rounded-md -translate-y-full -translate-x-1/2">Envoyer un courrier</span>
                                            </a>
                                            <a v-if="proposition.res_prop === null" @click="handeUpdateProposition(proposition.id_prop, true)" class="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-green-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                                <CheckIcon class="w-5 h-5"/>
                                            </a>
                                            <a v-if="proposition.res_prop === null" @click="handeUpdateProposition(proposition.id_prop, false)" class="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-red-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
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
                    </div>
                    <!-- #endregion -->

                    <!-- #region RENCONTRES -->
                    <div>
                        <h2 class="px-4 text-base font-medium leading-7 text-gray-900 sm:px-6 lg:px-8 mb-2 flex items-center gap-2">
                            <BoltIcon class="text-rose w-5 h-5"/>
                            Rencontres
                        </h2>
                        <div class="bg-white shadow-sm ring-1 ring-inset ring-gray-900/5 sm:rounded-xl md:col-span-2">
                            <ul v-if="rencontres.length > 0" role="list" class="divide-y divide-gray-100 bg-white shadow-sm ring-1 ring-inset ring-gray-900/5 sm:rounded-xl">
                                <li v-if="rencontresLoaded" v-for="rencontre in rencontres" :key="rencontre.id_renc" class="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6">
                                    <div v-if="rencontre.laureat" class="flex min-w-0 gap-x-4">
                                        <img @error="event => handleImageError(event)" class="h-12 w-12 flex-none rounded-full bg-gray-50 object-cover" :src="`${uri}/storage/img/cli/${rencontre.laureat.id_cli}.webp`" alt="" />
                                        <div class="min-w-0 flex-auto">
                                            <p class="text-xs 2xl:text-sm font-semibold 2xl:leading-6 text-gray-900">
                                                <a class="flex gap-x-2 items-center flex-wrap" :style="`color: ${setColorName(rencontre.laureat)}`">
                                                    {{ rencontre.laureat.nom_cli + ' ' + rencontre.laureat.pNoms_cli }}
                                                </a>
                                            </p>
                                            <p class="mt-1 flex text-xs leading-5" :style="`color: ${setColorTag(rencontre.laureat)}`">
                                                Réf. {{ rencontre.laureat.ref_cli }}
                                            </p>
                                        </div>
                                    </div>
                                    <div class="flex shrink-0 items-center gap-x-4">
                                        <div v-if="rencontre.laureat" class="flex flex-none items-center gap-x-4">
                                            <span @click="setIsOpen(true, rencontre)" class="text-xs underline cursor-pointer">{{ setComment(rencontre.statut_renc) }}</span>
                                        </div>
                                        <button @click="handleOpeningFiche(rencontre.laureat)" type="button" class="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                                            Voir la fiche
                                        </button>
                                    </div>
                                </li>
                                <SkeletonRow v-else/>
                            </ul>
                            <div v-else-if="rencontresLoaded">
                                <p class="text-gray-500 text-center py-4">Aucune rencontre n'a eu lieu...</p>
                            </div>
                            <TransitionRoot appear :show="isOpen" as="template">
                                <Dialog as="div" @close="setIsOpen(false)" class="relative z-50">
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
                                                                <img class="aspect-[3/2] w-full rounded-2xl object-contain" :src="`${uri}/storage/img/cli/${props.client}.webp`" alt="" />
                                                            </div>
                                                            <div class="col-span-3">
                                                                <img class="aspect-[3/2] w-full rounded-2xl object-contain" :src="`${uri}/storage/img/cli/${rencontre_ref.laureat.id_cli}.webp`" alt="" />
                                                            </div>
                                                            <div class="col-span-3 mt-4">
                                                                <label for="comm_renc" class="block text-center text-xs font-medium leading-6 text-gray-700">Comm. - {{ name }} </label>
                                                                <div class="mt-1">
                                                                    <textarea v-model="rencontre_ref.comm_renc" id="comm_renc" name="comm_renc" rows="3" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6"/>
                                                                    <div class="flex gap-x-2 mt-1">
                                                                        <a @click="handleSendingAttachment(rencontre_ref.laureat, 'renc', false, mail)" class="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                                                            <AtSymbolIcon class="w-5 h-5"/>
                                                                        </a>
                                                                        <a @click="handlePrint(rencontre_ref.laureat, 'renc')" class="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                                                            <PrinterIcon class="w-5 h-5"/>
                                                                        </a>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="col-span-3 mt-4">
                                                                <label for="comm1_renc" class="block text-center text-xs font-medium leading-6 text-gray-700">Comm. - {{ rencontre_ref.laureat.sexe_cli === 'F' ? 'Mme' : 'Mr' }} {{ rencontre_ref.laureat.nom_cli }}</label>
                                                                <div class="mt-1">
                                                                    <textarea v-model="rencontre_ref.comm1_renc" id="comm1_renc" name="comm_renc1" rows="3" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6"/>
                                                                    <div class="flex justify-end gap-x-2 mt-1">
                                                                        <a @click="handleSendingAttachment(client, 'renc', rencontre_ref.laureat)" class="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                                                            <AtSymbolIcon class="w-5 h-5"/>
                                                                        </a>
                                                                        <a @click="handlePrint(client, 'renc', rencontre_ref.laureat)" class="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                                                            <PrinterIcon  class="w-5 h-5"/>
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
                    </div>   
                    <!-- #endregion -->
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
                                                <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">{{ clientViewed.poids_cli }} kg</dd>
                                            </div>

                                            <div class="sm:flex sm:px-6 sm:py-5">
                                                <dt class="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">Enfants</dt>
                                                <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">{{ clientViewed.nbEbf_cli }}</dd>
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

        <!-- #region COURRIER CLIENT -->
        <CourrierClient :client="client" :targetClient="targetClient" :isOpen="popupCourrier" :generate="generateBase64Courrier" @base64generated="handleMail" :type="currentType" :inverse="isInverse" @modal-close="closeCourrierPDF"/>
        <!-- #endregion -->
        
        <Toast :state="stateToast" title="Portrait client envoyé avec succès"/>
    </div>

</template>