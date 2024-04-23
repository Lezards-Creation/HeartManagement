<script setup>
    import { computed, ref, watch } from 'vue'
    import { useChoixStore } from '../stores/choix'
    import { useRencontresStore } from '../stores/rencontres'
    import { usePropositionsStore } from '../stores/propositions'
	import { EnvelopeIcon, AtSymbolIcon, CheckIcon, XMarkIcon} from '@heroicons/vue/24/outline'
    import SkeletonRow from './SkeletonRow.vue';

    import moment from "moment";
    import fr from 'moment/dist/locale/fr';
    moment.updateLocale('fr', fr);

	const uri = import.meta.env.VITE_URL;
    const props = defineProps(['client', 'name']);
    
    const choixStore = useChoixStore();
    const rencontresStore = useRencontresStore();
    const propositionsStore = usePropositionsStore();

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

    const name = computed(() => props.name);

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

            let temp = res.communs;            
            
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
                    console.log(communs.value, choices.value, demandes.value, rencontres.value, propositions.value);
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

    const active_tab = ref('communs')
    const tabs = ref([
		{ name: `Choix communs`, slug: 'communs', href: '#' },
		{ name: `Choix de`, slug: 'choix', href: '#' },
		{ name: `Ont choisi`, slug: 'demande', href: '#' },
		{ name: 'Propositions', slug: 'propositions', href: '#' },
		{ name: 'Rencontres', slug: 'rencontres', href: '#' },
	])

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

    watch(() => props.client, fetchRencontresData, {immediate: true});

    const fallbackImage = `${uri}/img/cli/vide.webp`;
	function handleImageError(event) {
		event.target.src = fallbackImage;
	}
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

        <div class="space-y-10 divide-y divide-gray-900/10 mt-10" v-if="active_tab === 'communs'">
            <ul v-if="communs.length > 0" role="list" class="divide-y divide-gray-100 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl max-w-[80%]">
                <li v-if="communsLoaded" v-for="commun in communs" :key="commun.id_choix" class="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6">
                    <div v-if="commun.client" class="flex min-w-0 gap-x-4">
                        <img @error="event => handleImageError(event)" class="h-12 w-12 flex-none rounded-full bg-gray-50 object-cover" :src="`${uri}/img/cli/${commun.client.id_cli}.webp`" alt="" />
                        <div class="min-w-0 flex-auto">
                            <p class="text-sm font-semibold leading-6 text-gray-900">
                                <a class="flex gap-2 items-center">
                                    <span class="absolute inset-x-0 -top-px bottom-0" />
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
                            <a class="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
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
        </div>

        <div class="space-y-10 divide-y divide-gray-900/10 mt-10" v-if="active_tab === 'choix'">
            <ul v-if="choices.length > 0" role="list" class="divide-y divide-gray-100 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl max-w-[80%]">
                <li v-if="choicesLoaded" v-for="choice in choices" :key="choice.id_choix" class="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6">
                    <div v-if="choice.client" class="flex min-w-0 gap-x-4">
                        <img @error="event => handleImageError(event)" class="h-12 w-12 flex-none rounded-full bg-gray-50 object-cover" :src="`${uri}/img/cli/${choice.client.id_cli}.webp`" alt="" />
                        <div class="min-w-0 flex-auto">
                            <p class="text-sm font-semibold leading-6 text-gray-900">
                                <a class="flex gap-2 items-center">
                                    <span class="absolute inset-x-0 -top-px bottom-0" />
                                    {{ choice.client.nom_cli + ' ' + choice.client.pNoms_cli }}
                                    <span :class="[choice.res_choix === 1 ? 'text-green-700 bg-green-50 ring-green-600/20' : (choice.res_choix === 0 ? 'text-red-800 bg-red-50 ring-red-600/20' : 'text-gray-600 bg-gray-50 ring-gray-500/10'), 'rounded-md whitespace-nowrap mt-0.5 px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset']">
                                        {{ choice.res_choix === 1 ? 
                                            'Validé' : (choice.res_choix === 0 ? `Refusé le ${moment(choice.dateRes_choix).format('ll')}` : `En cours depuis ${choice.dateEnv_choix ? moment(choice.dateEnv_choix).format('ll') : moment(choice.date_choix).format('ll')}`)}}
                                    </span>
                                </a>
                            </p>
                            <p class="mt-1 flex text-xs leading-5 text-gray-500">
                                Réf. {{ choice.client.ref_cli }}
                            </p>
                        </div>
                    </div>
                    <div class="flex shrink-0 items-center gap-x-4">
                        <div v-if="choice.client" class="flex flex-none items-center gap-x-4">
                            <a class="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                <AtSymbolIcon class="w-5 h-5"/>
                            </a>

                            <a class="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                <EnvelopeIcon class="w-5 h-5"/>
                            </a>

                            <a class="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-green-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                <CheckIcon class="w-5 h-5"/>
                            </a>

                            <a class="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-red-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                <XMarkIcon class="w-5 h-5"/>
                            </a>
                        </div>
                    </div>
                </li>

                <SkeletonRow v-else/>
            </ul>
            <div v-else>
                <p class="text-gray-500 text-center py-4">Aucun choix réalisé(e) par {{ name }}...</p>
            </div>
        </div>

        <div class="space-y-10 divide-y divide-gray-900/10 mt-10" v-if="active_tab === 'demande'">
            <ul v-if="demandes.length > 0" role="list" class="divide-y divide-gray-100 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl max-w-[80%]">
                <li v-if="demandesLoaded" v-for="demande in demandes" :key="demande.id_choix" class="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6">
                    <div v-if="demande.client" class="flex min-w-0 gap-x-4">
                        <img @error="event => handleImageError(event)" class="h-12 w-12 flex-none rounded-full bg-gray-50 object-cover" :src="`${uri}/img/cli/${demande.client.id_cli}.webp`" alt="" />
                        <div class="min-w-0 flex-auto">
                            <p class="text-sm font-semibold leading-6 text-gray-900">
                                <a class="flex gap-2 items-center">
                                    <span class="absolute inset-x-0 -top-px bottom-0" />
                                    {{ demande.client.nom_cli + ' ' + demande.client.pNoms_cli }}
                                    <span :class="[demande.res_choix === 1 ? 'text-green-700 bg-green-50 ring-green-600/20' : (demande.res_choix === 0 ? 'text-red-800 bg-red-50 ring-red-600/20' : 'text-gray-600 bg-gray-50 ring-gray-500/10'), 'rounded-md whitespace-nowrap mt-0.5 px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset']">
                                        {{ demande.res_choix === 1 ? 
                                            'Validé' : (demande.res_choix === 0 ? `Refusé le ${moment(demande.dateRes_choix).format('ll')}` : `En cours depuis ${demande.dateEnv_choix ? moment(demande.dateEnv_choix).format('ll') : moment(demande.date_choix).format('ll')}`)}}
                                    </span>
                                </a>
                            </p>
                            <p class="mt-1 flex text-xs leading-5 text-gray-500">
                                Réf. {{ demande.client.ref_cli }}
                            </p>
                        </div>
                    </div>
                    <div class="flex shrink-0 items-center gap-x-4">
                        <div v-if="demande.client" class="flex flex-none items-center gap-x-4">
                            <a class="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                <AtSymbolIcon class="w-5 h-5"/>
                            </a>

                            <a class="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                <EnvelopeIcon class="w-5 h-5"/>
                            </a>

                            <a class="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-green-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                <CheckIcon class="w-5 h-5"/>
                            </a>

                            <a class="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-red-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                <XMarkIcon class="w-5 h-5"/>
                            </a>
                        </div>
                    </div>
                </li>

                <SkeletonRow v-else/>
            </ul>
            <div v-else>
                <p class="text-gray-500 text-center py-4">Aucun choix réalisés concernant {{ name }}...</p>
            </div>
        </div>

        <div class="space-y-10 divide-y divide-gray-900/10 mt-10" v-if="active_tab === 'rencontres'">
            <ul v-if="rencontres.length > 0" role="list" class="divide-y divide-gray-100 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl max-w-[80%]">
                <li v-if="rencontresLoaded" v-for="rencontre in rencontres" :key="rencontre.id_renc" class="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6">
                    <div v-if="rencontre.laureat" class="flex min-w-0 gap-x-4">
                        <img @error="event => handleImageError(event)" class="h-12 w-12 flex-none rounded-full bg-gray-50 object-cover" :src="`${uri}/img/cli/${rencontre.laureat.id_cli}.webp`" alt="" />
                        <div class="min-w-0 flex-auto">
                            <p class="text-sm font-semibold leading-6 text-gray-900">
                                <a class="flex gap-2 items-center">
                                    <span class="absolute inset-x-0 -top-px bottom-0" />
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
                            <spa class="text-xs underline">{{ setComment(rencontre.statut_renc) }}</spa>
                        </div>
                    </div>
                </li>
                <SkeletonRow v-else/>
            </ul>
            <div v-else>
                <p class="text-gray-500 text-center py-4">Aucune rencontre n'a eu lieu...</p>
            </div>
        </div>        

        <div class="space-y-10 divide-y divide-gray-900/10 mt-10" v-if="active_tab === 'propositions'">
            <ul v-if="demandes.length > 0" role="list" class="divide-y divide-gray-100 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl max-w-[80%]">
                <li v-if="propositionsLoaded" v-for="proposition in propositions" :key="proposition.id_prop" class="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6">
                    <div v-if="proposition.client" class="flex min-w-0 gap-x-4">
                        <img @error="event => handleImageError(event)" class="h-12 w-12 flex-none rounded-full bg-gray-50 object-cover" :src="`${uri}/img/cli/${proposition.client.id_cli}.webp`" alt="" />
                        <div class="min-w-0 flex-auto">
                            <p class="text-sm font-semibold leading-6 text-gray-900">
                                <a class="flex gap-2 items-center">
                                    <span class="absolute inset-x-0 -top-px bottom-0" />
                                    {{ proposition.client.nom_cli + ' ' + proposition.client.pNoms_cli }}
                                </a>
                            </p>
                            <p class="mt-1 flex text-xs leading-5 text-gray-500">
                                Réf. {{ proposition.client.ref_cli }}
                            </p>
                        </div>
                    </div>
                    <div class="flex shrink-0 items-center gap-x-4">
                        <div v-if="proposition.client" class="flex flex-none items-center gap-x-4">
                            <a class="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                <AtSymbolIcon class="w-5 h-5"/>
                            </a>

                            <a class="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                <EnvelopeIcon class="w-5 h-5"/>
                            </a>

                            <a class="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-green-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                <CheckIcon class="w-5 h-5"/>
                            </a>

                            <a class="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-red-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                <XMarkIcon class="w-5 h-5"/>
                            </a>
                        </div>
                    </div>
                </li>

                <SkeletonRow v-else/>
            </ul>
            <div v-else>
                <p class="text-gray-500 text-center py-4">Aucune proposition de l'agence.</p>
            </div>
        </div>  
    </div>
</template>