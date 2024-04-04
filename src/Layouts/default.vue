<script setup>
	import { ref } from 'vue'
	import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue'
	import { BellAlertIcon, BoltIcon, Bars3Icon, CalendarIcon, ChartPieIcon, DocumentDuplicateIcon, FolderIcon, HomeIcon, UsersIcon, HomeModernIcon, HeartIcon, ChatBubbleLeftRightIcon, AdjustmentsVerticalIcon } from '@heroicons/vue/24/outline'
	import { useRoute } from "vue-router";

	const route = useRoute();
	
	const navigation = [
		{ name: 'Dashboard', href: '/', icon: HomeIcon, current: route.path == '/' },
		{ name: 'Profils', href: '/profils', icon: UsersIcon, current: route.path == '/profils' || route.path.includes('/profil') },
		{ name: 'Factures', href: '#', icon: FolderIcon, current: false },
		{ name: 'Agences', href: '#', icon: HomeModernIcon, current: false },
		{ name: 'Matching', href: '#', icon: HeartIcon, current: false },
		{ name: 'Messages', href: '#', icon: ChatBubbleLeftRightIcon, current: false },
		{ name: 'Rencontres', href: '#', icon: BoltIcon, current: false },
		{ name: 'Leads', href: '#', icon: BellAlertIcon, current: false },
		{ name: 'Réglages', href: '#', icon: AdjustmentsVerticalIcon, current: false },
	];

	const teams = [
		{ id: 8, name: 'Auxerre', href: '#', initial: 'A', current: false },
		{ id: 5, name: 'Colmar', href: '#', initial: 'C', current: false },
		{ id: 3, name: 'Epinal', href: '#', initial: 'E', current: false },
		{ id: 1, name: 'Metz', href: '#', initial: 'M', current: false },
		{ id: 2, name: 'Nancy', href: '#', initial: 'N', current: false },
		{ id: 4, name: 'Reims', href: '#', initial: 'R', current: false },
		{ id: 6, name: 'Troyes', href: '#', initial: 'T', current: false },
		{ id: 7, name: 'Verdun', href: '#', initial: 'V', current: false },
	];

	const sidebarOpen = ref(false);
</script>

<template>
	<div>
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
		<div class="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
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
							<div class="text-xs font-semibold leading-6 text-gray-400">Agences</div>
							<ul role="list" class="-mx-2 mt-2 space-y-1">
								<li v-for="team in teams" :key="team.name">
									<a :href="team.href"
										:class="[team.current ? 'bg-gray-50 text-rose-600' : 'text-gray-700 hover:text-rose-600 hover:bg-gray-50', 'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold']">
										<span
												:class="[team.current ? 'text-rose-600 border-rose-600' : 'text-gray-400 border-gray-200 group-hover:border-rose-600 group-hover:text-rose-600', 'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white']">{{
													team.initial }}</span>
										<span class="truncate">{{ team.name }}</span>
									</a>
								</li>
							</ul>
						</li>
						<li class="mt-auto py-2 text-xs text-slate-500 font-light">
							Proof of Concept
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

		<main class="lg:pl-72">
			<slot />
		</main>
	</div>
</template>

