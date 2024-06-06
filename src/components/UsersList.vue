<script setup>
	import { ref } from 'vue';

	import { ChevronRightIcon } from '@heroicons/vue/20/solid'
	import { useClientsStore } from '../stores/clients';

	const uri = import.meta.env.VITE_URL;
	const fallbackImage = `${uri}/storage/img/cli/vide.webp`;
	const clientsStore = useClientsStore();
	const people = ref(null);

	const fetchNewClients = () => {
		clientsStore.getLastClients()
		.then(res => 
		{
			console.log(res)
			people.value = res.clients
		})
		.catch(err => console.error(err))
	}
	fetchNewClients()

	function handleImageError(event) {
        event.target.src = fallbackImage;
	}

	function calculateAge(dateString) {
		let today = new Date();
		let birthDate = new Date(dateString);
		let age = today.getFullYear() - birthDate.getFullYear();
		let monthDifference = today.getMonth() - birthDate.getMonth();
		if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
			age--;
		}
		return age;
}
</script>

<template>

	<div class="user_part p-10 flex-1">
		<div class="border-b border-gray-200 pb-5">
			<h3 class="text-base font-semibold leading-6 text-gray-900">Les nouveaux profils</h3>
			<p class="mt-2 max-w-4xl text-sm text-gray-500">Retrouvez les dernières personnes inscrites au sein des
				agences Harmonie.</p>
		</div>

		<ul role="list" class="divide-y divide-gray-100 ">
			<li v-for="person in people" :key="person.email" class="relative flex justify-between gap-x-6 py-5">
				<div class="flex min-w-0 gap-x-4">
					<img class="h-12 w-12 flex-none rounded-full object-cover bg-gray-50"
						@error="handleImageError"
						:src="`${uri}/storage/img/cli/${person.id_cli}.webp`" alt=""
						loading="lazy" />
					<div class="min-w-0 flex-auto">
						<p class="text-sm font-semibold leading-6 text-gray-900">
							<a :href="`clients/fiche/${person.id_cli}`">
								<span class="absolute inset-x-0 -top-px bottom-0" />
								{{ person.pNoms_cli }} {{ person.nom_cli }}
							</a>
						</p>
						<p class="mt-1 flex text-xs leading-5 text-gray-500 line-clamp-1">
							{{ person.prof_cli }} - {{ person.dateNaiss_cli ? calculateAge(person.dateNaiss_cli) + "ans" : '' }}
						</p>
					</div>
				</div>
				<div class="flex shrink-0 items-center gap-x-4">
					<div class="hidden sm:flex sm:flex-col sm:items-end">
						<p class="text-sm leading-6 text-gray-900">{{ person.ville_cli }}</p>
						<p class="mt-1 text-xs leading-5 text-gray-500">
							{{ person.taille_cli }} cm, {{ person.poid_cli }} kg
						</p>
					</div>
					<ChevronRightIcon class="h-5 w-5 flex-none text-gray-400" aria-hidden="true" />
				</div>
			</li>
		</ul>
	</div>
</template>
