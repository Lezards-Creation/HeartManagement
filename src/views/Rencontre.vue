<script setup>
    import { ref, computed, onMounted } from 'vue';
    import { Dialog, DialogTitle, DialogPanel, Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems, Popover, PopoverButton, PopoverGroup, PopoverPanel, TransitionChild, TransitionRoot } from '@headlessui/vue'
    import { PrinterIcon, AtSymbolIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, LinkIcon, XMarkIcon } from '@heroicons/vue/24/outline';
    import { useRouter } from 'vue-router';
    import { useRencontresStore } from '../stores/rencontres';
    import { useClientsStore } from '../stores/clients';
    import { useAgencesStore } from '../stores/agences';
    import { useUserStore } from '../stores/user';
    import moment from "moment";
    import fr from 'moment/dist/locale/fr';
    moment.updateLocale('fr', fr);

    //#region VARIABLES
    const router = useRouter();

    const rencontreStore = useRencontresStore();   
    const agencesStore = useAgencesStore();
    const clientsStore = useClientsStore();
    const userStore = useUserStore();
    const rencontres = ref(null);
    const rencontresLoaded = ref(false);
    const rencontres_count = ref(0);

    const uri = import.meta.env.VITE_URL;

    const pageNumber = ref(1);
    const currentPage = ref(1);
    const totalPages = ref(1);

    const popupCourrier = ref(false);
    const currentType = ref('');
    const targetClient = ref(null);
    const currentClient = ref(null);
    const isInverse = ref(false);
    const generateBase64Courrier = ref(false);

    const stateToast = ref(false);
    const fallbackImage = `${uri}/storage/img/cli/vide.webp`;

    const clientViewed = ref(null);
    const openSidebar = ref(false);

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
            fetchRencontres(currentPage.value);
        }
    };

    const previousPage = () => {
        if (currentPage.value > 1) {
            currentPage.value -= 1;
            fetchRencontres(currentPage.value);
        }
    };

    const nextPage = () => {
        if (currentPage.value < totalPages.value) {
            currentPage.value += 1;
            fetchRencontres(currentPage.value);
        }
    };

    const sortOptions = [
        { name: 'Plus récent', href: '#', value: "desc" },
        { name: 'Plus ancien', href: '#', value: "asc" },
    ];
    
    const currentSort = ref('desc');

    const filters = ref({
        statut_renc: [],
        idAgence_cli: []
    });
    
    const filtersOptions = ref([
        {
            id: 'statut_renc',
            name: 'Statut',
            options: [
                { value: 'Z', label: 'Non créée' },
                { value: 'N', label: 'En cours' },
                { value: 'L', label: 'Ne l\'a pas vu(e)' },
                { value: 'P', label: 'Se poursuit' },
                { value: 'R', label: 'Pas de suite Madame' },
                { value: 'S', label: 'Pas de suite Monsieur' },
                { value: 'I', label: 'Madame pas encore décidée' },
                { value: 'J', label: 'Monsieur pas encore décidé' },
                { value: 'A', label: 'N\'a pas marché' }
            ],
        },
    ])

    const open = ref(false)
        
    //#endregion 

    //#region METHODS
    function setComment(type){
        let res = '';
        switch (type)
            {
                case 'Z':
                    res = 'Non créée';
                    break;
                case 'N':
                    res = 'En cours';
                    break;
                case 'L':
                    res = 'Ne l\'a pas vu(e)';
                    break;
                case 'P':
                    res = 'Se poursuit';
                    break;
                case 'R':
                    res = 'Pas de suite Madame';
                    break;
                case 'S':
                    res = 'Pas de suite Monsieur';
                    break;
                case 'I':
                    res = 'Madame pas encore décidée';
                    break;
                case 'J':
                    res = 'Monsieur pas encore décidé';
                    break;
                case 'A':
                    res = 'N\'a pas marché';
                    break;
            }
        return(res);
    }

    function handleImageError(event) {
        event.target.src = fallbackImage;
	}

    const fetchRencontres = (page = 1) => {
        rencontresLoaded.value = false;
        
        pageNumber.value = page;
        rencontreStore.getRencontres(page, currentSort.value, filters.value)
        .then(res => {
            rencontres.value = res.rencontres;

            rencontres_count.value = res.count;
            totalPages.value = Math.ceil(rencontres_count.value / 100)
            rencontresLoaded.value = true;

            console.log(res)
        })
        .catch(err => console.error(err))
    }
    fetchRencontres();

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

    const isFromAgence = (client) => {
        if(userStore.userLog.adm_util == 1 && client.visu_cli === 'admin'){
            return {name: client.pNoms_cli + ' ' + client.nom_cli, can: true};
        }

        if(client.visu_cli === 'conseiller'){
            if(userStore.userLog.agences.includes(client.idAgence_cli)){
                return {name: client.pNoms_cli + ' ' + client.nom_cli, can: true};
            } else {
                if (client.nom_cli) {
					let formattedNomCli = client.nom_cli.substring(0, 3)
						+ '*'.repeat(Math.max(client.nom_cli.length - 3, 0));
                    return {name: client.pNoms_cli + ' ' + formattedNomCli, can: false};
				}
            }    
        }

        if(client.visu_cli === 'public'){
            return {name: client.pNoms_cli + ' ' + client.nom_cli, can: true};
        }
	} 

    const handleOpeningFiche = (target) => {
        clientViewed.value = target;
        openSidebar.value = true;
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
    //#endregion

</script>

<template>
    <div class="px-4 sm:px-6 lg:px-8 overflow-auto h-screen pb-24 max-w-7xl mx-auto">
        <div class="border-b border-gray-200 pb-5 mt-12">
            <div>
                <h3 class="text-3xl font-semibold leading-6 text-gray-900 mb-6">Dernières Rencontres</h3>
                <p class="text-pretty text-base font-normal text-gray-500 mb-2">Accédez d’un seul coup d’œil à l’historique complet des rencontres entre vos clients, pour piloter efficacement chaque mise en relation au sein de votre agence matrimoniale</p>
                <p class="text-pretty text-base font-normal text-gray-500">Grâce à cette vue structurée, filtrez par type d’interaction, visualisez l’état actuel de chaque dossier et intervenez au bon moment pour transformer une rencontre en succès durable.</p>
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
                            <form @change="fetchRencontres(pageNumber)" class="space-y-4">
                                <div v-for="option in sortOptions" :key="option" class="flex items-center">
                                    <input v-model="currentSort" :id="`filter-${option.value}`" name="sort" :value="option.value" type="radio" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500" />
                                    <label :for="`filter-${option.value}`" class="ml-3 whitespace-nowrap pr-6 text-sm font-medium text-gray-900">{{ option.name }}</label>
                                </div>
                            </form>
                        </div>
                    </MenuItems>
                    </transition>
                </Menu>

                <PopoverGroup class="sm:items-baseline space-x-2">
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
                                <form @change="fetchRencontres(pageNumber)" class="space-y-4">
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
        </div>

          <div class="grid grid-cols-1 sm:gap-4 gap-24 mt-6 overflow-y-auto">
            <div v-if="rencontres && rencontresLoaded" class="mt-4" v-for="rencontre in rencontres" :key="rencontre.id_renc">
                <div class="grid gap-8 grid-cols-2 mb-2 relative">
                    <span class="text-sm text-rose-500 text-right">{{ moment(rencontre.dateCre_renc).format('ll') }}</span>
                    <span class="text-sm text-gray-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">-</span>
                    <span class="text-sm text-rose-500 underline">{{ setComment(rencontre.statut_renc) }}</span>
                </div>
                <div class="grid gap-2 sm:grid-cols-2 grid-cols-1 relative">
                    <div class="z-0 relative flex gap-y-3 lg:gap-y-0 flex-wrap items-center sm:justify-between justify-center lg:space-x-3 rounded-lg border border-gray-300 bg-white sm:px-6 px-2 py-5 shadow-sm hover:border-gray-400">
                        <div class="flex items-center sm:justify-start justify-center space-x-3 grow shrink-0 basis-auto">
                            <div class="flex-shrink-0">
                                <img class="h-10 w-10 rounded-full object-cover" @error="handleImageError" :src="`${uri}/storage/img/cli/${rencontre.laureat.id_cli}.webp`" alt="" />
                            </div>
                            <div class="min-w-0 sm:flex-1">
                                <a href="#" class="focus:outline-none">
                                    <p class="text-sm font-medium text-gray-900" :style="`color: ${setColorName(rencontre.laureat)}`">
                                        {{ rencontre.laureat.pNoms_cli }} {{ rencontre.laureat.nom_cli }}
                                    </p>
                                    <p class="truncate text-sm text-gray-500" :style="`color: ${setColorTag(rencontre.laureat)}`">{{ rencontre.laureat.ref_cli }}</p>
                                </a>
                            </div>
                        </div>

                        <div class="flex gap-2 sm:flex-nowrap flex-wrap items-center basis-auto">
                            <span class="text-sm text-right font-light text-gray-400">{{ rencontre.comm1_renc }}</span>

                            <a @click="handleSendingAttachment(rencontre.laureat.id_cli, 'renc', rencontre.pretendant)" class="relative cursor-pointer group rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                <AtSymbolIcon class="w-5 h-5"/>
                                <span class="w-max group-hover:opacity-100 duration-300 ease-out opacity-0 absolute -top-1 left-1/2 pointer-events-none bg-gray-700 text-white px-4 py-1 rounded-md -translate-y-full -translate-x-1/2">Envoyer un mail</span>
                            </a>

                            <a @click="handlePrint(rencontre.laureat.id_cli, 'renc', rencontre.pretendant)" class="relative cursor-pointer group rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                <PrinterIcon class="w-5 h-5"/>
                                <span class="w-max group-hover:opacity-100 duration-300 ease-out opacity-0 absolute -top-1 left-1/2 pointer-events-none bg-gray-700 text-white px-4 py-1 rounded-md -translate-y-full -translate-x-1/2">Envoyer un courrier</span>
                            </a>
                            <button @click="handleOpeningFiche(rencontre.laureat)" type="button" class="basis-auto grow shrink-0 rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Voir la fiche</button>
                        </div>
                    </div>

                    <span class="z-10 sm:absolute static mx-auto top-1/2 sm:-translate-y-1/2 left-1/2 sm:-translate-x-1/2 w-10 h-10 bg-white ring-1 ring-inset ring-gray-300 rounded-full flex items-center justify-center">
                        <LinkIcon class="w-5 h-5"/>
                    </span>

                    <div class="z-0 relative flex lg:flex-nowrap flex-wrap gap-y-3 lg:gap-y-0 items-center lg:justify-between sm:justify-end justify-center space-x-3 rounded-lg border border-gray-300 bg-white sm:px-6 px-2 py-5 shadow-sm hover:border-gray-400">
                        <div class="flex sm:flex-nowrap flex-wrap items-center gap-2 basis-auto order-2 lg:order-1">
                            <button @click="handleOpeningFiche(rencontre.pretendant)" type="button" class="basis-auto grow shrink-0 rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Voir la fiche</button>
                            <a @click="handleSendingAttachment(rencontre.pretendant.id_cli, 'renc', rencontre.laureat)" class="relative cursor-pointer group rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                <AtSymbolIcon class="w-5 h-5"/>
                                <span class="w-max group-hover:opacity-100 duration-300 ease-out opacity-0 absolute -top-1 left-1/2 pointer-events-none bg-gray-700 text-white px-4 py-1 rounded-md -translate-y-full -translate-x-1/2">Envoyer un mail</span>
                            </a>

                            <a @click="handlePrint(rencontre.pretendant.id_cli, 'renc', rencontre.laureat)" class="relative cursor-pointer group rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                <PrinterIcon class="w-5 h-5"/>
                                <span class="w-max group-hover:opacity-100 duration-300 ease-out opacity-0 absolute -top-1 left-1/2 pointer-events-none bg-gray-700 text-white px-4 py-1 rounded-md -translate-y-full -translate-x-1/2">Envoyer un courrier</span>
                            </a>

                            <span class="text-sm font-light text-gray-400">{{ rencontre.comm_renc }}</span>
                        </div>

                        <div class="flex items-center sm:justify-end justify-center space-x-3 grow shrink-0 basis-auto lg:order-2">
                            <div>
                                <a href="#" class="focus:outline-none">
                                    <p class="text-sm font-medium text-gray-900 text-right" :style="`color: ${setColorName(rencontre.pretendant)}`">{{ rencontre.pretendant.pNoms_cli }} {{ rencontre.pretendant.nom_cli }}</p>
                                    <p class="truncate text-sm text-gray-500 text-right" :style="`color: ${setColorTag(rencontre.pretendant)}`">{{ rencontre.pretendant.ref_cli }}</p>
                                </a>
                            </div>
                            <div class="flex-shrink-0">
                                <img class="h-10 w-10 rounded-full object-cover" @error="handleImageError" :src="`${uri}/storage/img/cli/${rencontre.pretendant.id_cli}.webp`" alt="" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- #region SKELETON -->
            <div class="mt-12" v-else-if="!rencontresLoaded">
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
                        <LinkIcon class="w-5 h-5"/>
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

            <div v-if="rencontres?.length === 0">
                <h3 class="text-center text-gray-300 font-light ">Aucune rencontre corresponde à votre sélection de filtre.</h3>
            </div>

            <!-- #region PAGINATION -->

            <div v-if="rencontres" class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 sticky bottom-0 z-20">
                <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                        <p class="text-sm text-gray-700">
                            <span class="font-medium">{{ 100 * (pageNumber - 1) }}</span>
                            {{ ' ' }}
                            à
                            {{ ' ' }}
                            <span class="font-medium">{{ 100 * (pageNumber) > rencontres_count ? rencontres_count : 100 * (pageNumber)}}</span>
                            {{ ' ' }}
                            sur
                            {{ ' ' }}
                            <span class="font-medium">{{ rencontres_count }}</span>
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
            <!-- #endregion  -->
        </div>
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
    <TransitionRoot as="template" :show="openSidebar">
        <Dialog class="relative z-50" @close="openSidebar = false">
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

    <Toast :state="stateToast" title="E-mail envoyé au client"/>
</template>