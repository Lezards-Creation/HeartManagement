<script setup>
    import { ref, computed } from 'vue';
    import { useRouter } from 'vue-router';
    import { PrinterIcon, AtSymbolIcon, MagnifyingGlassIcon, ChevronDownIcon, BarsArrowUpIcon, BoltIcon, ArrowRightIcon, CheckIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon, UsersIcon, ArrowPathIcon, HomeModernIcon } from '@heroicons/vue/24/outline';
    import { useClientsStore } from '../stores/clients';
    import { useChoixStore } from '../stores/choix';
    import { useRencontresStore } from '../stores/rencontres';
    import { useUserStore } from '../stores/user';
    import { usePropositionsStore } from '../stores/propositions';
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
        { name: 'Choix communs', slug: 'communs', icon: UsersIcon},
        { name: 'Choix et Demandes', slug: 'choix', icon: ArrowPathIcon, callback: 'fetchAllChoices'},
        { name: 'Propositions', slug: 'propositions', icon: HomeModernIcon, callback: 'fetchAllPropositions'},
    ]

    const currentPage = ref(1);
    const totalPages = ref(1); // or set dynamically based on your data
    const fetchType = ref('commonChoices');

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

    const functionMap = {
        fetchAllChoices, fetchAllPropositions
    };

    function handleFunctionCall(functionName) {
        const func = functionMap[functionName];
        if (typeof func === 'function') {
            func();
        } else {
            console.warn(`Function ${functionName} is not defined`);
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

    function handleImageError(event) {
        event.target.src = fallbackImage;
	}

    const fetchAllCommonChoices = (page = 1) => {
        pageNumber.value = page;
        communsLoaded.value = false;
        choixStore.getAllCommonChoices(page)
        .then(res => {
            communs.value = res.choices;
            count_communs.value = res.count;
            totalPages.value = Math.ceil(count_communs.value / 100)
            communsLoaded.value = true;
            fetchType.value = 'commonChoices';
        })
        .catch(err => console.error(err))
    }
    fetchAllCommonChoices();

    function fetchAllChoices(page = 1){
        pageNumberChoix.value = page;
        choixLoaded.value = false;
        choixStore.getAllChoices(page)
        .then(res => {
            console.log(res)
            choix.value = res.choices;
            count_choix.value = res.count;
            totalPages.value = Math.ceil(count_choix.value / 100)
            choixLoaded.value = true;
            fetchType.value = 'allChoices';
        })
        .catch(err => console.error(err))
    }

    function fetchAllPropositions(page = 1){
        console.log(page);
        pageNumberPropositions.value = page;
        propositionsLoaded.value = false
        propositionsStore.getAllPropositions(page)
        .then(res => {
            console.log(res)
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
        popupCourrier.value = true; 
        currentType.value = type; 
        currentClient.value = obj
        targetClient.value = inverse;

        let email;
        if(mail){
            email = mail
        } else {
            email = !inverse ? obj.mail_cli : inverse.mail_cli
        }
        
        generateBase64Courrier.value = { 
            state: true, 
            email: email,
        }
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
</script>


<template>
    <div class="px-4 sm:px-6 lg:px-8">
        <div class="border-b border-gray-200 pb-5 sm:flex sm:items-center sm:justify-between mt-12">
            <div>
                <h3 class="text-3xl font-semibold leading-6 text-gray-900">Dernières intéractions clients</h3>
            </div>
            <div class="mt-3 sm:ml-4 sm:mt-0">
                <label for="mobile-search-candidate" class="sr-only">Search</label>
                <label for="desktop-search-candidate" class="sr-only">Search</label>
                <div class="flex rounded-md shadow-sm">
                    <div class="relative flex-grow focus-within:z-10">
                        <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <input type="text" name="mobile-search-candidate" id="mobile-search-candidate" class="block w-full rounded-none rounded-l-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:hidden" placeholder="Recherche.." />
                        <input type="text" name="desktop-search-candidate" id="desktop-search-candidate" class="hidden w-full rounded-none rounded-l-md border-0 py-1.5 pl-10 text-sm leading-6 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:block" :placeholder="`Rechercher clients...`" />
                    </div>
                    <button type="button" class="relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-md px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                        <BarsArrowUpIcon class="-ml-0.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                        Filtrer
                        <ChevronDownIcon class="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
                    </button>
                </div>
            </div>
        </div>
        
        <div class="mt-8 sm:mt-12">
            <div class="sm:hidden">
                <label for="tabs" class="sr-only">Select a tab</label>
                <!-- Use an "onChange" listener to redirect the user to the selected tab URL. -->
                <select id="tabs" name="tabs" class="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                    <option v-for="tab in tabs" :key="tab.name" :selected="tab.current">{{ tab.name }}</option>
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

        <!-- #region CHOIX COMMUNS -->
        <div class="grid grid-cols-1 gap-4 mt-6 h-[75vh] overflow-auto" v-if="active_tab === 'communs'"> 
            <div v-if="communs && communsLoaded" class="mt-4" v-for="commun in communs" :key="commun.id_choix">
                <div class="mb-2 relative">
                    <span class="text-sm text-rose-500 text-center block">{{ moment(commun.date_choix).format('ll') }}</span>
                </div>
                <div class="grid gap-2 grid-cols-2 relative">
                    <div class="z-0 relative flex items-center justify-between space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400">
                        <div class="flex items-center justify-start space-x-3 grow shrink-0 basis-auto">
                            <div class="flex-shrink-0">
                                <img class="h-10 w-10 rounded-full object-cover" @error="handleImageError" :src="`${uri}/storage/img/cli/${commun.client.id_cli}.webp`" alt="" />
                            </div>
                            <div class="min-w-0 flex-1">
                                <a href="#" class="focus:outline-none">
                                    <p class="text-sm font-medium text-gray-900">{{ commun.client.pNoms_cli }} {{ commun.client.nom_cli }}</p>
                                    <p class="truncate text-sm text-gray-500">{{ commun.client.ref_cli }}</p>
                                </a>
                            </div>
                        </div>

                        <div class="flex gap-2 items-center basis-auto">
                            <button @click="goToFicheClient(commun.client.id_cli)" type="button" class="basis-auto grow shrink-0 rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Voir la fiche</button>
                        </div>
                    </div>

                    <span @click="handleCreateRencontre(commun.client.id_cli, commun.demandeur.id_cli)" class="z-10 group absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-10 h-10 bg-white ring-1 ring-inset ring-gray-300 hover:ring-rose cursor-pointer duration-300 ease-out hover:scale-90 group rounded-full flex items-center justify-center">
                        <BoltIcon class="w-5 h-5 group-hover:text-rose"/>
                        <span class="w-max group-hover:opacity-100 duration-300 ease-out opacity-0 absolute -top-1 left-1/2 pointer-events-none bg-gray-700 text-white px-4 py-1 rounded-md -translate-y-full -translate-x-1/2">Initier la rencontre</span>
                    </span>

                    <div class="z-0 relative flex items-center justify-between space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400">
                        <div class="flex items-center gap-2 basis-auto">
                            <button @click="goToFicheClient(commun.demandeur.id_cli)" type="button" class="basis-auto grow shrink-0 rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Voir la fiche</button>
                        </div>

                        <div class="flex items-center justify-end space-x-3 grow shrink-0 basis-auto">
                            <div>
                                <a href="#" class="focus:outline-none">
                                    <p class="text-sm font-medium text-gray-900 text-right">{{ commun.demandeur.pNoms_cli }} {{ commun.demandeur.nom_cli }}</p>
                                    <p class="truncate text-sm text-gray-500 text-right">{{ commun.demandeur.ref_cli }}</p>
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
            <div v-else-if="!communsLoaded">
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
        <div class="grid grid-cols-1 gap-4 mt-6 h-[75vh] overflow-auto" v-if="active_tab === 'choix'"> 
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
                <div class="grid gap-2 grid-cols-2 relative">
                    <div class="z-0 relative flex items-center justify-between space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400">
                        <div class="flex items-center justify-start space-x-3 grow shrink-0 basis-auto">
                            <div class="flex-shrink-0">
                                <img class="h-10 w-10 rounded-full object-cover" @error="handleImageError" :src="`${uri}/storage/img/cli/${ch.client.id_cli}.webp`" alt="" />
                            </div>
                            <div class="min-w-0 flex-1">
                                <a href="#" class="focus:outline-none">
                                    <p class="text-sm font-medium text-gray-900">{{ ch.client.pNoms_cli }} {{ ch.client.nom_cli }}</p>
                                    <p class="truncate text-sm text-gray-500">{{ ch.client.ref_cli }}</p>
                                </a>
                            </div>
                        </div>

                        <div class="flex gap-2 items-center basis-auto">
                            <a @click="handleSendingAttachment(ch.client.id_cli, 'choix', ch.demandeur)" class="relative cursor-pointer group rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                <AtSymbolIcon class="w-5 h-5"/>
                                <span class="w-max group-hover:opacity-100 duration-300 ease-out opacity-0 absolute -top-1 left-1/2 pointer-events-none bg-gray-700 text-white px-4 py-1 rounded-md -translate-y-full -translate-x-1/2">Envoyer un mail</span>
                            </a>

                            <a @click="handlePrint(ch.client.id_cli, 'choix', ch.demandeur)" class="relative cursor-pointer group rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                <PrinterIcon class="w-5 h-5"/>
                                <span class="w-max group-hover:opacity-100 duration-300 ease-out opacity-0 absolute -top-1 left-1/2 pointer-events-none bg-gray-700 text-white px-4 py-1 rounded-md -translate-y-full -translate-x-1/2">Envoyer un courrier</span>
                            </a>

                            <button @click="goToFicheClient(ch.client.id_cli)" type="button" class="basis-auto grow shrink-0 rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Voir la fiche</button>
                        </div>
                    </div>

                    <span class="z-10 absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-10 h-10 bg-white ring-1 ring-inset ring-gray-300 rounded-full flex items-center justify-center group">
                        <ArrowRightIcon class="w-5 h-5"/>
                        <span class="w-max group-hover:opacity-100 duration-300 ease-out opacity-0 absolute -top-1 left-1/2 pointer-events-none bg-gray-700 text-white px-4 py-1 rounded-md -translate-y-full -translate-x-1/2">{{ ch.client.pNoms_cli }} à choisi {{ ch.demandeur.pNoms_cli }}</span>
                    </span>

                    <div class="z-0 relative flex items-center justify-between space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400">
                        <div class="flex items-center gap-2 basis-auto">
                            <button @click="goToFicheClient(ch.demandeur.id_cli)" type="button" class="basis-auto grow shrink-0 rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Voir la fiche</button>

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

                        <div class="flex items-center justify-end space-x-3 grow shrink-0 basis-auto">
                            <div>
                                <a href="#" class="focus:outline-none">
                                    <p class="text-sm font-medium text-gray-900 text-right">{{ ch.demandeur.pNoms_cli }} {{ ch.demandeur.nom_cli }}</p>
                                    <p class="truncate text-sm text-gray-500 text-right">{{ ch.demandeur.ref_cli }}</p>
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
            <div v-else-if="!choixLoaded">
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
        <div class="grid grid-cols-1 gap-4 mt-6 h-[75vh] overflow-auto" v-if="active_tab === 'propositions'"> 
            <div v-if="propositions && propositionsLoaded" class="mt-4" v-for="proposition in propositions" :key="proposition.id_prop">
                <div class="mb-2 relative grid gap-8 grid-cols-2 items-center">
                    <span class="text-sm text-rose-500 text-right block">{{ moment(proposition.date_prop).format('ll') }}</span>
                    <span class="text-sm text-gray-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">-</span>
                    <span class="text-sm text-gray-500">Effectué par {{ proposition.idUtil_prop }}</span>
                </div>
                <div class="grid gap-2 grid-cols-2 relative">
                    <div class="z-0 relative flex items-center justify-between space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400">
                        <div class="flex items-center justify-start space-x-3 grow shrink-0 basis-auto">
                            <div class="flex-shrink-0">
                                <img class="h-10 w-10 rounded-full object-cover" @error="handleImageError" :src="`${uri}/storage/img/cli/${proposition.client1.id_cli}.webp`" alt="" />
                            </div>
                            <div class="min-w-0 flex-1">
                                <a href="#" class="focus:outline-none">
                                    <p class="text-sm font-medium text-gray-900">{{ proposition.client1.pNoms_cli }} {{ proposition.client1.nom_cli }}</p>
                                    <p class="truncate text-sm text-gray-500">{{ proposition.client1.ref_cli }}</p>
                                </a>
                            </div>
                        </div>

                        <div class="flex gap-2 items-center basis-auto">
                            <a @click="handleSendingAttachment(proposition.client1.id_cli, 'prop', proposition.client2)" class="relative cursor-pointer group rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                <AtSymbolIcon class="w-5 h-5"/>
                                <span class="w-max group-hover:opacity-100 duration-300 ease-out opacity-0 absolute -top-1 left-1/2 pointer-events-none bg-gray-700 text-white px-4 py-1 rounded-md -translate-y-full -translate-x-1/2">Envoyer un mail</span>
                            </a>

                            <a @click="handlePrint(proposition.client1.id_cli, 'prop', proposition.client2)" class="relative cursor-pointer group rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                <PrinterIcon class="w-5 h-5"/>
                                <span class="w-max group-hover:opacity-100 duration-300 ease-out opacity-0 absolute -top-1 left-1/2 pointer-events-none bg-gray-700 text-white px-4 py-1 rounded-md -translate-y-full -translate-x-1/2">Envoyer un courrier</span>
                            </a>

                            <button @click="goToFicheClient(proposition.client1.id_cli)" type="button" class="basis-auto grow shrink-0 rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Voir la fiche</button>
                        </div>
                    </div>

                    <span class="z-10 absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-10 h-10 bg-white ring-1 ring-inset ring-gray-300 rounded-full flex items-center justify-center group">
                        <ArrowRightIcon class="w-5 h-5"/>
                        <span class="w-max group-hover:opacity-100 duration-300 ease-out opacity-0 absolute -top-1 left-1/2 pointer-events-none bg-gray-700 text-white px-4 py-1 rounded-md -translate-y-full -translate-x-1/2">{{ proposition.client2.pNoms_cli }} a été proposé à {{ proposition.client1.pNoms_cli }} </span>
                    </span>

                    <div class="z-0 relative flex items-center justify-between space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400">
                        <div class="flex items-center gap-2 basis-auto">
                            <button @click="goToFicheClient(proposition.client2.id_cli)" type="button" class="basis-auto grow shrink-0 rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Voir la fiche</button>

                            <a @click="handleSendingAttachment(proposition.client2.id_cli, 'prop', proposition.client1)" class="relative cursor-pointer group rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                <AtSymbolIcon class="w-5 h-5"/>
                                <span class="w-max group-hover:opacity-100 duration-300 ease-out opacity-0 absolute -top-1 left-1/2 pointer-events-none bg-gray-700 text-white px-4 py-1 rounded-md -translate-y-full -translate-x-1/2">Envoyer un mail</span>
                            </a>

                            <a @click="handlePrint(proposition.client2.id_cli, 'prop', proposition.client1)" class="relative cursor-pointer group rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                <PrinterIcon class="w-5 h-5"/>
                                <span class="w-max group-hover:opacity-100 duration-300 ease-out opacity-0 absolute -top-1 left-1/2 pointer-events-none bg-gray-700 text-white px-4 py-1 rounded-md -translate-y-full -translate-x-1/2">Envoyer un courrier</span>
                            </a>

                            <a v-if="proposition.res_prop === null" @click="handeUpdateProposition(proposition.id_prop, true)" class="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-green-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                <CheckIcon class="w-5 h-5"/>
                            </a>

                            <a v-if="proposition.res_prop === null" @click="handeUpdateProposition(proposition.id_prop, false)" class="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-red-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                <XMarkIcon class="w-5 h-5"/>
                            </a>
                        </div>

                        <div class="flex items-center justify-end space-x-3 grow shrink-0 basis-auto">
                            <div>
                                <a href="#" class="focus:outline-none">
                                    <p class="text-sm font-medium text-gray-900 text-right">{{ proposition.client2.pNoms_cli }} {{ proposition.client2.nom_cli }}</p>
                                    <p class="truncate text-sm text-gray-500 text-right">{{ proposition.client2.ref_cli }}</p>
                                </a>
                            </div>
                            <div class="flex-shrink-0">
                                <img class="h-10 w-10 rounded-full object-cover" @error="handleImageError" :src="`${uri}/storage/img/cli/${proposition.client2.id_cli}.webp`" alt="" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- #region SKELETON -->
            <div v-else-if="!propositionsLoaded">
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

    <Toast :state="stateToast" title="Modification enregistrée"/>
</template>