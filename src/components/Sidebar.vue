<script setup>
	import { ref } from 'vue';
	import { version } from "../../package.json"
	import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue'
	import { BellAlertIcon, BoltIcon, Bars3Icon, CalendarIcon, ChartPieIcon, DocumentDuplicateIcon, FolderIcon, HomeIcon, UsersIcon, HomeModernIcon, HeartIcon, ChatBubbleLeftRightIcon, AdjustmentsVerticalIcon } from '@heroicons/vue/24/outline'
	import { useRoute } from "vue-router";
	import { useRouter } from 'vue-router'
	import { useAgencesStore } from '../stores/agences';

	const agencesStore = useAgencesStore();
	const route = useRoute();
	const router = useRouter();
	
	const navigation = [
		{ name: 'Dashboard', href: '/', icon: HomeIcon, current: route.path == '/' },
		{ name: 'Clients', href: '/clients', icon: UsersIcon, current: route.path == '/profils' || route.path.includes('/profil') },
		{ name: 'Rencontres', href: '/rencontres', icon: BoltIcon, current: route.path == '/rencontres' },
		{ name: 'Matchings', href: '/matchings', icon: HeartIcon, current: route.path == '/matchings' },
		{ name: 'Messages', href: '/messages', icon: ChatBubbleLeftRightIcon, current: route.path == '/messages' },
		{ name: 'Factures', href: '/factures', icon: FolderIcon, current: route.path == '/factures' },
	];	

	const agences = ref([]);
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

	const sidebarOpen = ref(false);
</script>


<template>
    <TransitionRoot as="template" :show="sidebarOpen">
		<Dialog as="div" class="relative z-50 lg:hidden" @close="sidebarOpen = false">
			<TransitionChild as="template" enter="transition-opacity ease-linear duration-300"
				enter-from="opacity-0" enter-to="opacity-100"
				leave="transition-opacity ease-linear duration-300" leave-from="opacity-100"
				leave-to="opacity-0">
				<div class="fixed inset-0 bg-gray-900/80" />
			</TransitionChild>

			<div class="fixed inset-0 flex">
				<TransitionChild as="template" enter="transition ease-in-out duration-300 transform"
					enter-from="-translate-x-full" enter-to="translate-x-0"
					leave="transition ease-in-out duration-300 transform" leave-from="translate-x-0"
					leave-to="-translate-x-full">
					<DialogPanel class="relative mr-16 flex w-full max-w-xs flex-1">
						<TransitionChild as="template" enter="ease-in-out duration-300"
							enter-from="opacity-0" enter-to="opacity-100" leave="ease-in-out duration-300"
							leave-from="opacity-100" leave-to="opacity-0">
							<div class="absolute left-full top-0 flex w-16 justify-center pt-5">
								<button type="button" class="-m-2.5 p-2.5" @click="sidebarOpen = false">
									<span class="sr-only">Close sidebar</span>
									<XMarkIcon class="h-6 w-6 text-white" aria-hidden="true" />
								</button>
							</div>
						</TransitionChild>
						<!-- Sidebar component, swap this element with another sidebar if you like -->
						<div class="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-2">
							<div class="flex h-16 shrink-0 items-center">
								<img src="../assets/images/logo.png" />
							</div>
							<nav class="flex flex-1 flex-col">
								<ul role="list" class="flex flex-1 flex-col gap-y-7">
									<li>
										<ul role="list" class="-mx-2 space-y-1">
											<li v-for="item in navigation" :key="item.name">
												<a :href="item.href"
													:class="[item.current ? 'bg-gray-50 text-rose-600' : 'text-gray-700 hover:text-rose-600 hover:bg-gray-50', 'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold']">
													<component :is="item.icon"
															:class="[item.current ? 'text-rose-600' : 'text-gray-400 group-hover:text-rose-600', 'h-6 w-6 shrink-0']"
															aria-hidden="true" />
													{{ item.name }}
												</a>
											</li>
										</ul>
									</li>
									<li>
										<div class="text-xs font-semibold leading-6 text-gray-400">Your teams</div>
										<ul role="list" class="-mx-2 mt-2 space-y-1">
											<li v-for="team in teams" :key="team.name">
												<a :href="team.href"
													:class="[team.current ? 'bg-gray-50 text-rose-600' : 'text-gray-700 hover:text-rose-600 hover:bg-gray-50', 'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold']">
													<span
															:class="[team.current ? 'text-rose-600 border-rose-600' : 'text-gray-400 border-gray-200 group-hover:border-rose-600 group-hover:text-rose-600', 'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white']">{{
																team.initial }}</span>
													<span class="truncate">{{ team.name
													}}</span>
												</a>
											</li>
										</ul>
									</li>
								</ul>
							</nav>
						</div>
					</DialogPanel>
				</TransitionChild>
			</div>
		</Dialog>
	</TransitionRoot>

	<!-- Static sidebar for desktop -->
	<div class="hidden lg:flex lg:flex-col h-full">
		<!-- Sidebar component, swap this element with another sidebar if you like -->
		<div class="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
			<div class="flex h-16 shrink-0 items-center">
				<img src="../assets/images/logo.png" class="h-12" />
			</div>
			<nav class="flex flex-1 flex-col">
				<ul role="list" class="flex flex-1 flex-col gap-y-7">
					<li>
						<ul role="list" class="-mx-2 space-y-1">
							<li v-for="item in navigation" :key="item.name">
								<RouterLink :active-class="'!text-rose-600 group'" class="text-gray-700 hover:text-rose-600 hover:bg-gray-50 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold" :to="{name: item.name}" >
									<component :is="item.icon" class="text-gray-400 group-hover:text-rose-600 h-6 w-6 shrink-0 group-[.router-link-exact-active]:text-rose-600" aria-hidden="true" /> 
									{{ item.name }}
								</RouterLink>
							</li>
						</ul>
					</li>
					<li>
						<div class="text-xs font-semibold leading-6 text-gray-400">Agences</div>
						<ul role="list" class="-mx-2 mt-2 space-y-1">
							<li v-for="agence in agences" :key="agence.id">
								<router-link :to="{name: 'Agence', params: {id: agence.id}}" :active-class="'!text-rose-600'" class="'text-gray-700 hover:text-rose-600 hover:bg-gray-50 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold">
									<span class="text-gray-400 border-gray-200 group-hover:border-rose-600 group-hover:text-rose-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white group-[.router-link-exact-active]:text-rose-600 group-[.router-link-exact-active]:border-rose-600">{{ agence.initial }}</span>
									<span class="truncate">{{ agence.name }}</span>
								</router-link>
							</li>
						</ul>
					</li>
					<li class="mt-auto py-2 text-xs text-slate-500 font-light">
						Heart Management v.{{ version }}
						<br />© Lézards Création 2023
					</li>
				</ul>
			</nav>
		</div>
	</div>

	<div class="sticky top-0 z-40 flex items-center gap-x-6 bg-white px-4 py-4 shadow-sm sm:px-6 lg:hidden">
		<button type="button" class="-m-2.5 p-2.5 text-gray-700 lg:hidden" @click="sidebarOpen = true">
			<span class="sr-only">Open sidebar</span>
			<Bars3Icon class="h-6 w-6" aria-hidden="true" />
		</button>
		<div class="flex-1 text-sm font-semibold leading-6 text-gray-900">Dashboard</div>
		<a href="#">
			<span class="sr-only">Your profile</span>
			<img class="h-8 w-8 rounded-full bg-gray-50"
				src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
				alt="" />
		</a>
	</div>
</template>

