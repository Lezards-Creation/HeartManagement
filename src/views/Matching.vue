<script setup>
    import { ref, computed, onMounted } from 'vue';
    import { useRouter } from 'vue-router';
    import { Menu, MenuButton, MenuItem, MenuItems, Popover, PopoverButton, PopoverGroup, PopoverPanel, TransitionChild, TransitionRoot, Dialog, DialogTitle, DialogPanel } from '@headlessui/vue'
    import { PrinterIcon, AtSymbolIcon, ChevronDownIcon, BoltIcon, ArrowRightIcon, CheckIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon, UsersIcon, ArrowPathIcon, HomeModernIcon } from '@heroicons/vue/24/outline';
    import { useClientsStore } from '../stores/clients';
    import { useChoixStore } from '../stores/choix';
    import { useRencontresStore } from '../stores/rencontres';
    import { useUserStore } from '../stores/user';
    import { usePropositionsStore } from '../stores/propositions';
    import { useAgencesStore } from '../stores/agences';

    import moment from "moment";
    import fr from 'moment/dist/locale/fr';
    
    moment.updateLocale('fr', fr);
    
    const uri = import.meta.env.VITE_URL;
    const fallbackImage = `${uri}/storage/img/cli/vide.webp`;
    const active_tab = ref('communs');

    const router = useRouter();
    const clientsStore = useClientsStore();
    const rencontresStore = useRencontresStore();
    const choixStore = useChoixStore();
    const userStore = useUserStore();
    const propositionsStore = usePropositionsStore();
    const agencesStore = useAgencesStore();

    const stateToast = ref(false);
    const communs = ref([]);
    const communsLoaded = ref(false);
    const count_communs = ref(0);
    const pageNumber = ref(1);

    const choix = ref([]);
    const choixLoaded = ref(false);
    const count_choix = ref(0);
    const pageNumberChoix = ref(1)

    const propositions = ref([]);
    const propositionsLoaded = ref(false);
    const count_propositions = ref(0);
    const pageNumberPropositions = ref(1)

    const popupCourrier = ref(false);
    const currentType = ref('');
    const targetClient = ref(null);
    const currentClient = ref(null);
    const isInverse = ref(false);
    const generateBase64Courrier = ref(false);

    const tabs = [
        { name: 'Choix communs', slug: 'communs', icon: UsersIcon, callback: 'fetchAllCommonChoices'},
        { name: 'Choix et Demandes', slug: 'choix', icon: ArrowPathIcon, callback: 'fetchAllChoices'},
        { name: 'Propositions', slug: 'propositions', icon: HomeModernIcon, callback: 'fetchAllPropositions'},
    ]

    const currentPage = ref(1);
    const totalPages = ref(1);
    const fetchType = ref('commonChoices');

    const clientViewed = ref(null);
    const open = ref(false);

    const hasFetched = ref(false)

    const functionMap = {
        fetchAllChoices, fetchAllPropositions, fetchAllCommonChoices
    };
    
    const pages = computed(() => {
        const range = 2;
        const pageList = [];
        
        if (totalPages.value <= 7) {
            for (let i = 1; i <= totalPages.value; i++) {
                pageList.push(i);
            }
        } else {
            if (currentPage.value <= range + 2) {
                for (let i = 1; i <= range + 2; i++) {
                    pageList.push(i);
                }
                pageList.push('...');
                pageList.push(totalPages.value);
            } else if (currentPage.value >= totalPages.value - (range + 1)) {
                pageList.push(1);
                pageList.push('...');
                for (let i = totalPages.value - (range + 2); i <= totalPages.value; i++) {
                    pageList.push(i);
                }
            } else {
                pageList.push(1);
                pageList.push('...');
                for (let i = currentPage.value - range; i <= currentPage.value + range; i++) {
                    pageList.push(i);
                }
                
                pageList.push('...');
                pageList.push(totalPages.value);
            }
        }
        return pageList;
    });

    const sortOptions = [
        { name: 'Plus récent', value: "desc" },
        { name: 'Plus ancien', value: "asc" },
    ]
    const currentSort = ref('desc')

    const filters = ref({
        idAgence_cli: []
    });
    
    const filtersOptions = ref([])

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages.value) {
            currentPage.value = page;
            switch (fetchType.value) {
                case 'commonChoices':
                    fetchAllCommonChoices(currentPage.value);
                    break;
                case 'allChoices':
                    fetchAllChoices(currentPage.value);
                    break;
                case 'propositions':
                    fetchAllPropositions(currentPage.value);
                    break;
            }
        }
    };

    const previousPage = () => {
        if (currentPage.value > 1) {
            currentPage.value -= 1;
            switch (fetchType.value) {
                case 'commonChoices':
                    fetchAllCommonChoices(currentPage.value);
                    break;
                case 'allChoices':
                    fetchAllChoices(currentPage.value);
                    break;
                case 'propositions':
                    fetchAllPropositions(currentPage.value);
                    break;
            }
        }
    };

    const nextPage = () => {
        if (currentPage.value < totalPages.value) {
            currentPage.value += 1;
            switch (fetchType.value) {
                case 'commonChoices':
                    fetchAllCommonChoices(currentPage.value);
                    break;
                case 'allChoices':
                    fetchAllChoices(currentPage.value);
                    break;
                case 'propositions':
                    fetchAllPropositions(currentPage.value);
                    break;
            }
        }
    };

    const switchTab = (tab) =>{
        active_tab.value = tab.slug
        if(tab.callback){
            handleFunctionCall(tab.callback);
        }
    }

    const handeUpdateChoice = (idChoix, state) => {
        stateToast.value = false;
        let data = {
            id_choix: idChoix,
            dateRes_choix: moment().format('YYYY-MM-DD'),
            res_choix: state ? 1 : 0
        }

        choixStore.updateChoice(data)
        .then(res => {
            console.log(res);
            stateToast.value = true;
            fetchAllChoices();
        })
        .catch(err => console.error(err))
    }

    const handeUpdateProposition = (idProp, state) => {
        stateToast.value = false;
        
        let data = {
            id_prop: idProp,
            idUtil_choix: userStore.userLog.id_util,
            dateRes_Prop: moment().format('YYYY-MM-DD'),
            res_prop: state ? 1 : 0
        }

        propositionsStore.updateProposition(data)
        .then(res => { 
            console.log(res);
            stateToast.value = true;
            fetchAllPropositions();
        })
        .catch(err => console.error(err))
    }

    function handleFunctionCall(functionName) {
        const func = functionMap[functionName];
        if (typeof func === 'function') {
            func();
        } else {
            console.warn(`Function ${functionName} is not defined`);
        }
    }

    function handleImageError(event) {
        event.target.src = fallbackImage;
	}

    function fetchAllCommonChoices(page = 1){
        pageNumber.value = page;
        communsLoaded.value = false;
        choixStore.getAllCommonChoices(page, currentSort.value, filters.value)
        .then(res => {
            communs.value = res.choices;
            count_communs.value = res.count;
            totalPages.value = Math.ceil(count_communs.value / 100)
            communsLoaded.value = true;
            fetchType.value = 'commonChoices';
        })
        .catch(err => console.error(err))
    }

    function fetchAllChoices(page = 1){
        pageNumberChoix.value = page;
        choixLoaded.value = false;
        choixStore.getAllChoices(page, currentSort.value, filters.value)
        .then(res => {
            choix.value = res.choices;
            count_choix.value = res.count;
            totalPages.value = Math.ceil(count_choix.value / 100)
            choixLoaded.value = true;
            fetchType.value = 'allChoices';
        })
        .catch(err => console.error(err))
    }

    function fetchAllPropositions(page = 1){
        pageNumberPropositions.value = page;
        propositionsLoaded.value = false
        propositionsStore.getAllPropositions(page, currentSort.value, filters.value)
        .then(res => {
            propositions.value = res.propositions;
            count_propositions.value = res.count;
            totalPages.value = Math.ceil(count_propositions.value / 100)
            propositionsLoaded.value = true;
            fetchType.value = 'propositions';
        })
        .catch(err => console.error(err))
    }

    const handleCreateRencontre = (id1, id2) => {
        stateToast.value = false;
        let client = id1;
        let autre = id2;
		let data = {
            idUtil_renc: userStore.userLog.id_util,
			idCli_renc: client,
			idCli1_renc: autre,
            statut_renc: 'Z',
			dateCre_renc: moment().format('YYYY-MM-DD'),
		}
		
		rencontresStore.createRencontre(data)
		.then(res => {
			console.log(res);
            stateToast.value = true;
            fetchAllChoices();
		})
		.catch(err => console.error(err))
    }

    const handleMail = (e) => {
        let data = {
            subject: e.subject,
            base64: e.file,
            filename: e.name
        }

        if(e.email){
            clientsStore.sendMail(e.email, data)
            .then(res => {
                stateToast.value = true;
                setTimeout(() => {
                    stateToast.value = false;
                }, 3000)
            })
            .catch(err => console.error(err))
        }
    }

    const handleSendingAttachment = (obj, type, inverse, mail) => {
        // popupCourrier.value = true; 
        // currentType.value = type; 
        // currentClient.value = obj
        // targetClient.value = inverse;

        // let email;
        // if(mail){
        //     email = mail
        // } else {
        //     email = !inverse ? obj.mail_cli : inverse.mail_cli
        // }
        
        // generateBase64Courrier.value = { 
        //     state: true, 
        //     email: email,
        // }
    }

    const handlePrint = (obj, type, inverse) => {
        popupCourrier.value = true; 
        currentType.value = type; 
        currentClient.value = obj
        targetClient.value = inverse;
    }

    const closeCourrierPDF = () => {
        popupCourrier.value = false;
        currentType.value = '';
        targetClient.value = null;
        isInverse.value = false;
        generateBase64Courrier.value = false;
    }

    const goToFicheClient = (id) => {
		open.value = false;
		router.push({name: 'Client', params: {id: id}})
	}

    const setColorName = (client) => {
		let color = 'rgb(17 24 39)'
		if(!client.libre_cli){
			color = 'rgb(17 24 39)';
			if(client.probPaie_cli){
				color = 'rgb(249, 115, 22)';
			}
		}


		let anc_adh = false;
		let a = moment(client.insc_cli).add(client.duree_cli, 'M');
		let b = moment();
		if (!b.isBefore(a)){
			anc_adh = true;
		} 
		
		if(client.prosp_cli || client.cont_cli || anc_adh){
			color = 'rgb(239,68,68)'
		}

		return color;
	}
	
	const setColorTag = (client) => {
		let color = 'rgb(12, 159, 67)';
		if(!client.libre_cli){
			color = 'rgb(17 24 39)';
			if(client.probPaie_cli){
				color = 'rgb(17, 24, 39)';
			}
		} else {
			if(client.probPaie_cli){
				color = 'rgb(249, 115, 22)';
			}
		}

		let anc_adh = false;
		let a = moment(client.insc_cli).add(client.duree_cli, 'M');
		let b = moment();
		if (!b.isBefore(a)){
			anc_adh = true;
		} 

		if(client.prosp_cli || client.cont_cli || anc_adh){
			color = 'rgb(17, 24, 39)';

			if(!client.libre_cli){
				color = 'rgb(239,68,68)';
			}

			if(client.probPaie_cli){
				color = 'rgb(249, 115, 22)';
			}
		}

		return color;
	}

    const handleOpeningFiche = (target) => {
        clientViewed.value = target;
        open.value = true;
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

    onMounted(() => {
        fetchAllCommonChoices();

        agencesStore.getAgences()
        .then(res => {
            let options = [];

            res.agences.forEach(agence => {
                options.push(  { value: agence.id_agence, label: agence.lib_agence } )
            })

            let data = {
                id: 'idAgence_cli',
                name: 'Agence',
                options: options,
            }
            filtersOptions.value.push(data)
        });
    
    })
</script>

<template>
    <div class="px-4 sm:px-6 lg:px-8 overflow-auto h-screen max-w-7xl mx-auto">
        <div class="pb-5 mt-12">
            <div>
                <h3 class="text-3xl font-semibold leading-6 text-gray-900 mb-6">Dernières interactions clients</h3>
                <p class="text-pretty text-base font-normal text-gray-500 mb-2">Accédez d’un seul coup d’œil à l’historique complet des interactions entre vos clients, pour piloter efficacement chaque mise en relation au sein de votre agence matrimoniale</p>
                <p class="text-pretty text-base font-normal text-gray-500">Grâce à cette vue structurée en trois onglets, filtrez par type d’interaction, visualisez l’état actuel de chaque dossier et intervenez au bon moment pour transformer une proposition en succès durable.</p>
            </div>
        </div>
        
        <div class="mt-6 sm:mt-8">
            <div class="sm:hidden">
                <label for="tabs" class="sr-only">Select a tab</label>
                <select
                    v-model="active_tab"
                    id="tabs"
                    name="tabs"
                    class="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    @change="switchTab(
                        tabs.find(tab => active_tab === tab.slug)
                    )"
                >
                    <option
                        v-for="tab in tabs"
                        :key="tab.slug"
                        :value="tab.slug"
                    >
                        {{ tab.name }}
                    </option>
                </select>
            </div>
            <div class="hidden sm:block">
                <div class="border-b border-gray-200">
                    <nav class="-mb-px flex space-x-8" aria-label="Tabs">
                        <a @click="switchTab(tab)"  v-for="tab in tabs" :key="tab.slug" :class="[tab.slug === active_tab ? 'border-rose text-rose' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700', 'group inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium']" :aria-current="tab.current ? 'page' : undefined">
                            <component :is="tab.icon" :class="[tab.slug === active_tab ? 'text-rose' : 'text-gray-400 group-hover:text-gray-500', '-ml-0.5 mr-2 h-5 w-5']" aria-hidden="true" />
                            <span>{{ tab.name }}</span>
                        </a>
                    </nav>
                </div>
            </div>
        </div>

        <!-- #region FILTERS -->
        <div class="flex items-center justify-between mt-6">
            <Menu as="div" class="relative inline-block text-left">
                <div>
                    <MenuButton class="group inline-flex justify-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                        Trier
                        <ChevronDownIcon class="-mr-1 ml-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                    </MenuButton>
                </div>

                <transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
                    <MenuItems class="absolute left-0 z-50 mt-2 w-40 origin-top-left rounded-md bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div class="p-4 shadow-2xl">
                            <form @change="handleFunctionCall(tabs.find((obj) => obj.slug === active_tab).callback)" class="space-y-4">
                                <div v-for="option in sortOptions" :key="option" class="flex items-center">
                                    <input v-model="currentSort" :id="`filter-${option.value}`" name="sort" :value="option.value" type="radio" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500" />
                                    <label :for="`filter-${option.value}`" class="ml-3 whitespace-nowrap pr-6 text-sm font-medium text-gray-900">{{ option.name }}</label>
                                </div>
                            </form>
                        </div>
                    </MenuItems>
                </transition>
            </Menu>

            <PopoverGroup class="sm:items-baseline sm:space-x-2">
                <Popover as="div" v-for="(section, sectionIdx) in filtersOptions" :key="section.name" :id="`desktop-menu-${sectionIdx}`" class="relative inline-block text-left ">
                    <div>
                        <PopoverButton class="group inline-flex items-center justify-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                            <span>{{ section.name }}</span>
                            <span v-if="filters[section.id].length > 0" class="ml-1.5 rounded bg-gray-200 px-1.5 py-0.5 text-xs font-semibold tabular-nums text-gray-700">{{ filters[section.id].length }}</span>
                            <ChevronDownIcon class="-mr-1 ml-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                        </PopoverButton>
                    </div>

                    <transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
                        <PopoverPanel class="absolute right-0 z-50 mt-2 origin-top-right rounded-md bg-white p-4 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <form @change="handleFunctionCall(tabs.find((obj) => obj.slug === active_tab).callback)" class="space-y-4">
                                <div v-for="(option, optionIdx) in section.options" :key="option.value" class="flex items-center">
                                    <input v-model="filters[section.id]" :id="`filter-${section.id}-${optionIdx}`" :name="`${section.id}`" :value="option.value" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500" />
                                    <label :for="`filter-${section.id}-${optionIdx}`" class="ml-3 whitespace-nowrap pr-6 text-sm font-medium text-gray-900">{{ option.label }}</label>
                                </div>
                            </form>
                        </PopoverPanel>
                    </transition>
                </Popover>
            </PopoverGroup>
        </div>
        <!-- #endregion -->

        <!-- #region CHOIX COMMUNS -->
        <div class="grid grid-cols-1 sm:gap-4 gap-24 pb-24" v-if="active_tab === 'communs'"> 
            <div v-if="communs && communsLoaded" class="mt-4" v-for="commun in communs" :key="commun.id_choix">
                <div class="mb-2 relative">
                    <span class="text-sm text-rose-500 text-center block">{{ moment(commun.date_choix).format('ll') }}</span>
                </div>
                <div class="grid gap-2 sm:grid-cols-2 grid-cols-1 relative">
                    <div class="z-0 relative flex gap-y-3 lg:gap-y-0 flex-wrap items-center sm:justify-between justify-center lg:space-x-3 rounded-lg border border-gray-300 bg-white sm:px-6 px-2 py-5 shadow-sm hover:border-gray-400">
                        <div class="flex items-center sm:justify-start justify-center space-x-3 grow shrink-0 basis-auto">
                            <div class="flex-shrink-0">
                                <img class="h-10 w-10 rounded-full object-cover" @error="handleImageError" :src="`${uri}/storage/img/cli/${commun.client.id_cli}.webp`" alt="" />
                            </div>
                            <div class="min-w-0 sm:flex-1">
                                <a href="#" class="focus:outline-none">
                                    <p class="text-sm font-medium text-gray-900" :style="`color: ${setColorName(commun.client)}`">{{ commun.client.pNoms_cli }} {{ commun.client.nom_cli }}</p>
                                    <p class="truncate text-sm text-gray-500" :style="`color: ${setColorTag(commun.client)}`">{{ commun.client.ref_cli }}</p>
                                </a>
                            </div>
                        </div>

                        <div class="flex gap-2 sm:flex-nowrap flex-wrap items-center basis-auto">
                            <button @click="handleOpeningFiche(commun.client)" type="button" class="basis-auto grow shrink-0 rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Voir la fiche</button>
                        </div>
                    </div>

                    <span @click="handleCreateRencontre(commun.client.id_cli, commun.demandeur.id_cli)" class="z-10 group sm:absolute static mx-auto top-1/2 sm:-translate-y-1/2 left-1/2 sm:-translate-x-1/2 w-10 h-10 bg-white ring-1 ring-inset ring-gray-300 hover:ring-rose cursor-pointer duration-300 ease-out hover:scale-90 group rounded-full flex items-center justify-center">
                        <BoltIcon class="w-5 h-5 group-hover:text-rose"/>
                        <span class="w-max group-hover:opacity-100 duration-300 ease-out opacity-0 absolute -top-1 left-1/2 pointer-events-none bg-gray-700 text-white px-4 py-1 rounded-md -translate-y-full -translate-x-1/2">Initier la rencontre</span>
                    </span>

                    <div class="z-0 relative flex lg:flex-nowrap flex-wrap gap-y-3 lg:gap-y-0 items-center lg:justify-between sm:justify-end justify-center space-x-3 rounded-lg border border-gray-300 bg-white sm:px-6 px-2 py-5 shadow-sm hover:border-gray-400">
                        <div class="flex sm:flex-nowrap flex-wrap items-center gap-2 basis-auto order-2 lg:order-1">
                            <button @click="handleOpeningFiche(commun.demandeur)" type="button" class="basis-auto grow shrink-0 rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Voir la fiche</button>
                        </div>

                        <div class="flex items-center sm:justify-end justify-center space-x-3 grow shrink-0 basis-auto lg:order-2">
                            <div>
                                <a href="#" class="focus:outline-none">
                                    <p class="text-sm font-medium text-gray-900 text-right" :style="`color: ${setColorName(commun.demandeur)}`">{{ commun.demandeur.pNoms_cli }} {{ commun.demandeur.nom_cli }}</p>
                                    <p class="truncate text-sm text-gray-500 text-right" :style="`color: ${setColorTag(commun.demandeur)}`">{{ commun.demandeur.ref_cli }}</p>
                                </a>
                            </div>
                            <div class="flex-shrink-0">
                                <img class="h-10 w-10 rounded-full object-cover" @error="handleImageError" :src="`${uri}/storage/img/cli/${commun.demandeur.id_cli}.webp`" alt="" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- #region SKELETON -->
            <div class="mt-12" v-else-if="!communsLoaded">
                <div v-for="n in 10" class="grid gap-2 grid-cols-2 relative mb-12">
                    <div class="z-0 relative flex items-center justify-between space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400">
                        <div class="flex items-center justify-start space-x-3 grow shrink-0 basis-auto">
                            <span class="h-10 w-10 rounded-full object-cover animate-pulse bg-gray-300"/>
                            <div>
                                <p class="text-sm font-medium text-gray-900 animate-pulse bg-gray-300 w-32 h-5 rounded-md mb-2"></p>
                                <p class="truncate text-sm text-gray-500 animate-pulse bg-gray-300 w-16 h-4 rounded-md"></p>
                            </div>
                        </div>

                        <div class="flex gap-2 items-center basis-auto">
                            <a class="relative animate-pulse bg-gray-300 w-6 h-6 cursor-pointer group rounded-md px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block"></a>
                            <a class="relative animate-pulse bg-gray-300 w-6 h-6 cursor-pointer group rounded-md px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block"></a>
                            <button type="button" class="basis-auto grow shrink-0 w-24 h-6 rounded-md animate-pulse bg-gray-300 px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 "></button>
                        </div>
                    </div>

                    <span class="z-10 absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-10 h-10 bg-white ring-1 ring-inset ring-gray-300 rounded-full flex items-center justify-center">
                        <BoltIcon class="w-5 h-5"/>
                    </span>

                    <div class="z-0 relative flex items-center justify-between space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400">
                        <div class="flex items-center gap-2 basis-auto">
                            <button type="button" class="basis-auto grow shrink-0 w-24 h-6 rounded-md animate-pulse bg-gray-300 px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 "></button>
                            <a class="relative animate-pulse bg-gray-300 w-6 h-6 cursor-pointer group rounded-md px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block"></a>
                            <a class="relative animate-pulse bg-gray-300 w-6 h-6 cursor-pointer group rounded-md px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block"></a>
                        </div>

                        <div class="flex items-center justify-end space-x-3 grow shrink-0 basis-auto">
                            <div>
                                <p class="text-sm font-medium text-gray-900 animate-pulse bg-gray-300 w-32 h-5 rounded-md mb-2"></p>
                                <p class="ml-auto truncate text-sm text-gray-500 animate-pulse bg-gray-300 w-16 h-4 rounded-md"></p>
                            </div>
                            <span class="h-10 w-10 rounded-full object-cover animate-pulse bg-gray-300"/>
                        </div>
                    </div>
                </div>
            </div>
            <!-- #endregion -->

            <div v-if="communs?.length === 0">
                <h3 class="text-center text-gray-300 font-light mt-5">Aucun choix communs correspond à votre sélection de filtre.</h3>
            </div>


            <div v-if="communs" class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 sticky bottom-0 z-20">
                <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                        <p class="text-sm text-gray-700">
                            <span class="font-medium">{{ 100 * (pageNumber - 1) }}</span>
                            {{ ' ' }}
                            à
                            {{ ' ' }}
                            <span class="font-medium">{{ 100 * (pageNumber) > count_communs ?  count_communs : 100 * (pageNumber)}}</span>
                            {{ ' ' }}
                            sur
                            {{ ' ' }}
                            <span class="font-medium">{{ count_communs }}</span>
                            {{ ' ' }}
                            résultats
                        </p>
                    </div>
                    <div>
                        <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm">
                            <button @click="previousPage" :disabled="currentPage === 1" class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                                <ChevronLeftIcon class="h-5 w-5" aria-hidden="true" />
                            </button>

                            <button v-for="(page, index) in pages" :key="index" :class="['relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0', { 'z-10 bg-rose text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600' : page === currentPage, 'cursor-not-allowed': page === '...' }]" @click="goToPage(page)" :disabled="page === '...'">
                                {{ page }}
                            </button>
                                
                            <button @click="nextPage" :disabled="currentPage === totalPages" class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                                <ChevronRightIcon class="h-5 w-5" aria-hidden="true" />
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
        <!-- #endregion  -->

        <!-- #region CHOIX -->
        <div class="grid grid-cols-1 sm:gap-4 gap-24 pb-24" v-if="active_tab === 'choix'"> 
            <div v-if="choix && choixLoaded" class="mt-4" v-for="ch in choix" :key="ch.id_choix">
                <div class="mb-2 relative grid gap-8 grid-cols-2 items-center">
                    <span class="text-sm text-rose-500 text-right block">{{ moment(ch.date_choix).format('ll') }}</span>
                    <span class="text-sm text-gray-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">-</span>
                    <div>
                        <span :class="[ch.res_choix === 1 ? 'text-green-700 bg-green-50 ring-green-600/20' : (ch.res_choix === 0 ? 'text-red-800 bg-red-50 ring-red-600/20' : 'text-gray-600 bg-gray-50 ring-gray-500/10'), 'rounded-md whitespace-nowrap mt-0.5 px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset']">
                            {{
                                ch.res_choix === 1 ? `Acceptée le ${moment(ch.dateRes_choix).format('ll')}`
                                : ch.res_choix === 0 ? `Refusée le ${moment(ch.dateRes_choix).format('ll')}`
                                : ch.res_choix === null && ch.dateEnv_choix ? `Proposition le ${moment(ch.dateEnv_choix).format('ll')}` : 'Aucune proposition'
                            }}
                        </span>
                    </div>
                </div>
                <div class="grid gap-2 sm:grid-cols-2 grid-cols-1 relative">
                    <div class="z-0 relative flex gap-y-3 lg:gap-y-0 flex-wrap items-center sm:justify-between justify-center lg:space-x-3 rounded-lg border border-gray-300 bg-white sm:px-6 px-2 py-5 shadow-sm hover:border-gray-400">
                        <div class="flex items-center sm:justify-start justify-center space-x-3 grow shrink-0 basis-auto">
                            <div class="flex-shrink-0">
                                <img class="h-10 w-10 rounded-full object-cover" @error="handleImageError" :src="`${uri}/storage/img/cli/${ch.client.id_cli}.webp`" alt="" />
                            </div>
                            <div class="min-w-0 sm:flex-1">
                                <a href="#" class="focus:outline-none">
                                    <p class="text-sm font-medium text-gray-900" :style="`color: ${setColorName(ch.client)}`">{{ ch.client.pNoms_cli }} {{ ch.client.nom_cli }}</p>
                                    <p class="truncate text-sm text-gray-500" :style="`color: ${setColorTag(ch.client)}`">{{ ch.client.ref_cli }}</p>
                                </a>
                            </div>
                        </div>

                        <div class="flex gap-2 sm:flex-nowrap flex-wrap items-center basis-auto">
                            <a @click="handleSendingAttachment(ch.client.id_cli, 'choix', ch.demandeur)" class="relative cursor-pointer group rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                <AtSymbolIcon class="w-5 h-5"/>
                                <span class="w-max group-hover:opacity-100 duration-300 ease-out opacity-0 absolute -top-1 left-1/2 pointer-events-none bg-gray-700 text-white px-4 py-1 rounded-md -translate-y-full -translate-x-1/2">Envoyer un mail</span>
                            </a>

                            <a @click="handlePrint(ch.client.id_cli, 'choix', ch.demandeur)" class="relative cursor-pointer group rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                <PrinterIcon class="w-5 h-5"/>
                                <span class="w-max group-hover:opacity-100 duration-300 ease-out opacity-0 absolute -top-1 left-1/2 pointer-events-none bg-gray-700 text-white px-4 py-1 rounded-md -translate-y-full -translate-x-1/2">Envoyer un courrier</span>
                            </a>

                            <button @click="handleOpeningFiche(ch.client)" type="button" class="basis-auto grow shrink-0 rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Voir la fiche</button>
                        </div>
                    </div>

                    <span class="z-10 sm:absolute static mx-auto top-1/2 sm:-translate-y-1/2 left-1/2 sm:-translate-x-1/2 w-10 h-10 bg-white ring-1 ring-inset ring-gray-300 rounded-full flex items-center justify-center group">
                        <ArrowRightIcon class="w-5 h-5"/>
                        <span class="w-max group-hover:opacity-100 duration-300 ease-out opacity-0 absolute -top-1 left-1/2 pointer-events-none bg-gray-700 text-white px-4 py-1 rounded-md -translate-y-full -translate-x-1/2">{{ ch.client.pNoms_cli }} à choisi {{ ch.demandeur.pNoms_cli }}</span>
                    </span>

                    <div class="z-0 relative flex lg:flex-nowrap flex-wrap gap-y-3 lg:gap-y-0 items-center lg:justify-between sm:justify-end justify-center space-x-3 rounded-lg border border-gray-300 bg-white sm:px-6 px-2 py-5 shadow-sm hover:border-gray-400">
                        <div class="flex sm:flex-nowrap flex-wrap items-center gap-2 basis-auto order-2 lg:order-1">
                            <button @click="handleOpeningFiche(ch.demandeur)" type="button" class="basis-auto grow shrink-0 rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Voir la fiche</button>

                            <a @click="handleSendingAttachment(ch.demandeur.id_cli, 'choix', ch.client)" class="relative cursor-pointer group rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                <AtSymbolIcon class="w-5 h-5"/>
                                <span class="w-max group-hover:opacity-100 duration-300 ease-out opacity-0 absolute -top-1 left-1/2 pointer-events-none bg-gray-700 text-white px-4 py-1 rounded-md -translate-y-full -translate-x-1/2">Envoyer un mail</span>
                            </a>

                            <a @click="handlePrint(ch.demandeur.id_cli, 'choix', ch.client)" class="relative cursor-pointer group rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                <PrinterIcon class="w-5 h-5"/>
                                <span class="w-max group-hover:opacity-100 duration-300 ease-out opacity-0 absolute -top-1 left-1/2 pointer-events-none bg-gray-700 text-white px-4 py-1 rounded-md -translate-y-full -translate-x-1/2">Envoyer un courrier</span>
                            </a>

                            <a v-if="ch.res_choix === null" @click="handeUpdateChoice(ch.id_choix, true)" class="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-green-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                <CheckIcon class="w-5 h-5"/>
                            </a>

                            <a v-if="ch.res_choix === null" @click="handeUpdateChoice(ch.id_choix, false)" class="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-red-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                <XMarkIcon class="w-5 h-5"/>
                            </a>
                        </div>

                        <div class="flex items-center sm:justify-end justify-center space-x-3 grow shrink-0 basis-auto lg:order-2">
                            <div>
                                <a href="#" class="focus:outline-none">
                                    <p class="text-sm font-medium text-gray-900 text-right" :style="`color: ${setColorName(ch.demandeur)}`">{{ ch.demandeur.pNoms_cli }} {{ ch.demandeur.nom_cli }}</p>
                                    <p class="truncate text-sm text-gray-500 text-right" :style="`color: ${setColorTag(ch.demandeur)}`">{{ ch.demandeur.ref_cli }}</p>
                                </a>
                            </div>
                            <div class="flex-shrink-0">
                                <img class="h-10 w-10 rounded-full object-cover" @error="handleImageError" :src="`${uri}/storage/img/cli/${ch.demandeur.id_cli}.webp`" alt="" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- #region SKELETON -->
            <div class="mt-12" v-else-if="!choixLoaded">
                <div v-for="n in 10" class="grid gap-2 grid-cols-2 relative mb-12">
                    <div class="z-0 relative flex items-center justify-between space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400">
                        <div class="flex items-center justify-start space-x-3 grow shrink-0 basis-auto">
                            <span class="h-10 w-10 rounded-full object-cover animate-pulse bg-gray-300"/>
                            <div>
                                <p class="text-sm font-medium text-gray-900 animate-pulse bg-gray-300 w-32 h-5 rounded-md mb-2"></p>
                                <p class="truncate text-sm text-gray-500 animate-pulse bg-gray-300 w-16 h-4 rounded-md"></p>
                            </div>
                        </div>

                        <div class="flex gap-2 items-center basis-auto">
                            <a class="relative animate-pulse bg-gray-300 w-6 h-6 cursor-pointer group rounded-md px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block"></a>
                            <a class="relative animate-pulse bg-gray-300 w-6 h-6 cursor-pointer group rounded-md px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block"></a>
                            <button type="button" class="basis-auto grow shrink-0 w-24 h-6 rounded-md animate-pulse bg-gray-300 px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 "></button>
                        </div>
                    </div>

                    <span class="z-10 absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-10 h-10 bg-white ring-1 ring-inset ring-gray-300 rounded-full flex items-center justify-center">
                        <ArrowRightIcon class="w-5 h-5"/>
                    </span>

                    <div class="z-0 relative flex items-center justify-between space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400">
                        <div class="flex items-center gap-2 basis-auto">
                            <button type="button" class="basis-auto grow shrink-0 w-24 h-6 rounded-md animate-pulse bg-gray-300 px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 "></button>
                            <a class="relative animate-pulse bg-gray-300 w-6 h-6 cursor-pointer group rounded-md px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block"></a>
                            <a class="relative animate-pulse bg-gray-300 w-6 h-6 cursor-pointer group rounded-md px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block"></a>
                        </div>

                        <div class="flex items-center justify-end space-x-3 grow shrink-0 basis-auto">
                            <div>
                                <p class="text-sm font-medium text-gray-900 animate-pulse bg-gray-300 w-32 h-5 rounded-md mb-2"></p>
                                <p class="ml-auto truncate text-sm text-gray-500 animate-pulse bg-gray-300 w-16 h-4 rounded-md"></p>
                            </div>
                            <span class="h-10 w-10 rounded-full object-cover animate-pulse bg-gray-300"/>
                        </div>
                    </div>
                </div>
            </div>
            <!-- #endregion -->

            <div v-if="choix?.length === 0">
                <h3 class="text-center text-gray-300 font-light ">Aucun choix/demande correspond à votre sélection de filtre.</h3>
            </div>


            <div v-if="choix" class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 sticky bottom-0 z-20">
                <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                        <p class="text-sm text-gray-700">
                            <span class="font-medium">{{ 100 * (pageNumberChoix - 1) }}</span>
                            {{ ' ' }}
                            à
                            {{ ' ' }}
                            <span class="font-medium">{{ 100 * (pageNumberChoix) > count_choix ?  count_choix : 100 * (pageNumberChoix)}}</span>
                            {{ ' ' }}
                            sur
                            {{ ' ' }}
                            <span class="font-medium">{{ count_choix }}</span>
                            {{ ' ' }}
                            résultats
                        </p>
                    </div>
                    <div>
                        <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm">
                            <button @click="previousPage" :disabled="currentPage === 1" class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                                <ChevronLeftIcon class="h-5 w-5" aria-hidden="true" />
                            </button>

                            <button v-for="(page, index) in pages" :key="index" :class="['relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0', { 'z-10 bg-rose text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600' : page === currentPage, 'cursor-not-allowed': page === '...' }]" @click="goToPage(page)" :disabled="page === '...'">
                                {{ page }}
                            </button>
                                
                            <button @click="nextPage" :disabled="currentPage === totalPages" class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                                <ChevronRightIcon class="h-5 w-5" aria-hidden="true" />
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
        <!-- #endregion -->

        <!-- #region PROPOSITIONS -->
        <div class="grid grid-cols-1 sm:gap-4 gap-24 pb-24" v-if="active_tab === 'propositions'"> 
            <div v-if="propositions && propositionsLoaded" class="mt-4" v-for="proposition in propositions" :key="proposition.id_prop">
                <div class="mb-2 relative grid gap-8 grid-cols-2 items-center">
                    <span class="text-sm text-rose-500 text-right block">{{ moment(proposition.date_prop).format('ll') }}</span>
                    <span class="text-sm text-gray-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">-</span>
                    <div>
                        <span :class="[proposition.res_prop === 1 ? 'text-green-700 bg-green-50 ring-green-600/20' : (proposition.res_prop === 0 ? 'text-red-800 bg-red-50 ring-red-600/20' : 'text-gray-600 bg-gray-50 ring-gray-500/10'), 'rounded-md whitespace-nowrap mt-0.5 px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset']">
                            {{
                                proposition.res_prop === 1 ? `Acceptée le ${moment(proposition.dateRes_prop).format('ll')}`
                                : proposition.res_prop === 0 ? `Refusée le ${moment(proposition.dateRes_prop).format('ll')}`
                                : proposition.res_prop === null && proposition.dateEnv_prop ? `Proposition le ${moment(proposition.dateEnv_prop).format('ll')}` : 'Aucune proposition'
                            }}
                        </span>
                        <span class="text-xs text-gray-500"> - Effectué par {{ proposition.idUtil_prop }}</span>
                    </div>

                    
                </div>
                <div class="grid gap-2 sm:grid-cols-2 grid-cols-1 relative">
                    <div class="z-0 relative flex gap-y-3 lg:gap-y-0 flex-wrap items-center sm:justify-between justify-center lg:space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400">
                        <div class="flex items-center sm:justify-start justify-center space-x-3 grow shrink-0 basis-auto">
                            <div class="flex-shrink-0">
                                <img class="h-10 w-10 rounded-full object-cover" @error="handleImageError" :src="`${uri}/storage/img/cli/${proposition.client2.id_cli}.webp`" alt="" />
                            </div>

                            <div>
                                <a href="#" class="focus:outline-none">
                                    <p class="text-sm font-medium text-gray-900 text-left" :style="`color: ${setColorName(proposition.client2)}`">{{ proposition.client2.pNoms_cli }} {{ proposition.client2.nom_cli }}</p>
                                    <p class="truncate text-sm text-gray-500 text-left" :style="`color: ${setColorTag(proposition.client2)}`">{{ proposition.client2.ref_cli }}</p>
                                </a>
                            </div>
                        </div>
                        
                        <div class="flex items-center gap-2 basis-auto">
                            <a v-if="proposition.res_prop === null" @click="handeUpdateProposition(proposition.id_prop, true)" class="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-green-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                <CheckIcon class="w-5 h-5"/>
                            </a>

                            <a v-if="proposition.res_prop === null" @click="handeUpdateProposition(proposition.id_prop, false)" class="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-red-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                <XMarkIcon class="w-5 h-5"/>
                            </a>

                            <a @click="handlePrint(proposition.client2.id_cli, 'prop', proposition.client1)" class="relative cursor-pointer group rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                <PrinterIcon class="w-5 h-5"/>
                                <span class="w-max group-hover:opacity-100 duration-300 ease-out opacity-0 absolute -top-1 left-1/2 pointer-events-none bg-gray-700 text-white px-4 py-1 rounded-md -translate-y-full -translate-x-1/2">Envoyer un courrier</span>
                            </a>
                            
                            <a @click="handleSendingAttachment(proposition.client2.id_cli, 'prop', proposition.client1)" class="relative cursor-pointer group rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                <AtSymbolIcon class="w-5 h-5"/>
                                <span class="w-max group-hover:opacity-100 duration-300 ease-out opacity-0 absolute -top-1 left-1/2 pointer-events-none bg-gray-700 text-white px-4 py-1 rounded-md -translate-y-full -translate-x-1/2">Envoyer un mail</span>
                            </a>

                            <button @click="handleOpeningFiche(proposition.client2)" type="button" class="basis-auto grow shrink-0 rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Voir la fiche</button>
                        </div>
                    </div>

                    <span class="z-10 sm:absolute static mx-auto top-1/2 sm:-translate-y-1/2 left-1/2 sm:-translate-x-1/2 w-10 h-10 bg-white ring-1 ring-inset ring-gray-300 rounded-full flex items-center justify-center group">
                        <ArrowRightIcon class="w-5 h-5"/>
                        <span class="w-max group-hover:opacity-100 duration-300 ease-out opacity-0 absolute -top-1 left-1/2 pointer-events-none bg-gray-700 text-white px-4 py-1 rounded-md -translate-y-full -translate-x-1/2">{{ proposition.client2.pNoms_cli }} a été proposé à {{ proposition.client1.pNoms_cli }} </span>
                    </span>

                    <div class="z-0 relative flex lg:flex-nowrap flex-wrap gap-y-3 lg:gap-y-0 items-center lg:justify-between sm:justify-end justify-center space-x-3 rounded-lg border border-gray-300 bg-white sm:px-6 px-2 py-5 shadow-sm hover:border-gray-400">
                        <div class="flex sm:flex-nowrap flex-wrap items-center gap-2 basis-auto order-2 lg:order-1">
                            <button @click="handleOpeningFiche(proposition.client1)" type="button" class="basis-auto grow shrink-0 rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Voir la fiche</button>
                            
                            <a @click="handleSendingAttachment(proposition.client1.id_cli, 'prop', proposition.client2)" class="relative cursor-pointer group rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                <AtSymbolIcon class="w-5 h-5"/>
                                <span class="w-max group-hover:opacity-100 duration-300 ease-out opacity-0 absolute -top-1 left-1/2 pointer-events-none bg-gray-700 text-white px-4 py-1 rounded-md -translate-y-full -translate-x-1/2">Envoyer un mail</span>
                            </a>

                            <a @click="handlePrint(proposition.client1.id_cli, 'prop', proposition.client2)" class="relative cursor-pointer group rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                <PrinterIcon class="w-5 h-5"/>
                                <span class="w-max group-hover:opacity-100 duration-300 ease-out opacity-0 absolute -top-1 left-1/2 pointer-events-none bg-gray-700 text-white px-4 py-1 rounded-md -translate-y-full -translate-x-1/2">Envoyer un courrier</span>
                            </a>
                        </div>

                        <div class="flex items-center sm:justify-end justify-center space-x-3 grow shrink-0 basis-auto lg:order-2">
                            <div class="min-w-0 sm:flex-1">
                                <a href="#" class="focus:outline-none">
                                    <p class="text-sm font-medium text-gray-900 text-right" :style="`color: ${setColorName(proposition.client1)}`">{{ proposition.client1.pNoms_cli }} {{ proposition.client1.nom_cli }}</p>
                                    <p class="truncate text-sm text-gray-500 text-right" :style="`color: ${setColorTag(proposition.client1)}`">{{ proposition.client1.ref_cli }}</p>
                                </a>
                            </div>

                            <div class="flex-shrink-0">
                                <img class="h-10 w-10 rounded-full object-cover" @error="handleImageError" :src="`${uri}/storage/img/cli/${proposition.client1.id_cli}.webp`" alt="" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- #region SKELETON -->
            <div class="mt-12" v-else-if="!propositionsLoaded">
                <div v-for="n in 10" class="grid gap-2 grid-cols-2 relative mb-12">
                    <div class="z-0 relative flex items-center justify-between space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400">
                        <div class="flex items-center justify-start space-x-3 grow shrink-0 basis-auto">
                            <span class="h-10 w-10 rounded-full object-cover animate-pulse bg-gray-300"/>
                            <div>
                                <p class="text-sm font-medium text-gray-900 animate-pulse bg-gray-300 w-32 h-5 rounded-md mb-2"></p>
                                <p class="truncate text-sm text-gray-500 animate-pulse bg-gray-300 w-16 h-4 rounded-md"></p>
                            </div>
                        </div>

                        <div class="flex gap-2 items-center basis-auto">
                            <a class="relative animate-pulse bg-gray-300 w-6 h-6 cursor-pointer group rounded-md px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block"></a>
                            <a class="relative animate-pulse bg-gray-300 w-6 h-6 cursor-pointer group rounded-md px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block"></a>
                            <button type="button" class="basis-auto grow shrink-0 w-24 h-6 rounded-md animate-pulse bg-gray-300 px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 "></button>
                        </div>
                    </div>

                    <span class="z-10 absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-10 h-10 bg-white ring-1 ring-inset ring-gray-300 rounded-full flex items-center justify-center">
                        <ArrowRightIcon class="w-5 h-5"/>
                    </span>

                    <div class="z-0 relative flex items-center justify-between space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400">
                        <div class="flex items-center gap-2 basis-auto">
                            <button type="button" class="basis-auto grow shrink-0 w-24 h-6 rounded-md animate-pulse bg-gray-300 px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 "></button>
                            <a class="relative animate-pulse bg-gray-300 w-6 h-6 cursor-pointer group rounded-md px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block"></a>
                            <a class="relative animate-pulse bg-gray-300 w-6 h-6 cursor-pointer group rounded-md px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block"></a>
                        </div>

                        <div class="flex items-center justify-end space-x-3 grow shrink-0 basis-auto">
                            <div>
                                <p class="text-sm font-medium text-gray-900 animate-pulse bg-gray-300 w-32 h-5 rounded-md mb-2"></p>
                                <p class="ml-auto truncate text-sm text-gray-500 animate-pulse bg-gray-300 w-16 h-4 rounded-md"></p>
                            </div>
                            <span class="h-10 w-10 rounded-full object-cover animate-pulse bg-gray-300"/>
                        </div>
                    </div>
                </div>
            </div>
            <!-- #endregion -->

            <div v-if="propositions?.length === 0">
                <h3 class="text-center text-gray-300 font-light ">Aucune proposition corresponde à votre sélection de filtre.</h3>
            </div>

            <div v-if="propositions" class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 sticky bottom-0 z-20">
                <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                        <p class="text-sm text-gray-700">
                            <span class="font-medium">{{ 100 * (pageNumberPropositions - 1) }}</span>
                            {{ ' ' }}
                            à
                            {{ ' ' }}
                            <span class="font-medium">{{ 100 * (pageNumberPropositions) > count_propositions ?  count_propositions : 100 * (pageNumberPropositions)}}</span>
                            {{ ' ' }}
                            sur
                            {{ ' ' }}
                            <span class="font-medium">{{ count_propositions }}</span>
                            {{ ' ' }}
                            résultats
                        </p>
                    </div>
                    <div>
                        <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm">
                            <button @click="previousPage" :disabled="currentPage === 1" class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                                <ChevronLeftIcon class="h-5 w-5" aria-hidden="true" />
                            </button>

                            <button v-for="(page, index) in pages" :key="index" :class="['relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0', { 'z-10 bg-rose text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600' : page === currentPage, 'cursor-not-allowed': page === '...' }]" @click="goToPage(page)" :disabled="page === '...'">
                                {{ page }}
                            </button>
                                
                            <button @click="nextPage" :disabled="currentPage === totalPages" class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                                <ChevronRightIcon class="h-5 w-5" aria-hidden="true" />
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
        <!-- #endregion -->
    </div>


    <!-- #region COURRIER CLIENT -->
    <CourrierClient 
        :client="currentClient" 
        :targetClient="targetClient" 
        :isOpen="popupCourrier" 
        :generate="generateBase64Courrier" 
        @base64generated="handleMail" 
        :type="currentType" 
        :inverse="isInverse" 
        @modal-close="closeCourrierPDF"
    />
    <!-- #endregion -->


    <!-- #region SIDEBAR FICHE -->
    <TransitionRoot as="template" :show="open">
        <Dialog class="relative z-50" @close="open = false">
            <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
                <div class="fixed inset-0 bg-black backdrop-blur-sm bg-opacity-50 transition-opacity" />
            </TransitionChild>
            <div class="fixed inset-0" />

            <div class="fixed inset-0 overflow-hidden">
                <div class="absolute inset-0 overflow-hidden">
                <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
                    <TransitionChild as="template" enter="transform transition ease-in-out duration-500 sm:duration-700" enter-from="translate-x-full" enter-to="translate-x-0" leave="transform transition ease-in-out duration-500 sm:duration-700" leave-from="translate-x-0" leave-to="translate-x-full">
                    <DialogPanel class="pointer-events-auto w-screen max-w-2xl">
                        <div class="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                            <div class="px-4 py-6 sm:px-6">
                                <div class="flex items-start justify-between">
                                    <DialogTitle class="text-base font-semibold leading-6 text-gray-900">Profil client</DialogTitle>
                                    <div class="ml-3 flex h-7 items-center">
                                        <button type="button" class="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-rose-500" @click="open = false">
                                            <span class="absolute -inset-2.5" />
                                            <span class="sr-only">Close panel</span>
                                            <XMarkIcon class="h-6 w-6" aria-hidden="true" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <!-- Main -->
                            <div class="divide-y divide-gray-200" v-if="clientViewed">
                                <div class="pb-6">
                                    <div class="h-24 bg-rose sm:h-20 lg:h-28" />
                                    <div class="-mt-12 flow-root px-4 sm:-mt-8 sm:flex sm:items-end sm:px-6 lg:-mt-16">
                                        <div>
                                            <div class="-m-1 flex">
                                                <div class="inline-flex overflow-hidden rounded-lg border-4 border-white">
                                                <img class="h-24 w-24 flex-shrink-0 sm:h-40 sm:w-40 lg:h-48 lg:w-48 object-cover" :src="`${uri}/storage/img/cli/${clientViewed.id_cli}.webp`" alt="" />
                                                </div>
                                            </div>
                                        </div>
                                        <div class="mt-6 sm:ml-6 sm:flex-1">
                                            <div>
                                                <div class="flex items-center">
                                                    <h3 class="text-xl font-bold text-gray-900 sm:text-2xl">{{ clientViewed.pNoms_cli }} {{ clientViewed.nom_cli }}</h3>
                                                </div>
                                                <p class="text-sm text-gray-500">{{clientViewed.ville_cli}}, {{ calculateAge(clientViewed.dateNaiss_cli) }} ans</p>
                                            </div>
                                            <div class="mt-5 flex flex-wrap space-y-3 sm:space-x-3 sm:space-y-0">
                                                <button type="button" class="inline-flex w-full flex-shrink-0 items-center justify-center rounded-md px-3 py-2 text-sm font-semibold ring-1 ring-gray-300 shadow-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 sm:flex-1">Envoyer un mail</button>
                                                <button @click="goToFicheClient()" type="button" class="inline-flex w-full flex-shrink-0 items-center justify-center rounded-md px-3 py-2 text-sm font-semibold ring-1 ring-gray-300 shadow-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 sm:flex-1">Voir en détail</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="px-4 py-5 sm:px-0 sm:py-0">
                                    <dl class="space-y-8 sm:space-y-0 sm:divide-y sm:divide-gray-200">
                                        <div class="sm:flex sm:px-6 sm:py-5">
                                            <dt class="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">Taille</dt>
                                            <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">{{ clientViewed.taille_cli }} cm</dd>
                                        </div>
                                        
                                        <div class="sm:flex sm:px-6 sm:py-5">
                                            <dt class="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">Poids</dt>
                                            <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">{{ clientViewed.poid_cli }} kg</dd>
                                        </div>

                                        <div class="sm:flex sm:px-6 sm:py-5">
                                            <dt class="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">Enfants</dt>
                                            <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">{{ clientViewed.nbEnf_cli }}</dd>
                                        </div>

                                        <div class="sm:flex sm:px-6 sm:py-5">
                                            <dt class="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">Profession</dt>
                                            <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">{{ clientViewed.prof_cli }}</dd>
                                        </div>
                                        
                                        <div class="sm:flex sm:px-6 sm:py-5">
                                            <dt class="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">Caractère</dt>
                                            <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">
                                                <p>{{ clientViewed.desc_cli }}</p>
                                            </dd>
                                        </div>
                                        
                                        <div class="sm:flex sm:px-6 sm:py-5">
                                            <dt class="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">Goûts / loisirs</dt>
                                            <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">
                                                <p>{{ clientViewed.interets_cli }}</p>
                                            </dd>
                                        </div>

                                        <div class="sm:flex sm:px-6 sm:py-5">
                                            <dt class="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">Milieu d'éducation</dt>
                                            <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">
                                                <p>{{ clientViewed.milieu_cli }}</p>
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </DialogPanel>
                    </TransitionChild>
                </div>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
    <!-- #endregion -->

    <Toast :state="stateToast" title="Modification enregistrée"/>
</template>