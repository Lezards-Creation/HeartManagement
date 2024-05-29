<script setup>
	import { computed, ref, watch } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
	import { ArrowPathRoundedSquareIcon, XMarkIcon, EllipsisVerticalIcon } from '@heroicons/vue/24/solid'
	import { UserPlusIcon, EnvelopeIcon} from '@heroicons/vue/24/outline'
	import { useClientsStore } from '../stores/clients'
	import { useChoixStore } from '../stores/choix'
	import { useUserStore } from '../stores/user'
	import { usePropositionsStore } from '../stores/propositions'
	import { Combobox, ComboboxInput, ComboboxOptions, ComboboxOption, Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot, Menu, MenuButton, MenuItem, MenuItems, } from '@headlessui/vue'
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
	const popupType = ref('choix');
	const current_user = ref(null);
	
	const imageSource = ref(null);

	const isModalOpened = ref(false);
    const generateBase64 = ref(false);
	const mail_test = ref(null);

	const scoring = ref(null); 

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

	const handleGetClient = () => {
		clientsStore.getClient(route.params.id)
		.then(res => {
			current_user.value = res.client
			imageSource.value = `${uri}/storage/img/cli/${current_user.value.id_cli}.webp?` + new Date().getTime()
		})
	}

    const handleMail = (e) => {
        let data = {
			subject: e.subject,
            base64: e.file,
            filename: `${current_user.value.sexe_cli === 'H' ? 'Mr ' + current_user.value.nom_cli : 'Mme ' + current_user.value.nom_cli}`
        }

        clientsStore.sendMail(e.email, data)
        .then(res => {
			openTestPopup.value = false;
        })
        .catch(err => console.error(err))
    }

	const seekMatch = () => {
		clientsStore.getMatch(current_user.value.id_cli)
		.then((res) => {
			scoring.value = res.scoring
		})
		.catch(err => {
			console.error(err)
		})
	}

	watch(() => route.params.id, handleGetClient, {immediate: true})
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
					<h1 class="text-2xl font-bold text-gray-900">{{ current_user.pNoms_cli }} {{ current_user.nom_cli }}</h1>
					<p class="text-sm font-medium text-gray-500">
						<a href="#" class="text-gray-900">{{ current_user.prof_cli }}</a>, de {{ current_user.ville_cli}}, {{ current_user.dateNaiss_cli ? calculateAge(current_user.dateNaiss_cli) + ' ans' : '' }}
					</p>
					<p class="text-xs font-medium text-gray-500 mt-1">Réf. {{ current_user.ref_cli }} - {{ determineStatus }}</p>
				</div>
			</div>
			<div>
				<div class="mt-3 flex justify-end gap-x-3">
					<button @click="openTestPopup = true" type="button"
						class="inline-flex gap-2 items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
						Envoyer un test
						<EnvelopeIcon class="text-gray-600 w-5 h-5"/>
					</button>
					<button @click="() => {open = true; seekMatch()}" type="button"
						class="inline-flex gap-2 items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
						Lancer un match
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
							<ul role="list" class="flex-1 divide-y divide-gray-200 overflow-y-auto mt-6">
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