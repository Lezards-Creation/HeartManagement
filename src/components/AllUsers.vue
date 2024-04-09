<script setup>
import { computed, ref } from "vue"
import { useClientsStore } from '../stores/clients'
import { AdjustmentsHorizontalIcon, BarsArrowUpIcon, MagnifyingGlassIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'


const uri = import.meta.env.VITE_URL;
const clientsStore = useClientsStore()

const search_term = ref(null);

const clients = ref({});
const clients_count = ref(0);
const selectedUser = ref(null);

const filtered_clients = computed(() => {
	if (!search_term.value || search_term.value.length < 3) {
		return clients.value;
	} else {
		const searchTermLower = search_term.value.toLowerCase();
		const filteredDirectory = Object.keys(clients.value).reduce((acc, initialLetter) => {
			const filteredUsers = clients.value[initialLetter].filter(user => {
				return (user.pNoms_cli.toLowerCase() + user.nom_cli.toLowerCase()).includes(searchTermLower) || user.ref_cli.toLowerCase().includes(searchTermLower);
			});

			if (filteredUsers.length) {
				acc[initialLetter] = filteredUsers;
			}

			return acc;
		}, {});
		return filteredDirectory;
	}
})

const fetchClients = () => {
	clientsStore.getClients()
		.then((res) => {
			console.log(res)
			clients.value = res.directory;
			clients_count.value = res.clients_count;
		})
		.catch(err => {
			console.error(err)
		})
}
fetchClients();

const handleClick = (id) => {
	selectedUser.value = id;
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
	<!-- Filters -->
	<div class="h-screen border-r border-r-gray-100">
		<div class="search flex justify-between items-center p-4 w-full">
			<div class="flex rounded-md shadow-sm w-full">
				<div class="relative flex flex-grow items-stretch focus-within:z-10">
					<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
						<UsersIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
					</div>
					<input type="text" name="text" v-model="search_term" id="search_term"
						class="block w-full rounded-none rounded-l-md border-0 py-2.5 pl-4 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6"
						:placeholder="`Rechercher dans ${clients_count} clients`" />
				</div>

				<Popover class="relative">
					<PopoverButton
						class="h-full -ml-px inline-flex items-center gap-x-1.5 rounded-r-md px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-200 hover:bg-gray-50 focus:ring-inset focus:ring-rose-600">
						<AdjustmentsHorizontalIcon class="-ml-0.5 h-5 w-5 text-gray-400" aria-hidden="true" />
						Filtrer
					</PopoverButton>

					<PopoverPanel class="absolute left-1/2 z-10 mt-5 flex w-screen max-w-max -translate-x-1/2 px-4">
						<div
							class="w-screen max-w-md flex-auto overflow-hidden rounded-3xl bg-white text-sm leading-6 shadow-lg ring-1 ring-gray-900/5">
							<div class="p-4 py-6">
								<div class="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-6">
									<div class="sm:col-span-3">
										<label for="country"
											class="block text-sm font-medium leading-6 text-gray-900">Sexe</label>
										<div class="mt-2">
											<select id="country" name="country" autocomplete="country-name"
												class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:max-w-xs sm:text-sm sm:leading-6">
												<option value="">Homme / Femme</option>
												<option value="H">Homme</option>
												<option value="F">Femme</option>
											</select>
										</div>
									</div>


									<div class="sm:col-span-3">
										<label for="first-name"
											class="block text-sm font-medium leading-6 text-gray-900">Ville</label>
										<div class="mt-2">
											<input type="text" name="first-name" id="first-name"
												autocomplete="given-name"
												class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6">
										</div>
									</div>

									<div class="sm:col-span-3">
										<label for="last-name"
											class="block text-sm font-medium leading-6 text-gray-900">Département</label>
										<div class="mt-2">
											<input type="text" name="last-name" id="last-name"
												autocomplete="family-name"
												class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6">
										</div>
									</div>

									<div class="sm:col-span-3">
										<label for="last-name"
											class="block text-sm font-medium leading-6 text-gray-900">Téléphone</label>
										<div class="mt-2">
											<input type="text" name="last-name" id="last-name"
												autocomplete="family-name"
												class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6">
										</div>
									</div>

									<div class="sm:col-span-3">
										<label for="country"
											class="block text-sm font-medium leading-6 text-gray-900">Libre</label>
										<div class="mt-2">
											<select id="country" name="country" autocomplete="country-name"
												class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:max-w-xs sm:text-sm sm:leading-6">
												<option value="">Sans importance</option>
												<option value="O">Oui</option>
												<option value="N">Non</option>
											</select>
										</div>
									</div>

									<div class="sm:col-span-3">
										<label for="country"
											class="block text-sm font-medium leading-6 text-gray-900">Problème de paiement</label>
										<div class="mt-2">
											<select id="country" name="country" autocomplete="country-name"
												class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:max-w-xs sm:text-sm sm:leading-6">
												<option value="">Sans importance</option>
												<option value="O">Oui</option>
												<option value="N">Non</option>
											</select>
										</div>
									</div>

									<div class="sm:col-span-3">
										<label for="country"
											class="block text-sm font-medium leading-6 text-gray-900">Type</label>
										<div class="mt-2">
											<select id="country" name="country" autocomplete="country-name"
												class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:max-w-xs sm:text-sm sm:leading-6">
												<option value="adh">Adhérents</option>
												<option value="prosp">Prospects</option>
												<option value="cont">Contacts</option>
												<option value="anc">Anciens adhérents</option>
												<option value="sup">Fiches archivées</option>
												<option value="ln">Liste noir</option>
												<option value="">Tous</option>
											</select>
										</div>
									</div>

									<div class="sm:col-span-3">
										<label for="country"
											class="block text-sm font-medium leading-6 text-gray-900">Situation</label>
										<div class="mt-2">
											<select id="country" name="country" autocomplete="country-name"
												class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:max-w-xs sm:text-sm sm:leading-6">
												<option value="0">Indétérminé</option>
												<option value="prosp">Prospects</option>
												<option value="cont">Contacts</option>
												<option value="anc">Anciens adhérents</option>
												<option value="sup">Fiches archivées</option>
												<option value="ln">Liste noir</option>
												<option value="">Tous</option>
											</select>
										</div>
									</div>

									<div class="col-span-full">
										<label for="street-address"
											class="block text-sm font-medium leading-6 text-gray-900">Street
											address</label>
										<div class="mt-2">
											<input type="text" name="street-address" id="street-address"
												autocomplete="street-address"
												class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6">
										</div>
									</div>

									<div class="sm:col-span-2 sm:col-start-1">
										<label for="city"
											class="block text-sm font-medium leading-6 text-gray-900">City</label>
										<div class="mt-2">
											<input type="text" name="city" id="city" autocomplete="address-level2"
												class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6">
										</div>
									</div>

									<div class="sm:col-span-2">
										<label for="region"
											class="block text-sm font-medium leading-6 text-gray-900">State /
											Province</label>
										<div class="mt-2">
											<input type="text" name="region" id="region" autocomplete="address-level1"
												class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6">
										</div>
									</div>

									<div class="sm:col-span-2">
										<label for="postal-code"
											class="block text-sm font-medium leading-6 text-gray-900">ZIP / Postal
											code</label>
										<div class="mt-2">
											<input type="text" name="postal-code" id="postal-code"
												autocomplete="postal-code"
												class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6">
										</div>
									</div>
								</div>
							</div>

							<div class="grid grid-cols-2 divide-x divide-white/50 bg-rose">
								<a href="#"
									class="flex items-center justify-center gap-x-2.5 p-3 font-semibold text-white hover:bg-rose-400 duration-300">
									<ArrowPathIcon class="h-5 w-auto flex-none text-white" />
									Réinitialiser
								</a>
								<a href="#"
									class="flex items-center justify-center gap-x-2.5 p-3 font-semibold text-white hover:bg-rose-400 duration-300">
									<MagnifyingGlassIcon class="h-5 w-auto flex-none text-white" />
									Rechercher
								</a>
							</div>
						</div>
					</PopoverPanel>
				</Popover>
			</div>
		</div>
		<nav class="h-screen overflow-y-auto w-96  bg-white/80 backdrop-blur-sm relative" aria-label="Directory">
			<div v-for="letter in Object.keys(filtered_clients)" :key="letter" class="relative">
				<div
					class="sticky top-0 z-10 border-y border-b-gray-200 border-t-gray-100 bg-gray-50 px-3 py-1.5 text-sm font-semibold leading-6 text-rose">
					<h3>{{ letter }}</h3>
				</div>
				<ul role="list" class="divide-y divide-gray-100">
					<li v-for="person in filtered_clients[letter]" :key="person.email"
						class="flex gap-x-4 px-3 py-5 hover:bg-rose-50 items-center transition-all pointer"
						@click="handleClick(person.id_cli)">
						<img class="h-12 w-12 flex-none object-cover object-center rounded-full bg-gray-50"
							:src="`${uri}/img/cli/${person.id_cli}.jpg`" loading="lazy" />
						<div class="min-w-0">
							<p class="text-sm font-medium  text-gray-900">{{ person.pNoms_cli }} {{ person.nom_cli }}
							</p>
							<p class="truncate text-xs text-gray-500">{{ person.ville_cli }} - {{ person.dateNaiss_cli ?
						calculateAge(person.dateNaiss_cli) + ' ans' : '' }}</p>
						</div>
					</li>
				</ul>
			</div>
		</nav>
	</div>

	<NewUser v-if="!selectedUser" />
	<SelectedClient :client="selectedUser" v-else />
</template>
