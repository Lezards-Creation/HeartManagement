<script setup>
import { reactive, ref, computed } from 'vue';
import { PhotoIcon, CheckIcon } from '@heroicons/vue/24/solid'
import { useAgencesStore } from '../stores/agences';
import { useClientsStore } from '../stores/clients';
import { Switch, SwitchGroup, SwitchLabel } from '@headlessui/vue'
import DropZone from '../components/DropZone.vue'
import FilePreview from '../components/FilePreview.vue'
import useFileList from '../compositions/file-list'

// #region VARIABLES

const agenceStore = useAgencesStore();
const clientsStore = useClientsStore();
const { files, addFiles, removeFile } = useFileList()
const current_step = ref('reference');
const step_index = ref(0);

const steps = ref([
    { id: '01', name: 'Données de base', slug: 'reference', status: 'current' },
    { id: '02', name: 'Données personnelles (opt)', slug: 'donnees_personnelles', status: 'upcoming' },
    { id: '03', name: 'Situation / recherche (opt)', slug: 'recherche',status: 'upcoming' },
]);

const dataCreation = ref({
    idAgence_cli: 0,
    ref_cli: '',
    nom_cli: '',
    pNoms_cli: '',
    sexe_cli: '0',
    type_cli : 'adherent',
    duree_cli: 1,
    adr_cli : '',
    cp_cli : '',
    ville_cli : '',
    telPri_cli : '',
    affTelPri_cli : 0,
    telPro_cli : '',
    affTelPro_cli : 0,
    telGsm_cli : '',
    affTelGsm_cli : 0,
    mail_cli : '',
    nl_cli : 0,
    situation_cli: {
        celib_cli: false,
        veuf_cli: false,
        div_cli: false,
        sep_cli: false,
        instDiv_cli: false,
    },
    desCelib_cli: 0,
    desVeuf_cli: 0,
    desDiv_cli: 0,
    desSep_cli: 0,
    desAge_cli_min: 0,
    desAge_cli_max: 0,
    desNbEn_cli: 0,
    desPhy_cli: '',
    desCaract_cli: '',
    desReg_cli: 0,
    desInst_cli: 0,
    desProf_cli: 0,
    desCarctIndisp_cli: '',
    msRech_cli: '_0',
    msRechPrec_cli: '',
});
// #endregion

// #region METHODS

const nextStep = () => {
    steps.value[step_index.value].status = 'complete';
    
    step_index.value = step_index.value === steps.value.length - 1 ? steps.value.length : step_index.value + 1;

    current_step.value = steps.value[step_index.value].status = 'current';
    current_step.value = steps.value[step_index.value].slug;

    console.log(current_step.value)
}

const previousStep = () => {
    steps.value[step_index.value].status = 'upcoming';
    
    step_index.value = steps.value.length > 0 ? step_index.value - 1 : 0;
    
    current_step.value = steps.value[step_index.value].status = 'current';
    current_step.value = steps.value[step_index.value].slug;
    
    console.log(current_step.value)
}

const handleCreationFiche = () => {
    clientsStore.createClient(dataCreation.value, files.value)
    .then(res => console.log(res))
    .catch(err => console.error(err))
}

const onInputChange = (e) => {
    addFiles(e.target.files)
	e.target.value = null
}
// #endregion 

</script>

<template>
    <div class="h-screen flex-1 p-10 overflow-y-auto">
        <nav aria-label="Progress">
            <ol role="list" class="divide-y divide-gray-300 rounded-md border border-gray-300 md:flex md:divide-y-0">
                <li v-for="(step, stepIdx) in steps" :key="step.name" class="relative md:flex md:flex-1">
                    <a v-if="step.status === 'complete'" :href="step.href" class="group flex w-full items-center">
                        <span class="flex items-center px-6 py-4 text-sm font-medium">
                            <span
                                class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-rose-600 group-hover:bg-rose-800">
                                <CheckIcon class="h-6 w-6 text-white" aria-hidden="true" />
                            </span>
                            <span class="ml-4 text-sm font-medium text-gray-900">{{ step.name }}</span>
                        </span>
                    </a>
                    <a v-else-if="step.status === 'current'" :href="step.href"
                        class="flex items-center px-6 py-4 text-sm font-medium" aria-current="step">
                        <span
                            class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-rose-600">
                            <span class="text-rose-600">{{ step.id }}</span>
                        </span>
                        <span class="ml-4 text-sm font-medium text-rose-600">{{ step.name }}</span>
                    </a>
                    <a v-else :href="step.href" class="group flex items-center">
                        <span class="flex items-center px-6 py-4 text-sm font-medium">
                            <span
                                class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-300 group-hover:border-gray-400">
                                <span class="text-gray-500 group-hover:text-gray-900">{{ step.id }}</span>
                            </span>
                            <span class="ml-4 text-sm font-medium text-gray-500 group-hover:text-gray-900">{{ step.name
                                }}</span>
                        </span>
                    </a>
                    <template v-if="stepIdx !== steps.length - 1">
                        <!-- Arrow separator for lg screens and up -->
                        <div class="absolute right-0 top-0 hidden h-full w-5 md:block" aria-hidden="true">
                            <svg class="h-full w-full text-gray-300" viewBox="0 0 22 80" fill="none"
                                preserveAspectRatio="none">
                                <path d="M0 -2L20 40L0 82" vector-effect="non-scaling-stroke" stroke="currentcolor"
                                    stroke-linejoin="round" />
                            </svg>
                        </div>
                    </template>
                </li>
            </ol>
        </nav>

        <form method="POST" @submit.prevent="handleCreationFiche" class="bg-gray-50 p-10 mt-4 rounded-xl">
            <div class="space-y-12">
                <TransitionGroup class="overflow-hidden" tag="div" name="deploy">
                    <div v-if="current_step === 'reference'" class="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12 md:grid-cols-3">
                        <div>
                            <h2 class="text-base font-semibold leading-7 text-gray-900">Référence de la fiche</h2>
                            <p class="mt-1 text-sm leading-6 text-gray-600">Élements de base pour créer et réferencer une fiche client.</p>
                        </div>

                        <div class="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2 bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl px-4 py-6 sm:p-8">
                            <div v-if="agenceStore.agences" class="sm:col-span-full">
                                <label for="idAgence_cli" class="block text-sm font-medium leading-6 text-gray-900">Agence</label>
                                <div class="mt-2">
                                    <select id="idAgence_cli" name="idAgence_cli" v-model="dataCreation.idAgence_cli" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6">
                                        <option v-for="agence in agenceStore.agences" :value="agence.id_agence">
                                            {{ agence.lib_agence }}
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <div class="sm:col-span-full">
                                <label for="ref_cli"
                                    class="block text-sm font-medium leading-6 text-gray-900">Référence</label>
                                <div class="mt-2">
                                    <input type="text" name="ref_cli"
                                        id="ref_cli"
                                        v-model="dataCreation.ref_cli"
                                        required
                                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                </div>
                            </div>

                            <div class="sm:col-span-3">
                                <label for="pNoms_cli"
                                    class="block text-sm font-medium leading-6 text-gray-900">Prénom(s)</label>
                                <div class="mt-2">
                                    <input type="text" name="pNoms_cli"
                                        id="pNoms_cli"
                                        v-model="dataCreation.pNoms_cli"
                                        required
                                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                </div>
                            </div>

                            <div class="sm:col-span-3">
                                <label for="nom_cli" class="block text-sm font-medium leading-6 text-gray-900">Nom de famille</label>
                                <div class="mt-2">
                                    <input type="text" name="nom_cli" id="nom_cli" required v-model="dataCreation.nom_cli"
                                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                </div>
                            </div>

                            <div class="sm:col-span-full">
                                <label for="type_cli" class="block text-sm font-medium leading-6 text-gray-900">Type de contrat</label>
                                <div class="mt-2">
                                    <select id="type_cli" name="type_cli" v-model="dataCreation.type_cli" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6">
                                        <option value="adherent">Nouvel adhérent</option>
                                        <option value="contact">Contact</option>
                                        <option value="prospect">Prospect</option>
                                    </select>
                                </div>
                            </div>

                            <div class="sm:col-span-full" v-if="dataCreation.type_cli === 'adherent'">
                                <label for="duree_cli" class="block text-sm font-medium leading-6 text-gray-900">Durée du contrat</label>
                                <div class="mt-2">
                                    <input type="number" min="1" max="12" name="duree_cli" id="duree_cli" required v-model="dataCreation.duree_cli"
                                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-if="current_step === 'donnees_personnelles'" class="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12 md:grid-cols-3">
                        <div>
                            <h2 class="text-base font-semibold leading-7 text-gray-900">État civil du client</h2>
                        </div>

                        <div class="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2 bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl px-4 py-6 sm:p-8">
                            <div class="col-span-full">
                                <label for="cover-photo" class="block text-sm font-medium leading-6 text-gray-900">Photo de profil</label>
                                
                                <DropZone class="drop-area" @files-dropped="addFiles" #default="{ dropZoneActive }">
                                    <div v-show="!files.length" :class="[dropZoneActive ? 'border-solid border-rose' : 'border-dashed','mt-2 flex justify-center rounded-lg border border-gray-900/25 px-6 py-10']">
                                        <div class="text-center">
                                            <PhotoIcon class="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
                                            <div class="mt-4 flex text-sm leading-6 text-gray-600">
                                                <label for="file-upload" class="relative cursor-pointer rounded-md bg-white font-semibold text-rose-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-rose-600 focus-within:ring-offset-2 hover:text-rose-500">
                                                    <span>Téléverser une image</span>
                                                    <input id="file-upload" @change="onInputChange" name="file-upload" type="file" class="sr-only" />
                                                </label>
                                                <p class="pl-1">ou glisser, déposer</p>
                                            </div>
                                            <p class="text-xs leading-5 text-gray-600">PNG, JPG, GIF jusqu'à 10 Mo</p>
                                        </div>
                                    </div>

                                    <div class="flex justify-center" v-show="files.length">
                                        <FilePreview v-for="file of files" :key="file.id" :file="file" tag="figure" @remove="removeFile" />
                                    </div>
                                </DropZone>
                            </div>

                            <div class="sm:col-span-3">
                                <label for="dateNaiss_cli"
                                    class="block text-sm font-medium leading-6 text-gray-900">Naissance</label>
                                <div class="mt-2">
                                    <input id="dateNaiss_cli" name="dateNaiss_cli" type="date" v-model="dataCreation.dateNaiss_cli"
                                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                </div>
                            </div>
                            <div class="sm:col-span-3">
                                <label for="sexe_cli"
                                    class="block text-sm font-medium leading-6 text-gray-900">Sexe</label>
                                <div class="mt-2">
                                    <select
                                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:max-w-xs sm:text-sm sm:leading-6"
                                        v-model="dataCreation.sexe_cli"
                                        name="sexe_cli"
                                        id="sexe_cli"
                                        >
                                        <option value="0">Inderterminé</option>
                                        <option value="F">Femme</option>
                                        <option value="H">Homme</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 class="text-base font-semibold leading-7 text-gray-900">Adresses</h2>
                        </div>

                        <div class="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2 px-4 py-6 bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl sm:p-8">
                            <div class="col-span-full">
                                <label for="adr_cli"
                                    class="block text-sm font-medium leading-6 text-gray-900">Adresse</label>
                                    <div class="mt-2">
                                        <input type="text" name="adr_cli"
                                            id="adr_cli"
                                            v-model="dataCreation.adr_cli"
                                            class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                    </div>
                            </div>
                            <div class="sm:col-span-2">
                                <label for="cp_cli" class="block text-sm font-medium leading-6 text-gray-900">Code postal</label>
                                <div class="mt-2">
                                    <input type="text" name="cp_cli" id="cp_cli"
                                        v-model="dataCreation.cp_cli"
                                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                </div>
                            </div>
                            <div class="sm:col-span-4">
                                <label for="ville_cli"
                                    class="block text-sm font-medium leading-6 text-gray-900">Ville</label>
                                <div class="mt-2">
                                    <input type="text" name="ville_cli" id="ville_cli"
                                        v-model="dataCreation.ville_cli"
                                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                </div>
                            </div>
                            <div class="sm:col-span-4">
                                <label for="telPri_cli" class="block text-sm font-medium leading-6 text-gray-900">Téléphone privé</label>
                                <div class="mt-2">
                                    <input id="telPri_cli" name="telPri_cli" type="tel"
                                        v-model="dataCreation.telPri_cli"
                                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                </div>
                            </div>
                            <div class="sm:col-span-2 self-end mb-2">
                                <SwitchGroup as="div" class="flex items-center">
                                    <Switch v-model="dataCreation.affTelPri_cli"
                                        :class="[dataCreation.affTelPri_cli ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                        <span aria-hidden="true"
                                            :class="[dataCreation.affTelPri_cli ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                    </Switch>
                                    <SwitchLabel as="span" class="ml-3 text-sm">
                                        <span class="font-medium text-gray-900">Afficher</span>
                                    </SwitchLabel>
                                </SwitchGroup>
                            </div>
                            <div class="sm:col-span-4">
                                <label for="telPro_cli" class="block text-sm font-medium leading-6 text-gray-900">Téléphone pro</label>
                                <div class="mt-2">
                                    <input id="telPro_cli" name="telPro_cli" type="tel"
                                        v-model="dataCreation.telPro_cli"
                                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                </div>
                            </div>
                            <div class="sm:col-span-2 self-end mb-2">
                                <SwitchGroup as="div" class="flex items-center">
                                    <Switch v-model="dataCreation.affTelPro_cli"
                                        :class="[dataCreation.affTelPro_cli ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                        <span aria-hidden="true"
                                            :class="[dataCreation.affTelPro_cli ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                    </Switch>
                                    <SwitchLabel as="span" class="ml-3 text-sm">
                                        <span class="font-medium text-gray-900">Afficher</span>
                                    </SwitchLabel>
                                </SwitchGroup>
                            </div>
                            <div class="sm:col-span-4">
                                <label for="telGsm_cli" class="block text-sm font-medium leading-6 text-gray-900">Numéro de portable</label>
                                <div class="mt-2">
                                    <input id="telGsm_cli" name="telGsm_cli" type="tel"
                                        v-model="dataCreation.telGsm_cli"
                                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                </div>
                            </div>
                            <div class="sm:col-span-2 self-end mb-2">
                                <SwitchGroup as="div" class="flex items-center">
                                    <Switch v-model="dataCreation.affTelGsm_cli"
                                        :class="[dataCreation.affTelGsm_cli ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                        <span aria-hidden="true"
                                            :class="[dataCreation.affTelGsm_cli ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                    </Switch>
                                    <SwitchLabel as="span" class="ml-3 text-sm">
                                        <span class="font-medium text-gray-900">Afficher</span>
                                    </SwitchLabel>
                                </SwitchGroup>
                            </div>
                            <div class="sm:col-span-full">
                                <label for="email" class="block text-sm font-medium leading-6 text-gray-900">Adresse email</label>
                                <div class="mt-2">
                                    <input id="mail_cli" name="mail_cli" type="email"
                                        v-model="dataCreation.mail_cli"
                                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                </div>
                            </div>
                            <div class="sm:col-span-2 self-end mb-2">
                                <SwitchGroup as="div" class="flex items-center">
                                    <Switch v-model="dataCreation.nl_cli"
                                        :class="[dataCreation.nl_cli ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                        <span aria-hidden="true"
                                            :class="[dataCreation.nl_cli ? 'translate-x-5' :  'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                    </Switch>
                                    <SwitchLabel as="span" class="ml-3 text-sm">
                                        <span class="font-medium text-gray-900">Newsletter</span>
                                    </SwitchLabel>
                                </SwitchGroup>
                            </div>
                        </div>
                    </div>

                    <div v-if="current_step === 'recherche'" class="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12 md:grid-cols-3">
                        <div>
                            <h2 class="text-base font-semibold leading-7 text-gray-900">Situation</h2>
                            <p class="mt-1 text-sm leading-6 text-gray-600">Use a permanent address where you can receive
                                mail.
                            </p>
                        </div>

                        <div class="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2 bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl px-4 py-6">
                            <div class="sm:col-span-2 self-end mb-2">
                                <SwitchGroup as="div" class="flex items-center">
                                    <Switch value="1" v-model="dataCreation.situation_cli.celib_cli"
                                        :class="[dataCreation.situation_cli.celib_cli ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                        <span aria-hidden="true"
                                            :class="[dataCreation.situation_cli.celib_cli ? 'translate-x-5' :  'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                    </Switch>
                                    <SwitchLabel as="span" class="ml-3 text-sm">
                                        <span class="font-medium text-gray-900">Célibataire</span>
                                    </SwitchLabel>
                                </SwitchGroup>
                            </div>
                            <div class="sm:col-span-2 self-end mb-2">
                                <SwitchGroup as="div" class="flex items-center">
                                    <Switch v-model="dataCreation.situation_cli.veuf_cli"
                                        :class="[dataCreation.situation_cli.veuf_cli ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                        <span aria-hidden="true"
                                            :class="[dataCreation.situation_cli.veuf_cli ? 'translate-x-5' :  'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                    </Switch>
                                    <SwitchLabel as="span" class="ml-3 text-sm">
                                        <span class="font-medium text-gray-900">Veuf</span>
                                    </SwitchLabel>
                                </SwitchGroup>
                            </div>
                            <div class="sm:col-span-2 self-end mb-2">
                                <SwitchGroup as="div" class="flex items-center">
                                    <Switch v-model="dataCreation.situation_cli.div_cli"
                                        :class="[dataCreation.situation_cli.div_cli ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                        <span aria-hidden="true"
                                            :class="[dataCreation.situation_cli.div_cli ? 'translate-x-5' :  'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                    </Switch>
                                    <SwitchLabel as="span" class="ml-3 text-sm">
                                        <span class="font-medium text-gray-900">Divorcé</span>
                                    </SwitchLabel>
                                </SwitchGroup>
                            </div>
                            <div class="sm:col-span-2 self-end mb-2">
                                <SwitchGroup as="div" class="flex items-center">
                                    <Switch v-model="dataCreation.situation_cli.sep_cli"
                                        :class="[dataCreation.situation_cli.sep_cli ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                        <span aria-hidden="true"
                                            :class="[dataCreation.situation_cli.sep_cli ? 'translate-x-5' :  'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                    </Switch>
                                    <SwitchLabel as="span" class="ml-3 text-sm">
                                        <span class="font-medium text-gray-900">Séparé</span>
                                    </SwitchLabel>
                                </SwitchGroup>
                            </div>
                            <div class="sm:col-span-4 self-end mb-2">
                                <SwitchGroup as="div" class="flex items-center">
                                    <Switch v-model="dataCreation.situation_cli.instDiv_cli"
                                        :class="[dataCreation.situation_cli.instDiv_cli ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                        <span aria-hidden="true"
                                            :class="[dataCreation.situation_cli.instDiv_cli ? 'translate-x-5' :  'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                    </Switch>
                                    <SwitchLabel as="span" class="ml-3 text-sm">
                                        <span class="font-medium text-gray-900">Instance de divorce</span>
                                    </SwitchLabel>
                                </SwitchGroup>
                            </div>
                        </div>

                        <div>
                            <h2 class="text-base font-semibold leading-7 text-gray-900">Qui désirez-vous rencontrer ?</h2>
                            <p class="mt-1 text-sm leading-6 text-gray-600">Use a permanent address where you can receive
                                mail.
                            </p>
                        </div>

                        <div class="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2 bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl px-4 py-6 ">
                            <div class="max-w-2xl space-y-10 col-span-full">
                                <fieldset>
                                    <legend class="text-sm font-semibold leading-6 text-gray-900">Situation</legend>
                                    <div class="mt-6 grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                        <div class="sm:col-span-2 self-end mb-2">
                                            <SwitchGroup as="div" class="flex items-center">
                                                <Switch v-model="dataCreation.desCelib_cli"
                                                    :class="[dataCreation.desCelib_cli  ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                                    <span aria-hidden="true"
                                                        :class="[dataCreation.desCelib_cli ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                                </Switch>
                                                <SwitchLabel as="span" class="ml-3 text-sm">
                                                    <span class="font-medium text-gray-900">Célibataire</span>
                                                </SwitchLabel>
                                            </SwitchGroup>
                                        </div>
                                        <div class="sm:col-span-2 self-end mb-2">
                                            <SwitchGroup as="div" class="flex items-center">
                                                <Switch v-model="dataCreation.desVeuf_cli"
                                                    :class="[dataCreation.desVeuf_cli ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                                    <span aria-hidden="true"
                                                        :class="[dataCreation.desVeuf_cli ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                                </Switch>
                                                <SwitchLabel as="span" class="ml-3 text-sm">
                                                    <span class="font-medium text-gray-900">Veuf</span>
                                                </SwitchLabel>
                                            </SwitchGroup>
                                        </div>
                                        <div class="sm:col-span-2 self-end mb-2">
                                            <SwitchGroup as="div" class="flex items-center">
                                                <Switch v-model="dataCreation.desDiv_cli"
                                                    :class="[dataCreation.desDiv_cli ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                                    <span aria-hidden="true"
                                                        :class="[dataCreation.desDiv_cli ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                                </Switch>
                                                <SwitchLabel as="span" class="ml-3 text-sm">
                                                    <span class="font-medium text-gray-900">Divorcé</span>
                                                </SwitchLabel>
                                            </SwitchGroup>
                                        </div>
                                        <div class="sm:col-span-2 self-end mb-2">
                                            <SwitchGroup as="div" class="flex items-center">
                                                <Switch v-model="dataCreation.desSep_cli"
                                                    :class="[dataCreation.desSep_cli ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                                    <span aria-hidden="true"
                                                        :class="[dataCreation.desSep_cli ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                                </Switch>
                                                <SwitchLabel as="span" class="ml-3 text-sm">
                                                    <span class="font-medium text-gray-900">Séparé</span>
                                                </SwitchLabel>
                                            </SwitchGroup>
                                        </div>
                                    </div>
                                </fieldset>
                                <fieldset>
                                    <div class="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                        <div class="sm:col-span-3">
                                            <label for="desAge_cli_min"
                                                class="block text-sm font-medium leading-6 text-gray-900">Age minimum</label>
                                            <div class="mt-2">
                                                <input type="text"
                                                    name="desAge_cli_min" id="ldesAge_cli_min" v-model="dataCreation.desAge_cli_min"
                                                    class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                            </div>
                                        </div>
                                        <div class="sm:col-span-3">
                                            <label for="desAge_cli_max"
                                                class="block text-sm font-medium leading-6 text-gray-900">Age
                                                maximum</label>
                                            <div class="mt-2">
                                                <input type="text"
                                                    name="desAge_cli_max" id="desAge_cli_max" v-model="dataCreation.desAge_cli_max"
                                                    class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                            </div>
                                        </div>
                                        <div class="sm:col-span-3">
                                            <label for="desNbEn_cli"
                                                class="block text-sm font-medium leading-6 text-gray-900">Nombre d'enfants
                                                acceptés</label>
                                            <div class="mt-2">
                                                <select id="desNbEn_cli" name="desNbEn_cli" v-model="dataCreation.desNbEn_cli"
                                                    class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:max-w-xs sm:text-sm sm:leading-6">
                                                    <option value="0">Indéterminé</option>
                                                    <option value="1">Sans</option>
                                                    <option value="2">Pas d'importance</option>
                                                    <option value="3">Avec</option>
                                                    <option value="4">1</option>
                                                    <option value="5">Jusqu'à 2</option>
                                                    <option value="6">Jusqu'à 3</option>
                                                    <option value="7">4 et plus</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div class="col-span-full">
                                            <label for="desPhy_cli"
                                                class="block text-sm font-medium leading-6 text-gray-900">Allure physique</label>
                                            <div class="mt-2">
                                                <textarea id="desPhy_cli" name="desPhy_cli" rows="3" v-model="dataCreation.desPhy_cli"
                                                    class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                            </div>
                                        </div>
                                        <div class="col-span-full">
                                            <label for="desCaract_cli"
                                                class="block text-sm font-medium leading-6 text-gray-900">Caractère</label>
                                            <div class="mt-2">
                                                <textarea id="desCaract_cli" name="desCaract_cli" v-model="dataCreation.desCaract_cli"
                                                    rows="3"
                                                    class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                            </div>
                                        </div>
                                        <div class="sm:col-span-full self-end mb-2">
                                            <SwitchGroup as="div" class="flex items-center">
                                                <Switch v-model="dataCreation.desReg_cli"
                                                    :class="[dataCreation.desReg_cli ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                                    <span aria-hidden="true"
                                                        :class="[dataCreation.desReg_cli ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                                </Switch>
                                                <SwitchLabel as="span" class="ml-3 text-sm">
                                                    <span class="font-medium text-gray-900">Exclusivement dans la région</span>
                                                </SwitchLabel>
                                            </SwitchGroup>
                                        </div>
                                        <div class="sm:col-span-3">
                                            <label for="desInst_cli"
                                                class="block text-sm font-medium leading-6 text-gray-900">Degré
                                                d'instruction</label>
                                            <div class="mt-2">
                                                <select id="desInst_cli" name="desInst_cli" v-model="dataCreation.desInst_cli"
                                                    class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:max-w-xs sm:text-sm sm:leading-6">
                                                    <option value="0">Indéterminé</option>
                                                    <option value="1">Au moins primaire</option>
                                                    <option value="2">Au moins secondaire</option>
                                                    <option value="3">Au moins Bac à Bac +3</option>
                                                    <option value="4">Bac +3 et plus</option>
                                                    <option value="5">Sans importance</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div class="sm:col-span-3">
                                            <label for="desProf_cli"
                                                class="block text-sm font-medium leading-6 text-gray-900">Profession</label>
                                            <div class="mt-2">
                                                <select id="desProf_cli" name="desProf_cli" v-model="dataCreation.desProf_cli"
                                                    class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:max-w-xs sm:text-sm sm:leading-6">
                                                    <option value="0">Indéterminé</option>
                                                    <option value="1">Sans importance</option>
                                                    <option value="2">En activité</option>
                                                    <option value="3">Retraité</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div class="col-span-full">
                                            <label for="desCarctIndisp_cli"
                                                class="block text-sm font-medium leading-6 text-gray-900">Caractéristiques indispensables</label>
                                            <div class="mt-2">
                                                <textarea id="desCarctIndisp_cli" name="desCarctIndisp_cli" v-model="dataCreation.desCarctIndisp_cli"
                                                    rows="3"
                                                    class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                            </div>
                                        </div>
                                        <div class="sm:col-span-3">
                                            <label for="msRech_cli" class="block text-sm font-medium leading-6 text-gray-900">Milieu social recherché</label>
                                            <div class="mt-2">
                                                <select id="msRech_cli" name="msRech_cli" v-model="dataCreation.msRech_cli"
                                                    class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:max-w-xs sm:text-sm sm:leading-6">
                                                    <option value="_0">Bon</option>
                                                    <option value="_1">Moyen</option>
                                                    <option value="_2">Modeste</option>
                                                    <option value="_3">Autre</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div class="sm:col-span-3">
                                            <label for="msRechPrec" class="block text-sm font-medium leading-6 text-gray-900">Précisions</label>
                                            <div class="mt-2">
                                                <input type="text" name="msRechPrec_cli" id="msRechPrec_cli" v-model="dataCreation.msRechPrec_cli"
                                                    class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                            </div>
                                        </div>
                                    </div>
                                </fieldset>
                            </div>
                        </div>
                    </div>
                </TransitionGroup>
            </div>

            <div class="flex justify-between items-center mt-6">
                <span class="text-xs text-rose tracking-wide">Vous pouvez finaliser à tout moment le dossier, seulement la première étape est nécessaire pour la validation.</span>
                <div class="flex items-center justify-end gap-x-6">
                    <button v-if="step_index > 0" type="button" class="text-sm font-semibold leading-6 text-gray-900" @click="previousStep">Précedent</button>
                    <button v-if="step_index !== steps.length - 1" type="button" class="text-sm font-semibold leading-6 text-gray-900 hover:text-rose-500 duration-300 ease-out" @click="nextStep">Suivant</button>
                    <button type="submit" class="rounded-md bg-rose-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 duration-300 ease-out">Finaliser</button>
                </div>
            </div>
        </form>
    </div>
</template>

<style scoped>
    .deploy-enter-active,
    .deploy-leave-active {
        transition: all 0.5s ease;
    }

    .deploy-enter-from,
    .deploy-leave-to {
        opacity: 0;
        height: 0;
        padding: 0;
    }
</style>