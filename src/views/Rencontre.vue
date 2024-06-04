<script setup>
    import { ref } from 'vue';
    import { PrinterIcon, AtSymbolIcon, MagnifyingGlassIcon, ChevronDownIcon, BarsArrowUpIcon, BoltIcon } from '@heroicons/vue/24/outline';
    import { useRouter } from 'vue-router';
    import { useRencontresStore } from '../stores/rencontres';
    import { useClientsStore } from '../stores/clients';
    import moment from "moment";
    import fr from 'moment/dist/locale/fr';
    moment.updateLocale('fr', fr);


    //#region VARIABLES
    const router = useRouter();

    const rencontreStore = useRencontresStore();   
    const clientsStore = useClientsStore();
    const rencontres = ref(null);
    const rencontresLoaded = ref(false);
    const rencontres_count = ref(0);

    const uri = import.meta.env.VITE_URL;

    const pageNumber = ref(1);

    const popupCourrier = ref(false);
    const currentType = ref('');
    const targetClient = ref(null);
    const currentClient = ref(null);
    const isInverse = ref(false);
    const generateBase64Courrier = ref(false);

    const stateToast = ref(false);
    const fallbackImage = `${uri}/storage/img/cli/vide.webp`;
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
        rencontreStore.getRencontres(page)
        .then(res => {
            rencontres.value = res.rencontres;
            rencontres_count.value = res.count;
            rencontresLoaded.value = true;
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
    //#endregion

</script>

<template>
    <div class="px-4 sm:px-6 lg:px-8">
        <div class="border-b border-gray-200 pb-5 sm:flex sm:items-center sm:justify-between mt-12">
            <div>
                <h3 class="text-3xl font-semibold leading-6 text-gray-900">Dernières Rencontres</h3>
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
                        <input type="text" name="desktop-search-candidate" id="desktop-search-candidate" class="hidden w-full rounded-none rounded-l-md border-0 py-1.5 pl-10 text-sm leading-6 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:block" :placeholder="`Rechercher dans ${rencontres_count} clients...`" />
                    </div>
                    <button type="button" class="relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-md px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                        <BarsArrowUpIcon class="-ml-0.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                        Filtrer
                        <ChevronDownIcon class="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
                    </button>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 gap-4 mt-6 h-[75vh] overflow-auto">
            <div v-if="rencontres && rencontresLoaded" class="mt-4" v-for="rencontre in rencontres" :key="rencontre.id_renc">
                <div class="grid gap-8 grid-cols-2 mb-2 relative">
                    <span class="text-sm text-rose-500 text-right">{{ moment(rencontre.dateCre_renc).format('ll') }}</span>
                    <span class="text-sm text-gray-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">-</span>
                    <span class="text-sm text-rose-500 underline">{{ setComment(rencontre.statut_renc) }}</span>
                </div>
                <div class="grid gap-2 grid-cols-2 relative">
                    <div class="z-0 relative flex items-center justify-between space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400">
                        <div class="flex items-center justify-start space-x-3 grow shrink-0 basis-auto">
                            <div class="flex-shrink-0">
                                <img class="h-10 w-10 rounded-full object-cover" @error="handleImageError" :src="`${uri}/storage/img/cli/${rencontre.laureat.id_cli}.webp`" alt="" />
                            </div>
                            <div class="min-w-0 flex-1">
                                <a href="#" class="focus:outline-none">
                                    <p class="text-sm font-medium text-gray-900">{{ rencontre.laureat.pNoms_cli }} {{ rencontre.laureat.nom_cli }}</p>
                                    <p class="truncate text-sm text-gray-500">{{ rencontre.laureat.ref_cli }}</p>
                                </a>
                            </div>
                        </div>

                        <div class="flex gap-2 items-center basis-auto">
                            <span class="text-sm text-right font-light text-gray-400">{{ rencontre.comm1_renc }}</span>

                            <a @click="handleSendingAttachment(rencontre.laureat.id_cli, 'renc', rencontre.pretendant)" class="relative cursor-pointer group rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                <AtSymbolIcon class="w-5 h-5"/>
                                <span class="w-max group-hover:opacity-100 duration-300 ease-out opacity-0 absolute -top-1 left-1/2 pointer-events-none bg-gray-700 text-white px-4 py-1 rounded-md -translate-y-full -translate-x-1/2">Envoyer un mail</span>
                            </a>

                            <a @click="handlePrint(rencontre.laureat.id_cli, 'renc', rencontre.pretendant)" class="relative cursor-pointer group rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-500 hover:text-white sm:block">
                                <PrinterIcon class="w-5 h-5"/>
                                <span class="w-max group-hover:opacity-100 duration-300 ease-out opacity-0 absolute -top-1 left-1/2 pointer-events-none bg-gray-700 text-white px-4 py-1 rounded-md -translate-y-full -translate-x-1/2">Envoyer un courrier</span>
                            </a>
                            <button @click="goToFicheClient(rencontre.laureat.id_cli)" type="button" class="basis-auto grow shrink-0 rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Voir la fiche</button>
                        </div>
                    </div>

                    <span class="z-10 absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-10 h-10 bg-white ring-1 ring-inset ring-gray-300 rounded-full flex items-center justify-center">
                        <BoltIcon class="w-5 h-5"/>
                    </span>

                    <div class="z-0 relative flex items-center justify-between space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400">
                        <div class="flex items-center gap-2 basis-auto">
                            <button @click="goToFicheClient(rencontre.pretendant.id_cli)" type="button" class="basis-auto grow shrink-0 rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Voir la fiche</button>
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

                        <div class="flex items-center justify-end space-x-3 grow shrink-0 basis-auto">
                            <div>
                                <a href="#" class="focus:outline-none">
                                    <p class="text-sm font-medium text-gray-900 text-right">{{ rencontre.pretendant.pNoms_cli }} {{ rencontre.pretendant.nom_cli }}</p>
                                    <p class="truncate text-sm text-gray-500 text-right">{{ rencontre.pretendant.ref_cli }}</p>
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
            <div v-else-if="!rencontresLoaded">
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

            <!-- #region PAGINATION -->
            <div v-if="rencontres" class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 sticky bottom-0 z-20">
                <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                        <p class="text-sm text-gray-700">
                            <span class="font-medium">{{ 100 * (pageNumber - 1) }}</span>
                            {{ ' ' }}
                            à
                            {{ ' ' }}
                            <span class="font-medium">{{ 100 * (pageNumber) > rencontres_count ?  rencontres_count : 100 * (pageNumber)}}</span>
                            {{ ' ' }}
                            sur
                            {{ ' ' }}
                            <span class="font-medium">{{ rencontres_count }}</span>
                            {{ ' ' }}
                            résultats
                        </p>
                    </div>
                    <div>
                        <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                            <a @click="fetchRencontres(n)" v-for="n in Math.ceil(rencontres_count / 100)"  href="#" :class="[pageNumber === n ? 'z-10 bg-rose text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose' : 'hover:bg-gray-50 focus:z-20 focus:outline-offset-0' , 'relative hidden items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 md:inline-flex']" >
                                {{ n }}
                            </a>
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

    <Toast :state="stateToast" title="E-mail envoyé au client"/>
</template>