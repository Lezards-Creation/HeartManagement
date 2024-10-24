<script setup>
    import { computed, ref, watch, onMounted } from 'vue';
    import { useRoute } from 'vue-router';
    import { useClientsStore } from '../stores/clients';
    import { useAgencesStore } from '../stores/agences';
    import { CheckIcon } from '@heroicons/vue/24/outline';
    import { useUserStore } from '../stores/user';
    import StarterKit from '@tiptap/starter-kit';
	import { useEditor, EditorContent } from '@tiptap/vue-3';
    import { Switch, SwitchGroup, SwitchLabel } from '@headlessui/vue';

    import DropZone from '../components/DropZone.vue';
    import FilePreview from '../components/FilePreview.vue';
    import useFileList from '../compositions/file-list';

    //#region VARIABLES
    const emit = defineEmits(['updateImage'])
    const route = useRoute();
    const uri = import.meta.env.VITE_URL;
    const props = defineProps(['client']);
    const clientsStore = useClientsStore()
    const agencesStore = useAgencesStore();
    const userStore = useUserStore();
    const fallbackImage = `${uri}/storage/img/cli/vide.webp`;
    const agences = ref(null);
    const active_tab = ref('Profil');
    const updatingPhoto = ref(false);

    const tabs = ref([]);
    const isReadOnly = ref(false);

    const { files, addFiles, removeFile } = useFileList()
    //#endregion

    //#region METHODS
    const current_user = ref(null)

    const imageSource = ref(null);
    const editorAnn1 = useEditor({
		extensions: [
			StarterKit,
		],
		content: '',
		onUpdate: () => {
			current_user.value.ann1_cli = editorAnn1.value.getHTML();
            debouncedFunction()
		}
	})

	const editorAnn2 = useEditor({
		extensions: [
			StarterKit,
		],
		content: '',
		onUpdate: () => {
			current_user.value.ann2_cli = editorAnn2.value.getHTML();
            debouncedFunction()
		}
	})
    
	function handleImageError(event) {
		event.target.src = fallbackImage;
	}

    const fetchAgences = () => {
        agencesStore.getAgences()
        .then(res => agences.value = res.agences)
        .catch(err => console.err(err));
    }
    fetchAgences();

    function debounce(func, delay) {
        let timerId;
        
        return function() {
            const context = this;
            const args = arguments;
            
            clearTimeout(timerId);
            timerId = setTimeout(() => {
                func.apply(context, args);
            }, delay);
        };
    }
    
    const handleUpdateClient = (e) => {
        let target;
        if(e){
            target = e.target;
        }
        
        clientsStore.updateClient(current_user.value, files.value)
        .then(res => {
            if(target){
                target.classList.add('updated');
                
                setTimeout(() => {
                    target.classList.remove('updated');
                }, 2500)
            }
            imageSource.value = `${uri}/storage/img/cli/${current_user.value.id_cli}.webp?` + new Date().getTime();
            emit('updateImage')
        })
        .catch(err => console.error(err))
    }

    const debouncedFunction = debounce(handleUpdateClient, 1000);

    const onInputChange = (e) => {
        addFiles(e.target.files)
        e.target.value = null
    }

	const handleGetClient = () => {
		clientsStore.getClient(route.params.id)
		.then(res => {
			current_user.value = res.client
            current_user.value.situation_cli = JSON.parse(res.client.situation_cli);

			imageSource.value = `${uri}/storage/img/cli/${current_user.value.id_cli}.webp?` + new Date().getTime()

            editorAnn1.value.commands.setContent(current_user.value.ann1_cli);
            editorAnn2.value.commands.setContent(current_user.value.ann2_cli);

            if(!isFromAgence(res.client).can){
                isReadOnly.value = true;
                tabs.value = [
                    { name: 'Profil', href: '#' },
                    { name: 'Situation', href: '#' },
                    { name: 'Physique', href: '#' },
                    { name: 'Psychologie et morale', href: '#' },
                    { name: 'Annonces', href: '#' },
                    { name: 'Autres', href: '#' },
                ]
            } else {
                isReadOnly.value = false;
                tabs.value = [
                    { name: 'Profil', href: '#' },
                    { name: 'Situation', href: '#' },
                    { name: 'Physique', href: '#' },
                    { name: 'Psychologie et morale', href: '#' },
                    { name: 'Annonces', href: '#' },
                    { name: 'Autres', href: '#' },
                    { name: 'Rencontres', href: '#' },
                    { name: 'Documents', href: '#' },
                ]
            }
		})
	}

    const isFromAgence = (client) => {
		if(userStore.userLog.agences.includes(client.idAgence_cli)){
			return {name: client.pNoms_cli + ' ' + client.nom_cli, can: true};
		} else {
			let formattedNomCli = client.nom_cli.substring(0, 3) + '*'.repeat(client.nom_cli.length - 3);
			return {name: formattedNomCli, can: false};
		}
	} 

    watch(() => route.params.id, handleGetClient, {immediate: true})
    //#endregion 
</script>

<script>
export default {
    directives: {
        readonly: {
        mounted(el, binding) {
            // If the binding value (isReadOnly) is true, set the fields to readonly
            if (binding.value) {
            const inputs = el.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                input.setAttribute('readonly', 'readonly');
                input.setAttribute('disabled', 'disabled');
            });
            }
        },
        updated(el, binding) {
            // On update, toggle readonly status based on the binding value
            const inputs = el.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                if (binding.value) {
                    input.setAttribute('readonly', 'readonly');
                    input.setAttribute('disabled', 'disabled');
                } else {
                    input.removeAttribute('readonly');
                    input.removeAttribute('disabled', 'disabled');
                }
            });
        }
        }
    }
    };
</script>

<template>
    <div class="relative border-b border-gray-200 pb-5 sm:pb-0">
        <div>
            <div class="xl:hidden">
                <label for="current-tab" class="sr-only">Select a tab</label>
                <select @change="(e) => active_tab = e.target.value"  id="current-tab" name="current-tab" class="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600">
                    <option v-for="tab in tabs" :key="tab.name" :selected="tab.name" :value="tab.name">{{ tab.name }}</option>
                </select>
            </div>
            
            <div class="hidden xl:block">
                <nav class="-mb-px flex space-x-8">
                    <a @click="active_tab = tab.name" v-for="tab in tabs" :key="tab.name" :href="tab.href"
                        :class="[active_tab == tab.name  ? 'border-rose-500 text-rose-600' : 'border-transparent text-gray-500 ', 'hover:border-gray-300 hover:text-gray-700 whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium']"
                        :aria-current="active_tab == tab.name  ? 'page' : undefined">{{ tab.name }}</a>
                </nav>
            </div>
        </div>
    </div>

    <form v-readonly="isReadOnly" method="POST" v-if="current_user" @change="handleUpdateClient">
        <div class="space-y-10 mt-10" v-if="active_tab === 'Profil'">
            <div class="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
                <div class="px-4 sm:px-0">
                    <h2 class="text-base font-semibold leading-7 text-gray-900">Etat civil</h2>
                    <p class="mt-1 text-sm leading-6 text-gray-600">Information publiques du client, utilisées sur sa fiche publique et pouvant être partagées aux autres clients.</p>
                </div>
                <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
                    <div class="px-4 py-6 sm:p-8">
                        <div class="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            <div class="col-span-full flex">
                                <div v-if="!updatingPhoto" class="photo overflow-hidden rounded-xl shadow-xl mt-0 mb-3 max-w-xs">
                                    <img @error="event => handleImageError(event)" class="w-full h-auto" :src="imageSource" alt="" loading="lazy" />
                                </div>
                                <DropZone v-else class="drop-area" @files-dropped="addFiles" #default="{ dropZoneActive }">
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
                                <div class="droite p-10">
                                    <label for="photo" class="block text-sm font-medium leading-6 text-gray-900">Photo</label>
                                    <div class="mt-2 flex items-center gap-x-3">
                                        <button v-if="!updatingPhoto && isFromAgence(current_user).can" @click="() => updatingPhoto = true" type="button" class="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Modifier</button>
                                        <button v-else-if="isFromAgence(current_user).can" @click="() => {updatingPhoto = false; handleUpdateClient()}" type="button" class="rounded-md bg-rose px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm">Valider</button>
                                    </div>
                                </div>
                            </div>
                            <div class="sm:col-span-3">
                                <label for="pNoms_cli"
                                    class="block text-sm font-medium leading-6 text-gray-900">Prénom(s)</label>
                                <div class="mt-2">
                                    <input type="text" v-model="current_user.pNoms_cli" name="pNoms_cli"
                                        id="pNoms_cli"
                                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                    <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                </div>
                            </div>
                            <div class="sm:col-span-3">
                                <label for="nom_cli" class="block text-sm font-medium leading-6 text-gray-900">Nom de famille</label>
                                <div class="mt-2">
                                    <input v-if="isFromAgence(current_user).can" type="text" v-model="current_user.nom_cli" name="nom_cli" id="nom_cli"
                                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                    <input v-else type="text" :value="isFromAgence(current_user).name" name="nom_cli" id="nom_cli"
                                    class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                    <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                </div>
                            </div>
                            <div class="sm:col-span-3">
                                <label for="dateNaiss_cli"
                                    class="block text-sm font-medium leading-6 text-gray-900">Naissance</label>
                                <div class="mt-2">
                                    <input id="dateNaiss_cli" v-model="current_user.dateNaiss_cli" name="dateNaiss_cli" type="date"
                                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                    <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                </div>
                            </div>
                            <div class="sm:col-span-3">
                                <label for="sexe_cli"
                                    class="block text-sm font-medium leading-6 text-gray-900">Sexe</label>
                                <div class="mt-2">
                                    <select v-model="current_user.sexe_cli" name="sexe_cli" id="sexe_cli"
                                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:max-w-xs sm:text-sm sm:leading-6">
                                        <option value="0">Indeterminé</option>
                                        <option value="F">Femme</option>
                                        <option value="H">Homme</option>
                                    </select>
                                    <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                </div>
                            </div>
                            <div class="sm:col-span-3">
                                <label for="website"
                                    class="block text-sm font-medium leading-6 text-gray-900">Religion</label>
                                <div class="mt-2">
                                    <div
                                        class="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-rose-600 sm:max-w-md">
                                        <input v-model="current_user.reli_cli" type="text" name="website" id="website"
                                            class="block flex-1 border-0 bg-transparent py-1.5 pl-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                                            placeholder="Indeterminé" />
                                        <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                    </div>
                                </div>
                            </div>
                            <div class="sm:col-span-3">
                                <label for="pol_cli"
                                    class="block text-sm font-medium leading-6 text-gray-900">Politique</label>
                                <div class="mt-2">
                                    <select v-model="current_user.pol_cli" name="pol_cli" id="pol_cli"
                                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:max-w-xs sm:text-sm sm:leading-6">
                                        <option value="0">Indeterminé</option>
                                        <option value="1">Sans</option>
                                        <option value="2">Extrême Gauche</option>
                                        <option value="3">Gauche</option>
                                        <option value="4">Centre</option>
                                        <option value="5">Droite</option>
                                        <option value="6">Extrême droite</option>
                                    </select>
                                    <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
                <div class="px-4 sm:px-0">
                    <h2 class="text-base font-semibold leading-7 text-gray-900">Adresse</h2>
                    <p class="mt-1 text-sm leading-6 text-gray-600">Information publiques du client, utilisées sur sa fiche publique et pouvant être partagées aux autres clients.</p>
                </div>
                <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
                    <div class="px-4 py-6 sm:p-8">
                        <div class="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            <div class="col-span-full">
                                <label for="adr_cli"
                                    class="block text-sm font-medium leading-6 text-gray-900">Adresse</label>
                                    <div class="mt-2">
                                        <input v-if="isFromAgence(current_user).can" type="text" v-model="current_user.adr_cli" name="adr_cli"
                                            id="adr_cli"
                                            class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                        <input v-else type="text" value="*************" name="adr_cli" id="adr_cli" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                        <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                    </div>
                            </div>
                            <div class="sm:col-span-2">
                                <label for="cp_cli" class="block text-sm font-medium leading-6 text-gray-900">Code postal</label>
                                <div class="mt-2">
                                    <input type="text" v-model="current_user.cp_cli" name="cp_cli" id="cp_cli"
                                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                        <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                </div>
                            </div>
                            <div class="sm:col-span-4">
                                <label for="ville_cli"
                                    class="block text-sm font-medium leading-6 text-gray-900">Ville</label>
                                <div class="mt-2">
                                    <input v-if="isFromAgence(current_user).can" type="text" v-model="current_user.ville_cli" name="ville_cli" id="ville_cli"
                                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                    <input v-else type="text" value="*************" name="adr_cli" id="adr_cli" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                    <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                </div>
                            </div>
                            <div class="sm:col-span-4">
                                <label for="telPri_cli" class="block text-sm font-medium leading-6 text-gray-900">Téléphone privé</label>
                                <div class="mt-2">
                                    <input v-if="isFromAgence(current_user).can" id="telPri_cli" v-model="current_user.telPri_cli" name="telPri_cli" type="tel"
                                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                    <input v-else type="text" value="*************" name="adr_cli" id="adr_cli" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                    <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                </div>
                            </div>
                            <div class="sm:col-span-2 self-end mb-2" v-if="isFromAgence(current_user).can">
                                <SwitchGroup as="div" class="flex items-center">
                                    <Switch @click="debouncedFunction" v-model="current_user.affTelPri_cli" name="affTelPri_cli"
                                        :class="[current_user.affTelPri_cli ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                        <span aria-hidden="true"
                                            :class="[current_user.affTelPri_cli ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                    </Switch>
                                    <SwitchLabel as="span" class="ml-3 text-sm">
                                        <span class="font-medium text-gray-900">Afficher</span>
                                    </SwitchLabel>
                                </SwitchGroup>
                            </div>
                            <div class="sm:col-span-4">
                                <label for="telPro_cli" class="block text-sm font-medium leading-6 text-gray-900">Téléphone pro</label>
                                <div class="mt-2">
                                    <input v-if="isFromAgence(current_user).can" id="telPro_cli" v-model="current_user.telPro_cli" name="telPro_cli" type="tel"
                                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                    <input v-else type="text" value="*************" name="adr_cli" id="adr_cli" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                    <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                </div>
                            </div>
                            <div class="sm:col-span-2 self-end mb-2" v-if="isFromAgence(current_user).can">
                                <SwitchGroup as="div" class="flex items-center">
                                    <Switch @click="debouncedFunction" v-model="current_user.affTelPro_cli" name="affTelPro_cli"
                                        :class="[current_user.affTelPro_cli  ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                        <span aria-hidden="true"
                                            :class="[current_user.affTelPro_cli ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                    </Switch>
                                    <SwitchLabel as="span" class="ml-3 text-sm">
                                        <span class="font-medium text-gray-900">Afficher</span>
                                    </SwitchLabel>
                                </SwitchGroup>
                            </div>
                            <div class="sm:col-span-4">
                                <label for="telGsm_cli" class="block text-sm font-medium leading-6 text-gray-900">Numéro de portable</label>
                                <div class="mt-2">
                                    <input v-if="isFromAgence(current_user).can" id="telGsm_cli" v-model="current_user.telGsm_cli" name="telGsm_cli" type="tel"
                                        autocomplete="tel"
                                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                    <input v-else type="text" value="*************" name="adr_cli" id="adr_cli" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                    <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                </div>
                            </div>
                            <div class="sm:col-span-2 self-end mb-2" v-if="isFromAgence(current_user).can">
                                <SwitchGroup as="div" class="flex items-center">
                                    <Switch @click="debouncedFunction" v-model="current_user.affTelGsm_cli" name="affTelGsm_cli"
                                        :class="[current_user.affTelGsm_cli ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                        <span aria-hidden="true"
                                            :class="[current_user.affTelGsm_cli ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                    </Switch>
                                    <SwitchLabel as="span" class="ml-3 text-sm">
                                        <span class="font-medium text-gray-900">Afficher</span>
                                    </SwitchLabel>
                                </SwitchGroup>
                            </div>
                            <div class="sm:col-span-full">
                                <label for="mail_cli" class="block text-sm font-medium leading-6 text-gray-900">Adresse email</label>
                                <div class="mt-2">
                                    <input v-if="isFromAgence(current_user).can" id="mail_cli" v-model="current_user.mail_cli" name="mail_cli" type="email"
                                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                    <input v-else type="text" value="*************" name="adr_cli" id="adr_cli" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                    <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                </div>
                            </div>
                            <div class="sm:col-span-2 self-start mb-2" v-if="isFromAgence(current_user).can">
                                <SwitchGroup as="div" class="flex items-center flex-wrap">
                                    <Switch @click="debouncedFunction" v-model="current_user.nl_cli" name="nl_cli"
                                        :class="[current_user.nl_cli ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                        <span aria-hidden="true"
                                            :class="[current_user.nl_cli ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                    </Switch>
                                    <SwitchLabel as="span" class="ml-3 text-sm">
                                        <span class="font-medium text-gray-900">Newsletter</span>
                                    </SwitchLabel>
                                    <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden status">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                </SwitchGroup>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="space-y-10 mt-10" v-if="active_tab === 'Situation'">
            <div class="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
                <div class="px-4 sm:px-0">
                    <h2 class="text-base font-semibold leading-7 text-gray-900">Statut</h2>
                    <p class="mt-1 text-sm leading-6 text-gray-600">Information publiques du client, utilisées sur sa fiche publique et pouvant être partagées aux autres clients.</p>
                </div>
                <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
                    <div class="px-4 py-6 sm:p-8">
                        <div class="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            <div class="sm:col-span-2 self-start mb-2">
                                <SwitchGroup as="div" class="flex items-center flex-wrap">
                                    <Switch @click="debouncedFunction" v-model="current_user.situation_cli.celib_cli" name="celib_cli"
                                        :class="[current_user.situation_cli.celib_cli ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                        <span aria-hidden="true"
                                            :class="[current_user.situation_cli.celib_cli ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                    </Switch>
                                    <SwitchLabel as="span" class="ml-3 text-sm">
                                        <span class="font-medium text-gray-900">Célibataire</span>
                                    </SwitchLabel>
                                    <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden status">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                </SwitchGroup>
                            </div>

                            <div class="sm:col-span-2 self-start mb-2">
                                <SwitchGroup as="div" class="flex items-center flex-wrap">
                                    <Switch @click="debouncedFunction" v-model="current_user.situation_cli.veuf_cli" name="veuf_cli"
                                        :class="[current_user.situation_cli.veuf_cli ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                        <span aria-hidden="true"
                                            :class="[current_user.situation_cli.veuf_cli ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                    </Switch>
                                    <SwitchLabel as="span" class="ml-3 text-sm">
                                        <span class="font-medium text-gray-900">Veuf</span>
                                    </SwitchLabel>
                                    <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden status">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                </SwitchGroup>
                            </div>

                            <div class="sm:col-span-2 self-start mb-2">
                                <SwitchGroup as="div" class="flex items-center flex-wrap">
                                    <Switch @click="debouncedFunction" v-model="current_user.situation_cli.div_cli" name="div_cli"
                                        :class="[current_user.situation_cli?.div_cli ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                        <span aria-hidden="true"
                                            :class="[current_user.situation_cli?.div_cli ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                    </Switch>
                                    <SwitchLabel as="span" class="ml-3 text-sm">
                                        <span class="font-medium text-gray-900">Divorcé</span>
                                    </SwitchLabel>
                                    <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden status">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                </SwitchGroup>
                            </div>

                            <div class="sm:col-span-2 self-start mb-2">
                                <SwitchGroup as="div" class="flex items-center flex-wrap">
                                    <Switch @click="debouncedFunction" v-model="current_user.situation_cli.sep_cli" name="sep_cli"
                                        :class="[current_user.situation_cli?.sep_cli ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                        <span aria-hidden="true"
                                            :class="[current_user.situation_cli?.sep_cli ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                    </Switch>
                                    <SwitchLabel as="span" class="ml-3 text-sm">
                                        <span class="font-medium text-gray-900">Séparé</span>
                                    </SwitchLabel>
                                    <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden status">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                </SwitchGroup>
                            </div>
                            <div class="sm:col-span-4 self-start mb-2">
                                <SwitchGroup as="div" class="flex items-center flex-wrap">
                                    <Switch @click="debouncedFunction" v-model="current_user.situation_cli.instDiv_cli" name="instDiv_cli"
                                        :class="[current_user.situation_cli?.instDiv_cli ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                        <span aria-hidden="true"
                                            :class="[current_user.situation_cli?.instDiv_cli ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                    </Switch>
                                    <SwitchLabel as="span" class="ml-3 text-sm">
                                        <span class="font-medium text-gray-900">En instance de divorce</span>
                                    </SwitchLabel>
                                    <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden status">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                </SwitchGroup>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
                <div class="px-4 sm:px-0">
                    <h2 class="text-base font-semibold leading-7 text-gray-900">Enfants</h2>
                    <p class="mt-1 text-sm leading-6 text-gray-600">Plus les critères de recherche seront précis, plus notre outil de matching dénichera les profils les plus pertinents.</p>
                </div>
                <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
                    <div class="px-4 py-6 sm:p-8">
                        <div class="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            <div class="sm:col-span-full">
                                <label for="nbEnf_cli"
                                    class="block text-sm font-medium leading-6 text-gray-900">Nombre d'enfants</label>
                                <div class="mt-2 relative">
                                    <input type="text" v-model="current_user.nbEnf_cli" name="nbEnf_cli" id="nbEnf_cli" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                    <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                    <div class="pointer-events-none absolute top-[8px] right-0 flex items-center pr-3">
                                        <span class="text-gray-500 text-xs">enfant(s)</span>
                                    </div>
                                </div>
                            </div>
                            <div class="sm:col-span-3">
                                <label for="minEnf_cli"
                                    class="block text-sm font-medium leading-6 text-gray-900">Age minimum enfant</label>
                                <div class="mt-2 relative">
                                    <input type="text" v-model="current_user.minEnf_cli" name="minEnf_cli"
                                        id="minEnf_cli"
                                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                    <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                    <div
                                        class="pointer-events-none absolute top-[8px] right-0 flex items-center pr-3">
                                        <span class="text-gray-500 text-xs" id="price-currency">ans</span>
                                    </div>
                                </div>
                            </div>
                            <div class="sm:col-span-3">
                                <label for="maxEnf_cli"
                                    class="block text-sm font-medium leading-6 text-gray-900">Age maximum enfant</label>
                                <div class="mt-2 relative">
                                    <input type="text" v-model="current_user.maxEnf_cli" name="maxEnf_cli"
                                        id="maxEnf_cli" autocomplete="given-name"
                                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                    <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                    <div
                                        class="pointer-events-none absolute top-[8px] right-0 flex items-center pr-3">
                                        <span class="text-gray-500 text-xs" id="price-currency">ans</span>
                                    </div>
                                </div>
                            </div>
                            <div class="sm:col-span-full">
                                <label for="chargeEnf_cli"
                                    class="block text-sm font-medium leading-6 text-gray-900">Nombre d'enfants à charge</label>
                                <div class="mt-2 relative">
                                    <input type="text" v-model="current_user.chargeEnf_cli" name="chargeEnf_cli"
                                        id="chargeEnf_cli"
                                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                        <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                    <div
                                        class="pointer-events-none absolute top-[8px] right-0 flex items-center pr-3">
                                        <span class="text-gray-500 text-xs" id="price-currency">enfant(s)</span>
                                    </div>
                                </div>
                            </div>
                            <div class="sm:col-span-full">
                                <label for="alternEnf_cli"
                                    class="block text-sm font-medium leading-6 text-gray-900">Nombre d'enfants en garde alternée</label>
                                <div class="mt-2 relative">
                                    <input type="text" v-model="current_user.alternEnf_cli" name="alternEnf_cli"
                                        id="alternEnf_cli"
                                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                    <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                    <div
                                        class="pointer-events-none absolute top-[8px] right-0 flex items-center pr-3">
                                        <span class="text-gray-500 text-xs" id="price-currency">enfant(s)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
                <div class="px-4 sm:px-0">
                    <h2 class="text-base font-semibold leading-7 text-gray-900">Professionnel</h2>
                    <p class="mt-1 text-sm leading-6 text-gray-600">Plus les critères de recherche seront précis, plus notre outil de matching dénichera les profils les plus pertinents.</p>
                </div>
                <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
                    <div class="px-4 py-6 sm:p-8">
                        <div class="max-w-2xl space-y-10">
                            <fieldset>
                                <div class="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                    <div class="sm:col-span-3">
                                        <label for="etude_cli"
                                            class="block text-sm font-medium leading-6 text-gray-900">Niveau d'étude</label>
                                        <div class="mt-2">
                                            <select v-model="current_user.etude_cli" name="etude_cli" id="etude_cli"
                                                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:max-w-xs sm:text-sm sm:leading-6">
                                                <option value="0">Indeterminé</option>
                                                <option value="1">Primaire</option>
                                                <option value="2">Secondaire</option>
                                                <option value="3">Bac à Bac +2</option>
                                                <option value="4">Bac</option>
                                                <option value="5">Bac +3 et plus</option>
                                            </select>
                                            <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                        </div>
                                    </div>
                                    <div class="sm:col-span-3">
                                        <label for="prof_cli" class="block text-sm font-medium leading-6 text-gray-900">Profession</label>
                                        <div class="mt-2">
                                            <input type="text" v-model="current_user.prof_cli" name="prof_cli" id="prof_cli"
                                                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                            <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                        </div>
                                    </div>
                                    <div class="sm:col-span-3">
                                        <label for="tranche_cli"
                                            class="block text-sm font-medium leading-6 text-gray-900">Revenus</label>
                                        <div class="mt-2">
                                            <select v-model="current_user.tranche_cli" name="tranche_cli" id="tranche_cli"
                                                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:max-w-xs sm:text-sm sm:leading-6">
                                                <option value="">Indeterminé</option>
                                                <option value="0">Modestes (- de 900€)</option>
                                                <option value="1">Corrects (de 900€ à 1300€)</option>
                                                <option value="2">Confortables (de 1300€ à 2000€)</option>
                                                <option value="3">Très confortables (de 2000€ à 4000€)</option>
                                                <option value="4">Elevés (4000€ et plus)</option>
                                            </select>
                                            <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                        </div>
                                    </div>
                                    <div class="sm:col-span-3">
                                        <label for="revenus_cli" class="block text-sm font-medium leading-6 text-gray-900">Précision revenus</label>
                                        <div class="mt-2">
                                            <input type="text" v-model="current_user.revenus_cli" name="revenus_cli" id="revenus_cli"
                                                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                            <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                        </div>
                                    </div>
                                    <div class="col-span-full">
                                        <label for="hor_cli"
                                            class="block text-sm font-medium leading-6 text-gray-900">Horaires</label>
                                        <div class="mt-2">
                                            <textarea id="hor_cli" v-model="current_user.hor_cli" name="hor_cli" rows="3" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                            <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                        </div>
                                    </div>
                                </div>
                            </fieldset>
                            <fieldset class="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                <div class="sm:col-span-3 self-start mb-2">
                                    <SwitchGroup as="div" class="flex items-center flex-wrap">
                                        <Switch @click="debouncedFunction" v-model="current_user.veh_cli" name="veh_cli"
                                            :class="[current_user.veh_cli ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                            <span aria-hidden="true"
                                                :class="[current_user.veh_cli ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                        </Switch>
                                        <SwitchLabel as="span" class="ml-3 text-sm">
                                            <span class="font-medium text-gray-900">Véhicule</span>
                                        </SwitchLabel>
                                        <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden status">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                    </SwitchGroup>
                                </div>

                                <div class="sm:col-span-3 self-start mb-2">
                                    <SwitchGroup as="div" class="flex items-center flex-wrap">
                                        <Switch @click="debouncedFunction" v-model="current_user.permis_cli" name="permis_cli"
                                            :class="[current_user.permis_cli ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                            <span aria-hidden="true"
                                                :class="[current_user.permis_cli ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                        </Switch>
                                        <SwitchLabel as="span" class="ml-3 text-sm">
                                            <span class="font-medium text-gray-900">Permis de conduire</span>
                                        </SwitchLabel>
                                        <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden status">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                    </SwitchGroup>
                                </div>
                            </fieldset>
        
                            <div class="sm:col-span-full">
                                <label for="loge_cli"
                                    class="block text-sm font-medium leading-6 text-gray-900">Logement</label>
                                <div class="mt-2">
                                    <select id="loge_cli" name="loge_cli" v-model="current_user.loge_cli"
                                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:max-w-xs sm:text-sm sm:leading-6">
                                        <option value="0">Indeterminé</option>
                                        <option value="1">Non</option>
                                        <option value="2">Oui (sans précision)</option>
                                        <option value="3">Location appartement</option>
                                        <option value="4">Location maison</option>
                                        <option value="5">Propriétaire appartement</option>
                                        <option value="6">Propriétaire maison</option>
                                        <option value="7">En famille</option>
                                        <option value="8">Autre</option>
                                    </select>
                                    <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                </div>
                            </div>
                            <div class="sm:col-span-full">
                                <label for="ms_cli"
                                    class="block text-sm font-medium leading-6 text-gray-900">Milieu social</label>
                                <div class="mt-2">
                                    <select id="ms_cli" name="ms_cli" v-model="current_user.ms_cli"
                                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:max-w-xs sm:text-sm sm:leading-6">
                                        <option value="_0">Bon</option>
                                        <option value="_1">Moyen</option>
                                        <option value="_2">Modeste</option>
                                        <option value="_3">Autre</option>
                                    </select>
                                    <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="space-y-10 mt-10" v-if="active_tab === 'Physique'">
            <div class="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
                <div class="px-4 sm:px-0">
                    <h2 class="text-base font-semibold leading-7 text-gray-900">Appréciations</h2>
                    <p class="mt-1 text-sm leading-6 text-gray-600">Plus les critères de recherche seront précis, plus notre outil de matching dénichera les profils les plus pertinents.</p>
                </div>
                <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
                    <div class="px-4 py-6 sm:p-8">
                        <div class="max-w-2xl space-y-10">
                            <fieldset>
                                <div class="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                    <div class="sm:col-span-3">
                                        <label for="taille_cli"
                                            class="block text-sm font-medium leading-6 text-gray-900">Taille</label>
                                        <div class="mt-2 relative">
                                            <input type="text" v-model="current_user.taille_cli" name="taille_cli"
                                                id="taille_cli"
                                                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                            <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                            <div class="pointer-events-none absolute top-[8px] right-0 flex items-center pr-3">
                                                <span class="text-gray-500 text-xs" id="price-currency">cm</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="sm:col-span-3">
                                        <label for="poid_cli"
                                            class="block text-sm font-medium leading-6 text-gray-900">Poids</label>
                                        <div class="mt-2 relative">
                                            <input type="text" v-model="current_user.poid_cli" name="poid_cli"
                                                id="poid_cli"
                                                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                            <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                            <div class="pointer-events-none absolute top-[8px] right-0 flex items-center pr-3">
                                                <span class="text-gray-500 text-xs" id="price-currency">kg</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="sm:col-span-3">
                                        <label for="cheveux_cli"
                                            class="block text-sm font-medium leading-6 text-gray-900">Cheveux</label>
                                        <div class="mt-2">
                                            <select name="cheveux_cli" id="cheveux_cli" v-model="current_user.cheveux_cli"
                                                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:max-w-xs sm:text-sm sm:leading-6">
                                                <option value="0">Indeterminé</option>
                                                <option value="1">Bruns</option>
                                                <option value="2">Blonds</option>
                                                <option value="3">Roux</option>
                                                <option value="4">Blancs</option>
                                                <option value="5">Chauve</option>
                                                <option value="6">Noirs</option>
                                                <option value="7">Châtains clairs</option>
                                                <option value="8">Châtains foncés</option>
                                                <option value="9">Gris</option>
                                                <option value="10">Poivre et sel</option>
                                                <option value="11">Auburn</option>
                                                <option value="12">Acajou</option>
                                                <option value="13">Mèches blondes</option>
                                                <option value="14">Mèches brunes</option>
                                                <option value="15">Autre</option>
                                            </select>
                                            <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                        </div>
                                    </div>
                                    <div class="sm:col-span-3">
                                        <label for="yeux_cli"
                                            class="block text-sm font-medium leading-6 text-gray-900">Yeux</label>
                                        <div class="mt-2">
                                            <select name="yeux_cli" id="yeux_cli" v-model="current_user.yeux_cli"
                                                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:max-w-xs sm:text-sm sm:leading-6">
                                                <option value="0">Indeterminé</option>
                                                <option value="1">Bruns</option>
                                                <option value="2">Verts</option>
                                                <option value="3">Bleus</option>
                                                <option value="4">Noirs</option>
                                                <option value="5">Gris</option>
                                                <option value="6">Noisettes</option>
                                                <option value="7">Bleus/verts</option>
                                                <option value="8">Bleux/gris</option>
                                                <option value="9">Dominance bleue</option>
                                                <option value="10">Dominance verte</option>
                                                <option value="11">Dominance brune</option>
                                                <option value="12">Autres</option>
                                            </select>
                                            <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                        </div>
                                    </div>
                                    <div class="sm:col-span-full">
                                        <label for="code_cli"
                                            class="block text-sm font-medium leading-6 text-gray-900">Code</label>
                                        <div class="mt-2">
                                            <select name="code_cli" id="code_cli" v-model="current_user.code_cli"
                                                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6">
                                                <option value="0">Indeterminé</option>
                                                <option value="1">1</option>
                                                <option value="2">2</option>
                                                <option value="3">3</option>
                                            </select>
                                            <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                        </div>
                                    </div>
                                    <div class="sm:col-span-3">
                                        <SwitchGroup as="div" class="flex items-center flex-wrap">
                                            <Switch @click="debouncedFunction" v-model="current_user.lun_cli" name="lun_cli"
                                                :class="[current_user.lun_cli ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                                <span aria-hidden="true"
                                                    :class="[current_user.lun_cli ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                            </Switch>
                                            <SwitchLabel as="span" class="ml-3 text-sm">
                                                <span class="font-medium text-gray-900">Porte des lunettes</span>
                                            </SwitchLabel>
                                            <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden status">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                        </SwitchGroup>
                                    </div>
                                    <div class="sm:col-span-3">
                                        <SwitchGroup as="div" class="flex items-center flex-wrap">
                                            <Switch @click="debouncedFunction" v-model="current_user.fum_cli" name="fum_cli"
                                                :class="[current_user.fum_cli ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                                <span aria-hidden="true"
                                                    :class="[current_user.fum_cli ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                            </Switch>
                                            <SwitchLabel as="span" class="ml-3 text-sm">
                                                <span class="font-medium text-gray-900">Fumeur / Fumeuse</span>
                                            </SwitchLabel>
                                            <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden status">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                        </SwitchGroup>
                                    </div>
                                    <div class="col-span-full">
                                        <label for="sante_cli"
                                            class="block text-sm font-medium leading-6 text-gray-900">Forme physique</label>
                                        <div class="mt-2">
                                            <textarea v-model="current_user.sante_cli" id="sante_cli" name="sante_cli" rows="3" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                            <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                        </div>
                                        <p class="mt-3 text-sm leading-6 text-gray-600">Décrivez rapidement votre client.</p>
                                    </div>
                                    <div class="col-span-full">
                                        <label for="def_cli"
                                            class="block text-sm font-medium leading-6 text-gray-900">Défauts</label>
                                        <div class="mt-2">
                                            <textarea v-model="current_user.def_cli" id="def_cli" name="def_cli" rows="3" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                            <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                        </div>
                                        <p class="mt-3 text-sm leading-6 text-gray-600">Décrivez rapidement votre client.</p>
                                    </div>
                                    <div class="col-span-full">
                                        <label for="rem_cli"
                                            class="block text-sm font-medium leading-6 text-gray-900">Remarques</label>
                                        <div class="mt-2">
                                            <textarea v-model="current_user.rem_cli" id="rem_cli" name="rem_cli" rows="3" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                            <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                        </div>
                                        <p class="mt-3 text-sm leading-6 text-gray-600">Décrivez rapidement votre client.</p>
                                    </div>
                                </div>
                            </fieldset>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="space-y-10 mt-10" v-if="active_tab === 'Psychologie et morale'">
            <div class="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
                <div class="px-4 sm:px-0">
                    <h2 class="text-base font-semibold leading-7 text-gray-900">Psychologie et morale</h2>
                    <p class="mt-1 text-sm leading-6 text-gray-600">Plus les critères de recherche seront précis, plus notre outil de matching dénichera les profils les plus pertinents.</p>
                </div>
                <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
                    <div class="px-4 py-6 sm:p-8">
                        <div class="max-w-2xl space-y-10">
                            <fieldset>
                                <div class="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                    <div class="col-span-full">
                                        <label for="interets_cli" class="block text-sm font-medium leading-6 text-gray-900">Centres d'intérêt</label>
                                        <div class="mt-2">
                                            <textarea v-model="current_user.interets_cli" id="interets_cli" name="interets_cli" rows="3" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                            <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                        </div>
                                        <p class="mt-3 text-sm leading-6 text-gray-600">Décrivez rapidement votre client.</p>
                                    </div>

                                    <div class="col-span-full">
                                        <label for="desc_cli" class="block text-sm font-medium leading-6 text-gray-900">Description/Caractère</label>
                                        <div class="mt-2">
                                            <textarea v-model="current_user.desc_cli" id="def_cli" name="desc_cli" rows="3" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                            <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                        </div>
                                        <p class="mt-3 text-sm leading-6 text-gray-600">Décrivez rapidement votre client.</p>
                                    </div>

                                    <div class="col-span-full">
                                        <label for="milieu_cli" class="block text-sm font-medium leading-6 text-gray-900">Milieu dans lequel vous avez été élevé</label>
                                        <div class="mt-2">
                                            <textarea v-model="current_user.milieu_cli" id="rem_cli" name="rem_cli" rows="3" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                            <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                        </div>
                                        <p class="mt-3 text-sm leading-6 text-gray-600">Décrivez rapidement votre client.</p>
                                    </div>

                                    <div class="col-span-full">
                                        <legend class="text-base font-semibold leading-6 text-gray-900 mb-4">Allure</legend>
                                        <div class="gap-4 grid grid-cols-4">
                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.allure_cli" id="indetermine" value="0" name="indetermine" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="indetermine" class="font-medium text-gray-900">Indeterminé</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.allure_cli" id="classique" value="1" name="classique" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="classique" class="font-medium text-gray-900">Classique</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.allure_cli" id="attirant" value="2" name="attirant" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="attirant" class="font-medium text-gray-900">Attirant(e)</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.allure_cli" id="decontracte" value="3" name="decontracte" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="decontracte" class="font-medium text-gray-900">Décontracté(e)</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.allure_cli" id="moderne" value="4" name="moderne" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="moderne" class="font-medium text-gray-900">Moderne</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.allure_cli" id="elegant" value="5" name="elegant" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="elegant" class="font-medium text-gray-900">Élégant</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.allure_cli" id="elance" value="6" name="elance" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="elance" class="font-medium text-gray-900">Élancé(e)</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.allure_cli" id="moyenne" value="7" name="moyenne" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="moyenne" class="font-medium text-gray-900">Moyenne</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.allure_cli" id="solide" value="8" name="solide" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="solide" class="font-medium text-gray-900">Solide</label>
                                                </div>
                                            </div>

                                            <div v-if="current_user.sexe_cli === 'H'" class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.allure_cli" id="viril" value="9" name="viril" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="viril" class="font-medium text-gray-900">Viril</label>
                                                </div>
                                            </div>

                                            <div v-if="current_user.sexe_cli === 'F'" class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.allure_cli" id="feminine" value="10" name="feminine" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="feminine" class="font-medium text-gray-900">Féminine</label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="col-span-full">
                                        <legend class="text-base font-semibold leading-6 text-gray-900 mb-4">Personnalités</legend>
                                        <div class="gap-4 grid grid-cols-4">
                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.personnalite_cli" id="indetermine" value="0" name="indetermine" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="indetermine" class="font-medium text-gray-900">Indeterminé</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.personnalite_cli" id="Romantique" value="1" name="Romantique" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="Romantique" class="font-medium text-gray-900">Romantique</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.personnalite_cli" id="sentimental" value="2" name="sentimental" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="sentimental" class="font-medium text-gray-900">Sentimental(e)</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.personnalite_cli" id="sensible" value="3" name="sensible" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="sensible" class="font-medium text-gray-900">Sensible</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.personnalite_cli" id="optimiste" value="4" name="optimiste" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="optimiste" class="font-medium text-gray-900">Optimiste</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.personnalite_cli" id="humour" value="5" name="humour" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="humour" class="font-medium text-gray-900">Humour</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.personnalite_cli" id="cultive" value="6" name="cultive" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="cultive" class="font-medium text-gray-900">Cultivé(e)</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.personnalite_cli" id="patient" value="7" name="patient" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="patient" class="font-medium text-gray-900">Patient(e)</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.personnalite_cli" id="doux" value="8" name="doux" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="doux" class="font-medium text-gray-900">Doux(ce)</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.personnalite_cli" id="ambitieux" value="9" name="ambitieux" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="ambitieux" class="font-medium text-gray-900">Ambitieux(se)</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.personnalite_cli" id="communicatif" value="10" name="communicatif" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="communicatif" class="font-medium text-gray-900">Communicatif(ve)</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.personnalite_cli" id="dynamique" value="11" name="dynamique" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="dynamique" class="font-medium text-gray-900">Dynamique</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.personnalite_cli" id="savoir-vivre" value="12" name="savoir-vivre" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="savoir-vivre" class="font-medium text-gray-900">Savoir-vire</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.personnalite_cli" id="reserve" value="13" name="reserve" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="reserve" class="font-medium text-gray-900">Réservé(e)</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.personnalite_cli" id="intelligent" value="14" name="intelligent" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="intelligent" class="font-medium text-gray-900">Intelligent(e)</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.personnalite_cli" id="tendre" value="15" name="tendre" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="tendre" class="font-medium text-gray-900">Tendre</label>
                                                </div>
                                            </div>
                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.personnalite_cli" id="fidele" value="16" name="fidele" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="fidele" class="font-medium text-gray-900">Fidèle</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.personnalite_cli" id="realiste" value="17" name="realiste" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="realiste" class="font-medium text-gray-900">Réaliste</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.personnalite_cli" id="affectueux" value="18" name="affectueux" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="affectueux" class="font-medium text-gray-900">Affectueux(se)</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.personnalite_cli" id="securisant" value="19" name="securisant" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="securisant" class="font-medium text-gray-900">Sécurisant(e)</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.personnalite_cli" id="sociable" value="20" name="sociable" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="sociable" class="font-medium text-gray-900">Sociable</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.personnalite_cli" id="tolerant" value="21" name="tolerant" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="tolerant" class="font-medium text-gray-900">Tolérant(e)</label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="col-span-full">
                                        <legend class="text-base font-semibold leading-6 text-gray-900 mb-4">Goûts</legend>
                                        <div class="gap-4 grid grid-cols-4">
                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.gouts_cli" id="indetermine" value="0" name="indetermine" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="indetermine" class="font-medium text-gray-900">Indeterminé</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.gouts_cli" id="enfants" value="1" name="enfants" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="enfants" class="font-medium text-gray-900">Les enfants</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.gouts_cli" id="cuisine" value="2" name="cuisine" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="cuisine" class="font-medium text-gray-900">La cuisine</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.gouts_cli" id="bricolage" value="3" name="bricolage" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="bricolage" class="font-medium text-gray-900">Le bricolage</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.gouts_cli" id="animaux" value="4" name="animaux" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="animaux" class="font-medium text-gray-900">Les animaux</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.gouts_cli" id="arts" value="5" name="arts" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="arts" class="font-medium text-gray-900">Les arts</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.gouts_cli" id="cultive" value="6" name="lecture" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="lecture" class="font-medium text-gray-900">La lecture</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.gouts_cli" id="musique" value="7" name="musique" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="musique" class="font-medium text-gray-900">La musique</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.gouts_cli" id="sorties" value="8" name="sorties" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="sorties" class="font-medium text-gray-900">Les sorties</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.gouts_cli" id="sport" value="9" name="sport" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="sport" class="font-medium text-gray-900">Le sport</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.gouts_cli" id="vie_de_famille" value="10" name="vie_de_famille" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="vie_de_famille" class="font-medium text-gray-900">La vie de famille</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.gouts_cli" id="sexe" value="11" name="sexe" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="sexe" class="font-medium text-gray-900">Le sexe</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.gouts_cli" id="spiritualite" value="12" name="spiritualite" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="spiritualite" class="font-medium text-gray-900">Spiritualité</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.gouts_cli" id="nature" value="13" name="nature" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="nature" class="font-medium text-gray-900">La nature</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.gouts_cli" id="danse" value="14" name="danse" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="danse" class="font-medium text-gray-900">La danse</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.gouts_cli" id="voyages" value="15" name="voyages" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="voyages" class="font-medium text-gray-900">Les voyages</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.gouts_cli" id="gastronomie" value="16" name="gastronomie" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="gastronomie" class="font-medium text-gray-900">La gastronomie</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.gouts_cli" id="culturelle" value="17" name="culturelle" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="culturelle" class="font-medium text-gray-900">La vie culturelle</label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </fieldset>
                        </div>
                    </div>
                </div>
            </div>
            <div class="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
                <div class="px-4 sm:px-0">
                    <h2 class="text-base font-semibold leading-7 text-gray-900">Critères de recherche</h2>
                    <p class="mt-1 text-sm leading-6 text-gray-600">Plus les critères de recherche seront précis, plus notre outil de matching dénichera les profils les plus pertinents.</p>
                </div>
                <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
                    <div class="px-4 py-6 sm:p-8">
                        <div class="max-w-2xl space-y-10">
                            <fieldset>
                                <legend class="text-sm font-semibold leading-6 text-gray-900">Situation</legend>
                                <div class="mt-6 grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                    <div class="sm:col-span-2 self-start mb-2">

                                        <SwitchGroup as="div" class="flex items-center flex-wrap">
                                            <Switch @click="debouncedFunction" v-model="current_user.desCelib_cli" name="desCelib_cli"
                                                :class="[current_user.desCelib_cli ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                                <span aria-hidden="true"
                                                    :class="[current_user.desCelib_cli ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                            </Switch>
                                            <SwitchLabel as="span" class="ml-3 text-sm">
                                                <span class="font-medium text-gray-900">Célibataire</span>
                                            </SwitchLabel>
                                            <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden status">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                        </SwitchGroup>
                                    </div>
                                    <div class="sm:col-span-2 self-start mb-2">
                                        <SwitchGroup as="div" class="flex items-center flex-wrap">
                                            <Switch @click="debouncedFunction" v-model="current_user.desVeuf_cli" name="desVeuf_cli"
                                                :class="[current_user.desVeuf_cli ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                                <span aria-hidden="true"
                                                    :class="[current_user.desVeuf_cli ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                            </Switch>
                                            <SwitchLabel as="span" class="ml-3 text-sm">
                                                <span class="font-medium text-gray-900">Veuf</span>
                                            </SwitchLabel>
                                            <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden status">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                        </SwitchGroup>
                                    </div>
                                    <div class="sm:col-span-2 self-start mb-2">
                                        <SwitchGroup as="div" class="flex items-center flex-wrap">
                                            <Switch @click="debouncedFunction" v-model="current_user.desDiv_cli" name="desDiv_cli"
                                                :class="[current_user.desDiv_cli ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                                <span aria-hidden="true"
                                                    :class="[current_user.desDiv_cli ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                            </Switch>
                                            <SwitchLabel as="span" class="ml-3 text-sm">
                                                <span class="font-medium text-gray-900">Divorcé</span>
                                            </SwitchLabel>
                                        </SwitchGroup>
                                        <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden status">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                    </div>
                                    <div class="sm:col-span-2 self-end mb-2">
                                        <SwitchGroup as="div" class="flex items-center flex-wrap">
                                            <Switch @click="debouncedFunction" v-model="current_user.desSep_cli" name="desSep_cli"
                                                :class="[current_user.desSep_cli ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                                <span aria-hidden="true"
                                                    :class="[current_user.desSep_cli ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                            </Switch>
                                            <SwitchLabel as="span" class="ml-3 text-sm">
                                                <span class="font-medium text-gray-900">Séparé</span>
                                            </SwitchLabel>
                                            <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden status">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                        </SwitchGroup>
                                    </div>
                                </div>
                            </fieldset>
                            <fieldset>
                                <div class="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                    <div class="sm:col-span-3">
                                        <label for="desAge_cli_min" class="block text-sm font-medium leading-6 text-gray-900">Age minimum</label>
                                        <div class="mt-2">
                                            <input type="text" v-model="current_user.desAge_cli.split('-')[0]" name="desAge_cli_min" id="ldesAge_cli_min" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                            <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                        </div>
                                    </div>
                                    <div class="sm:col-span-3">
                                        <label for="desAge_cli_max" class="block text-sm font-medium leading-6 text-gray-900">Age maximum</label>
                                        <div class="mt-2">
                                            <input type="text" v-model="current_user.desAge_cli.split('-')[1]" name="desAge_cli_max" id="desAge_cli_max" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                            <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                        </div>
                                    </div>
                                    <div class="sm:col-span-3">
                                        <label for="desNbEn_cli" class="block text-sm font-medium leading-6 text-gray-900">Nombre d'enfants acceptés</label>
                                        <div class="mt-2">
                                            <select v-model="current_user.desNbEn_cli" id="desNbEn_cli" name="desNbEn_cli"
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
                                            <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                        </div>
                                    </div>
                                    <div class="col-span-full">
                                        <label for="desPhy_cli" class="block text-sm font-medium leading-6 text-gray-900">Allure physique</label>
                                        <div class="mt-2">
                                            <textarea id="desPhy_cli" v-model="current_user.desPhy_cli" name="desPhy_cli" rows="3" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                            <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                        </div>
                                    </div>
                                    <div class="col-span-full">
                                        <label for="desCaract_cli" class="block text-sm font-medium leading-6 text-gray-900">Caractère</label>
                                        <div class="mt-2">
                                            <textarea id="desCaract_cli" v-model="current_user.desCaract_cli" name="desCaract_cli" rows="3" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                            <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                        </div>
                                    </div>
                                    <div class="sm:col-span-full self-start mb-2">
                                        <SwitchGroup as="div" class="flex items-center flex-wrap">
                                            <Switch @click="debouncedFunction" v-model="current_user.desReg_cli" name="desReg_cli"
                                                :class="[current_user.desReg_cli ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                                <span aria-hidden="true"
                                                    :class="[current_user.desReg_cli ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                            </Switch>
                                            <SwitchLabel as="span" class="ml-3 text-sm">
                                                <span class="font-medium text-gray-900">Exclusivement dans la région</span>
                                            </SwitchLabel>
                                            <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden status">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                        </SwitchGroup>
                                    </div>
                                    <div class="sm:col-span-3">
                                        <label for="desInst_cli" class="block text-sm font-medium leading-6 text-gray-900">Degré d'instruction</label>
                                        <div class="mt-2">
                                            <select v-model="current_user.desInst_cli" id="desInst_cli" name="desInst_cli" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:max-w-xs sm:text-sm sm:leading-6">
                                                <option value="0">Indéterminé</option>
                                                <option value="1">Au moins primaire</option>
                                                <option value="2">Au moins secondaire</option>
                                                <option value="3">Au moins Bac à Bac +3</option>
                                                <option value="4">Bac +3 et plus</option>
                                                <option value="5">Sans importance</option>
                                            </select>
                                            <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                        </div>
                                    </div>
                                    <div class="sm:col-span-3">
                                        <label for="desProf_cli"
                                            class="block text-sm font-medium leading-6 text-gray-900">Profession</label>
                                        <div class="mt-2">
                                            <select v-model="current_user.desProf_cli" id="desProf_cli" name="desProf_cli"
                                                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:max-w-xs sm:text-sm sm:leading-6">
                                                <option value="0">Indéterminé</option>
                                                <option value="1">Sans importance</option>
                                                <option value="2">En activité</option>
                                                <option value="3">Retraité</option>
                                            </select>
                                            <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                        </div>
                                    </div>
                                    <div class="col-span-full">
                                        <label for="desCarctIndisp_cli" class="block text-sm font-medium leading-6 text-gray-900">Caractéristiques indispensables</label>
                                        <div class="mt-2">
                                            <textarea id="desCarctIndisp_cli" v-model="current_user.desCarctIndisp_cli" name="desCarctIndisp_cli" rows="3" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                            <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                        </div>
                                    </div>
                                    <div class="sm:col-span-3">
                                        <label for="msRech_cli" class="block text-sm font-medium leading-6 text-gray-900">Milieu social recherché</label>
                                        <div class="mt-2">
                                            <select id="msRech_cli" name="msRech_cli" v-model="current_user.msRech_cli"
                                                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:max-w-xs sm:text-sm sm:leading-6">
                                                <option value="_0">Bon</option>
                                                <option value="_1">Moyen</option>
                                                <option value="_2">Modeste</option>
                                                <option value="_3">Autre</option>
                                            </select>
                                            <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                        </div>
                                    </div>
                                    <div v-if="current_user.msRech_cli === '_3'" class="sm:col-span-3">
                                        <label for="msRechPrec" class="block text-sm font-medium leading-6 text-gray-900">Précisions</label>
                                        <div class="mt-2"> 
                                            <input type="text" v-model="current_user.msRechPrec_cli" name="msRechPrec_cli" id="msRechPrec_cli" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                            <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                        </div>
                                    </div>

                                    <div class="col-span-full">
                                        <legend class="text-base font-semibold leading-6 text-gray-900 mb-4">Son allure</legend>
                                        <div class="gap-4 grid grid-cols-4">
                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.desAllure_cli" id="indetermine" value="0" name="indetermine" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="indetermine" class="font-medium text-gray-900">Indeterminé</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.desAllure_cli" id="classique" value="1" name="classique" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="classique" class="font-medium text-gray-900">Classique</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.desAllure_cli" id="attirant" value="2" name="attirant" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="attirant" class="font-medium text-gray-900">Attirant(e)</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.desAllure_cli" id="decontracte" value="3" name="decontracte" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="decontracte" class="font-medium text-gray-900">Décontracté(e)</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.desAllure_cli" id="moderne" value="4" name="moderne" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="moderne" class="font-medium text-gray-900">Moderne</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.desAllure_cli" id="elegant" value="5" name="elegant" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="elegant" class="font-medium text-gray-900">Élégant</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.desAllure_cli" id="elance" value="6" name="elance" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="elance" class="font-medium text-gray-900">Élancé(e)</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.desAllure_cli" id="moyenne" value="7" name="moyenne" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="moyenne" class="font-medium text-gray-900">Moyenne</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.desAllure_cli" id="solide" value="8" name="solide" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="solide" class="font-medium text-gray-900">Solide</label>
                                                </div>
                                            </div>

                                            <div v-if="current_user.sexe_cli === 'H'" class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.desAllure_cli" id="feminine" value="10" name="feminine" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="feminine" class="font-medium text-gray-900">Féminine</label>
                                                </div>

                                            </div>

                                            <div v-if="current_user.sexe_cli === 'F'" class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.desAllure_cli" id="viril" value="9" name="viril" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="viril" class="font-medium text-gray-900">Viril</label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="col-span-full">
                                        <legend class="text-base font-semibold leading-6 text-gray-900 mb-4">Sa personnalité</legend>
                                        <div class="gap-4 grid grid-cols-4">
                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.desPersonnalite_cli" id="indetermine" value="0" name="indetermine" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="indetermine" class="font-medium text-gray-900">Indeterminé</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.desPersonnalite_cli" id="Romantique" value="1" name="Romantique" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="Romantique" class="font-medium text-gray-900">Romantique</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.desPersonnalite_cli" id="sentimental" value="2" name="sentimental" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="sentimental" class="font-medium text-gray-900">Sentimental(e)</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.desPersonnalite_cli" id="sensible" value="3" name="sensible" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="sensible" class="font-medium text-gray-900">Sensible</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.desPersonnalite_cli" id="optimiste" value="4" name="optimiste" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="optimiste" class="font-medium text-gray-900">Optimiste</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.desPersonnalite_cli" id="humour" value="5" name="humour" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="humour" class="font-medium text-gray-900">Humour</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.desPersonnalite_cli" id="cultive" value="6" name="cultive" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="cultive" class="font-medium text-gray-900">Cultivé(e)</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.desPersonnalite_cli" id="patient" value="7" name="patient" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="patient" class="font-medium text-gray-900">Patient(e)</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.desPersonnalite_cli" id="doux" value="8" name="doux" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="doux" class="font-medium text-gray-900">Doux(ce)</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.desPersonnalite_cli" id="ambitieux" value="9" name="ambitieux" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="ambitieux" class="font-medium text-gray-900">Ambitieux(se)</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.desPersonnalite_cli" id="communicatif" value="10" name="communicatif" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="communicatif" class="font-medium text-gray-900">Communicatif(ve)</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.desPersonnalite_cli" id="dynamique" value="11" name="dynamique" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="dynamique" class="font-medium text-gray-900">Dynamique</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.desPersonnalite_cli" id="savoir-vivre" value="12" name="savoir-vivre" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="savoir-vivre" class="font-medium text-gray-900">Savoir-vire</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.desPersonnalite_cli" id="reserve" value="13" name="reserve" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="reserve" class="font-medium text-gray-900">Réservé(e)</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.desPersonnalite_cli" id="intelligent" value="14" name="intelligent" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="intelligent" class="font-medium text-gray-900">Intelligent(e)</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.desPersonnalite_cli" id="tendre" value="15" name="tendre" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="tendre" class="font-medium text-gray-900">Tendre</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.desPersonnalite_cli" id="fidele" value="16" name="fidele" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="fidele" class="font-medium text-gray-900">Fidèle</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.desPersonnalite_cli" id="realiste" value="17" name="realiste" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="realiste" class="font-medium text-gray-900">Réaliste</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.desPersonnalite_cli" id="affectueux" value="18" name="affectueux" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="affectueux" class="font-medium text-gray-900">Affectueux(se)</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.desPersonnalite_cli" id="securisant" value="19" name="securisant" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="securisant" class="font-medium text-gray-900">Sécurisant(e)</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.desPersonnalite_cli" id="sociable" value="20" name="sociable" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="sociable" class="font-medium text-gray-900">Sociable</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.desPersonnalite_cli" id="tolerant" value="21" name="tolerant" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="tolerant" class="font-medium text-gray-900">Tolérant(e)</label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="col-span-full">
                                        <legend class="text-base font-semibold leading-6 text-gray-900 mb-4">Ses goûts</legend>
                                        <div class="gap-4 grid grid-cols-4">
                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.desGouts_cli" id="indetermine" value="0" name="indetermine" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="indetermine" class="font-medium text-gray-900">Indeterminé</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.desGouts_cli" id="enfants" value="1" name="enfants" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="enfants" class="font-medium text-gray-900">Les enfants</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.desGouts_cli" id="cuisine" value="2" name="cuisine" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="cuisine" class="font-medium text-gray-900">La cuisine</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.desGouts_cli" id="bricolage" value="3" name="bricolage" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="bricolage" class="font-medium text-gray-900">Le bricolage</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.desGouts_cli" id="animaux" value="4" name="animaux" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="animaux" class="font-medium text-gray-900">Les animaux</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.desGouts_cli" id="arts" value="5" name="arts" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="arts" class="font-medium text-gray-900">Les arts</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.desGouts_cli" id="cultive" value="6" name="lecture" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="lecture" class="font-medium text-gray-900">La lecture</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.desGouts_cli" id="musique" value="7" name="musique" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="musique" class="font-medium text-gray-900">La musique</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.desGouts_cli" id="sorties" value="8" name="sorties" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="sorties" class="font-medium text-gray-900">Les sorties</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.desGouts_cli" id="sport" value="9" name="sport" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="sport" class="font-medium text-gray-900">Le sport</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.desGouts_cli" id="vie_de_famille" value="10" name="vie_de_famille" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="vie_de_famille" class="font-medium text-gray-900">La vie de famille</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.desGouts_cli" id="sexe" value="11" name="sexe" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="sexe" class="font-medium text-gray-900">Le sexe</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.desGouts_cli" id="spiritualite" value="12" name="spiritualite" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="spiritualite" class="font-medium text-gray-900">Spiritualité</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.desGouts_cli" id="nature" value="13" name="nature" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="nature" class="font-medium text-gray-900">La nature</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.desGouts_cli" id="danse" value="14" name="danse" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="danse" class="font-medium text-gray-900">La danse</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.desGouts_cli" id="voyages" value="15" name="voyages" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="voyages" class="font-medium text-gray-900">Les voyages</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.desGouts_cli" id="gastronomie" value="16" name="gastronomie" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="gastronomie" class="font-medium text-gray-900">La gastronomie</label>
                                                </div>
                                            </div>

                                            <div class="relative flex items-start">
                                                <div class="flex h-6 items-center">
                                                    <input v-model="current_user.desGouts_cli" id="culturelle" value="17" name="culturelle" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
                                                </div>
                                                <div class="ml-3 text-sm leading-6">
                                                    <label for="culturelle" class="font-medium text-gray-900">La vie culturelle</label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </fieldset>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="space-y-10 mt-10" v-if="active_tab === 'Annonces'">
            <div class="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
                <div class="px-4 sm:px-0">
                    <h2 class="text-base font-semibold leading-7 text-gray-900">Affichage journal et site</h2>
                    <p class="mt-1 text-sm leading-6 text-gray-600">Plus les critères de recherche seront précis, plus notre outil de matching dénichera les profils les plus pertinents.</p>
                </div>
                <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
                    <div class="px-4 py-6 sm:p-8">
                        <div class="max-w-2xl space-y-10">
                            <fieldset>
                                <span class="block text-sm font-medium leading-6 text-gray-900 mb-2">Annonce 1</span>
                                <div class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm sm:leading-6">
                                    <div class="flex gap-4 justify-between items-center mb-4 shadow-md py-2 px-4" v-if="editorAnn1">
                                        <div class="flex gap-1 items-center">
                                            <button type="button" @click="editorAnn1.chain().focus().toggleBold().run()"
                                                :disabled="!editorAnn1.can().chain().focus().toggleBold().run()"
                                                :class="{ 'bg-rose/50': editorAnn1.isActive('bold') }" class="px-2 py-1 hover:bg-slate-500/20 rounded-md duration-300 ease-out">
                                                <svg class="h-4 w-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                                                    <path d="M0 56C0 42.7 10.7 32 24 32H72 88 212c68.5 0 124 55.5 124 124c0 34.7-14.3 66.2-37.3 88.7C339.7 264.9 368 307.1 368 356c0 68.5-55.5 124-124 124H88 72 24c-13.3 0-24-10.7-24-24s10.7-24 24-24H48V256 80H24C10.7 80 0 69.3 0 56zM212 232c42 0 76-34 76-76s-34-76-76-76H96V232H212zM96 280V432H244c42 0 76-34 76-76s-34-76-76-76H212 96z"/>
                                                </svg>
                                            </button>
                                            <button type="button" @click="editorAnn1.chain().focus().toggleItalic().run()"
                                                :disabled="!editorAnn1.can().chain().focus().toggleItalic().run()"
                                                :class="{ 'bg-rose/50': editorAnn1.isActive('italic') }" class="px-2 py-1 rounded-md hover:bg-slate-500/20 duration-300 ease-out">
                                                <svg class="h-4 w-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                                                    <path d="M128 56c0-13.3 10.7-24 24-24H360c13.3 0 24 10.7 24 24s-10.7 24-24 24H291.3L144.7 432H232c13.3 0 24 10.7 24 24s-10.7 24-24 24H24c-13.3 0-24-10.7-24-24s10.7-24 24-24H92.7L239.3 80H152c-13.3 0-24-10.7-24-24z"/>
                                                </svg>
                                            </button>
                                            <button type="button" @click="editorAnn1.chain().focus().toggleBulletList().run()"
                                                :class="{ 'bg-rose/50': editorAnn1.isActive('bulletList') }" class="px-2 py-1 rounded-md hover:bg-slate-500/20 duration-300 ease-out">
                                                <svg class="h-4 w-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                                    <path d="M64 64a32 32 0 1 0 0 64 32 32 0 1 0 0-64zM176 80c-8.8 0-16 7.2-16 16s7.2 16 16 16H496c8.8 0 16-7.2 16-16s-7.2-16-16-16H176zm0 160c-8.8 0-16 7.2-16 16s7.2 16 16 16H496c8.8 0 16-7.2 16-16s-7.2-16-16-16H176zm0 160c-8.8 0-16 7.2-16 16s7.2 16 16 16H496c8.8 0 16-7.2 16-16s-7.2-16-16-16H176zM96 256a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zM64 384a32 32 0 1 0 0 64 32 32 0 1 0 0-64z"/>
                                                </svg>
                                            </button>
                                            <button type="button" @click="editorAnn1.chain().focus().toggleOrderedList().run()"
                                                :class="{ 'bg-rose/50': editorAnn1.isActive('orderedList') }" class="px-2 py-1 rounded-md hover:bg-slate-500/20 duration-300 ease-out">
                                                <svg class="h-4 w-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                                    <path d="M32 48c0 8.8 7.2 16 16 16H64V192H32c-8.8 0-16 7.2-16 16s7.2 16 16 16h96c8.8 0 16-7.2 16-16s-7.2-16-16-16H96V48c0-8.8-7.2-16-16-16H48c-8.8 0-16 7.2-16 16zM192 96c0 8.8 7.2 16 16 16H496c8.8 0 16-7.2 16-16s-7.2-16-16-16H208c-8.8 0-16 7.2-16 16zm0 160c0 8.8 7.2 16 16 16H496c8.8 0 16-7.2 16-16s-7.2-16-16-16H208c-8.8 0-16 7.2-16 16zm0 160c0 8.8 7.2 16 16 16H496c8.8 0 16-7.2 16-16s-7.2-16-16-16H208c-8.8 0-16 7.2-16 16zM58.7 323.9c11.1-11.1 29.2-10.5 39.6 1.3c9.2 10.5 8.9 26.2-.6 36.3L12.3 453.1c-4.3 4.7-5.5 11.5-3 17.3s8.3 9.6 14.7 9.6H128c8.8 0 16-7.2 16-16s-7.2-16-16-16H60.8l60.3-64.6c20.7-22.2 21.2-56.4 1.3-79.3c-22.5-25.7-62.1-27.1-86.3-2.9L20.7 316.7c-6.2 6.2-6.2 16.4 0 22.6s16.4 6.2 22.6 0l15.4-15.4z"/>
                                                </svg>
                                            </button>
                                        </div>
        
                                        <div class="flex gap-1 items-center">
                                            <button type="button" @click="editorAnn1.chain().focus().undo().run()"
                                                :disabled="!editorAnn1.can().chain().focus().undo().run()" class="px-2 py-1 rounded-md hover:bg-slate-500/20 duration-300 ease-out">
                                                <svg class="h-4 w-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                                    <path d="M135 369c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-87-87H424c22.1 0 40 17.9 40 40V456c0 13.3 10.7 24 24 24s24-10.7 24-24V288c0-48.6-39.4-88-88-88H81.9l87-87c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0L7 207c-9.4 9.4-9.4 24.6 0 33.9L135 369z"/>
                                                </svg>
                                            </button>
                                            <button type="button" @click="editorAnn1.chain().focus().redo().run()"
                                                :disabled="!editorAnn1.can().chain().focus().redo().run()" class="px-2 py-1 hover:bg-slate-500/20 rounded-md duration-300 ease-out">
                                                <svg class="h-4 w-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                                    <path d="M40 224c-13.3 0-24-10.7-24-24V56c0-13.3 10.7-24 24-24s24 10.7 24 24v80.1l20-23.5C125 63.4 186.9 32 256 32c123.7 0 224 100.3 224 224s-100.3 224-224 224c-50.4 0-97-16.7-134.4-44.8c-10.6-8-12.7-23-4.8-33.6s23-12.7 33.6-4.8C179.8 418.9 216.3 432 256 432c97.2 0 176-78.8 176-176s-78.8-176-176-176c-54.3 0-102.9 24.6-135.2 63.4l-.1 .2 0 0L93.1 176H184c13.3 0 24 10.7 24 24s-10.7 24-24 24H40z"/>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    <editor-content class="px-4" :editor="editorAnn1" />
                                </div>
                            </fieldset>
                            <fieldset>
                                <span class="block text-sm font-medium leading-6 text-gray-900 mb-2">Annonce 2</span>
                                <div class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm sm:leading-6">
                                    <div class="flex gap-4 justify-between items-center mb-4 shadow-md py-2 px-4" v-if="editorAnn2">
                                        <div class="flex gap-1 items-center">
                                            <button type="button" @click="editorAnn2.chain().focus().toggleBold().run()"
                                                :disabled="!editorAnn2.can().chain().focus().toggleBold().run()"
                                                :class="{ 'bg-rose/50': editorAnn2.isActive('bold') }" class="px-2 py-1 hover:bg-slate-500/20 rounded-md duration-300 ease-out">
                                                <svg class="h-4 w-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                                                    <path d="M0 56C0 42.7 10.7 32 24 32H72 88 212c68.5 0 124 55.5 124 124c0 34.7-14.3 66.2-37.3 88.7C339.7 264.9 368 307.1 368 356c0 68.5-55.5 124-124 124H88 72 24c-13.3 0-24-10.7-24-24s10.7-24 24-24H48V256 80H24C10.7 80 0 69.3 0 56zM212 232c42 0 76-34 76-76s-34-76-76-76H96V232H212zM96 280V432H244c42 0 76-34 76-76s-34-76-76-76H212 96z"/>
                                                </svg>
                                            </button>
                                            <button type="button" @click="editorAnn2.chain().focus().toggleItalic().run()"
                                                :disabled="!editorAnn2.can().chain().focus().toggleItalic().run()"
                                                :class="{ 'bg-rose/50': editorAnn2.isActive('italic') }" class="px-2 py-1 rounded-md hover:bg-slate-500/20 duration-300 ease-out">
                                                <svg class="h-4 w-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                                                    <path d="M128 56c0-13.3 10.7-24 24-24H360c13.3 0 24 10.7 24 24s-10.7 24-24 24H291.3L144.7 432H232c13.3 0 24 10.7 24 24s-10.7 24-24 24H24c-13.3 0-24-10.7-24-24s10.7-24 24-24H92.7L239.3 80H152c-13.3 0-24-10.7-24-24z"/>
                                                </svg>
                                            </button>
                                            <button type="button" @click="editorAnn2.chain().focus().toggleBulletList().run()"
                                                :class="{ 'bg-rose/50': editorAnn2.isActive('bulletList') }" class="px-2 py-1 rounded-md hover:bg-slate-500/20 duration-300 ease-out">
                                                <svg class="h-4 w-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                                    <path d="M64 64a32 32 0 1 0 0 64 32 32 0 1 0 0-64zM176 80c-8.8 0-16 7.2-16 16s7.2 16 16 16H496c8.8 0 16-7.2 16-16s-7.2-16-16-16H176zm0 160c-8.8 0-16 7.2-16 16s7.2 16 16 16H496c8.8 0 16-7.2 16-16s-7.2-16-16-16H176zm0 160c-8.8 0-16 7.2-16 16s7.2 16 16 16H496c8.8 0 16-7.2 16-16s-7.2-16-16-16H176zM96 256a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zM64 384a32 32 0 1 0 0 64 32 32 0 1 0 0-64z"/>
                                                </svg>
                                            </button>
                                            <button type="button" @click="editorAnn2.chain().focus().toggleOrderedList().run()"
                                                :class="{ 'bg-rose/50': editorAnn2.isActive('orderedList') }" class="px-2 py-1 rounded-md hover:bg-slate-500/20 duration-300 ease-out">
                                                <svg class="h-4 w-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                                    <path d="M32 48c0 8.8 7.2 16 16 16H64V192H32c-8.8 0-16 7.2-16 16s7.2 16 16 16h96c8.8 0 16-7.2 16-16s-7.2-16-16-16H96V48c0-8.8-7.2-16-16-16H48c-8.8 0-16 7.2-16 16zM192 96c0 8.8 7.2 16 16 16H496c8.8 0 16-7.2 16-16s-7.2-16-16-16H208c-8.8 0-16 7.2-16 16zm0 160c0 8.8 7.2 16 16 16H496c8.8 0 16-7.2 16-16s-7.2-16-16-16H208c-8.8 0-16 7.2-16 16zm0 160c0 8.8 7.2 16 16 16H496c8.8 0 16-7.2 16-16s-7.2-16-16-16H208c-8.8 0-16 7.2-16 16zM58.7 323.9c11.1-11.1 29.2-10.5 39.6 1.3c9.2 10.5 8.9 26.2-.6 36.3L12.3 453.1c-4.3 4.7-5.5 11.5-3 17.3s8.3 9.6 14.7 9.6H128c8.8 0 16-7.2 16-16s-7.2-16-16-16H60.8l60.3-64.6c20.7-22.2 21.2-56.4 1.3-79.3c-22.5-25.7-62.1-27.1-86.3-2.9L20.7 316.7c-6.2 6.2-6.2 16.4 0 22.6s16.4 6.2 22.6 0l15.4-15.4z"/>
                                                </svg>
                                            </button>
                                        </div>
        
                                        <div class="flex gap-1 items-center">
                                            <button type="button" @click="editorAnn2.chain().focus().undo().run()"
                                                :disabled="!editorAnn2.can().chain().focus().undo().run()" class="px-2 py-1 rounded-md hover:bg-slate-500/20 duration-300 ease-out">
                                                <svg class="h-4 w-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                                    <path d="M135 369c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-87-87H424c22.1 0 40 17.9 40 40V456c0 13.3 10.7 24 24 24s24-10.7 24-24V288c0-48.6-39.4-88-88-88H81.9l87-87c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0L7 207c-9.4 9.4-9.4 24.6 0 33.9L135 369z"/>
                                                </svg>
                                            </button>
                                            <button type="button" @click="editorAnn2.chain().focus().redo().run()"
                                                :disabled="!editorAnn2.can().chain().focus().redo().run()" class="px-2 py-1 hover:bg-slate-500/20 rounded-md duration-300 ease-out">
                                                <svg class="h-4 w-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                                    <path d="M40 224c-13.3 0-24-10.7-24-24V56c0-13.3 10.7-24 24-24s24 10.7 24 24v80.1l20-23.5C125 63.4 186.9 32 256 32c123.7 0 224 100.3 224 224s-100.3 224-224 224c-50.4 0-97-16.7-134.4-44.8c-10.6-8-12.7-23-4.8-33.6s23-12.7 33.6-4.8C179.8 418.9 216.3 432 256 432c97.2 0 176-78.8 176-176s-78.8-176-176-176c-54.3 0-102.9 24.6-135.2 63.4l-.1 .2 0 0L93.1 176H184c13.3 0 24 10.7 24 24s-10.7 24-24 24H40z"/>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    <editor-content class="px-4" :editor="editorAnn2" />
                                </div>
                            </fieldset>
                            <fieldset>
                                <legend class="text-sm font-semibold leading-6 text-gray-900">Situation</legend>
                                <div class="mt-6 grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                    <div class="sm:col-span-full">
                                        <label for="idAgence_cli" class="block text-sm font-medium leading-6 text-gray-900">Agence</label>
                                        <div class="mt-2">
                                            <select v-model="current_user.idAgence_cli" id="idAgence_cli" name="idAgence_cli" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6">
                                                <option v-for="agence in agences" :key="agence.id_agence" :value="agence.id_agence">{{agence.lib_agence}}</option>
                                            </select>
                                            <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                        </div>
                                    </div>
        
                                    <div class="sm:col-span-3">
                                        <label for="affAnn_cli" class="block text-sm font-medium leading-6 text-gray-900">Affichage de l'annonce</label>
                                        <div class="mt-2">
                                            <select v-model="current_user.affAnn_cli" id="affAnn_cli" name="affAnn_cli" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:max-w-xs sm:text-sm sm:leading-6">
                                                <option value="I">Inderterminé</option>
                                                <option value="O">Oui</option>
                                                <option value="N">Non</option>
                                                <option value="P">Profil rare</option>
                                            </select>
                                            <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                        </div>
                                    </div>
                                    <div class="sm:col-span-3">
                                        <label for="nroAnn_cli" class="block text-sm font-medium leading-6 text-gray-900">Annonce à faire apparaître</label>
                                        <div class="mt-2">
                                            <select v-model="current_user.nroAnn_cli" id="nroAnn_cli" name="nroAnn_cli" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:max-w-xs sm:text-sm sm:leading-6">
                                                <option value="0">Inderterminé</option>
                                                <option value="1">Annonce 1</option>
                                                <option value="2">Annonce 2</option>
                                            </select>
                                            <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                        </div>
                                    </div>
        
                                    <div class="sm:col-span-2 self-start mb-2">
                                        <SwitchGroup as="div" class="flex items-center flex-wrap">
                                            <Switch @click="debouncedFunction" v-model="current_user.proc_cli" name="proc_cli"
                                                :class="[current_user.proc_cli ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                                <span aria-hidden="true"
                                                    :class="[current_user.proc_cli ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                            </Switch>
                                            <SwitchLabel as="span" class="ml-3 text-sm">
                                                <span class="font-medium text-gray-900">Procuration</span>
                                            </SwitchLabel>
                                            <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden status">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                        </SwitchGroup>
                                    </div>
                                </div>
                            </fieldset>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="space-y-10 mt-10" v-if="active_tab === 'Autres'">
            <div class="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
                <div class="px-4 sm:px-0">
                    <h2 class="text-base font-semibold leading-7 text-gray-900">Informations complémentaires</h2>
                    <p class="mt-1 text-sm leading-6 text-gray-600">Plus les critères de recherche seront précis, plus notre outil de matching dénichera les profils les plus pertinents.</p>
                </div>
                <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
                    <div class="px-4 py-6 sm:p-8">
                        <div class="max-w-2xl space-y-10">
                            <fieldset>
                                <div class="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                    <div class="sm:col-span-full">
                                        <label for="origine_cli"
                                            class="block text-sm font-medium leading-6 text-gray-900">Origine de la demande</label>
                                        <div class="mt-2">
                                            <select name="origine_cli" id="origine_cli" v-model="current_user.origine_cli"
                                                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6">
                                                <option value="0">Indeterminé</option>
                                                <option value="1">PQR</option>
                                                <option value="2">Gratuit</option>
                                                <option value="3">Flyer/Brochure</option>
                                                <option value="4">Relation</option>
                                                <option value="5">Renouvellement</option>
                                                <option value="6">Internet</option>
                                                <option value="7">Annuaire</option>
                                                <option value="8">Vitrine/Enseigne</option>
                                                <option value="9">Relance</option>
                                                <option value="10">Autre</option>
                                            </select>
                                            <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                        </div>
                                    </div>
                                    <div class="sm:col-span-full">
                                        <label for="insc_cli" class="block text-sm font-medium leading-6 text-gray-900">Date d'inscription</label>
                                        <div class="mt-2">
                                            <input id="insc_cli" v-model="current_user.insc_cli" name="insc_cli" type="date" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                            <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                        </div>
                                    </div>
                                    <div class="sm:col-span-3">
                                        <SwitchGroup as="div" class="flex items-center flex-wrap">
                                            <Switch @click="debouncedFunction" v-model="current_user.vip_cli" name="vip_cli"
                                                :class="[current_user.vip_cli ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                                <span aria-hidden="true"
                                                    :class="[current_user.vip_cli ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                            </Switch>
                                            <SwitchLabel as="span" class="ml-3 text-sm">
                                                <span class="font-medium text-gray-900">Client VIP</span>
                                            </SwitchLabel>
                                            <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden status">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                        </SwitchGroup>
                                    </div>
                                    <div class="sm:col-span-3">
                                        <SwitchGroup as="div" class="flex items-center flex-wrap">
                                            <Switch @click="debouncedFunction" v-model="current_user.ln_cli" name="ln_cli"
                                                :class="[current_user.ln_cli ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                                <span aria-hidden="true"
                                                    :class="[current_user.ln_cli ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                            </Switch>
                                            <SwitchLabel as="span" class="ml-3 text-sm">
                                                <span class="font-medium text-gray-900">Liste noir</span>
                                            </SwitchLabel>
                                            <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden status">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                        </SwitchGroup>
                                    </div>
                                    <div class="sm:col-span-3">
                                        <SwitchGroup as="div" class="flex items-center flex-wrap">
                                            <Switch @click="debouncedFunction" v-model="current_user.cont_cli" name="cont_cli"
                                                :class="[current_user.cont_cli ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                                <span aria-hidden="true"
                                                    :class="[current_user.cont_cli ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                            </Switch>
                                            <SwitchLabel as="span" class="ml-3 text-sm">
                                                <span class="font-medium text-gray-900">Contact</span>
                                            </SwitchLabel>
                                            <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden status">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                        </SwitchGroup>
                                    </div>
                                    <div class="sm:col-span-3">
                                        <SwitchGroup as="div" class="flex items-center flex-wrap">
                                            <Switch @click="debouncedFunction" v-model="current_user.prosp_cli" name="prosp_cli"
                                                :class="[current_user.prosp_cli ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                                <span aria-hidden="true"
                                                    :class="[current_user.prosp_cli ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                            </Switch>
                                            <SwitchLabel as="span" class="ml-3 text-sm">
                                                <span class="font-medium text-gray-900">Prospect</span>
                                            </SwitchLabel>
                                            <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden status">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                        </SwitchGroup>
                                    </div>
                                    <div class="sm:col-span-full">
                                        <label for="rev_cli" class="block text-sm font-medium leading-6 text-gray-900">Date de révision</label>
                                        <div class="mt-2">
                                            <input id="rev_cli" v-model="current_user.rev_cli" name="rev_cli" type="date" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                            <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                        </div>
                                    </div>
                                    <div class="sm:col-span-full">
                                        <label for="duree_cli" class="block text-sm font-medium leading-6 text-gray-900">Durée du contrat</label>
                                        <div class="mt-2 relative">
                                            <input type="text" v-model="current_user.duree_cli" name="duree_cli" id="duree_cli" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                            <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                            <div class="pointer-events-none absolute top-[8px] right-0 flex items-center pr-3">
                                                <span class="text-gray-500 text-xs" id="price-currency">mois</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="sm:col-span-3">
                                        <SwitchGroup as="div" class="flex items-center flex-wrap">
                                            <Switch @click="debouncedFunction" v-model="current_user.libre_cli" name="libre_cli"
                                                :class="[current_user.libre_cli ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                                <span aria-hidden="true"
                                                    :class="[current_user.libre_cli ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                            </Switch>
                                            <SwitchLabel as="span" class="ml-3 text-sm">
                                                <span class="font-medium text-gray-900">Libre</span>
                                            </SwitchLabel>
                                            <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden status">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                        </SwitchGroup>
                                    </div>
                                    <div class="sm:col-span-3">
                                        <SwitchGroup as="div" class="flex items-center flex-wrap">
                                            <Switch @click="debouncedFunction" v-model="current_user.probPaie_cli" name="probPaie_cli"
                                                :class="[current_user.probPaie_cli ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                                <span aria-hidden="true"
                                                    :class="[current_user.probPaie_cli ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                            </Switch>
                                            <SwitchLabel as="span" class="ml-3 text-sm">
                                                <span class="font-medium text-gray-900">Problème de paiement</span>
                                            </SwitchLabel>
                                            <span class="text-green-600 text-xs items-center gap-2 mt-2 hidden status">Champ mis à jour<CheckIcon class="w-3 h-3"/></span>
                                        </SwitchGroup>
                                    </div>
                                </div>
                            </fieldset>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="space-y-10 mt-10" v-if="active_tab === 'Rencontres'">
            <RencontresPanel :client="current_user.id_cli" :name="current_user.sexe_cli === 'H' ? 'Mr ' + current_user.nom_cli : 'Mme ' + current_user.nom_cli" :mail="current_user.mail_cli" />
        </div>

        <div class="space-y-10" v-if="active_tab === 'Documents'">
            <DocumentsPanel :client="current_user.id_cli" />
        </div>
    </form>
</template>


<style scoped>

    input.updated,
    select.updated,
    textarea.updated,
    button.updated {
        box-shadow: 0 0px 7px #05a01fc9;
    }

    input.updated ~ span,
    textarea.updated ~ span,
    select.updated ~ span {
        display: flex;
    }

    button.updated ~ span.status {
        display: flex;
        flex: 1 0 100%;
    }

    input[disabled],
    select[disabled],
    textarea[disabled] {
        opacity: 0.60;
    }

</style>