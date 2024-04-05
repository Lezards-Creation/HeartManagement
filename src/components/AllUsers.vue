<script setup>
import { computed, ref } from "vue"
import { useClientsStore } from '../stores/clients'
import { AdjustmentsHorizontalIcon, BarsArrowUpIcon } from '@heroicons/vue/24/outline'

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
				return (user.pNoms_cli.toLowerCase() + user.nom_cli.toLowerCase()).includes(searchTermLower);
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
				<button type="button"
					class="relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-md px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-00 hover:bg-gray-50">
					<AdjustmentsHorizontalIcon class="-ml-0.5 h-5 w-5 text-gray-400" aria-hidden="true" />
					Filtrer
				</button>
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
    <SelectedClient :client="selectedUser" v-else/>
</template>
