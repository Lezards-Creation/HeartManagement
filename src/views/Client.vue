<script setup>
	import { computed, ref, watch } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
	import { ArrowPathRoundedSquareIcon, XMarkIcon, EllipsisVerticalIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/solid'
	import { UserPlusIcon, EnvelopeIcon, CpuChipIcon} from '@heroicons/vue/24/outline'
	import { useClientsStore } from '../stores/clients'
	import { useChoixStore } from '../stores/choix'
	import { useUserStore } from '../stores/user'
	import { usePropositionsStore } from '../stores/propositions'
	import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
	import ProfilPanel from '../components/Profil.vue';
	import PortraitClient from '../components/PortraitClient.vue';
	import moment from 'moment'
	
	const uri = import.meta.env.VITE_URL;
	const route = useRoute();
	const router = useRouter();
	const clientsStore = useClientsStore()
	const choixStore = useChoixStore()
	const userStore = useUserStore();
	const propositionStore = usePropositionsStore();
	
	const fallbackImage = `${uri}/storage/img/cli/vide.webp`;

	//#region VARIABLES
	const open = ref(false)
	const openSearch = ref(false);
	const openTestPopup = ref(false);
	const current_user = ref(null);
	
	const imageSource = ref(null);

	const isModalOpened = ref(false);
    const generateBase64 = ref(false);
	const mail_test = ref(null);
	const typePortrait = ref('court');

	const scoring = ref(null); 

	const currentTabs = ref('Matching');
	const tabs = [
		{ name: 'Matching'},
		{ name: 'Recherche'},
	]

	const search_term = ref(null);
	const clientListed = ref(null);

	const searchLoading = ref(false);
	const matchLoading = ref(false);
	
	const sending = ref(false);
	const stateToast = ref(false);
	const stateToastPropo = ref(false);
	const stateToastChoix = ref(false);

	const determineStatus = computed(() => {
		if (current_user.value && current_user.value.insc_cli) {
			let a = moment(current_user.value.insc_cli).add(current_user.value.duree_cli, 'M');
			let b = moment();
			if (b.isBefore(a)) {
				return 'Adhérent jusqu\'au ' + moment(a).format('ll');
			} else {
				return 'Ancien adhérent depuis ' + moment(a).format('ll');
			}
		}
		return '';
	})

	const filters = ref({
		age_min_cli: "",
		age_max_cli: "",
		taille_min_cli: "",
		taille_max_cli: "",
	})
	//#endregion

	//#region METHODS
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

	const goToFicheClient = (activeOption) => {
		router.push({name: 'Client', params: {id: activeOption.id_cli}})
		open.value = false;
	}

	const handleAddChoice = (activeOption) => {
		stateToastChoix.value = false;
		let client = current_user.value;
		let choix = activeOption

		let data = {
			idUtil_choix: userStore.userLog.id_util,
			idCli_choix: client.id_cli,
			idCli1_choix: choix.id_cli,
			date_choix: moment().format('YYYY-MM-DD'),
		}
		
		matchLoading.value = true;
		searchLoading.value = true;

		choixStore.addChoice(data)
		.then(res => {
			openSearch.value = false;
			open.value = false;
			stateToastChoix.value = true;
			matchLoading.value = false;
			searchLoading.value = false;
		})
		.catch(err => console.error(err))
	}

	const handleAddProposition = (activeOption) => {
		stateToastPropo.value = false;
		let client = current_user.value;
		let prop = activeOption

		let data = {
			idUtil_prop: userStore.userLog.id_util,
			idCli_prop: client.id_cli,
			idCli1_prop: prop.id_cli,
			date_prop: moment().format('YYYY-MM-DD'),
		}
		matchLoading.value = true;
		searchLoading.value = true;
		
		propositionStore.addProposition(data)
		.then(res => {
			openSearch.value = false;
			open.value = false;
			stateToastPropo.value = true;
			matchLoading.value = false;
			searchLoading.value = false;
		})
		.catch(err => console.error(err))
	}

	function updateImageSource() {
		imageSource.value = `${uri}/storage/img/cli/${current_user.value.id_cli}.webp?` + new Date().getTime();
	}
	
	function handleImageError(event) {
		event.target.src = fallbackImage;
	}

	const handleGetClient = () => {
		clientsStore.getClient(route.params.id)
		.then(res => {
			current_user.value = res.client

			let age = res.client.desAge_cli.split('-');

			filters.value.age_min_cli = age[0];
			filters.value.age_max_cli = age[1];

			imageSource.value = `${uri}/storage/img/cli/${current_user.value.id_cli}.webp?` + new Date().getTime()
		})
	}

    const handleMail = (e) => {
		stateToast.value = false;
		sending.value = true;
        let data = {
			subject: e.subject,
            base64: e.file,
            filename: `${current_user.value.sexe_cli === 'H' ? 'Mr ' + current_user.value.nom_cli : 'Mme ' + current_user.value.nom_cli}`
        }

        clientsStore.sendMail(e.email, data)
        .then(res => {
			sending.value = false;
			openTestPopup.value = false;
			stateToast.value = true;
        })
        .catch(err => console.error(err))
    }

	const seekMatch = () => {
		matchLoading.value = true;
		clientsStore.getMatch(current_user.value.id_cli, filters.value)
		.then((res) => {
			matchLoading.value = false;
			scoring.value = res.scoring
		})
		.catch(err => {
			matchLoading.value = false;
			console.error(err)
		})
	}

	const handleSearchClient = () => {
		searchLoading.value = true;
		if(search_term.value.length > 3){
			let sexe = current_user.value.sexe_cli === 'H' ? 'F' : 'H';
			clientsStore.searchClient(search_term.value, sexe)
			.then(res => {
				if(res.clients){
					clientListed.value = res.clients;
				} else {
					clientListed.value = [];
				}
				
				searchLoading.value = false;
			})
			.catch(err => console.error(err))
		} else {
			clientListed.value = [];
			searchLoading.value = false;
		}
	}

	const setColorName = () => {
		let color = 'rgb(17 24 39)'
		if(!current_user.value.libre_cli){
			color = 'rgb(17 24 39)';
			if(current_user.value.probPaie_cli){
				color = 'rgb(249, 115, 22)';
			}
		}


		let anc_adh = false;
		let a = moment(current_user.value.insc_cli).add(current_user.value.duree_cli, 'M');
		let b = moment();
		if (!b.isBefore(a)){
			anc_adh = true;
		} 
		
		if(current_user.value.prosp_cli || current_user.value.cont_cli || anc_adh){
			color = 'rgb(239,68,68)'
		}

		return color;
	}
	
	const setColorTag = () => {
		let color = 'rgb(12, 159, 67)';
		if(!current_user.value.libre_cli){
			color = 'rgb(17 24 39)';
			if(current_user.value.probPaie_cli){
				color = 'rgb(17, 24, 39)';
			}
		} else {
			if(current_user.value.probPaie_cli){
				color = 'rgb(249, 115, 22)';
			}
		}

		let anc_adh = false;
		let a = moment(current_user.value.insc_cli).add(current_user.value.duree_cli, 'M');
		let b = moment();
		if (!b.isBefore(a)){
			anc_adh = true;
		} 

		if(current_user.value.prosp_cli || current_user.value.cont_cli || anc_adh){
			color = 'rgb(17, 24, 39)';

			if(!current_user.value.libre_cli){
				color = 'rgb(239,68,68)';
			}

			if(current_user.value.probPaie_cli){
				color = 'rgb(249, 115, 22)';
			}
		}

		return color;
	}

	const isFromAgence = (client) => {
		if(userStore.userLog.agences.includes(client.idAgence_cli)){
			return {name: client.pNoms_cli + ' ' + client.nom_cli, can: true};
		} else {
			let formattedNomCli = client.nom_cli.substring(0, 3) + '*'.repeat(client.nom_cli.length - 3);
			return {name: client.pNoms_cli + ' ' + formattedNomCli, can: false};
		}
	} 

	function debounce(func, delay) {
        let timerId;
        
        return function() {
            const context = this;
            const args = arguments;
            
            clearTimeout(timerId);
            timerId = setTimeout(() => {
                func.apply(context, args);
            }, delay);
        };
    }
	const debouncedFunction = debounce(handleSearchClient, 1000);

	watch(() => route.params.id, () => {
		handleGetClient()
	}, {immediate: true})
	//#endregion
</script>

<template>
	<!-- #region LAYOUT -->
	<div class="h-screen flex-1 p-10 overflow-y-auto pb-24" v-if="current_user">
		<div class="md:flex md:items-start md:justify-between md:space-x- mb-14 mt-2">
			<div class="flex items-center space-x-5">
				<div class="flex-shrink-0">
					<div class="relative">
						<img @error="event => handleImageError(event, current_user.id_cli)" class="h-16 w-16 rounded-full object-cover" :src="imageSource" loading="lazy" />
						<span class="absolute inset-0 rounded-full shadow-inner" aria-hidden="true" />
					</div>
				</div>
				<div class="pt-1.5">
					<h1 class="text-2xl font-bold" :style="`color: ${setColorName()}`">{{ isFromAgence(current_user).name }}</h1>
					<p class="text-sm font-medium text-gray-500">
						<a href="#" class="text-gray-900">{{ current_user.prof_cli }}</a>, de {{ current_user.ville_cli}}, {{ current_user.dateNaiss_cli ? calculateAge(current_user.dateNaiss_cli) + ' ans' : '' }}
					</p>
					<p class="text-xs font-medium mt-1" :style="`color: ${setColorTag()}`">Réf. {{ current_user.ref_cli }} - {{ determineStatus }}</p>
				</div>
			</div>
			<div>
				<div class="mt-3 flex justify-end gap-x-3">
					<button v-if="isFromAgence(current_user).can" @click="openTestPopup = true" type="button"
						class="inline-flex gap-2 items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
						Envoyer un test
						<EnvelopeIcon class="text-gray-600 w-5 h-5"/>
					</button>
					<button v-if="isFromAgence(current_user).can" @click="() => {open = true;}" type="button"
						class="inline-flex gap-2 items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
						Ajouter un choix
						<ArrowPathRoundedSquareIcon class="text-gray-600 w-5 h-5" />
					</button>
				</div>
			</div>
		</div>

		<!-- #region PROFIL -->
			<ProfilPanel :client="current_user.id_cli" @updateImage="updateImageSource"/>
		<!-- #endregion -->		
	</div>
	<!-- #endregion -->
	
	<!-- #region SIDEBAR Matching -->
	<TransitionRoot as="template" :show="open">
		<Dialog class="relative z-50" @close="open = false">
			<TransitionChild as="template" enter="ease-in-out duration-500" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in-out duration-500" leave-from="opacity-100" leave-to="opacity-0">
				<div class="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" />
			</TransitionChild>

			<div class="fixed inset-0 overflow-hidden">
				<div class="absolute inset-0 overflow-hidden">
				<div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
					<TransitionChild as="template" enter="transform transition ease-in-out duration-500 sm:duration-700" enter-from="translate-x-full" enter-to="translate-x-0" leave="transform transition ease-in-out duration-500 sm:duration-700" leave-from="translate-x-0" leave-to="translate-x-full">
						<DialogPanel class="pointer-events-auto w-screen max-w-md">
							<div class="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
								<div class="bg-gray-50 px-4 py-6 sm:px-6 border-b border-gray-900/5">
									<div class="flex items-center justify-between">
										<DialogTitle class="text-base font-semibold leading-6">Outils de Matching</DialogTitle>
										<div class="ml-3 flex h-7 items-center">
											<button type="button" class="relative rounded-md hover:text-rose focus:outline-none focus:ring-2 focus:ring-white" @click="open = false">
												<span class="absolute -inset-2.5" />
												<span class="sr-only">Close panel</span>
												<XMarkIcon class="h-6 w-6" aria-hidden="true" />
											</button>
										</div>
									</div>
									<div class="mt-1">
										<p class="text-sm text-gray-400 font-light">Liste d'options qui permet de réaliser des actions sur les potentiels prétendants du client.</p>
									</div>
								</div>
								<div class="border-b border-gray-200 mt-6">
									<div class="px-6">
										<nav class="-mb-px flex space-x-6">
											<a v-if="tabs && currentTabs" @click="currentTabs = tab.name" v-for="tab in tabs" :key="tab.name" :class="[currentTabs === tab.name ? 'border-rose-500 text-rose-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700', 'whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium']">
												{{ tab.name }}
											</a>
										</nav>
									</div>
								</div>
								<div v-if="currentTabs === 'Matching'">
									<div class="container grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-6 pt-6 pb-4 px-6">
										<div class="sm:col-span-full">
											<label for="age_min_cli" class="block text-sm font-medium leading-6 text-gray-500">Sélectionner une tranche d'âge</label>
											
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
											<label for="taille_min_cli" class="block text-sm font-medium leading-6 text-gray-500">Sélectionner une tranche de taille</label>
											
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

										<div class="sm:col-span-full text-center border-b pb-4 mt-2">
											<button class="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50" @click="seekMatch">
												Valider la sélection
											</button>
										</div>
									</div>
									
									<ul v-if="scoring && !matchLoading" role="list" class="flex-1 divide-y divide-gray-200 overflow-y-auto mt-6">
										<li v-for="score in scoring" :key="score.client.id_cli">
											<div class="group relative flex items-center px-5 py-6">
												<a href="#" class="-m-1 block flex-1 p-1">
													<div class="absolute inset-0 group-hover:bg-gray-50" aria-hidden="true" />
													<div class="relative flex min-w-0 flex-1 items-center">
														<span class="relative inline-block flex-shrink-0">
															<img class="h-10 w-10 rounded-full object-cover" @error="handleImageError" :src="`${uri}/storage/img/cli/${score.client.id_cli}.webp`" alt="" />
														</span>
														<div class="ml-4 truncate">
															<p class="truncate text-sm font-medium text-gray-900">{{ score.client.pNoms_cli }} {{ score.client.nom_cli }}</p>
															<p class="truncate text-sm text-gray-500">{{ score.client.ville_cli }}, {{ calculateAge(score.client.dateNaiss_cli) }} ans </p>
														</div>
													</div>
												</a>
												<Menu as="div" class="relative ml-2 inline-block flex-shrink-0 text-left">
													<MenuButton class="group relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2">
														<span class="absolute -inset-1.5" />
														<span class="sr-only">Open options menu</span>
														<span class="flex h-full w-full items-center justify-center rounded-full">
															<EllipsisVerticalIcon class="h-5 w-5 text-gray-900 group-hover:text-gray-500" aria-hidden="true" />
														</span>
													</MenuButton>
													<transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
														<MenuItems class="absolute right-9 top-0 z-10 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
															<div class="py-1">
																<MenuItem v-slot="{ active }">
																	<a @click="handleAddChoice(score.client)" :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-sm']">Ajouter choix</a>
																</MenuItem>
																<MenuItem v-slot="{ active }">
																	<a @click="handleAddProposition(score.client)" :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-sm']">Ajouter proposition</a>
																</MenuItem>
																<MenuItem v-slot="{ active }">
																	<a @click="goToFicheClient(score.client)" :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-sm']">Voir le profil</a>
																</MenuItem>
															</div>
														</MenuItems>
													</transition>
												</Menu>
											</div>
										</li>
										<li v-if="scoring?.length === 0">
											<p class="text-center text-base text-gray-500 font-normal">Aucun matchs potentiels</p>
										</li>
									</ul>

									<ul v-else-if="matchLoading" role="list" class="divide-y divide-gray-100 mt-6">
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

								<div v-if="currentTabs === 'Recherche'">
									<div class="p-5 mt-5">
										<span class="text-sm font-normal text-gray-500">Chercher manuellement un client.</span>
										<div class="relative flex flex-grow items-stretch focus-within:z-10 mt-2">
											<input @input="debouncedFunction" type="text" name="search_term" v-model="search_term" id="search_term"
												class="block w-full rounded-md border-0 py-2.5 pl-4 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6"
												placeholder="Rechercher un client..." />
												<div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
													<MagnifyingGlassIcon class="h-5 w-5 text-gray-400" aria-hidden="true"/>
												</div>
										</div>
									</div>
								
									<ul v-if="clientListed && !searchLoading" role="list" class="flex-1 divide-y divide-gray-200 overflow-y-auto mt-6 pb-24">
										<li v-for="client in clientListed" :key="client.id_cli">
											<div class="group relative flex items-center px-5 py-6">
												<a href="#" class="-m-1 block flex-1 p-1">
													<div class="absolute inset-0 group-hover:bg-gray-50" aria-hidden="true" />
													<div class="relative flex min-w-0 flex-1 items-center">
														<span class="relative inline-block flex-shrink-0">
															<img class="h-10 w-10 rounded-full object-cover" @error="handleImageError" :src="`${uri}/storage/img/cli/${client.id_cli}.webp`" alt="" />
														</span>
														<div class="ml-4 truncate">
															<p class="truncate text-sm font-medium text-gray-900">{{ client.pNoms_cli }} {{ client.nom_cli }}</p>
															<p class="truncate text-sm text-gray-500">{{ client.ville_cli }}, {{ calculateAge(client.dateNaiss_cli) }} ans </p>
														</div>
													</div>
												</a>
												<Menu as="div" class="relative ml-2 inline-block flex-shrink-0 text-left">
													<MenuButton class="group relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2">
														<span class="absolute -inset-1.5" />
														<span class="sr-only">Open options menu</span>
														<span class="flex h-full w-full items-center justify-center rounded-full">
															<EllipsisVerticalIcon class="h-5 w-5 text-gray-900 group-hover:text-gray-500" aria-hidden="true" />
														</span>
													</MenuButton>
													<transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
														<MenuItems class="absolute right-9 top-0 z-10 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
															<div class="py-1">
																<MenuItem v-slot="{ active }">
																	<a @click="handleAddChoice(client)" :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-sm']">Ajouter choix</a>
																</MenuItem>
																<MenuItem v-slot="{ active }">
																	<a @click="handleAddProposition(client)" :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-sm']">Ajouter proposition</a>
																</MenuItem>
																<MenuItem v-slot="{ active }">
																	<a @click="goToFicheClient(client)" :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-sm']">Voir le profil</a>
																</MenuItem>
															</div>
														</MenuItems>
													</transition>
												</Menu>
											</div>
										</li>
										<li v-if="clientListed.length === 0">
											<p class="text-center text-base text-gray-500 font-normal">Aucun client correspond à votre</p>
										</li>
									</ul>
									<ul v-else-if="searchLoading" role="list" class="divide-y divide-gray-100 mt-6">
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
							</div>
						</DialogPanel>
					</TransitionChild>
				</div>
				</div>
			</div>
		</Dialog>
	</TransitionRoot>
	<!-- #endregion -->

	<!-- #region POPUP Test -->
	<TransitionRoot :show="openTestPopup" as="template" appear>
		<Dialog as="div" class="relative z-50" @close="openTestPopup = false">
			<TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
				<div class="fixed inset-0 bg-black backdrop-blur-sm bg-opacity-50 transition-opacity" />
			</TransitionChild>

			<div class="fixed inset-0 z-10 w-screen overflow-y-auto p-4 sm:p-6 md:p-20">
				<TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="ease-in duration-200" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
					<DialogPanel class="mx-auto max-w-xl transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition-all">
						<div class="px-12 py-8">
							<div class="mx-auto max-w-2xl text-center">
								<h2 class="text-4xl font-bold tracking-tight text-rose">Aperçu portrait</h2>
								<p class="mt-6 text-sm leading-6">Envoyer la fiche portrait du client sélectioné à un email personalisé.</p>
							</div>

							<div class="mt-4">
								<label for="type_portrait" class="block text-sm leading-6 text-gray-800">Type de portrait</label>
								<select v-model="typePortrait" id="type_portrait" name="type_portrait" class="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
									<option value="court" selected>Court</option>
									<option value="complet">Complet</option>
								</select>
							</div>

							<div class="relative mt-2 rounded-md shadow-sm">
								<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
									<EnvelopeIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
								</div>
								<input v-model="mail_test" type="email" name="email" id="email" class="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" placeholder="you@example.com" />
							</div>

							<div class="mt-5 flex items-center justify-center gap-x-2">
								<a @click="openTestPopup = false" class="inline-flex gap-2 items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Annuler</a>
								<a @click="generateBase64 = {state: true, email: mail_test}" :class="sending ? 'active opacity-75 pointer-events-none' : false" class="group inline-flex gap-2 items-center justify-center rounded-md bg-rose px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-600">
									Envoyer 
									<span class="group-[.active]:hidden" aria-hidden="true">→</span>
									<span class="group-[.active]:block hidden" aria-hidden="true">
										<svg class="animate-spin ml-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
											<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
											<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
										</svg>
									</span>
								</a>
							</div> 
						</div>
					</DialogPanel>
				</TransitionChild>
			</div>
		</Dialog>
	</TransitionRoot>
	<!-- #endregion -->

	<Toast :state="stateToast" title="Portrait client envoyé avec succès"/>
	<Toast :state="stateToastPropo" title="Proposition envoyé avec succès"/>
	<Toast :state="stateToastChoix" title="Choix envoyé avec succès"/>

	<!-- #region PORTRAIT PATIENT -->
	<PortraitClient v-if="current_user" :type="typePortrait" :client="current_user.id_cli" :isOpen="isModalOpened" :generate="generateBase64" @base64generated="handleMail" @modal-close="isModalOpened = false"/>
	<!-- #endregion -->
</template>

<style>
	.tiptap.ProseMirror:focus-visible {
		outline: none;
	}
</style>