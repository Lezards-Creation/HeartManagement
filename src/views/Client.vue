<script setup>
	import { computed, ref, watch } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
	import { ArrowPathRoundedSquareIcon, XMarkIcon, PlusIcon, ArrowTopRightOnSquareIcon } from '@heroicons/vue/24/solid'
	import { FolderOpenIcon, BoltIcon, UserIcon, UserPlusIcon, EnvelopeIcon} from '@heroicons/vue/24/outline'
	import { useClientsStore } from '../stores/clients'
	import { useChoixStore } from '../stores/choix'
	import { useUserStore } from '../stores/user'
	import { usePropositionsStore } from '../stores/propositions'
	import { Combobox, ComboboxInput, ComboboxOptions, ComboboxOption, Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot, TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/vue'
	import ProfilPanel from '../components/ProfilPanel.vue';
	import RencontrePanel from '../components/RencontresPanel.vue';
	import DocumentsPanel from '../components/DocumentsPanel.vue';
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

	const open = ref(false)
	const openSearch = ref(false);
	const openTestPopup = ref(false);
	const popupType = ref('choix');
	const current_user = ref(null);
	
	const imageSource = ref(null);

	const isModalOpened = ref(false);
    const generateBase64 = ref(false);
	const mail_test = ref(null);

	const team = []

	const query = ref('');
	const recent = ref([]);
	
	const filteredPeople = computed(() =>
		query.value === '' ? [] : clientsStore.clients.filter((person) => {
			return person.nom_cli.toLowerCase().includes(query.value.toLowerCase())
		})
	)

	const determineStatus = computed(() => {
		if(current_user.value.insc_cli){
			let a = moment(current_user.value.insc_cli).add(current_user.value.duree_cli, 'M');
			let b = moment();
			if(b.isBefore(a)){
				return 'Adhérent jusqu\'au ' + moment(a).format('ll')
			} else {
				return 'Ancien adhérent depuis ' + moment(a).format('ll') 
			}
			
		}
	})

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
		openSearch.value = false;
	}

	const handleAddChoice = (activeOption) => {
		let client = current_user.value;
		let choix = activeOption

		let data = {
			idUtil_choix: userStore.userLog.id_util,
			idCli_choix: client.id_cli,
			idCli1_choix: choix.id_cli,
			date_choix: moment().format('YYYY-MM-DD'),
		}
		
		choixStore.addChoice(data)
		.then(res => {
			console.log(res);
			openSearch.value = false;
		})
		.catch(err => console.error(err))
	}

	const handleAddProposition = (activeOption) => {
		let client = current_user.value;
		let prop = activeOption

		let data = {
			idUtil_prop: userStore.userLog.id_util,
			idCli_prop: client.id_cli,
			idCli1_prop: prop.id_cli,
			date_prop: moment().format('YYYY-MM-DD'),
		}
		
		propositionStore.addProposition(data)
		.then(res => {
			console.log(res);
			openSearch.value = false;
		})
		.catch(err => console.error(err))
	}

	function updateImageSource() {
		imageSource.value = `${uri}/storage/img/cli/${current_user.value.id_cli}.webp?` + new Date().getTime();
	}
	
	function handleImageError(event, idCli) {
		event.target.src = fallbackImage;
	}

	const handlePopupChoix = (type) => {
		openSearch.value = true;
		popupType.value = type;
	}

	const handleGetClient = () => {
		clientsStore.getClient(route.params.id)
		.then(res => {
			current_user.value = res.client
			imageSource.value = `${uri}/storage/img/cli/${current_user.value.id_cli}.webp?` + new Date().getTime()
		})
	}

    const handleMail = (e) => {
        let data = {
            base64: e.file,
            filename: `${current_user.value.sexe_cli === 'H' ? 'Mr ' + current_user.value.nom_cli : 'Mme ' + current_user.value.nom_cli}`
        }

        clientsStore.sendPortraitMail(e.email, data)
        .then(res => {
			console.log(res);
			openTestPopup.value = false;
        })
        .catch(err => console.error(err))
    }

	watch(() => route.params.id, handleGetClient, {immediate: true})
</script>

<template>
	<div :class="['h-screen flex-1 p-10 overflow-y-auto']" v-if="current_user">
		<div class="md:flex md:items-start md:justify-between md:space-x- mb-14 mt-2">
			<div class="flex items-center space-x-5">
				<div class="flex-shrink-0">
					<div class="relative">
						<img @error="event => handleImageError(event, current_user.id_cli)" class="h-16 w-16 rounded-full object-cover" :src="imageSource" loading="lazy" />
						<span class="absolute inset-0 rounded-full shadow-inner" aria-hidden="true" />
					</div>
				</div>
				<div class="pt-1.5">
					<h1 class="text-2xl font-bold text-gray-900">{{ current_user.pNoms_cli }} {{ current_user.nom_cli }}</h1>
					<p class="text-sm font-medium text-gray-500">
						<a href="#" class="text-gray-900">{{ current_user.prof_cli }}</a>, de {{ current_user.ville_cli}}, {{ current_user.dateNaiss_cli ? calculateAge(current_user.dateNaiss_cli) + ' ans' : '' }}
					</p>
					<p class="text-xs font-medium text-gray-500 mt-1">Réf. {{ current_user.ref_cli }} - {{ determineStatus }}</p>
				</div>
			</div>
			<div>
				<div class="flex flex-col-reverse justify-stretch space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-x-3 sm:space-y-0 sm:space-x-reverse md:mt-0 md:flex-row md:space-x-3">
					<button @click="handlePopupChoix('proposition')" type="button"
						class="inline-flex gap-2 items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
						Faire une proposition
						<UserPlusIcon class="text-gray-600 w-5 h-5" />
					</button>
					<button @click="handlePopupChoix('choix')" type="button"
						class="inline-flex gap-2 items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
						Choisir
						<UserPlusIcon class="text-gray-600 w-5 h-5" />
					</button>
					
				</div>
				<div class="mt-3 flex justify-end gap-x-3">
					<button @click="openTestPopup = true" type="button"
						class="inline-flex gap-2 items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
						Envoyer un test
						<EnvelopeIcon class="text-gray-600 w-5 h-5"/>
					</button>
					<button @click="open = true" type="button"
						class="inline-flex gap-2 items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
						Lancer un match
						<ArrowPathRoundedSquareIcon class="text-gray-600 w-5 h-5" />
					</button>
				</div>
			</div>
		</div>

		<TabGroup :defaultIndex="0">
			<TabList class="isolate flex divide-x divide-gray-200 rounded-t-lg shadow overflow-hidden outline-none">
				<Tab class="flex-1 relative min-w-0 overflow-hidden" v-slot="{ selected }">
					<button 
						:class="{ 'bg-rose-500 text-white': selected, 'bg-white text-black': !selected }" 
						class="text-gray-500 text-sm font-medium relative w-full py-4 px-4 flex items-center gap-2 justify-center outline-none"
					>
						<UserIcon class="h-5 w-auto"/>
						Profil
					</button>
				</Tab>
				<Tab class="flex-1 relative min-w-0 overflow-hidden outline-none" v-slot="{ selected }">
					<button 
						:class="{ 'bg-rose-500 text-white': selected, 'bg-white text-black': !selected }" 
						class="text-gray-500 text-sm font-medium relative w-full py-4 px-4 flex items-center gap-2 justify-center outline-none"
					>
						<BoltIcon class="h-5 w-auto"/>
						Choix / Rencontres
					</button>
				</Tab>
				<Tab class="flex-1 relative min-w-0 overflow-hidden outline-none" v-slot="{ selected }" >
					<button 
						:class="{ 'bg-rose-500 text-white': selected, 'bg-white text-black': !selected }" 
						class="text-gray-500 text-sm font-medium relative w-full py-4 px-4 flex items-center gap-2 justify-center outline-none"
					>
						<FolderOpenIcon class="h-5 w-auto"/>
						Documents
					</button>
				</Tab>
			</TabList>
			<TabPanels>
				<!-- #region PROFIL -->
					<TabPanel>
						<ProfilPanel :client="current_user.id_cli" @updateImage="updateImageSource"/>
					</TabPanel>
				<!-- #endregion -->
				
				<!-- #region RENCONTRE -->
					<TabPanel>
						<RencontrePanel :client="current_user.id_cli" :name="current_user.sexe_cli === 'H' ? 'Mr ' + current_user.nom_cli : 'Mme ' + current_user.nom_cli" />
					</TabPanel>
				<!-- #endregion -->
				
				<!-- #region DOCUMENTS -->
					<TabPanel>
						<DocumentsPanel :client="current_user.id_cli" />
					</TabPanel>
				<!-- #endregion -->
			</TabPanels>
		</TabGroup>	
	</div>

	<!-- #region POPUP Choix / Proposition -->
	<TransitionRoot :show="openSearch" as="template" @after-leave="query = ''" appear>
		<Dialog as="div" class="relative z-50" @close="openSearch = false">
			<TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
				<div class="fixed inset-0 bg-black backdrop-blur-sm bg-opacity-50 transition-opacity" />
			</TransitionChild>

			<div class="fixed inset-0 z-10 w-screen overflow-y-auto p-4 sm:p-6 md:p-20">
				<TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="ease-in duration-200" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
					<DialogPanel class="mx-auto max-w-3xl transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition-all">
						<Combobox v-slot="{ activeOption }" @update:modelValue="onSelect">
							<div class="relative">
								<MagnifyingGlassIcon class="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-gray-400" aria-hidden="true" />
								<ComboboxInput class="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm" placeholder="Recherche..." @change="query = $event.target.value" />
							</div>

							<ComboboxOptions v-if="query === '' || filteredPeople.length > 0" class="flex transform-gpu divide-x divide-gray-100" as="div" static hold>
								<div :class="['max-h-96 min-w-0 flex-auto scroll-py-4 overflow-y-auto px-6 py-4', activeOption && 'sm:h-96']">
									<h2 v-if="query === ''" class="mb-4 mt-2 text-xs font-semibold text-gray-500">Recherches récentes</h2>
									<div hold class="-mx-2 text-sm text-gray-700">
										<ComboboxOption v-for="person in query === '' ? recent : filteredPeople" :key="person.id" :value="person" as="template" v-slot="{ active }">
												<div :class="['group flex cursor-default select-none items-center rounded-md p-2', active && 'bg-gray-100 text-gray-900']">
													<img :src="`${uri}/storage/img/cli/${person.id_cli}.webp`" alt="" class="h-6 w-6 flex-none rounded-full bg-gray-200 object-cover" />
													<span class="ml-3 flex-auto truncate">{{ person.pNoms_cli }} {{ person.nom_cli }}</span>
													<ChevronRightIcon v-if="active" class="ml-3 h-5 w-5 flex-none text-gray-400" aria-hidden="true" />
												</div>
										</ComboboxOption>
									</div>
								</div>

								<div v-if="activeOption" class="hidden w-1/2 flex-none flex-col divide-y divide-gray-100 overflow-y-auto sm:flex">
										<div class="flex-none p-6 text-center">
											<img :src="`${uri}/storage/img/cli/${activeOption.id_cli}.webp`" loading="lazy" alt="" class="mx-auto h-16 w-16 rounded-full object-cover" />
											<h2 class="mt-3 font-semibold text-gray-900">
													{{ activeOption.pNoms_cli }} {{ activeOption.nom_cli }}
											</h2>
											<p class="text-sm leading-6 text-gray-500">
													{{ activeOption.prof_cli }} - {{ activeOption.dateNaiss_cli ? calculateAge(activeOption.dateNaiss_cli) + " ans" : '' }}
											</p>
										</div>
										<div class="flex flex-auto flex-col justify-between p-6">
											<dl class="grid grid-cols-1 gap-x-6 gap-y-3 text-xs text-gray-700">
												<dt class="col-end-1 font-semibold text-gray-900" v-if="activeOption.telPri_cli">Téléphone</dt>
												<dd v-if="activeOption.telPri_cli">
													{{ activeOption.telPri_cli }}
												</dd>
												<dt class="col-end-1 font-semibold text-gray-900">Ville</dt>
												<dd class="text-xs">
													{{ activeOption.cp_cli }} {{ activeOption.ville_cli }}
												</dd>
												<dt class="col-end-1 font-semibold text-gray-900">Caractéristiques</dt>
												<dd class="text-xs">
													{{ activeOption.taille_cli }} cm, {{  activeOption.poid_cli }} kg
												</dd>
												<dt class="col-end-1 font-semibold text-gray-900">Description</dt>
												<dd class="text-xs">
													{{ activeOption.desc_cli }} 
												</dd>
											</dl>
											<div class="flex gap-x-2 mt-6">
												<button @click="goToFicheClient(activeOption)" type="button" class="w-full inline-flex gap-2 items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
													Voir la fiche
												</button>
												<button v-if="popupType === 'choix'" @click="handleAddChoice(activeOption)" type="button" class=" w-full rounded-md bg-rose-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600">
													Ajouter le choix
												</button>
												<button v-else @click="handleAddProposition(activeOption)" type="button" class=" w-full rounded-md bg-rose-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600">
													Proposer
												</button>
											</div>
										</div>
								</div>
							</ComboboxOptions>

							<div v-if="query !== '' && filteredPeople.length === 0" class="px-6 py-14 text-center text-sm sm:px-14">
								<UsersIcon class="mx-auto h-6 w-6 text-gray-400" aria-hidden="true" />
								<p class="mt-4 font-semibold text-gray-900">Aucun profil trouvé</p>
								<p class="mt-2 text-gray-500">Nous n'avons trouvé personne selon vos critères</p>
							</div>
						</Combobox>
					</DialogPanel>
				</TransitionChild>
			</div>
		</Dialog>
	</TransitionRoot>
	<!-- #endregion -->
	
	<!-- #region POPUP Matching -->
	<TransitionRoot as="template" :show="open">
		<Dialog as="div" class="relative z-50" @close="open = false">
			<TransitionChild as="template" enter="ease-in-out duration-500" enter-from="opacity-0"
				enter-to="opacity-100" leave="ease-in-out duration-500" leave-from="opacity-100" leave-to="opacity-0">
				<div class="fixed inset-0 bg-black backdrop-blur-sm bg-opacity-75 transition-opacity" />
			</TransitionChild>
			<div class="fixed inset-0" />

			<div class="fixed inset-0 overflow-hidden">
				<div class="absolute inset-0 overflow-hidden">
					<div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
						<TransitionChild as="template"
							enter="transform transition ease-in-out duration-500 sm:duration-700"
							enter-from="translate-x-full" enter-to="translate-x-0"
							leave="transform transition ease-in-out duration-500 sm:duration-700"
							leave-from="translate-x-0" leave-to="translate-x-full">
							<DialogPanel class="pointer-events-auto w-screen max-w-xl">
								<div class="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
									<div class="p-6">
										<div class="flex items-start justify-between">
											<DialogTitle class="text-base font-semibold leading-6 text-gray-900">
												Résultat du matching</DialogTitle>
											<div class="ml-3 flex h-7 items-center">
												<button type="button"
													class="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-rose-500"
													@click="open = false">
													<span class="absolute -inset-2.5" />
													<span class="sr-only">Close panel</span>
													<XMarkIcon class="h-6 w-6" aria-hidden="true" />
												</button>
											</div>
										</div>
										<p class="text-sm text-gray-500">Molestie vel erat ultricies, euismod egestas
											risus. Pellentesque tincidunt magna non elit euismod hendrerit. Donec a dui
											vel libero aliquet vestibulum. Nam eget sollicitudin magna.</p>

									</div>

									<ul role="list" class="flex-1 divide-y divide-gray-200 overflow-y-auto">
										<li v-for="person in team" :key="person.handle">
											<div class="group relative flex items-center px-5 py-6 ">
												<a :href="`profil/${person.id_cli}`"
													class="-m-1 block flex-1 p-1 group">
													<div class="absolute inset-0 group-hover:bg-gray-50"
														aria-hidden="true" />
													<div class="relative flex min-w-0 flex-1 items-center">

														<span class="relative inline-block flex-shrink-0">
															<img class="h-12 w-12 flex-none rounded-full object-cover bg-gray-50"
																:src="`${uri}/storage/img/cli/${person.id_cli}.webp`"
																alt="" loading="lazy" />
															<span
																:class="[person.status === 'online' ? 'bg-green-400' : 'bg-gray-300', 'absolute top-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white']"
																aria-hidden="true" />
															<ArrowTopRightOnSquareIcon
																class="opacity-0 text-white transition-all group-hover:opacity-100  group-hover:drop-shadow-lg absolute w-4 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
														</span>
														<div class="ml-4 truncate">
															<p class="truncate text-sm font-medium text-gray-900">
																<a :href="person.href">
																	<span class="absolute inset-x-0 -top-px bottom-0" />
																	{{ person.pNoms_cli }} {{ person.nom_cli }}
																</a>
															</p>
															<p class="truncate text-sm text-gray-500">
																{{ person.dateNaiss_cli ? calculateAge(person.dateNaiss_cli) + " ans" : '' }}
															</p>
														</div>
													</div>
													<div
														class="absolute top-1/2 -translate-y-1/2 right-8 inline-flex items-center justify-center rounded-md bg-rose-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600">
														<PlusIcon class="w-4" />
														<span>Ajouter aux prétendants</span>
													</div>
												</a>
											</div>
										</li>
									</ul>
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

							<div class="relative mt-2 rounded-md shadow-sm">
								<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
									<EnvelopeIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
								</div>
								<input v-model="mail_test" type="email" name="email" id="email" class="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" placeholder="you@example.com" />
							</div>

							<div class="mt-5 flex items-center justify-center gap-x-2">
								<a @click="openTestPopup = false" class="inline-flex gap-2 items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Annuler</a>
								<a @click="generateBase64 = {state: true, email: mail_test}" class="inline-flex gap-2 items-center justify-center rounded-md bg-rose px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-600">Envoyer <span aria-hidden="true">→</span></a>
							</div>
						</div>
					</DialogPanel>
				</TransitionChild>
			</div>
		</Dialog>
	</TransitionRoot>
	<!-- #endregion -->

	<!-- #region PORTRAIT PATIENT -->
	<PortraitClient v-if="current_user" :client="current_user.id_cli" :isOpen="isModalOpened" :generate="generateBase64" @base64generated="handleMail" @modal-close="isModalOpened = false"/>
	<!-- #endregion -->
</template>

<style>
	.tiptap.ProseMirror:focus-visible {
		outline: none;
	}
</style>