<script setup>
	import { computed, ref } from "vue"
	import { useAgencesStore } from '../stores/agences';
	import { useRoute, useRouter } from "vue-router";
	import moment from "moment";

	const agencesStore = useAgencesStore();
	const agences = ref([]);

	const route = useRoute();
	const router = useRouter();

	const uri = import.meta.env.VITE_URL;
	const ListLoaded = ref(false);

	const fetchAgences = () => {
		ListLoaded.value = false;
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

				ListLoaded.value = true;
			}
		})
		.catch(err => {
			console.error(err)
		})
	}
	fetchAgences();
</script>

<template>
	<div class="h-screen border-r border-r-gray-100 flex-[0]">
		<!-- #region LISTES CLIENTS -->
		<nav class="h-screen overflow-y-auto 2xl:w-96 bg-white/80 backdrop-blur-sm relative pb-[100%]" aria-label="Directory">
			<div v-if="ListLoaded" class="relative">
				<ul role="list" class="divide-y divide-gray-100 mt-4">
					<li v-for="agence in agences" :key="agence.id">
						<router-link :to="{ name: 'Agence', params: { id: agence.id }}" :active-class="'!text-rose-600'" class="'text-gray-700 hover:text-rose-600 hover:bg-gray-50 group flex gap-x-3 rounded-md p-2 text-xs leading-6 font-medium items-center">
							<span class="text-gray-400 border-gray-200 group-hover:border-rose-600 group-hover:text-rose-600 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-lg font-medium bg-white group-[.router-link-exact-active]:text-rose-600 group-[.router-link-exact-active]:border-rose-600">{{ agence.initial }}</span>
							<span class="text-sm font-medium  text-gray-900">{{ agence.name }}</span>
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
