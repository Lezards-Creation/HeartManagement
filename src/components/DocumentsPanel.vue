<script setup>
	import { computed, ref, onMounted, watch } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import { useDocumentsStore } from '../stores/documents'
    import { Menu, MenuButton, MenuItems, MenuItem,  TransitionRoot, TransitionChild, Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'
    import { ChevronDownIcon } from '@heroicons/vue/20/solid'
    import DropZone from './DropZone.vue';
    import FilesListPreview from './FilesListPreview.vue';
    import useFileList from '../compositions/file-list'
    
    const uri = import.meta.env.VITE_URL;
    const props = defineProps(['client']);
    const { files, addFiles, removeFile } = useFileList()

    const isOpen = ref(false);
    const currentModel = ref({});
    const pdf_model = ref({
        portrait: {
            model: 'portrait',
            input_list: [
                {
                    label: 'Nom / Prénom',
                    name: 'nom_prenom',
                    type: 'text',
                    value: '',
                },
                {
                    label: 'Référence',
                    name: 'ref',
                    type: 'text',
                    value: '',
                },
                {
                    label: 'Age',
                    name: 'age',
                    type: 'text',
                    value: '',
                },
                {
                    label: 'Né(e) le',
                    name: 'naissance',
                    type: 'date',
                    value: '01/01/2024',
                },
                {
                    label: 'Nationalité',
                    name: 'nationalite',
                    type: 'text',
                    value: '',
                },
                {
                    label: 'CVDS',
                    name: 'cvds',
                    type: 'text',
                    value: '',
                },
                {
                    label: 'Fumeur',
                    name: 'fumeur',
                    type: 'checkbox',
                    value: '',
                },
                {
                    label: 'Enfants',
                    name: 'enfants',
                    type: 'number',
                    value: 0,
                },
                {
                    label: 'F(âges)',
                    name: 'f_ages',
                    type: 'text',
                    value: '',
                },
                {
                    label: 'G(âges)',
                    name: 'g_ages',
                    type: 'text',
                    value: '',
                },
                {
                    label: 'À charge',
                    name: 'a_charge',
                    type: 'checkbox',
                    value: '',
                },
                {
                    label: 'Tendances politiques',
                    name: 'tendances',
                    type: 'text',
                    value: '',
                },
                {
                    label: 'Religion',
                    name: 'religion',
                    type: 'text',
                    value: '',
                },
                {
                    label: 'Code',
                    name: 'code',
                    type: 'text',
                    value: '',
                },
                {
                    label: 'Profession',
                    name: 'profession',
                    type: 'text',
                    value: '',
                },
                {
                    label: 'Revenus',
                    name: 'revenus',
                    type: 'text',
                    value: '',
                },
                {
                    label: 'Horaires',
                    name: 'horaires',
                    type: 'text',
                    value: '',
                },
                {
                    label: 'Instruction',
                    name: 'instruction',
                    type: 'text',
                    value: '',
                },
                {
                    label: 'Voiture',
                    name: 'voiture',
                    type: 'text',
                    value: '',
                },
                {
                    label: 'Permis',
                    name: 'permis',
                    type: 'text',
                    value: '',
                },
                {
                    label: 'Logement',
                    name: 'logement',
                    type: 'text',
                    value: '',
                },
                {
                    label: 'Taille',
                    name: 'taille',
                    type: 'text',
                    value: '',
                },
                {
                    label: 'Poids',
                    name: 'poids',
                    type: 'text',
                    value: '',
                },
                {
                    label: 'Cheveux',
                    name: 'cheveux',
                    type: 'text',
                    value: '',
                },
                {
                    label: 'Yeux',
                    name: 'yeux',
                    type: 'text',
                    value: '',
                },
                {
                    label: 'Santé',
                    name: 'sante',
                    type: 'text',
                    value: '',
                },
                {
                    label: 'Lunettes',
                    name: 'lunettes',
                    type: 'text',
                    value: '',
                },
                {
                    label: 'Caractère',
                    name: 'caractere',
                    type: 'textarea',
                    value: '',
                },
                {
                    label: 'Goûts / loisirs',
                    name: 'gouts',
                    type: 'textarea',
                    value: '',
                },
                {
                    label: 'Milieu d\'éducation',
                    name: 'education',
                    type: 'textarea',
                    value: '',
                },
                {
                    type: 'title',
                    label: 'Profil recherché'
                },
                {
                    label: 'Age de',
                    name: 'age_1',
                    type: 'text',
                    value: '',
                },
                {
                    label: 'à',
                    name: 'age_2',
                    type: 'text',
                    value: '',
                },
                {
                    label: 'Célibataire',
                    name: 'celibataire',
                    type: 'text',
                    value: '',
                },
                {
                    label: 'Veuf(ve)',
                    name: 'veuf',
                    type: 'text',
                    value: '',
                },
                {
                    label: 'Divorcé(e)',
                    name: 'divorce',
                    type: 'text',
                    value: '',
                },
                {
                    label: 'Séparé(e)',
                    name: 'separe',
                    type: 'text',
                    value: '',
                },
                {
                    label: 'Avec enfants',
                    name: 'avec_enfants',
                    type: 'text',
                    value: '',
                },
                {
                    label: 'À charge',
                    name: 'a_charge_2',
                    type: 'text',
                    value: '',
                },
                {
                    label: 'Allure et physique',
                    name: 'allure',
                    type: 'textarea',
                    value: '',
                },
                {
                    label: 'Caractère',
                    name: 'caractere_2',
                    type: 'textarea',
                    value: '',
                },
                {
                    label: 'Degré d\'instruction',
                    name: 'instruction_2',
                    type: 'text',
                    value: '',
                },
                {
                    label: 'Profession',
                    name: 'profession_2',
                    type: 'text',
                    value: '',
                },
                {
                    label: 'Milieu social',
                    name: 'milieu_social',
                    type: 'text',
                    value: '',
                },
                {
                    label: 'Caractéristiques indispensables à toute rencontre',
                    name: 'indispensables',
                    type: 'text',
                    value: '',
                },
            ],
            format: 'L'
        },
        additif_vip: {
            input_list: {

            },
            format: 'P'
        }
    })

    const documentsStore = useDocumentsStore();

    const documents = ref([]); // Use ref to make documents reactive
    const documentsLoaded = ref(false);
    
    const fetchDocuments = () => {
        documentsLoaded.value = false
        documentsStore.getDocuments(props.client)
        .then(res => {
            documents.value = res.files;
            documentsLoaded.value = true;
        })
        .catch(err => {
            documentsLoaded.value = true;
            console.error(err);
        }) 
    }

    const uploadDocs = () => {
        documentsStore.addDocuments(files.value, props.client)
        .then(res => {
            files.value = [];
            fetchDocuments();
        })
        .catch(err => console.error(err))
    }

    const onInputChange = (e) => {
        addFiles(e.target.files)
        e.target.value = null
    }

    const deleteDoc = (name) => {
        documentsStore.deleteDocument(name, props.client)
        .then(res => {
            fetchDocuments();
        })
        .catch(err => console.error(err)) 
    }

    const openModal = (model) => {
        isOpen.value = true;
        currentModel.value = pdf_model.value[model];
    }

    const generatePDF = () => {
        documentsStore.createDocument(currentModel.value.model, currentModel.value.input_list)
        .then(res => {
            if(res.url){
                window.open(res.url)
            }
        })
        .catch(err => console.error(err))
    }

    const closeModal = () => {
        isOpen.value = false;
        currentModel.value = '';
    }

    watch(() => props.client, fetchDocuments, {immediate: true})
</script>

<template>
    <div class="overflow-hidden">
        <ul v-if="documents.length > 0" role="list" class="divide-y divide-gray-200">
            <li v-for="document in documents"
                class="flex items-center justify-between gap-x-6 py-5">
                <div class="min-w-0">
                    <div class="flex items-start gap-x-3">
                        <p class="text-sm font-semibold leading-6 text-gray-900">{{ document.name }}</p>
                    </div>
                    <div class="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500">
                        <p class="whitespace-nowrap">
                            Taille
                        </p>
                        <svg viewBox="0 0 2 2" class="h-0.5 w-0.5 fill-current">
                            <circle cx="1" cy="1" r="1" />
                        </svg>
                        <p class="truncate">{{ (document.size / 1048576).toFixed(2)}} Mo</p>
                    </div>
                </div>
                <div class="flex flex-none items-center gap-x-4">
                    <a :download="`${document.name}`" :href="`${uri}/storage/documents/${client}/${document.name}`" class="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:block">Télécharger</a>
                    <a target="_blank" :href="`${uri}/storage/documents/${client}/${document.name}`" class="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:block">Visionner</a>
                    <a @click="deleteDoc(document.name)" class="hidden rounded-md bg-rose px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-600 sm:block">Supprimer</a>
                </div>
            </li>
        </ul>
        
        <div v-else-if="documentsLoaded">
            <p class="text-gray-400 text-2xl text-center py-4">Aucun documents...</p>
        </div>
        <ul v-else>
            <SkeletonRow />
        </ul>

        <DropZone class="drop-area" @files-dropped="addFiles" #default="{ dropZoneActive }">
            <div v-show="!files.length" :class="[dropZoneActive ? 'border-solid border-rose' : 'border-dashed','mt-2 flex justify-center rounded-lg border border-gray-900/25 px-6 py-10']">
                <div class="text-center">
                    <PhotoIcon class="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
                    <div class="mt-4 flex text-sm leading-6 text-gray-600">
                        <label for="file-upload" class="relative cursor-pointer rounded-md bg-white font-semibold text-rose-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-rose-600 focus-within:ring-offset-2 hover:text-rose-500">
                            <span>Téléverser un document</span>
                            <input id="file-upload" @change="onInputChange" name="file-upload" type="file" class="sr-only" />
                        </label>
                        <p class="pl-1">ou glisser, déposer</p>
                    </div>
                    <p class="text-xs leading-5 text-gray-600">PDF, PNG, JPG, DOCX, jusqu'à 10 Mo...</p>
                </div>
            </div>

            <ul v-show="files.length">
                <FilesListPreview v-for="file of files" :key="file.id" :file="file" tag="li" @remove="removeFile" />
            </ul>
        </DropZone>
        <div v-if="files.length" class="mt-5 gap-x-2 flex items-center justify-center mb-10">
            <button type="button" class="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Annuler</button>
            <button @click="uploadDocs" type="button" class="rounded-md bg-rose px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm">Valider</button>
        </div>
    </div>

    <Menu as="div" class="relative inline-block text-left mt-10">
        <div>
            <MenuButton class="inline-flex w-full justify-center rounded-md bg-rose px-4 py-2 text-sm font-medium text-white hover:bg-rose/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75">
                Générer un document
                <ChevronDownIcon class="-mr-1 ml-2 h-5 w-5 text-violet-200 hover:text-violet-100" aria-hidden="true" />
            </MenuButton>
        </div>

        <transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
            <MenuItems class="absolute left-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                <div class="px-1 py-1">
                    <MenuItem v-slot="{ active }">
                        <button type="button" :class="[ active ? 'bg-rose-500 text-white' : 'text-gray-900', 'group flex w-full items-center rounded-md px-2 py-2 text-sm']">
                            Additif VIP
                        </button>
                    </MenuItem>
                    <MenuItem v-slot="{ active }">
                        <button type="button" :class="[active ? 'bg-rose-500 text-white' : 'text-gray-900','group flex w-full items-center rounded-md px-2 py-2 text-sm',]">
                            Contrat d'adhésion
                        </button>
                    </MenuItem>
                    <MenuItem v-slot="{ active }">
                        <button type="button" :class="[active ? 'bg-rose-500 text-white' : 'text-gray-900','group flex w-full items-center rounded-md px-2 py-2 text-sm',]">
                            Contrat de crédit
                        </button>
                    </MenuItem>
                    <MenuItem v-slot="{ active }">
                        <button type="button" :class="[active ? 'bg-rose-500 text-white' : 'text-gray-900','group flex w-full items-center rounded-md px-2 py-2 text-sm',]">
                            Pré-requis adhérent
                        </button>
                    </MenuItem>
                    <MenuItem v-slot="{ active }">
                        <button type="button" :class="[active ? 'bg-rose-500 text-white' : 'text-gray-900','group flex w-full items-center text-left rounded-md px-2 py-2 text-sm',]">
                            Information préalable du consommateur
                        </button>
                    </MenuItem>
                    <MenuItem v-slot="{ active }">
                        <button type="button" :class="[active ? 'bg-rose-500 text-white' : 'text-gray-900','group flex w-full items-center text-left rounded-md px-2 py-2 text-sm',]">
                            Information précontractuelles Européene
                        </button>
                    </MenuItem>
                    <MenuItem v-slot="{ active }">
                        <button type="button" :class="[active ? 'bg-rose-500 text-white' : 'text-gray-900','group flex w-full items-center text-left rounded-md px-2 py-2 text-sm',]">
                            Rappel rencontre
                        </button>
                    </MenuItem>
                    <MenuItem v-slot="{ active }">
                        <button @click="openModal('portrait')" type="button" :class="[active ? 'bg-rose-500 text-white' : 'text-gray-900','group flex w-full items-center text-left rounded-md px-2 py-2 text-sm',]">
                            Portrait à compléter
                        </button>
                    </MenuItem>
                </div>
            </MenuItems>
        </transition>
    </Menu>

    <TransitionRoot appear :show="isOpen" as="template">
        <Dialog as="div" @close="closeModal" class="relative z-[999999]">
        <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
            <div class="fixed inset-0 bg-black/25" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
            <div class="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
                <DialogPanel class="w-full max-w-[85vw] transform overflow-hidden rounded-md bg-white p-12 text-left align-middle shadow-xl transition-all">
                <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
                    Génération d'un document
                    <p class="text-sm text-gray-500">Veuillez remplir le formulaire afin de renseigner les informations nécessaires pour la génération du document téléchargeable.</p>
                </DialogTitle>

                <form @submit.prevent="generatePDF" class="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-12 items-end" action="">
                    <div v-for="input in currentModel.input_list" :class="[input.type === 'textarea' ? 'sm:col-span-6' : input.type === 'title' ? 'col-span-full' : 'sm:col-span-3', 'col-span-full']">
                        <div v-if="input.type === 'textarea'">    
                            <label :for="input.name" class="block text-sm/6 font-medium text-gray-900">{{ input.label }}</label>
                            <div class="mt-2">
                                <textarea v-model="input.value" rows="2" maxlength="130" :name="input.name" :id="input.name" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose sm:text-sm/6"></textarea>
                            </div>
                        </div>

                        <div v-if="input.type === 'checkbox'" class="relative flex gap-x-3">
                            <div class="flex h-6 items-center">
                                <input v-model="input.value" :id="input.name" :name="input.name" type="checkbox" class="size-4 rounded border-gray-300 text-rose focus:ring-rose">
                            </div>
                            <div class="text-sm/6">
                                <label :for="input.name" class="font-medium text-gray-900">{{input.label}}</label>
                            </div>
                        </div>

                        <h2 v-if="input.type === 'title'" class="text-base/7 font-semibold text-gray-900 border-b border-gray-900/10 sm:pb-2 mt-4">{{ input.label }}</h2>

                        <div v-if="input.type === 'text' || input.type === 'number' || input.type === 'email' || input.type === 'date'">
                            <label :for="input.name" class="block text-sm/6 font-medium text-gray-900">{{ input.label }}</label>
                            <div class="mt-2">
                                <input v-model="input.value" :type="input.type" :name="input.name" :id="input.name" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose sm:text-sm/6">
                            </div>
                        </div>
                    </div>
                    <div class="mt-4 space-x-2 col-span-full">
                        <button @click="closeModal" type="button" class="inline-flex justify-center rounded-md border border-transparent bg-rose px-4 py-2 text-sm font-medium text-white hover:bg-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2" >
                            Annuler
                        </button>
                        <button type="submit" class="inline-flex justify-center rounded-md border border-transparent bg-rose px-4 py-2 text-sm font-medium text-white hover:bg-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2" >
                            Générer le document
                        </button>
                    </div>
                </form>
                </DialogPanel>
            </TransitionChild>
            </div>
        </div>
        </Dialog>
    </TransitionRoot>
</template>