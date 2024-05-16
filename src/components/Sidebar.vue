<script setup>
	import { ref, computed } from 'vue';
	import { version } from "../../package.json"
	import { Disclosure, DisclosureButton, DisclosurePanel, Combobox, ComboboxInput, ComboboxOptions, ComboboxOption, Dialog, DialogPanel, Menu, MenuButton, MenuItem, MenuItems, TransitionChild, TransitionRoot } from '@headlessui/vue'
	import { Bars3Icon, BellIcon, HomeIcon, UsersIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
	import { useRoute } from "vue-router";
	import { useRouter } from 'vue-router'
	import { useAgencesStore } from '../stores/agences';
	import { useUserStore } from '../stores/user';
	import { useClientsStore } from "../stores/clients";

	const agencesStore = useAgencesStore();
	const userStore = useUserStore();
	const clientsStore = useClientsStore();

	const route = useRoute();
	const router = useRouter();

	const userNavigation = [
		// { name: 'Mon profil', href: '#' },
		{ name: 'Déconnexion', href: '/connexion' },
	]

	const navigation = [
		{ name: 'Dashboard', href: '/', icon: HomeIcon, current: route.path == '/' },
		{ name: 'Clients', href: '/clients', icon: UsersIcon, current: route.path == '/clients' || route.path.includes('/clients') },
		// { name: 'Rencontres', href: '/rencontres', icon: BoltIcon, current: route.path == '/rencontres' },
		// { name: 'Matchings', href: '/matchings', icon: HeartIcon, current: route.path == '/matchings' },
		// { name: 'Messages', href: '/messages', icon: ChatBubbleLeftRightIcon, current: route.path == '/messages' },
		// { name: 'Factures', href: '/factures', icon: FolderIcon, current: route.path == '/factures' },
	];	

	const agences = ref([]);
	const openSearch = ref(false);
	const query = ref('');
	const recent = ref([]);

	const filteredPeople = computed(() =>
		query.value === '' ? [] : clientsStore.clients.filter((person) => {
			return person.nom_cli.toLowerCase().includes(query.value.toLowerCase())
		})
	)

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
	<div>
		<!-- #region SIDEBAR MOBILE -->
		<TransitionRoot as="template" :show="sidebarOpen">
			<Dialog class="relative z-50 lg:hidden" @close="sidebarOpen = false">
				<TransitionChild as="template" enter="transition-opacity ease-linear duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="transition-opacity ease-linear duration-300" leave-from="opacity-100" leave-to="opacity-0">
					<div class="fixed inset-0 bg-gray-900/80" />
				</TransitionChild>

				<div class="fixed inset-0 flex">
					<TransitionChild as="template" enter="transition ease-in-out duration-300 transform" enter-from="-translate-x-full" enter-to="translate-x-0" leave="transition ease-in-out duration-300 transform" leave-from="translate-x-0" leave-to="-translate-x-full">
						<DialogPanel class="relative mr-16 flex w-full max-w-xs flex-1">
							<TransitionChild as="template" enter="ease-in-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in-out duration-300" leave-from="opacity-100" leave-to="opacity-0">
								<div class="absolute left-full top-0 flex w-16 justify-center pt-5">
									<button type="button" class="-m-2.5 p-2.5" @click="sidebarOpen = false">
										<span class="sr-only">Close sidebar</span>
										<XMarkIcon class="h-6 w-6 text-white" aria-hidden="true" />
									</button>
								</div>
							</TransitionChild>

							<div class="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-2 ring-1 ring-white/10">
								<div class="flex h-16 shrink-0 items-center justify-center pt-4">
									<svg width="161px" height="65px" viewBox="0 0 161 65" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
										<g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
											<g id="Group" transform="translate(-0.000000, 0.000000)" fill-rule="nonzero">
												<path d="M111.661,28.9076262 C109.118,30.4207262 110.104,30.0647262 111.557,29.2192262 C113.01,28.3736262 114.826,27.5726262 111.557,30.5097262 C111.142,30.9547262 112.335,30.1092262 114.203,28.5961262 C117.835,25.6145262 118.458,23.6564262 124.684,24.1459262 C130.911,24.6354262 129.147,23.1224262 131.378,21.4758262 C133.868,19.6957262 134.75,19.2952262 136.203,19.4732262 C136.515,19.5177262 135.736,18.7166262 134.491,17.6931262 C132.519,16.0910262 132.052,15.9130262 130.496,16.1355262 C128.835,16.4025262 128.783,16.3580262 128.524,14.7559262 C128.42,13.8214262 127.798,11.2402262 127.227,9.05966622 C126.604,6.83455622 125.981,3.89740622 125.722,2.60683622 C125.099,-0.374814784 124.996,-0.330312784 123.698,1.53878622 C121.882,4.87645622 122.349,3.22986622 121.831,1.09375622 C121.312,-1.04235378 121.467,0.381723216 120.222,1.71679622 C117.264,4.69844622 116.486,7.54658622 116.279,11.3738262 C116.071,15.2010262 116.901,16.1355262 118.458,18.0936262 L119.547,19.0726262 L117.939,20.5412262 C117.057,21.2978262 115.397,22.9888262 114.93,24.4129262 C114.463,25.8370262 113.736,27.4391262 112.854,28.1511262" id="Path" fill="#E93F80"></path>
												<path d="M144.09,48.6667262 C129.302,54.5410262 112.958,59.1247262 99.4154,61.1718262 C92.3069,62.2399262 78.5049,62.2399262 73.4719,61.1718262 C66.0002,59.6142262 60.5002,57.1221262 56.92,53.7399262 C54.9483,51.8708262 54.9483,51.7818262 55.2077,49.0672262 C55.4671,45.9075262 57.2313,42.3029262 60.0332,38.9652262 C61.953,36.6066262 62.0049,35.7610262 60.2407,34.3815262 C59.203,33.5804262 59.0473,33.6249262 55.3634,35.3160262 C52.4058,36.6511262 51.1086,37.5411262 49.8115,39.1877262 C47.5803,41.9913262 41.7171,47.3316262 41.2501,46.9756262 C41.0945,46.7976262 41.4058,45.9965262 41.9765,45.1955262 C43.585,42.8369262 43.7926,41.5018262 42.5992,40.3448262 L41.5614,39.2767262 L40.4199,40.6118262 C38.2926,43.0594262 33.6227,47.0646262 33.2076,46.7976262 C31.9105,46.1301262 39.5897,38.3422262 42.6511,37.2741262 C43.4813,36.9626262 44.1558,36.4731262 44.1558,36.2060262 C44.1558,35.3160262 42.5992,33.7139262 41.7171,33.7139262 C39.2265,33.7139262 34.3492,37.0961262 31.1322,41.1013262 C29.835,42.7479262 29.368,43.7714262 29.368,45.1510262 C29.368,46.5306262 29.2642,47.0646262 26.9293,47.9546262 C24.1274,48.9782262 22.8821,49.0672262 22.8821,48.2662262 C22.8821,47.0201262 24.4906,42.5254262 25.3208,41.3683262 C27.1369,38.9207262 29.3161,36.8291262 29.9907,36.8291262 C31.3397,36.8291262 35.802,34.9600262 36.0614,34.2924262 C36.3209,33.7584262 36.0614,33.6694262 35.2312,33.9364262 C34.5567,34.1144262 33.3633,34.3370262 32.585,34.4705262 L31.1322,34.6930262 L32.6888,32.1118262 C36.0095,26.4156262 36.0095,23.4784262 32.6888,23.4784262 C29.368,23.4784262 30.4057,23.7899262 29.5756,24.1459262 C28.1746,24.7690262 28.0189,25.0805262 28.0189,26.8606262 C28.0189,28.6407262 27.5001,29.7532262 26.6699,31.1773262 C24.4387,35.1380262 24.3869,35.1825262 19.7689,35.4050262 C13.3868,35.7165262 13.3349,35.6720262 18.0567,30.9548262 C24.6982,24.2349262 28.6935,18.6722262 29.368,15.1120262 C29.6274,13.5989262 29.5237,13.2429262 28.4859,12.6198262 C27.1369,11.8188262 25.9954,11.7743262 23.3491,12.4418262 C20.1321,13.1984262 19.717,13.8659262 19.717,17.8711262 C19.717,23.2114262 17.5897,27.0831262 11.7264,32.6904262 C9.49531,34.8265262 9.08021,35.0045262 6.33021,35.3160262 C1.40095,35.8055262 1.42108547e-14,36.4731262 1.42108547e-14,38.4312262 C1.42108547e-14,40.3893262 1.86793,41.0123262 2.49057,39.8552262 C3.11322,38.6982262 5.18869,38.5202262 5.18869,39.0097262 C5.18869,39.4992262 4.87737,39.6327262 4.46228,39.8997262 C3.32076,40.7453262 1.55661,44.2610262 1.55661,45.7295262 C1.55661,47.1981262 1.86793,47.6431262 2.28303,48.3552262 C3.26888,49.9127262 7.1604,52.9389262 7.9387,52.7164262 C8.3538,52.6274262 8.66512,50.8028262 8.87267,47.4651262 C9.08021,43.6824262 9.39154,41.8578262 10.2217,40.3448262 L11.3114,38.2532262 L14.5802,37.9861262 C16.3963,37.8081262 18.7831,37.5856262 19.9246,37.4076262 L21.9482,37.1851262 L19.6133,39.9887262 C15.2548,45.3735262 15.0991,46.6641262 18.4718,49.7347262 C20.4435,51.5593262 21.2218,51.9598262 22.6227,51.9598262 C24.6982,51.9598262 28.5378,50.4913262 29.8869,49.2452262 C30.3539,48.8002262 31.3397,48.3997262 32.0661,48.3997262 C32.7925,48.3997262 34.0897,47.7321262 35.3869,46.6196262 C37.6699,44.6615262 37.9812,44.5280262 37.5661,45.5070262 C37.0473,46.5751262 38.7595,48.3997262 40.2643,48.3997262 C41.769,48.3997262 45.8681,45.2845262 49.3964,41.1903262 C50.953,39.4102262 52.4058,38.1641262 52.9766,38.1641262 C53.5473,38.1641262 54.2737,38.0306262 54.7407,37.8971262 C55.4671,37.6301262 55.4671,37.8971262 54.4813,39.5437262 C51.42,44.6615262 50.6417,49.0227262 52.1983,52.2269262 C53.4435,54.7635262 59.3068,59.5252262 63.6653,61.4388262 C69.9436,64.2425262 74.1983,64.9990262 83.7974,64.9990262 C95.5757,64.9990262 104.864,63.3524262 120.897,58.3237262 C127.486,56.2766262 149.798,47.2426262 149.331,46.8421262 C149.175,46.7086262 146.84,47.5096262 144.038,48.6222262 L144.09,48.6667262 Z" id="Path" fill="#E93F80"></path>
												<path d="M159.916,17.0701262 C159.258,17.4854262 158.86,17.1294262 158.722,16.0020262 L158.566,14.8449262 C158.566,14.8004262 158.463,14.7559262 158.463,14.8449262 L156.491,16.3135262 C155.349,17.1591262 153.378,18.3606262 152.081,18.9837262 C150.783,19.6067262 149.123,20.4967262 148.345,20.9418262 C147.447,21.4758262 146.684,21.3423262 146.062,20.5412262 C144.142,18.0046262 143,17.7376262 140.25,19.2062262 C138.486,20.1407262 138.486,20.1852262 139.524,20.5857262 C140.717,21.0753262 140.977,21.4758262 142.015,24.8580262 C142.43,26.1930262 143.052,29.0412262 144.816,29.9312262 C147.359,31.1773262 146.892,32.7349262 146.892,36.2060262 C146.892,39.6772262 146.684,40.5227262 146.84,39.9887262 C147.359,37.2296262 148.137,37.3631262 147.982,39.3657262 C147.826,41.3683262 148.864,35.6275262 149.279,30.8658262 C149.59,27.6171262 149.694,27.2611262 150.576,27.4391262 C153.43,28.1066262 158.255,24.8580262 159.552,21.4313262 C161.576,16.1355262 161.265,16.2690262 159.916,17.1146262 L159.916,17.0701262 Z" id="Path" fill="#E93F80"></path>
												<path d="M124.165,28.9522262 C123.231,29.7532262 123.491,32.8684262 124.529,32.8684262 C125.566,32.8684262 125.514,32.1563262 126.293,31.3108262 C127.486,30.0202262 127.642,29.5752262 127.175,29.0857262 C126.397,28.2846262 124.996,28.2401262 124.165,28.9522262 Z" id="Path" fill="#E93F80"></path>
												<path d="M136.826,38.9651262 C137.397,38.0306262 137.448,37.7636262 136.93,37.7636262 C136.411,37.7636262 131.741,42.7033262 132.156,43.0594262 C132.519,43.3709262 135.996,40.3447262 136.826,38.9651262 Z" id="Path" fill-opacity="0" fill="#FFFFFF"></path>
												<path d="M140.354,40.7898262 C136.566,44.3499262 133.038,46.6641262 131.378,46.6641262 C129.717,46.6641262 130.184,45.4180262 132.571,44.2164262 C133.816,43.5934262 135.944,42.0803262 137.241,40.8788262 C139.368,38.9207262 139.628,38.4756262 139.628,36.6511262 C139.628,31.8003262 134.387,33.5804262 128.316,40.4782262 C125.463,43.7714262 121.156,47.2871262 120.481,46.9311262 C119.496,46.3970262 119.807,45.6405262 122.505,41.9023262 C125.359,37.8971262 125.826,35.8055262 124.114,34.4704262 C123.18,33.7139262 123.076,33.8029262 121.415,36.4285262 C118.717,40.7453262 111.246,47.8211262 110.208,46.9756262 C109.897,46.6641262 111.194,44.5725262 114.255,40.5227262 C116.382,37.7191262 116.797,36.8736262 116.59,35.8055262 C116.279,34.5594262 115.5,33.8029262 114.566,33.7584262 C114.359,33.7584262 113.217,34.5149262 111.972,35.4495262 C108.184,38.3866262 108.236,38.3421262 108.236,36.3840262 C108.236,35.4050262 107.821,34.3369262 107.406,33.9364262 C106.68,33.3579262 106.42,33.5359262 104.967,36.0725262 C102.996,39.4547262 98.9484,43.9939262 97.8588,43.9939262 C96.7691,43.9939262 97.1323,43.8604262 97.8588,42.6589262 C98.8446,41.0123262 98.8446,40.0332262 97.8588,39.6772262 C96.6135,39.2767262 95.3682,40.6563262 95.4201,42.4363262 C95.4201,43.7269262 95.1087,44.2609262 93.3446,45.5515262 C89.9719,48.0436262 88.3116,47.5541262 89.5568,44.4834262 C91.0097,40.7898262 95.5238,36.8736262 98.3257,36.8736262 C101.128,36.8736262 99.7786,36.6956262 99.9342,36.4730262 C100.401,35.8500262 97.2361,33.7584262 95.8352,33.7584262 C94.4342,33.7584262 89.8163,36.4730262 87.7408,39.0987262 C84.3681,43.3709262 78.453,48.2661262 78.453,46.7531262 C78.453,45.2400262 79.9577,44.3499262 81.8257,41.8133262 C85.2502,37.0961262 85.6134,36.1615262 84.6795,34.6039262 C83.8493,33.3579262 82.8115,33.5804262 80.321,35.5385262 C79.0757,36.5175262 77.9342,37.3186262 77.7266,37.3186262 C77.5191,37.3186262 77.4153,36.8291262 77.4153,36.2505262 C77.4153,35.1825262 76.2219,33.7584262 75.3398,33.7584262 C74.4577,33.7584262 73.1606,35.0045262 71.137,36.4730262 C68.9577,38.0751262 67.7124,38.7872262 68.0756,38.2086262 C68.7502,37.1406262 68.4388,34.9155262 67.5049,33.8919262 C66.6747,33.0909262 66.0002,33.1799262 66.0002,34.1144262 C66.0002,35.0490262 64.4954,37.0071262 62.6275,39.5882262 C59.0992,44.3944262 58.5803,46.1300262 59.9813,47.8211262 C60.8634,48.8002262 60.552,48.9782262 64.5473,44.4389262 C66.1558,42.6144262 68.6983,40.0777262 70.203,38.8762262 L72.8492,36.6511262 L71.0332,38.8762262 C67.5049,43.2374262 66.6747,45.8630262 68.3351,47.7321262 C69.269,48.7557262 69.1653,48.8447262 70.9294,45.8185262 C72.4341,43.2819262 75.8068,39.8997262 79.2313,37.6301262 L81.3068,36.2060262 L79.3351,38.5201262 C76.637,41.7243262 75.236,44.5725262 75.6511,46.0855262 C76.5332,49.3342262 78.5568,49.2897262 82.6559,45.9075262 L85.7172,43.4154262 L85.7172,45.1955262 C85.7172,48.6667262 89.4531,49.5567262 93.3965,47.0646262 C94.5899,46.3080262 95.5757,45.5070262 95.5757,45.2845262 C95.5757,45.0620262 96.4059,44.8840262 97.3918,44.8840262 C98.9484,44.8840262 99.2078,45.0175262 99.2078,45.9075262 C99.2078,46.7976262 100.713,48.9337262 101.076,48.1771262 C101.646,47.0201262 105.849,42.1693262 108.236,39.9442262 C111.557,36.7846262 112.75,36.2505262 110.675,38.8317262 C107.665,42.5253262 106.783,45.5515262 108.029,47.5986262 C109.014,49.1117262 110.986,48.6222262 114.047,46.1745262 L116.849,43.8604262 L116.849,45.1510262 C116.849,46.8866262 118.198,48.4441262 119.651,48.4441262 C121.104,48.4441262 124.788,46.2190262 125.774,44.8840262 C126.656,43.6379262 126.967,43.7714262 127.071,45.3735262 C127.331,48.7112262 131.066,49.3342262 134.906,46.7086262 C138.071,44.5725262 143.831,39.1432262 143.831,38.3421262 C143.831,37.5411262 142.482,38.8317262 140.406,40.7898262 L140.354,40.7898262 Z M136.93,37.7636262 C137.448,37.7636262 137.397,38.0306262 136.826,38.9652262 C135.996,40.3447262 132.519,43.3709262 132.156,43.0594262 C131.741,42.7034262 136.203,37.7636262 136.93,37.7636262 Z" id="Shape" fill="#E93F80"></path>
												<path d="M91.0097,26.0595262 C89.6607,27.1721262 88.1559,28.0621262 87.6889,28.0176262 C87.0144,28.0176262 87.0663,27.9286262 87.8965,27.4836262 C90.2314,26.2375262 91.788,24.5465262 91.788,23.2114262 C91.788,20.9418262 90.0758,21.4313262 85.7691,25.0360262 C81.722,28.3736262 80.321,28.6852262 81.722,25.8815262 C82.3446,24.5910262 82.5521,24.4574262 83.2786,24.9915262 C84.005,25.4810262 84.2125,25.4365262 84.8352,24.7245262 C85.2503,24.2794262 85.5616,23.3004262 85.5616,22.6329262 C85.5616,21.4758262 85.4059,21.3868262 84.1606,21.6538262 C83.2786,21.7873262 81.255,23.2559262 79.1795,25.1250262 L75.6512,28.2846262 L77.2597,26.0150262 C78.0899,24.7690262 78.8163,23.3894262 78.8163,22.9889262 C78.8163,21.8763262 77.3635,21.6093262 76.1701,22.5438262 C75.1842,23.3004262 75.1323,23.3004262 74.3021,22.2768262 L73.4719,21.2533262 L72.4861,22.8999262 C71.2927,24.9470262 67.5568,28.0621262 66.4153,28.0176262 C65.7927,28.0176262 65.9483,27.7951262 66.8823,27.2611262 C69.4247,25.7925262 70.5144,24.5465262 70.5144,23.1669262 C70.5144,21.7873262 70.3068,21.8318262 69.2691,21.8318262 C68.2313,21.8318262 67.0898,22.7219262 64.8068,24.8135262 C62.6794,26.8161262 61.7455,27.4836262 61.953,26.8161262 C62.2125,26.1485262 62.0049,25.4810262 61.4342,24.9470262 C60.6559,24.1904262 60.6559,24.1014262 61.486,23.7009262 C62.6794,23.1224262 62.0568,21.8318262 60.5521,21.8318262 C59.0474,21.8318262 57.3351,22.8554262 55.986,24.7245262 C54.637,26.6381262 54.7926,28.5072262 56.4011,29.2192262 C57.5426,29.7087262 57.4908,29.7087262 55.7266,30.5543262 C54.1181,31.3108262 53.8068,31.3108262 53.3917,30.7323262 C52.6134,29.7087262 52.8209,26.7271262 53.8068,24.3239262 C54.5332,22.5438262 55.0002,22.0098262 56.3492,21.6538262 C58.6323,20.9863262 59.0474,20.4967262 57.3351,20.4967262 C55.6228,20.4967262 55.9341,20.3632262 56.2455,19.6957262 C57.1275,17.9156262 57.1275,17.2926262 56.2455,16.4915262 C55.7266,16.0020262 55.1558,15.6015262 55.0002,15.6460262 C54.8445,15.6460262 53.1841,17.0701262 51.3681,18.7612262 L48.0992,21.8318262 L44.6228,21.8318262 C42.703,21.8318262 40.8869,21.6093262 40.5756,21.3423262 C39.486,20.4077262 39.3822,21.6983262 40.4718,22.8999262 C41.1983,23.7009262 42.0284,24.0569262 43.17,24.0569262 C44.8303,24.0569262 44.7785,24.0569262 42.0284,25.6590262 C39.7454,26.9941262 39.3822,27.3501262 40.0567,27.7061262 C41.1464,28.1956262 43.4294,27.2166262 46.6464,24.9470262 C47.9436,24.0124262 49.5002,23.1669262 50.1228,22.9889262 C51.2124,22.6774262 51.2124,22.7664262 50.953,25.9705262 C50.7454,28.5517262 50.8492,29.6197262 51.5238,30.7323262 C52.3021,32.1118262 52.3021,32.2898262 51.5238,33.0019262 C50.2785,34.1589262 50.953,35.1825262 52.9766,35.1825262 C55.0002,35.1825262 55.2596,34.6485262 59.0992,31.1773262 C63.3021,27.3056262 63.5096,27.1721262 64.0285,28.1511262 C64.703,29.4862262 66.3634,29.6642262 67.92,28.5962262 C68.7502,28.0310262 69.4611,28.0488262 70.0474,28.6407262 C70.6337,29.2325262 71.1889,29.0990262 71.7078,28.2401262 C72.1229,27.5281262 73.0049,26.5491262 73.5757,26.0595262 L74.7172,25.2140262 L74.1983,26.4600262 C73.7832,27.3056262 73.7832,27.9286262 74.1465,28.5517262 C74.8729,29.7087262 75.8068,29.6197262 77.2597,28.2846262 L78.505,27.1276262 L79.1795,28.2846262 C80.0616,29.6642262 81.722,29.7532262 83.3305,28.4626262 L84.472,27.4836262 L85.4578,28.5072262 C86.8069,29.9312262 88.3635,29.4862262 91.4767,26.7716262 C94.7456,23.9234262 94.3824,23.3894262 91.0097,26.0595262 Z M87.4814,25.8370262 C87.6371,25.3475262 89.4531,23.9679262 89.4531,23.9679262 C89.4531,23.9679262 89.8682,23.6119262 90.1276,23.6119262 C90.3871,23.6119262 89.038,24.8580262 89.038,24.9025262 L88.104,25.7035262 C88.104,25.7035262 87.3776,26.2375262 87.5333,25.7925262 L87.4814,25.8370262 Z M66.2078,25.8370262 C66.3634,25.3475262 68.1795,23.9679262 68.1795,23.9679262 C68.1795,23.9679262 68.5946,23.6119262 68.854,23.6119262 C69.1134,23.6119262 67.7644,24.8580262 67.7644,24.9025262 L66.8304,25.7035262 C66.8304,25.7035262 66.104,26.2375262 66.2596,25.7925262 L66.2078,25.8370262 Z M51.9907,20.9863262 C51.3681,21.4313262 51.42,21.2088262 52.3021,20.1407262 C53.5473,18.5831262 54.2738,18.2271262 53.4436,19.5177262 C53.1841,19.9627262 52.5096,20.6303262 51.9907,20.9863262 Z M54.2738,32.7349262 C52.9766,33.7139262 51.8351,34.1589262 51.8351,33.6694262 C51.8351,33.1799262 55.104,31.6223262 55.4672,31.6223262 C55.6228,31.6223262 55.0521,32.1563262 54.2738,32.7349262 Z M59.0992,26.2820262 C58.4766,26.9941262 57.854,27.6171262 57.7502,27.6171262 C57.387,27.6171262 58.0096,26.7271262 58.9955,25.7035262 C60.2408,24.5019262 60.2926,24.8135262 59.0992,26.2820262 Z" id="Shape" fill="#E93F80"></path>
											</g>
										</g>
									</svg>
								</div>
								<nav class="flex flex-1 flex-col">
									<ul role="list" class="-mx-2 flex-1 space-y-1">
										<li v-for="item in navigation" :key="item.name">
											<router-link :to="{path: item.href}" :active-class="'!text-rose-600 bg-rose-100'" class="text-gray-400 hover:text-rose hover:bg-gray-200/25 group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold">
												<component :is="item.icon" class="h-6 w-6 shrink-0" aria-hidden="true" />
												<span>{{ item.name }}</span>
											</router-link>
										</li>

										<li>
											<div class="text-xs font-semibold leading-6 text-gray-400 mt-12 mb-2">Agences</div>
											<ul role="list" class="flex flex-col space-y-1">
												<li v-for="agence in agences" :key="agence.id">
													<router-link :to="{name: 'Agence', params: {id: agence.id}}" :active-class="'!text-rose-600'" class="'text-gray-700 hover:text-rose-600 hover:bg-gray-50 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold">
														<span class="text-gray-400 border-gray-200 group-hover:border-rose-600 group-hover:text-rose-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white group-[.router-link-exact-active]:text-rose-600 group-[.router-link-exact-active]:border-rose-600">{{ agence.initial }}</span>
														{{ agence.name }}
													</router-link>
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
		<!-- #endregion -->

		<!-- #region SIDEBAR -->
		<div class="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-20 lg:overflow-y-auto lg:pb-4 border-r border-gray-200">
			<div class="flex h-16 shrink-0 items-center justify-center">
				<svg  class="h-8 w-auto" viewBox="0 0 99 91" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
					<g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
						<g id="harmonie-favicon" transform="translate(-140.001753, 0.002244)" fill="#E93F80" fill-rule="nonzero">
							<g id="Group" transform="translate(140.740000, 0.000000)">
								<path d="M3.02175269,64.9577556 C-1.87824731,68.3577556 0.021752695,67.5577556 2.82175269,65.6577556 C5.62175269,63.7577556 9.12175269,61.9577556 2.82175269,68.5577556 C2.02175269,69.5577556 4.32175269,67.6577556 7.92175269,64.2577556 C14.9217527,57.5577556 16.1217527,53.1577556 28.1217527,54.2577556 C40.1217527,55.3577556 36.7217527,51.9577556 41.0217527,48.2577556 C45.8217527,44.2577556 47.5217527,43.3577556 50.3217527,43.7577556 C50.9217527,43.8577556 49.4217527,42.0577556 47.0217527,39.7577556 C43.2217527,36.1577556 42.3217527,35.7577556 39.3217527,36.2577556 C36.1217527,36.8577556 36.0217527,36.7577556 35.5217527,33.1577556 C35.3217527,31.0577556 34.1217527,25.2577556 33.0217527,20.3577556 C31.8217527,15.3577556 30.6217527,8.75775561 30.1217527,5.85775561 C28.9217527,-0.842244395 28.7217527,-0.742244395 26.2217527,3.45775561 C23.7217527,7.65775561 26.2217527,3.45775561 26.2217527,3.45775561 C22.7217527,10.9577556 23.6217527,7.25775561 22.6217527,2.45775561 C21.6217527,-2.34224439 21.9217527,0.857755605 19.5217527,3.85775561 C13.8217527,10.5577556 12.3217527,16.9577556 11.9217527,25.5577556 C11.5217527,34.1577556 13.1217527,36.2577556 16.1217527,40.6577556 L18.2217527,42.8577556 L15.1217527,46.1577556 C13.4217527,47.8577556 10.2217527,51.6577556 9.32175269,54.8577556 C8.42175269,58.0577556 7.02175269,61.6577556 5.32175269,63.2577556" id="Path"></path>
								<path d="M96.0217527,38.3577556 C94.755086,39.2910889 93.9884194,38.4910889 93.7217527,35.9577556 L93.4217527,33.3577556 C93.4217527,33.2577556 93.2217527,33.1577556 93.2217527,33.3577556 L89.4217527,36.6577556 C87.2217527,38.5577556 83.4217527,41.2577556 80.9217527,42.6577556 C78.4217527,44.0577556 75.2217527,46.0577556 73.7217527,47.0577556 C71.9917527,48.2577556 70.5217527,47.9577556 69.3217527,46.1577556 C65.6217527,40.4577556 63.4217527,39.8577556 58.1217527,43.1577556 C54.7217527,45.2577556 54.7217527,45.3577556 56.7217527,46.2577556 C59.0217527,47.3577556 59.5217527,48.2577556 61.5217527,55.8577556 C62.3217527,58.8577556 63.5217527,65.2577556 66.9217527,67.2577556 C71.8217527,70.0577556 70.9217527,73.5577556 70.9217527,81.3577556 C70.9217527,89.1577556 70.5217527,91.0577556 70.8217527,89.8577556 C71.8217527,83.6577556 73.3217527,83.9577556 73.0217527,88.4577556 C72.7217527,92.9577556 74.7217527,80.0577556 75.5217527,69.3577556 C76.1217527,62.0577556 76.3217527,61.2577556 78.0217527,61.6577556 C83.5217527,63.1577556 92.8217527,55.8577556 95.3217527,48.1577556 C99.2217527,36.2577556 98.6217527,36.5577556 96.0217527,38.4577556 L96.0217527,38.3577556 L96.0217527,38.3577556 Z" id="Path"></path>
							</g>
						</g>
					</g>
				</svg>	
			</div>
			<nav class="mt-8">
				<ul role="list" class="flex flex-col items-center space-y-1">
					<li v-for="item in navigation" :key="item.name">
						<router-link :to="{path: item.href}" :active-class="'!text-rose-600 bg-rose-100'" class="text-gray-400 hover:text-rose hover:bg-gray-200/25 group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold">
							<component :is="item.icon" class="h-6 w-6 shrink-0" aria-hidden="true" />
							<span class="sr-only">{{ item.name }}</span>
						</router-link>
					</li>

					<li>
						<div class="text-xs font-semibold leading-6 text-gray-400 mt-12 mb-2">Agences</div>
						<ul role="list" class="flex flex-col items-center space-y-1">
							<li v-for="agence in agences" :key="agence.id">
								<router-link :to="{name: 'Agence', params: {id: agence.id}}" :active-class="'!text-rose-600'" class="'text-gray-700 hover:text-rose-600 hover:bg-gray-50 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold">
									<span class="text-gray-400 border-gray-200 group-hover:border-rose-600 group-hover:text-rose-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white group-[.router-link-exact-active]:text-rose-600 group-[.router-link-exact-active]:border-rose-600">{{ agence.initial }}</span>
								</router-link>
							</li>
						</ul>
					</li>
				</ul>
			</nav>
		</div>
		<!-- #endregion -->

		<!-- #region BAR DU HAUT + ROUTER VIEW -->
		<div class="lg:pl-20">
			<div class="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
				<button type="button" class="-m-2.5 p-2.5 text-gray-700 lg:hidden" @click="sidebarOpen = true">
					<span class="sr-only">Open sidebar</span>
					<Bars3Icon class="h-6 w-6" aria-hidden="true" />
				</button>

				<!-- Separator -->
				<div class="h-6 w-px bg-gray-900/10 lg:hidden" aria-hidden="true" />

				<div class="flex flex-1 gap-x-4 lg:gap-x-6">
					<div class="flex-1"></div>
					<!-- <form class="relative flex flex-1" action="#" method="GET">
						<label for="search-field" class="sr-only">Rechercher un client</label>
						<MagnifyingGlassIcon class="pointer-events-none absolute inset-y-0 left-2 h-full w-5 text-gray-400" aria-hidden="true" />
						<input id="search-field" class="block rounded-md border-0 bg-white py-1.5 pl-10 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" placeholder="Rechercher un client..." type="search" name="search" @click="openSearch = !openSearch" />
					</form> -->
					<div class="flex items-center gap-x-4 lg:gap-x-6">
						<button v-if="false" type="button" class="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500">
							<span class="sr-only">View notifications</span>
							<BellIcon class="h-6 w-6" aria-hidden="true" />
						</button>

						<!-- Separator -->
						<div class="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-900/10" aria-hidden="true" />

						<!-- Profile dropdown -->
						<Menu as="div" class="relative">
							<MenuButton class="-m-1.5 flex items-center p-1.5">
								<span class="sr-only">Open user menu</span>

								<span class="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center font-semibold">
									{{ userStore.userLog.prenom.toUpperCase().charAt(0) }}
								</span>

								<span class="hidden lg:flex lg:items-center">
									<span class="ml-4 text-sm font-semibold leading-6 text-gray-900" aria-hidden="true">
										{{ userStore.userLog.prenom }}
									</span>
								<ChevronDownIcon class="ml-2 h-5 w-5 text-gray-400" aria-hidden="true" />
								</span>
							</MenuButton>
							<transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
								<MenuItems class="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
									<MenuItem v-for="item in userNavigation" :key="item.name" v-slot="{ active }">
										<a :href="item.href" :class="[active ? 'bg-gray-50' : '', 'block px-3 py-1 text-sm leading-6 text-gray-900']">{{ item.name }}</a>
									</MenuItem>
								</MenuItems>
							</transition>
						</Menu>
					</div>
				</div>
			</div>

			<main>
				<RouterView/>
			</main>
		</div>
		<!-- #endregion -->

		<!-- #region POPUP RECHERCHE -->
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
														<img :src="`https://heartmanagement.fr/soft/images/cli/${person.id_cli}.jpg`" alt="" class="h-6 w-6 flex-none rounded-full bg-gray-200 object-cover" />
														<span class="ml-3 flex-auto truncate">{{ person.pNoms_cli }} {{ person.nom_cli }}</span>
														<ChevronRightIcon v-if="active" class="ml-3 h-5 w-5 flex-none text-gray-400" aria-hidden="true" />
													</div>
											</ComboboxOption>
										</div>
								</div>

								<div v-if="activeOption" class="hidden h-96 w-1/2 flex-none flex-col divide-y divide-gray-100 overflow-y-auto sm:flex">
										<div class="flex-none p-6 text-center">
											<img :src="`https://heartmanagement.fr/soft/images/cli/${activeOption.id_cli}.jpg`" loading="lazy" alt="" class="mx-auto h-16 w-16 rounded-full object-cover" />
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
											<button type="button" class="mt-6 w-full rounded-md bg-rose-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600">Voir le profil complet</button>
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
	</div>
</template>

