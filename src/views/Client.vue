<script setup>
	import { computed, ref, onMounted, onBeforeMount } from 'vue'
	import { useRoute } from 'vue-router'
	import { PhotoIcon, UserCircleIcon, MagnifyingGlassCircleIcon, ArrowPathRoundedSquareIcon, XMarkIcon } from '@heroicons/vue/24/solid'
	import { useClientsStore } from '../stores/clients'
	import { Switch, SwitchGroup, SwitchLabel, Menu, MenuButton, MenuItem, MenuItems, Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
	import { EllipsisVerticalIcon } from '@heroicons/vue/20/solid'
	const route = useRoute()

	const statuses = {
		'En cours': 'text-green-700 bg-green-50 ring-green-600/20',
		'En retard': 'text-red-600 bg-red-50 ring-gray-500/10',
		Payé: 'text-yellow-800 bg-yellow-50 ring-yellow-600/20',
	}
	const projects = [
		{
			id: 1,
			name: 'Abonnement Octobre 2023',
			href: '#',
			status: 'En cours',
			createdBy: 'Matthieu ANDRE',
			dueDate: '10 novembre 2023',
			dueDateTime: '2023-03-17T00:00Z',
		},
		{
			id: 2,
			name: 'Abonnement Septembre 2023',
			href: '#',
			status: 'En retard',
			createdBy: 'Matthieu ANDRE',
			dueDate: '10 octobre 2023',
			dueDateTime: '2023-05-05T00:00Z',
		},
		{
			id: 3,
			name: 'Abonnement Août 2023',
			href: '#',
			status: 'Payé',
			createdBy: 'Matthieu ANDRE',
			dueDate: '10 septembre 2023',
			dueDateTime: '2023-05-25T00:00Z',
		},
		{
			id: 4,
			name: 'Abonnement Juillet 2023',
			href: '#',
			status: 'Payé',
			createdBy: 'Matthieu ANDRE',
			dueDate: '10 août 2023',
			dueDateTime: '2023-06-07T00:00Z',
		},
		{
			id: 5,
			name: 'Abonnement Juin 2023',
			href: '#',
			status: 'Payé',
			createdBy: 'Matthieu ANDRE',
			dueDate: '10 juillet 2023',
			dueDateTime: '2023-06-10T00:00Z',
		},
	]
	const active_tab = ref('Profil')
	const clients_store = useClientsStore()
	onBeforeMount(() => {
		clients_store.selected_client = parseInt(route.params.id)
	})

	const open = ref(false)
	const team = [
		clients_store.clients[Math.floor(Math.random() * clients_store.clients.length)],
		clients_store.clients[Math.floor(Math.random() * clients_store.clients.length)],
		clients_store.clients[Math.floor(Math.random() * clients_store.clients.length)],
		clients_store.clients[Math.floor(Math.random() * clients_store.clients.length)],
		clients_store.clients[Math.floor(Math.random() * clients_store.clients.length)],
		clients_store.clients[Math.floor(Math.random() * clients_store.clients.length)],
		clients_store.clients[Math.floor(Math.random() * clients_store.clients.length)],
		clients_store.clients[Math.floor(Math.random() * clients_store.clients.length)],
		clients_store.clients[Math.floor(Math.random() * clients_store.clients.length)],
		clients_store.clients[Math.floor(Math.random() * clients_store.clients.length)],
		clients_store.clients[Math.floor(Math.random() * clients_store.clients.length)],
		clients_store.clients[Math.floor(Math.random() * clients_store.clients.length)],
		clients_store.clients[Math.floor(Math.random() * clients_store.clients.length)],
		clients_store.clients[Math.floor(Math.random() * clients_store.clients.length)],
		clients_store.clients[Math.floor(Math.random() * clients_store.clients.length)],
		clients_store.clients[Math.floor(Math.random() * clients_store.clients.length)],
		clients_store.clients[Math.floor(Math.random() * clients_store.clients.length)],
		clients_store.clients[Math.floor(Math.random() * clients_store.clients.length)],
		clients_store.clients[Math.floor(Math.random() * clients_store.clients.length)],
	]
	const tabs = ref([
		{ name: 'Profil', href: '#' },
		{ name: 'Recherche', href: '#' },
		{ name: 'Physique', href: '#' },
		{ name: 'Contrats', href: '#' },
		{ name: 'Annonces', href: '#' },
	])

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
	<div class="page flex">
		<div :class="['h-screen flex-1 p-10 overflow-y-auto', route.path === '/profils' ? 'ml-96' : 'ml-0']"
			v-if="clients_store.current_client">
			<div class="md:flex md:items-center md:justify-between md:space-x- mb-20 mt-2">
				<div class="flex items-start space-x-5">
					<div class="flex-shrink-0">
						<div class="relative">
							<img class="h-16 w-16 rounded-full object-cover"
								:src="`https://heartmanagement.fr/soft/images/cli/${clients_store.current_client.id_cli}.jpg`"
								alt="" loading="lazy" />
							<span class="absolute inset-0 rounded-full shadow-inner" aria-hidden="true" />
						</div>
					</div>
					<div class="pt-1.5">
						<h1 class="text-2xl font-bold text-gray-900">{{ clients_store.current_client.pNoms_cli }} {{
				clients_store.current_client.nom_cli }}</h1>
						<p class="text-sm font-medium text-gray-500">
							<a href="#" class="text-gray-900">{{ clients_store.current_client.prof_cli }}</a>, de {{
				clients_store.current_client.ville_cli }}, {{ clients_store.current_client.dateNaiss_cli ?
				calculateAge(clients_store.current_client.dateNaiss_cli) + ' ans' : '' }}
						</p>
					</div>
				</div>
				<div
					class="mt-6 flex flex-col-reverse justify-stretch space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-x-3 sm:space-y-0 sm:space-x-reverse md:mt-0 md:flex-row md:space-x-3">
					<button @click="open = true" type="button"
						class="inline-flex gap-2 items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
						Lancer un match
						<ArrowPathRoundedSquareIcon class="text-gray-600 w-5 h-5" />
					</button>
					<button type="button"
						class="inline-flex items-center justify-center rounded-md bg-rose-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600">Envoyer
						un message</button>
				</div>
			</div>

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

			<div class="space-y-10 divide-y divide-gray-900/10 mt-10" v-if="active_tab === 'Profil'">
				<div class="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
					<div class="px-4 sm:px-0">
						<h2 class="text-base font-semibold leading-7 text-gray-900">Profil</h2>
						<p class="mt-1 text-sm leading-6 text-gray-600">Information publiques du client, utilisées sur
							sa fiche publique et pouvant être partagées aux autres clients.</p>

					</div>

					<form class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
						<div class="px-4 py-6 sm:p-8">
							<div class="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
								<div class="sm:col-span-4">
									<label for="country"
										class="block text-sm font-medium leading-6 text-gray-900">Sexe</label>
									<div class="mt-2">
										<select v-model="clients_store.current_client.sexe_cli"
											class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:max-w-xs sm:text-sm sm:leading-6">
											<option value="F">Femme</option>
											<option value="H">Homme</option>
										</select>
									</div>
								</div>

								<div class="sm:col-span-3">
									<label for="first-name"
										class="block text-sm font-medium leading-6 text-gray-900">Prénom(s)</label>
									<div class="mt-2">
										<input type="text" v-model="clients_store.current_client.pNoms_cli"
											name="first-name" id="first-name" autocomplete="given-name"
											class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
									</div>
								</div>

								<div class="sm:col-span-3">
									<label for="last-name" class="block text-sm font-medium leading-6 text-gray-900">Nom
										de famille</label>
									<div class="mt-2">
										<input type="text" v-model="clients_store.current_client.nom_cli"
											name="last-name" id="last-name" autocomplete="family-name"
											class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
									</div>
								</div>

								<div class="sm:col-span-4">
									<label for="email" class="block text-sm font-medium leading-6 text-gray-900">Adresse
										email</label>
									<div class="mt-2">
										<input id="email" v-model="clients_store.current_client.mail_cli" name="email"
											type="email" autocomplete="email"
											class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
									</div>
								</div>

								<div class="sm:col-span-2">
									<label for="email"
										class="block text-sm font-medium leading-6 text-gray-900">Naissance</label>
									<div class="mt-2">
										<input id="date" v-model="clients_store.current_client.dateNaiss_cli"
											name="email" type="date"
											class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
									</div>
								</div>

								<div class="col-span-full">
									<label for="street-address"
										class="block text-sm font-medium leading-6 text-gray-900">Adresse</label>
									<div class="mt-2">
										<input type="text" v-model="clients_store.current_client.adr_cli"
											name="street-address" id="street-address" autocomplete="street-address"
											class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
									</div>
								</div>

								<div class="sm:col-span-2 sm:col-start-1">
									<label for="city"
										class="block text-sm font-medium leading-6 text-gray-900">Ville</label>
									<div class="mt-2">
										<input type="text" v-model="clients_store.current_client.ville_cli" name="city"
											id="city" autocomplete="address-level2"
											class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
									</div>
								</div>

								<div class="sm:col-span-2">
									<label for="postal-code"
										class="block text-sm font-medium leading-6 text-gray-900">ZIP / Postal
										code</label>
									<div class="mt-2">
										<input type="text" v-model="clients_store.current_client.cp_cli"
											name="postal-code" id="postal-code" autocomplete="postal-code"
											class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
									</div>
								</div>

								<div class="sm:col-span-2">
									<label for="country"
										class="block text-sm font-medium leading-6 text-gray-900">Pays</label>
									<div class="mt-2">
										<select id="country" name="country" autocomplete="country-name"
											class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:max-w-xs sm:text-sm sm:leading-6">
											<option>France</option>
											<option>Canada</option>
											<option>Mexico</option>
										</select>
									</div>
								</div>

								<div class="sm:col-span-4">
									<label for="website"
										class="block text-sm font-medium leading-6 text-gray-900">Profession</label>
									<div class="mt-2">
										<div
											class="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-rose-600 sm:max-w-md">
											<input v-model="clients_store.current_client.prof_cli" type="text"
												name="website" id="website"
												class="block flex-1 border-0 bg-transparent py-1.5 pl-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
												placeholder="Chef d'entreprise" />
										</div>
									</div>
								</div>

								<div class="sm:col-span-4">
									<label for="website"
										class="block text-sm font-medium leading-6 text-gray-900">Religion</label>
									<div class="mt-2">
										<div
											class="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-rose-600 sm:max-w-md">
											<input v-model="clients_store.current_client.rel_cli" type="text"
												name="website" id="website"
												class="block flex-1 border-0 bg-transparent py-1.5 pl-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
												placeholder="Islam" />
										</div>
									</div>
								</div>

								<div class="col-span-full">
									<label for="about"
										class="block text-sm font-medium leading-6 text-gray-900">Description</label>
									<div class="mt-2">
										<textarea id="about" v-model="clients_store.current_client.desc_cli"
											name="about" rows="3"
											class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
									</div>
									<p class="mt-3 text-sm leading-6 text-gray-600">Décrivez rapidement votre client.
									</p>
								</div>

								<div class="col-span-full">
									<label for="about"
										class="block text-sm font-medium leading-6 text-gray-900">Intérêts</label>
									<div class="mt-2">
										<textarea id="about" v-model="clients_store.current_client.interets_cli"
											name="about" rows="3"
											class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
									</div>
									<p class="mt-3 text-sm leading-6 text-gray-600">Décrivez rapidement les intérets de
										votre client.</p>
								</div>

								<div class="col-span-full">
									<label for="photo"
										class="block text-sm font-medium leading-6 text-gray-900">Photo</label>
									<div class="mt-2 flex items-center gap-x-3">
										<UserCircleIcon class="h-12 w-12 text-gray-300" aria-hidden="true" />
										<button type="button"
											class="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Modifier</button>
									</div>
								</div>
							</div>
						</div>
					</form>
				</div>
			</div>

			<div class="space-y-10 divide-y divide-gray-900/10 mt-10" v-if="active_tab === 'Recherche'">
				<div class="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
					<div class="px-4 sm:px-0">
						<h2 class="text-base font-semibold leading-7 text-gray-900">Critères de recherche</h2>
						<p class="mt-1 text-sm leading-6 text-gray-600">Plus les critères de recherche seront précis,
							plus notre outil de matching dénichera les profils les plus pertinents.</p>
					</div>

					<form class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
						<div class="px-4 py-6 sm:p-8">
							<div class="max-w-2xl space-y-10">
								<fieldset>
									<legend class="text-sm font-semibold leading-6 text-gray-900">Situation</legend>
									<div class="mt-6 space-y-2">
										<div class="relative flex gap-x-3">
											<div class="flex h-6 items-center">
												<input id="comments" name="comments" type="checkbox"
													class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
											</div>
											<div class="text-sm leading-6 inline-flex gap-2">
												<label for="comments"
													class="font-medium text-gray-900">Célibataire</label>
												<span class="text-gray-500">Lorem ipsum dolor sit amet</span>
											</div>
										</div>
										<div class="relative flex gap-x-3">
											<div class="flex h-6 items-center">
												<input id="candidates" name="candidates" type="checkbox"
													class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
											</div>
											<div class="text-sm leading-6 inline-flex gap-2">
												<label for="candidates" class="font-medium text-gray-900">Veuve /
													Veuf</label>
												<span class="text-gray-500">Lorem ipsum dolor sit amet</span>
											</div>
										</div>
										<div class="relative flex gap-x-3">
											<div class="flex h-6 items-center">
												<input id="offers" name="offers" type="checkbox"
													class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
											</div>
											<div class="text-sm leading-6 inline-flex gap-2">
												<label for="offers" class="font-medium text-gray-900">Divorcé.e</label>
												<span class="text-gray-500">Lorem ipsum dolor sit amet</span>
											</div>
										</div>
										<div class="relative flex gap-x-3">
											<div class="flex h-6 items-center">
												<input id="offers" name="offers" type="checkbox"
													class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
											</div>
											<div class="text-sm leading-6 inline-flex gap-2">
												<label for="offers" class="font-medium text-gray-900">Séparé.e</label>
												<span class="text-gray-500">Lorem ipsum dolor sit amet</span>
											</div>
										</div>
									</div>
								</fieldset>

								<fieldset>
									<div class="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
										<div class="sm:col-span-3">
											<label for="last-name"
												class="block text-sm font-medium leading-6 text-gray-900">Age
												minimum</label>
											<div class="mt-2">
												<input type="text"
													v-model="clients_store.current_client.desAge_cli.split('-')[0]"
													name="last-name" id="last-name" autocomplete="family-name"
													class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
											</div>
										</div>

										<div class="sm:col-span-3">
											<label for="last-name"
												class="block text-sm font-medium leading-6 text-gray-900">Age
												maximum</label>
											<div class="mt-2">
												<input type="text"
													v-model="clients_store.current_client.desAge_cli.split('-')[1]"
													name="last-name" id="last-name" autocomplete="family-name"
													class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
											</div>
										</div>
										<div class="sm:col-span-3">
											<label for="country"
												class="block text-sm font-medium leading-6 text-gray-900">Nombre
												d'enfants acceptés</label>
											<div class="mt-2">
												<select id="country" name="country" autocomplete="country-name"
													class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:max-w-xs sm:text-sm sm:leading-6">
													<option>Indéterminé</option>
													<option>Sans</option>
													<option>Pas d'importance</option>
													<option>Avec</option>
													<option>1</option>
													<option>Jusqu'à 2</option>
													<option>Jusqu'à 3</option>
													<option>4 et plus</option>
												</select>
											</div>
										</div>

										<div class="sm:col-span-3">
											<label for="country"
												class="block text-sm font-medium leading-6 text-gray-900">Degré
												d'inscription</label>
											<div class="mt-2">
												<select id="country" name="country" autocomplete="country-name"
													class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:max-w-xs sm:text-sm sm:leading-6">
													<option>Indéterminé</option>
													<option>Pas d'importance</option>
													<option>Primaire</option>
													<option>Secondaire</option>
													<option>Bac à BAC+3</option>
													<option>Bac + 3 et plus</option>
												</select>
											</div>
										</div>

										<div class="col-span-full">
											<label for="about"
												class="block text-sm font-medium leading-6 text-gray-900">Caractère</label>
											<div class="mt-2">
												<textarea id="about"
													v-model="clients_store.current_client.desCaract_cli" name="about"
													rows="3"
													class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
											</div>
										</div>

										<div class="col-span-full">
											<label for="about"
												class="block text-sm font-medium leading-6 text-gray-900">Allure
												physique</label>
											<div class="mt-2">
												<textarea id="about" v-model="clients_store.current_client.desPhy_cli"
													name="about" rows="3"
													class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
											</div>
										</div>
									</div>
								</fieldset>

								<fieldset>
									<legend class="text-sm font-semibold leading-6 text-gray-900">Push Notifications
									</legend>
									<p class="mt-1 text-sm leading-6 text-gray-600">These are delivered via SMS to your
										mobile phone.</p>
									<div class="mt-6 space-y-6">
										<div class="flex items-center gap-x-3">
											<input id="push-everything" name="push-notifications" type="radio"
												class="h-4 w-4 border-gray-300 text-rose-600 focus:ring-rose-600" />
											<label for="push-everything"
												class="block text-sm font-medium leading-6 text-gray-900">Everything</label>
										</div>
										<div class="flex items-center gap-x-3">
											<input id="push-email" name="push-notifications" type="radio"
												class="h-4 w-4 border-gray-300 text-rose-600 focus:ring-rose-600" />
											<label for="push-email"
												class="block text-sm font-medium leading-6 text-gray-900">Same as
												email</label>
										</div>
										<div class="flex items-center gap-x-3">
											<input id="push-nothing" name="push-notifications" type="radio"
												class="h-4 w-4 border-gray-300 text-rose-600 focus:ring-rose-600" />
											<label for="push-nothing"
												class="block text-sm font-medium leading-6 text-gray-900">No push
												notifications</label>
										</div>
									</div>
								</fieldset>
							</div>
						</div>
					</form>
				</div>
			</div>

			<div class="space-y-10 divide-y divide-gray-900/10 mt-10" v-if="active_tab === 'Physique'">
				<div class="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
					<div class="px-4 sm:px-0">
						<h2 class="text-base font-semibold leading-7 text-gray-900">Appréciations</h2>
						<p class="mt-1 text-sm leading-6 text-gray-600">Plus les critères de recherche seront précis,
							plus notre outil de matching dénichera les profils les plus pertinents.</p>
					</div>

					<form class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
						<div class="px-4 py-6 sm:p-8">
							<div class="max-w-2xl space-y-10">
								<fieldset>
									<div class="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
										<div class="sm:col-span-3">
											<label for="first-name"
												class="block text-sm font-medium leading-6 text-gray-900">Taille</label>
											<div class="mt-2 relative">
												<input type="text" v-model="clients_store.current_client.taille_cli"
													name="first-name" id="first-name" autocomplete="given-name"
													class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
												<div
													class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
													<span class="text-gray-500 text-xs" id="price-currency">cm</span>
												</div>
											</div>
										</div>

										<div class="sm:col-span-3">
											<label for="first-name"
												class="block text-sm font-medium leading-6 text-gray-900">Poids</label>
											<div class="mt-2 relative">
												<input type="text" v-model="clients_store.current_client.poid_cli"
													name="first-name" id="first-name" autocomplete="given-name"
													class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
												<div
													class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
													<span class="text-gray-500 text-xs" id="price-currency">kg</span>
												</div>
											</div>
										</div>

										<div class="sm:col-span-3">
											<SwitchGroup as="div" class="flex items-center">
												<Switch v-model="clients_store.current_client.lun_cli"
													:class="[clients_store.current_client.lun_cli ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
													<span aria-hidden="true"
														:class="[clients_store.current_client.lun_cli ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
												</Switch>
												<SwitchLabel as="span" class="ml-3 text-sm">
													<span class="font-medium text-gray-900">Porte des lunettes</span>
												</SwitchLabel>
											</SwitchGroup>
										</div>
										<div class="sm:col-span-3">
											<SwitchGroup as="div" class="flex items-center">
												<Switch v-model="clients_store.current_client.lun_cli"
													:class="[clients_store.current_client.lun_cli ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
													<span aria-hidden="true"
														:class="[clients_store.current_client.lun_cli ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
												</Switch>
												<SwitchLabel as="span" class="ml-3 text-sm">
													<span class="font-medium text-gray-900">Fumeur</span>
												</SwitchLabel>
											</SwitchGroup>
										</div>

										<div class="col-span-full">
											<label for="about"
												class="block text-sm font-medium leading-6 text-gray-900">Forme
												physique</label>
											<div class="mt-2">
												<textarea id="about" name="about" rows="3"
													class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
											</div>
											<p class="mt-3 text-sm leading-6 text-gray-600">Décrivez rapidement votre
												client.</p>
										</div>

										<div class="col-span-full">
											<label for="about"
												class="block text-sm font-medium leading-6 text-gray-900">Remarques</label>
											<div class="mt-2">
												<textarea id="about" name="about" rows="3"
													class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
											</div>
											<p class="mt-3 text-sm leading-6 text-gray-600">Décrivez rapidement votre
												client.</p>
										</div>
									</div>
								</fieldset>

								<fieldset>
									<legend class="text-sm font-semibold leading-6 text-gray-900">Cheveux</legend>
									<div class="mt-6 grid grid-cols-3 space-y-2">
										<div class="flex items-center gap-x-3">
											<input id="push-everything" name="push-notifications" type="radio"
												class="h-4 w-4 border-gray-300 text-rose-600 focus:ring-rose-600" />
											<label for="push-everything"
												class="block text-sm font-medium leading-6 text-gray-900">Indeterminé</label>
										</div>
										<div class="flex items-center gap-x-3">
											<input id="push-email" name="push-notifications" type="radio"
												class="h-4 w-4 border-gray-300 text-rose-600 focus:ring-rose-600" />
											<label for="push-email"
												class="block text-sm font-medium leading-6 text-gray-900">Bruns</label>
										</div>
										<div class="flex items-center gap-x-3">
											<input id="push-nothing" name="push-notifications" type="radio"
												class="h-4 w-4 border-gray-300 text-rose-600 focus:ring-rose-600" />
											<label for="push-nothing"
												class="block text-sm font-medium leading-6 text-gray-900">Blonds</label>
										</div>
										<div class="flex items-center gap-x-3">
											<input id="push-everything" name="push-notifications" type="radio"
												class="h-4 w-4 border-gray-300 text-rose-600 focus:ring-rose-600" />
											<label for="push-everything"
												class="block text-sm font-medium leading-6 text-gray-900">Roux</label>
										</div>
										<div class="flex items-center gap-x-3">
											<input id="push-email" name="push-notifications" type="radio"
												class="h-4 w-4 border-gray-300 text-rose-600 focus:ring-rose-600" />
											<label for="push-email"
												class="block text-sm font-medium leading-6 text-gray-900">Blancs</label>
										</div>
										<div class="flex items-center gap-x-3">
											<input id="push-nothing" name="push-notifications" type="radio"
												class="h-4 w-4 border-gray-300 text-rose-600 focus:ring-rose-600" />
											<label for="push-nothing"
												class="block text-sm font-medium leading-6 text-gray-900">Chauve</label>
										</div>
										<div class="flex items-center gap-x-3">
											<input id="push-nothing" name="push-notifications" type="radio"
												class="h-4 w-4 border-gray-300 text-rose-600 focus:ring-rose-600" />
											<label for="push-nothing"
												class="block text-sm font-medium leading-6 text-gray-900">Noirs</label>
										</div>
										<div class="flex items-center gap-x-3">
											<input id="push-nothing" name="push-notifications" type="radio"
												class="h-4 w-4 border-gray-300 text-rose-600 focus:ring-rose-600" />
											<label for="push-nothing"
												class="block text-sm font-medium leading-6 text-gray-900">Châtains
												clairs</label>
										</div>
										<div class="flex items-center gap-x-3">
											<input id="push-nothing" name="push-notifications" type="radio"
												class="h-4 w-4 border-gray-300 text-rose-600 focus:ring-rose-600" />
											<label for="push-nothing"
												class="block text-sm font-medium leading-6 text-gray-900">Gris</label>
										</div>
										<div class="flex items-center gap-x-3">
											<input id="push-nothing" name="push-notifications" type="radio"
												class="h-4 w-4 border-gray-300 text-rose-600 focus:ring-rose-600" />
											<label for="push-nothing"
												class="block text-sm font-medium leading-6 text-gray-900">Poivre et
												sel</label>
										</div>
										<div class="flex items-center gap-x-3">
											<input id="push-nothing" name="push-notifications" type="radio"
												class="h-4 w-4 border-gray-300 text-rose-600 focus:ring-rose-600" />
											<label for="push-nothing"
												class="block text-sm font-medium leading-6 text-gray-900">Autre</label>
										</div>
									</div>
								</fieldset>
							</div>
						</div>
					</form>
				</div>
			</div>

			<div class="space-y-10 divide-y" v-if="active_tab === 'Contrats'">
				<ul role="list" class="divide-y divide-gray-100">
					<li v-for="project in projects" :key="project.id"
						class="flex items-center justify-between gap-x-6 py-5">
						<div class="min-w-0">
							<div class="flex items-start gap-x-3">
								<p class="text-sm font-semibold leading-6 text-gray-900">{{ project.name }}</p>
								<p
									:class="[statuses[project.status], 'rounded-md whitespace-nowrap mt-0.5 px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset']">
									{{ project.status }}
								</p>
							</div>
							<div class="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500">
								<p class="whitespace-nowrap">
									A payer avant <time :datetime="project.dueDateTime">{{ project.dueDate }}</time>
								</p>
								<svg viewBox="0 0 2 2" class="h-0.5 w-0.5 fill-current">
									<circle cx="1" cy="1" r="1" />
								</svg>
								<p class="truncate">Facturé par {{ project.createdBy }}</p>
							</div>
						</div>
						<div class="flex flex-none items-center gap-x-4">
							<a :href="project.href"
								class="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:block">Facture
								PDF<span class="sr-only">, {{ project.name }}</span></a>
							<Menu as="div" class="relative flex-none">
								<MenuButton class="-m-2.5 block p-2.5 text-gray-500 hover:text-gray-900">
									<span class="sr-only">Open options</span>
									<EllipsisVerticalIcon class="h-5 w-5" aria-hidden="true" />
								</MenuButton>
								<transition enter-active-class="transition ease-out duration-100"
									enter-from-class="transform opacity-0 scale-95"
									enter-to-class="transform opacity-100 scale-100"
									leave-active-class="transition ease-in duration-75"
									leave-from-class="transform opacity-100 scale-100"
									leave-to-class="transform opacity-0 scale-95">
									<MenuItems
										class="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
										<MenuItem v-slot="{ active }">
										<a href="#"
											:class="[active ? 'bg-gray-50' : '', 'block px-3 py-1 text-sm leading-6 text-gray-900']">Modifier<span
												class="sr-only">, {{ project.name }}</span></a>
										</MenuItem>
										<MenuItem v-slot="{ active }">
										<a href="#"
											:class="[active ? 'bg-gray-50' : '', 'block px-3 py-1 text-sm leading-6 text-gray-900']">Déplacer<span
												class="sr-only">, {{ project.name }}</span></a>
										</MenuItem>
										<MenuItem v-slot="{ active }">
										<a href="#"
											:class="[active ? 'bg-gray-50' : '', 'block px-3 py-1 text-sm leading-6 text-gray-900']">Supprimer<span
												class="sr-only">, {{ project.name }}</span></a>
										</MenuItem>
									</MenuItems>
								</transition>
							</Menu>
						</div>
					</li>
				</ul>
			</div>
		</div>

		<TransitionRoot as="template" :show="open">
			<Dialog as="div" class="relative z-50" @close="open = false">
				<TransitionChild as="template" enter="ease-in-out duration-500" enter-from="opacity-0"
					enter-to="opacity-100" leave="ease-in-out duration-500" leave-from="opacity-100"
					leave-to="opacity-0">
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
											<p class="text-sm text-gray-500">Molestie vel erat ultricies, euismod
												egestas risus. Pellentesque tincidunt magna non elit euismod hendrerit.
												Donec a dui vel libero aliquet vestibulum. Nam eget sollicitudin magna.
											</p>
										</div>

										<ul role="list" class="flex-1 divide-y divide-gray-200 overflow-y-auto">
											<li v-for="person in team" :key="person.handle">
												<div class="group relative flex items-center px-5 py-6">
													<a :href="`profil/${person.id_cli}`" class="-m-1 block flex-1 p-1">
														<div class="absolute inset-0 group-hover:bg-gray-50"
															aria-hidden="true" />
														<div class="relative flex min-w-0 flex-1 items-center">
															<span class="relative inline-block flex-shrink-0">
																<img class="h-12 w-12 flex-none rounded-full object-cover bg-gray-50"
																	:src="`https://heartmanagement.fr/soft/images/cli/${person.id_cli}.jpg`"
																	alt="" loading="lazy" />
																<span
																	:class="[person.status === 'online' ? 'bg-green-400' : 'bg-gray-300', 'absolute top-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white']"
																	aria-hidden="true" />
															</span>
															<div class="ml-4 truncate">
																<p class="truncate text-sm font-medium text-gray-900">
																	<a :href="person.href">
																		<span
																			class="absolute inset-x-0 -top-px bottom-0" />
																		{{ person.pNoms_cli }}
																		{{ person.nom_cli }}
																	</a>
																</p>
																<p class="truncate text-sm text-gray-500">
																	{{ person.dateNaiss_cli ?
				calculateAge(person.dateNaiss_cli) + ' ans' : '' }}
																</p>
															</div>
														</div>
														<div class="">Ajouter à la liste</div>
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
	</div>
</template>
