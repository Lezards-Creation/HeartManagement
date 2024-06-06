<script setup>
	import { computed, ref, watch, onMounted } from "vue"
	import { useRoute } from "vue-router";
	import { useClientsStore } from '../stores/clients'
	import { useAgencesStore } from "../stores/agences";
	import { AdjustmentsHorizontalIcon, PlusIcon, CheckIcon, ChevronDownIcon, IdentificationIcon, AdjustmentsVerticalIcon, BuildingOffice2Icon, ListBulletIcon, XMarkIcon } from '@heroicons/vue/24/outline'
	import { Popover, PopoverButton, PopoverPanel, Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/vue'

	import moment from "moment";

	const uri = import.meta.env.VITE_URL;
	const route = useRoute();

	const clientsStore = useClientsStore()

	const clients = ref({});
	const clients_count = ref(0);

	const ListLoaded = ref(false);

	const search_term = ref(null);
	const filters = ref({
		sexe_cli: "",
		ville_cli: "",
		telGsm_cli: "",
		libre_cli: "",
		probPaie_cli: "",
		situation_cli: "",
		nbEnf_min_cli: "",
		nbEnf_max_cli: "",
		age_min_cli: "",
		age_max_cli: "",
		taille_min_cli: "",
		taille_max_cli: "",
		etude_cli: "",
		ms_cli: "",
		tranche_cli: "",
		code_cli: "",
		date_cli: "",
		contrat_cli: "",
		proc_cli: "",
		idAgence_cli: "",
	})

	const filterOptions = [
		{ title: 'Adhérents', filter: 'insc_cli' ,current: true },
		{ title: 'Prospects', filter: 'prosp_cli', current: false },
		{ title: 'Contacts', filter: 'cont_cli', current: false },
		{ title: 'Anciens adhérents', filter: 'anc_adh', current: false },
		{ title: 'Fiches supprimées', filter: 'id_cli', current: false },
		{ title: 'Liste noire', filter: 'ln_cli', current: false },
	]

	const selected = ref(filterOptions[0])
	
	const filtered_clients = computed(() => {
		const searchTermLower = search_term.value?.toLowerCase() || "";
		let totalCount = 0;

		const filteredDirectory = Object.keys(clients.value).reduce((acc, initialLetter) => {
			const filteredUsers = clients.value[initialLetter].filter(user => {
				const searchMatch = searchTermLower.length >= 3 ? (user.pNoms_cli.toLowerCase() + user.nom_cli.toLowerCase()).includes(searchTermLower) || user.ref_cli.toLowerCase().includes(searchTermLower) : true;
				let filtersMatch = true;
				Object.entries(filters.value).forEach(([key, value]) => {
					if(filters.value[key] !== undefined){
						if(key === 'nbEnf_min_cli'){
							filtersMatch = filtersMatch && user.nbEnf_cli >= value;
							if(filters.value.nbEnf_max_cli){
								filtersMatch = filtersMatch && (user.nbEnf_cli >= value && user.nbEnf_cli <= filters.value.nbEnf_max_cli);
							}
						}

						if(key === 'age_min_cli'){
							filtersMatch = filtersMatch && calculateAge(user.dateNaiss_cli) >= value;
							if(filters.value.age_max_cli){
								filtersMatch = filtersMatch && (calculateAge(user.dateNaiss_cli) >= value && calculateAge(user.dateNaiss_cli) <= filters.value.age_max_cli);
							}
						}

						if(key === 'taille_min_cli'){
							filtersMatch = filtersMatch && user.taille_cli >= value;
							if(filters.value.taille_max_cli){
								filtersMatch = filtersMatch && (user.taille_cli >= value && user.taille_cli <= filters.value.taille_max_cli);
							}
						}

						if(key === 'date_cli'){
							if(user.insc_cli){
								let referenceDate = moment();
								let dateToCheck = moment(user.insc_cli);
								if(value){
									let monthDifference = referenceDate.diff(dateToCheck, 'month');
									filtersMatch = filtersMatch && (monthDifference <= parseInt(value));
								}
							}
						}

						if(key === 'contrat_cli'){
							if(user.insc_cli){
								let referenceDate = moment();
								let dateToCheck = moment(user.insc_cli).add(user.duree_cli, 'M');

								if(value){
									let monthDifference = referenceDate.diff(dateToCheck, 'month');
									filtersMatch = filtersMatch && (monthDifference <= parseInt(value));
								}
							}
						}
					}

					if (filters.value[key] && user[key] !== undefined) {
						if (key === 'situation_cli') {
							filtersMatch = filtersMatch && user[key][value] === 'O';
						} else if (typeof user[key] === 'string') {
							filtersMatch = filtersMatch && user[key].toLowerCase().includes(filters.value[key].toLowerCase());
						} else {
							filtersMatch = filtersMatch && user[key] === filters.value[key];
						}
					}
				});

				return searchMatch && filtersMatch;
			});

			if (filteredUsers.length) {
				acc[initialLetter] = filteredUsers;
				totalCount += filteredUsers.length;
			}
			return acc;
		}, {});
		
		return {
			filteredDirectory,
			totalCount
		};
	});

	const agencesStore = useAgencesStore();
	const agences = ref([]);

	const fetchClients = () => {
		ListLoaded.value = false;
		clientsStore.getClients(selected.value.filter)
			.then((res) => {
				clients.value = res.directory;
				clients_count.value = res.clients_count;
				
				ListLoaded.value = true;
			})
			.catch(err => {
				console.error(err)
			})
	}
	fetchClients();

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

	const toggleAccordeon = (e) => {
		let target = e.currentTarget;
		target.classList.toggle('active');
		
		var panel = target.nextElementSibling;
		if (panel.style.maxHeight) {
			panel.style.maxHeight = null;
		} else {
			panel.style.maxHeight = panel.scrollHeight + "px";
		}	
	}

	const fetchAgences = () => {
		agencesStore.getAgences()
		.then((res) => {
			if(res.agences.length > 0){
				res.agences.forEach(agence => {
					if(agence.id_agence !== 0){
						let data = {
							id: agence.id_agence,
							name: agence.lib_agence,
							initial: agence.lib_agence.charAt(0)
						}
						agences.value.push(data);
					}
				});

				agences.value.sort((a, b) => {
					return a.name.localeCompare(b.name);
				});
			}
		})
		.catch(err => {
			console.error(err)
		})
	}
	fetchAgences();

	const fallbackImage = `${uri}/storage/img/cli/vide.webp`;
	function handleImageError(event) {
		event.target.src = fallbackImage;
	}

	onMounted(() => {
		if(route?.query?.agence){
			filters.value.idAgence_cli = parseInt(route.query.agence)
		}
	})

	watch(() => route?.query?.agence, () => {
		if(route?.query?.agence){
			filters.value.idAgence_cli = parseInt(route.query.agence)
		}
	})
</script>

<template>
	<div class="h-screen border-r border-r-gray-100 flex-[0]">
		<!-- #region FILTRES TYPE + AJOUT -->
		<div class="flex gap-2 items-center px-4 pt-4 flex-wrap">
			<Listbox class="" as="div" v-model="selected" @update:model-value="fetchClients">
				<div class="relative">
					<div class="inline-flex">
						<ListboxButton class="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
							<p class="text-sm font-semibold">{{ selected.title }}</p>
							<ChevronDownIcon class="ml-2 h-4 w-4" aria-hidden="true" />
						</ListboxButton>
					</div>


					<transition leave-active-class="transition ease-in duration-100" leave-from-class="opacity-100" leave-to-class="opacity-0">
						<ListboxOptions class="absolute left-0 z-10 mt-2 w-72 origin-top-right divide-y divide-gray-200 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
						<ListboxOption as="template" v-for="option in filterOptions" :key="option.title" :value="option" v-slot="{ active, selected }">
							<li :class="[active ? 'bg-rose-600 text-white' : 'text-gray-900', 'cursor-default select-none p-4 text-sm']">
							<div class="flex flex-col">
								<div class="flex justify-between">
								<p :class="selected ? 'font-semibold' : 'font-normal'">{{ option.title }}</p>
									<span v-if="selected" :class="active ? 'text-white' : 'text-rose-600'">
										<CheckIcon class="h-5 w-5" aria-hidden="true" />
									</span>
								</div>
							</div>
							</li>
						</ListboxOption>
						</ListboxOptions>
					</transition>
				</div>
			</Listbox>
			<router-link :to="{path: '/clients/fiche/creation'}" type="button" class="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
				<PlusIcon class="-ml-0.5 mr-1.5 h-4 w-4" aria-hidden="true" />
				Ajouter un client
			</router-link>
		</div>
		<!-- #endregion -->
		
		<!-- #region RECHERCHE + FILTRES -->
		<div class="search flex justify-between items-center p-4 w-full">
			<div class="flex rounded-md shadow-sm w-full">
				<div class="relative flex flex-grow items-stretch focus-within:z-10">
					<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
						<UsersIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
					</div>
					<input type="text" name="text" v-model="search_term" id="search_term"
						class="block w-full rounded-none rounded-l-md border-0 py-2.5 pl-4 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6"
						:placeholder="`Rechercher dans ${filtered_clients.totalCount} clients`" />
				</div>

				<Popover class="relative">
					<PopoverButton
						class="h-full -ml-px inline-flex items-center gap-x-1.5 rounded-r-md px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-200 hover:bg-gray-50 focus:ring-inset focus:ring-rose-600">
						<AdjustmentsHorizontalIcon class="-ml-0.5 h-5 w-5 text-gray-400" aria-hidden="true" />
						Filtrer
					</PopoverButton>

					<PopoverPanel class="absolute left-0 z-10 mt-0 flex w-screen max-w-max">
						<form @input="updateFilter" class="w-screen max-w-md flex-auto rounded-md rounded-tl-none bg-white text-sm leading-6 shadow-md ring-1 ring-gray-900/5 max-h-[70vh] overflow-auto">
							<div class="p-6">
								<span class="text-xl font-semibold mb-6 flex justify-between items-center">
									Filtrer
									<PopoverButton>
										<XMarkIcon @click="" class="w-5 h-5"/>
									</PopoverButton>
								</span>

								

								<div class="accordion relative mb-6 p-4 rounded-md ring-1 ring-gray-900/5 ring-inset bg-gray-200/5">
									<button ref="firstAccordion" type="button" class="accordion flex justify-between items-center gap-2 group w-full" @click="toggleAccordeon">
										<span class="flex gap-2 items-center">
											<IdentificationIcon class="w-6 h-auto duration-300 ease-out"/>	
											Général
										</span>
										<PlusIcon class="h-5 w-auto text-rose group-[.active]:rotate-45 duration-300 ease-out"/>
									</button>
									<div class="panel p-0 max-h-0 overflow-hidden duration-300 ease-out">
										<div class="container grid grid-cols-1 gap-x-4 gap-y-4 pt-6 pb-4 sm:grid-cols-6">
											<div class="sm:col-span-full">
												<label for="sexe_cli"class="block text-sm font-medium leading-6 text-gray-900">Sexe</label>
												<div class="mt-2">
													<select v-model="filters.sexe_cli" id="sexe_cli" name="sexe_cli" 
														class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6">
														<option value="">Homme / Femme</option>
														<option value="H">Homme</option>
														<option value="F">Femme</option>
													</select>
												</div>
											</div>

											<div class="sm:col-span-3">
												<label for="ville_cli" class="block text-sm font-medium leading-6 text-gray-900">Ville</label>
												<div class="mt-2">
													<input v-model="filters.ville_cli" type="text" name="ville_cli" id="ville_cli" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6">
												</div>
											</div>

											<div class="sm:col-span-3">
												<label for="telGsm_cli" class="block text-sm font-medium leading-6 text-gray-900">Téléphone</label>
												<div class="mt-2">
													<input v-model="filters.telGsm_cli" type="text" name="telGsm_cli" id="telGsm_cli" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6">
												</div>
											</div>

											<div class="sm:col-span-3">
												<label for="libre_cli" class="block text-sm font-medium leading-6 text-gray-900">Libre</label>
												<div class="mt-2">
													<select v-model="filters.libre_cli" id="libre_cli" name="libre_cli" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:max-w-xs sm:text-sm sm:leading-6">
														<option value="">Sans importance</option>
														<option value="O">Oui</option>
														<option value="N">Non</option>
													</select>
												</div>
											</div>

											<div class="sm:col-span-3">
												<label for="probPaie_cli" class="block text-sm font-medium leading-6 text-gray-900">Problème de paiement</label>
												<div class="mt-2">
													<select v-model="filters.probPaie_cli" id="probPaie_cli" name="probPaie_cli"
														class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:max-w-xs sm:text-sm sm:leading-6">
														<option value="">Sans importance</option>
														<option value="O">Oui</option>
														<option value="N">Non</option>
													</select>
												</div>
											</div>

											<div class="sm:col-span-full">
												<label for="situation_cli" class="block text-sm font-medium leading-6 text-gray-900">Situation</label>
												<div class="mt-2">
													<select v-model="filters.situation_cli" id="situation_cli" name="situation_cli"
														class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6">
														<option value="">Indétérminé</option>
														<option value="celib_cli">Célibataire</option>
														<option value="veuf_cli">Veuf</option>
														<option value="div_cli">Divorcé</option>
														<option value="sep_cli">Séparé</option>
														<option value="instDiv_cli">En instance de divorce</option>
													</select>
												</div>
											</div>

											<div class="sm:col-span-full">
												<label for="nbEnf_min_cli" class="block text-sm font-medium leading-6 text-gray-900">Enfants</label>
												
												<div class="mt-2 flex items-center gap-2">
													<span>De</span>
													<div class="relative">
														<input v-model="filters.nbEnf_min_cli" type="text" name="nbEnf_min_cli" id="nbEnf_min_cli" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
													</div>
													<span>à</span>
													<div class="relative">
														<input v-model="filters.nbEnf_max_cli" type="text" name="nbEnf_max_cli" id="nbEnf_max_cli" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>

								<div class="accordion relative mb-6 p-4 rounded-md ring-1 ring-gray-900/5 ring-inset bg-gray-200/5">
									<button ref="firstAccordion" type="button" class="accordio flex justify-between items-center gap-2 group w-full" @click="toggleAccordeon">
										<span class="gap-2 flex items-center">
											<AdjustmentsVerticalIcon class="w-5 h-auto" />
											Caractéristiques physique
										</span>
										<PlusIcon class="h-5 w-auto text-rose group-[.active]:rotate-45 duration-300 ease-out"/>
									</button>
									<div class="panel p-0 max-h-0 overflow-hidden duration-300 ease-out">
										<div class="container grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-6 pt-6 pb-4">
											<div class="sm:col-span-full">
												<label for="age_min_cli" class="block text-sm font-medium leading-6 text-gray-900">Age</label>
												
												<div class="mt-2 flex items-center gap-2">
													<span>De</span>
													<div class="relative">
														<input v-model="filters.age_min_cli" type="text" name="age_min_cli" id="age_min_cli" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
														<div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
															<span class="text-gray-500 text-xs" id="price-currency">ans</span>
														</div>
													</div>
												
													<span>à</span>
													<div class="relative">
														<input v-model="filters.age_max_cli" type="text" name="age_max_cli" id="age_max_cli" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
														<div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
															<span class="text-gray-500 text-xs" id="price-currency">ans</span>
														</div>
													</div>
												</div>
											</div>

											<div class="sm:col-span-full">
												<label for="taille_min_cli" class="block text-sm font-medium leading-6 text-gray-900">Taille</label>
												
												<div class="mt-2 flex items-center gap-2">
													<span>De</span>
													<div class="relative">
														<input v-model="filters.taille_min_cli" type="text" name="taille_min_cli" id="taille_min_cli" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
														<div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
															<span class="text-gray-500 text-xs" id="price-currency">cm</span>
														</div>
													</div>
													<span>à</span>
													<div class="relative">
														<input v-model="filters.taille_max_cli" type="text" name="taille_max_cli" id="taille_max_cli" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
														<div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
															<span class="text-gray-500 text-xs" id="price-currency">cm</span>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
								
								<div class="accordion relative mb-6 p-4 bg-gray-200/5 ring-1 ring-gray-900/5 ring-inset rounded-md">
									<button ref="firstAccordion" type="button" class="accordion flex justify-between gap-2 group w-full" @click="toggleAccordeon">
										<span class="flex gap-2">
											<BuildingOffice2Icon class="w-5 h-auto"/>
											Caractéristiques professionnel
										</span>
										<PlusIcon class="h-5 w-auto text-rose group-[.active]:rotate-45 duration-300 ease-out"/>
									</button>
									<div class="panel p-0 max-h-0 overflow-hidden duration-300 ease-out">
										<div class="container grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-6 pt-6 pb-4">
											<div class="sm:col-span-full">
												<label for="etude_cli" class="block text-sm font-medium leading-6 text-gray-900">Niveau d'étude</label>
												<div class="mt-2">
													<select v-model="filters.etude_cli" id="etude_cli" name="etude_cli"
														class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:max-w-xs sm:text-sm sm:leading-6">
														<option value="">Sans importance</option>
														<option value="0">Indeterminé</option>
														<option value="1">Primaire</option>
														<option value="2">Secondaire</option>
														<option value="3">Bac à Bac +2</option>
														<option value="4">Bac +3 et plus</option>
													</select>
												</div>
											</div>

											<div class="sm:col-span-full">
												<label for="ms_cli" class="block text-sm font-medium leading-6 text-gray-900">Milieu social</label>
												<div class="mt-2">
													<select v-model="filters.ms_cli" id="ms_cli" name="ms_cli"
														class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:max-w-xs sm:text-sm sm:leading-6">
														<option value="">Sans importance</option>
														<option value="_0">Bon</option>
														<option value="_1">Moyen</option>
														<option value="_2">Modeste</option>
														<option value="_3">Autre</option>
													</select>
												</div>
											</div>

											<div class="sm:col-span-full">
												<label for="tranche_cli" class="block text-sm font-medium leading-6 text-gray-900">Revenus</label>
												<div class="mt-2">
													<select v-model="filters.tranche_cli" id="tranche_cli" name="tranche_cli"
														class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:max-w-xs sm:text-sm sm:leading-6">
														<option value="">Sans importance</option>
														<option value="0">Indeterminé</option>
														<option value="1">Modestes (- de 900€)</option>
														<option value="2">Corrects (de 900€ à 1300€)</option>
														<option value="3">Confortables (de 1300€ à 2000€)</option>
														<option value="4">Trés confortables (de 2000€ à 4000€)</option>
														<option value="5">Elevés (4000€ et plus)</option>
													</select>
												</div>
											</div>
										</div>
									</div>
								</div>

								<div class="accordion relative p-4 bg-gray-200/5 ring-1 ring-gray-900/5 ring-inset rounded-md">
									<button ref="firstAccordion" type="button" class="accordio flex justify-between items-center w-full gap-2 group" @click="toggleAccordeon">
										<span class="gap-2 flex items-center">
											<ListBulletIcon class="w-5 h-auto"/>
											Autres
										</span>
										<PlusIcon class="h-5 w-auto text-rose group-[.active]:rotate-45 duration-300 ease-out"/>
									</button>
									<div class="panel p-0 max-h-0 overflow-hidden duration-300 ease-out">
										<div class="container grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-6 pt-6 pb-4">
											<div class="sm:col-span-full flex gap-4 items-center">
												<label for="code_cli" class="block text-sm font-medium leading-6 text-gray-900 grow shrink-0 basis-auto">Code</label>
												<div class="flex-0">
													<select v-model="filters.code_cli" id="code_cli" name="code_cli" class="block w-48 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:max-w-xs sm:text-sm sm:leading-6">
														<option value="">Sans importance</option>
														<option value="0">Indeterminé</option>
														<option value="1">1</option>
														<option value="2">2</option>
														<option value="3">3</option>
													</select>
												</div>
											</div>

											<div class="sm:col-span-full">
												<label for="date_cli" class="block text-sm font-medium leading-6 text-gray-900">Date d'inscription</label>
												<div class="mt-2 flex items-center gap-2">
													<span class="text-xs grow shrink-0 basis-auto">Moins de</span>
													<div class="relative flex-0">
														<input v-model="filters.date_cli" type="text" name="date_cli" id="date_cli" class="block w-48 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
														<div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
															<span class="text-gray-500 text-xs" id="price-currency">mois</span>
														</div>
													</div>
												</div>
											</div>

											<div class="sm:col-span-full">
												<label for="contrat_cli" class="block text-sm font-medium leading-6 text-gray-900">Contrat échu depuis</label>
												<div class="mt-2 flex items-center gap-2">
													<span class="text-xs grow shrink-0 basis-auto">Moins de</span>
													<div class="relative">
														<input v-model="filters.contrat_cli" type="text" name="contrat_cli" id="contrat_cli" class="block w-48 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
														<div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
															<span class="text-gray-500 text-xs" id="price-currency">mois</span>
														</div>
													</div>
												</div>
											</div>

											<div class="sm:col-span-full">
												<label for="proc_cli" class="block text-sm font-medium leading-6 text-gray-900">Procuration</label>
												<div class="mt-2">
													<select v-model="filters.proc_cli" id="proc_cli" name="proc_cli" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6">
														<option value="">Sans importance</option>
														<option value="O">Oui</option>
														<option value="N">Non</option>
													</select>
												</div>
											</div>

											<div class="sm:col-span-full">
												<label for="idAgence_cli" class="block text-sm font-medium leading-6 text-gray-900">Agence</label>
												<div class="mt-2">
													<select v-model="filters.idAgence_cli" id="idAgence_cli" name="idAgence_cli" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6">
														<option value="">Sans importance</option>
														<option v-for="agence in agences" :key="agence.id" :value="agence.id">{{agence.name}}</option>
													</select>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</form>
					</PopoverPanel>
				</Popover>
			</div>
		</div>
		<!-- #endregion -->

		<!-- #region LISTES CLIENTS -->
		<nav class="h-screen overflow-y-auto 2xl:w-96 bg-white/80 backdrop-blur-sm relative pb-[100%]" aria-label="Directory">
			<div v-if="ListLoaded" v-for="letter in Object.keys(filtered_clients.filteredDirectory)" :key="letter" class="relative">
				<div
					class="sticky top-0 z-10 border-y border-b-gray-200 border-t-gray-100 bg-gray-50 px-3 py-1.5 text-sm font-semibold leading-6 text-rose">
					<h3>{{ letter }}</h3>
				</div>
				<ul role="list" class="divide-y divide-gray-100">
					<li v-for="person in filtered_clients.filteredDirectory[letter]" :key="person.email">
						<router-link class="flex gap-x-4 px-3 py-5 hover:bg-rose-50 items-center transition-all pointer" :to="{ name: 'Client', params: { id: person.id_cli }}" >
							<img @error="event => handleImageError(event, person.id_cli)" class="h-8 w-8 2xl:h-12 2xl:w-12 flex-none object-cover object-center rounded-full bg-gray-50" :src="`${uri}/storage/img/cli/${person.id_cli}.webp`" loading="lazy" />
							<div class="min-w-0">
								<p class="xl:text-xs 2xl:text-sm font-medium  text-gray-900">{{ person.pNoms_cli }} {{ person.nom_cli }}</p>
								<p class="truncate text-xs text-gray-500">{{ person.ville_cli }} - {{ person.dateNaiss_cli ? calculateAge(person.dateNaiss_cli) + ' ans' : '' }}</p>
							</div>
						</router-link>
					</li>
				</ul>
			</div>
			<div v-else>
				<ul role="list" class="divide-y divide-gray-100">
					<li class="relative flex justify-between gap-x-6 px-4 py-5" v-for="n in 10">
						<div class="flex min-w-0 gap-x-4 items-center animate-pulse">
							<span class="bg-gray-300 h-12 w-12 rounded-full"></span>
							
							<div class="min-w-0 flex-auto">
								<span class="bg-gray-300 w-32 h-4 block rounded-xl"></span>
								<span class="bg-gray-300 w-12 h-3 block rounded-xl mt-2"></span>
							</div>
						</div>
					</li>
				</ul>
			</div>
		</nav>
		<!-- #endregion -->
	</div>
</template>
