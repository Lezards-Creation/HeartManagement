<script setup>
	import { computed, ref, onMounted, watch } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import { useDocumentsStore } from '../stores/documents'
    import DropZone from './DropZone.vue';
    import FilesListPreview from './FilesListPreview.vue';
    import useFileList from '../compositions/file-list'
    
    const uri = import.meta.env.VITE_URL;
    const props = defineProps(['client']);
    const { files, addFiles, removeFile } = useFileList()
    const route = useRoute();

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
</template>