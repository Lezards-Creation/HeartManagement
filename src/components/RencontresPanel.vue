<script setup>
    import { computed, ref, watch } from 'vue'
    import { useChoixStore } from '../stores/choix'
    import { useRencontresStore } from '../stores/rencontres'
    
    import moment from "moment";
    import fr from 'moment/dist/locale/fr';
    moment.updateLocale('fr', fr);

	const uri = import.meta.env.VITE_URL;
    const props = defineProps(['client']);
    
    const choixStore = useChoixStore();
    const rencontresStore = useRencontresStore();

    const choices = ref([]);
    const demandes = ref([]);
    const communs = ref([]);
    const rencontres = ref([]);

    const fetchChoices = () => {
        choixStore.getChoices(props.client)
        .then(res => {
            console.log(res)
            choices.value = res.choices; 
            demandes.value = res.demandes;
            communs.value = res.communs;
        })
        .catch(err => {
            console.error(err);
        }) 
    }

    const fetchRencontres = () => {
        rencontresStore.getRencontres(props.client)
        .then(res => {
            console.log(res)
            rencontres.value = res.rencontres; 
        })
        .catch(err => {
            console.error(err);
        }) 
    }

    const active_tab = ref('Choix communs')
    const tabs = ref([
		{ name: 'Choix communs', href: '#' },
		{ name: 'Ont choisi', href: '#' },
		{ name: 'Choix de', href: '#' },
		{ name: 'Rencontres', href: '#' },
		{ name: 'Propositions', href: '#' },
	])


    watch(() => props.client, () => {fetchChoices(); fetchRencontres()}, {immediate: true});

    // SELECT * FROM CHOIX AS choix
    // INNER JOIN CLIENT AS client
    //     ON choix.idCli_choix = client.id_cli
    // WHERE choix.idCli_choix = 1323 

    // SELECT * FROM CHOIX AS choix
    // INNER JOIN CLIENT AS client
    //     ON choix.idCli_choix = client.id_cli
    // WHERE choix.idCli1_choix = 1323 

    const fallbackImage = `${uri}/img/cli/vide.png`;
	function handleImageError(event, idCli) {
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
                            @click="active_tab = tab.name">{{ tab.name }}</option>
                    </select>
                </div>
                <div class="hidden sm:block">
                    <nav class="-mb-px flex space-x-8">
                        <a @click="active_tab = tab.name" v-for="tab in tabs" :key="tab.name" :href="tab.href"
                            :class="[active_tab == tab.name ? 'border-rose-500 text-rose-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700', 'whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium']"
                            :aria-current="tab.current ? 'page' : undefined">{{ tab.name }}</a>
                    </nav>
                </div>
            </div>
        </div>

        <div class="space-y-10 divide-y divide-gray-900/10 mt-10" v-if="active_tab === 'Choix communs'">
            <ul role="list" class="divide-y divide-gray-100 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl max-w-[80%]">
                <li v-for="commun in communs" :key="commun.id_choix" class="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6">
                    <div class="flex min-w-0 gap-x-4">
                        <img @error="event => handleImageError(event)" class="h-12 w-12 flex-none rounded-full bg-gray-50 object-cover" :src="`${uri}/img/cli/${commun.client.id_cli}.jpg`" alt="" />
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
            </ul>
        </div>

        <div class="space-y-10 divide-y divide-gray-900/10 mt-10" v-if="active_tab === 'Ont choisi'">
            <ul role="list" class="divide-y divide-gray-100 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl max-w-[80%]">
                <li v-for="choice in choices" :key="choice.id_choix" class="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6">
                    <div class="flex min-w-0 gap-x-4">
                        <img @error="event => handleImageError(event)" class="h-12 w-12 flex-none rounded-full bg-gray-50 object-cover" :src="`${uri}/img/cli/${choice.client.id_cli}.jpg`" alt="" />
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
                                Envoyer un mail
                            </a>

                            <a class="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                Envoyer un courrier
                            </a>
                        </div>
                    </div>
                </li>
            </ul>
        </div>

        <div class="space-y-10 divide-y divide-gray-900/10 mt-10" v-if="active_tab === 'Choix de'">
            <ul role="list" class="divide-y divide-gray-100 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl max-w-[80%]">
                <li v-for="demande in demandes" :key="demande.id_choix" class="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6">
                    <div class="flex min-w-0 gap-x-4">
                        <img @error="event => handleImageError(event)" class="h-12 w-12 flex-none rounded-full bg-gray-50 object-cover" :src="`${uri}/img/cli/${demande.client.id_cli}.jpg`" alt="" />
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
                                Envoyer un mail
                            </a>

                            <a class="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                Envoyer un courrier
                            </a>
                        </div>
                    </div>
                </li>
            </ul>
        </div>

        <div class="space-y-10 divide-y divide-gray-900/10 mt-10" v-if="active_tab === 'Rencontres'">
            <ul role="list" class="divide-y divide-gray-100 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl max-w-[80%]">
                <li v-for="rencontre in rencontres" :key="rencontre.id_choix" class="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6">
                    <div class="flex min-w-0 gap-x-4">
                        <img @error="event => handleImageError(event)" class="h-12 w-12 flex-none rounded-full bg-gray-50 object-cover" :src="`${uri}/img/cli/${rencontre.laureat.id_cli}.jpg`" alt="" />
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
                            <a class="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                Initier une rencontre
                            </a>
                        </div>
                    </div>
                </li>
            </ul>
        </div>        
    </div>
</template>