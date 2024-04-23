<script setup>
	import { computed, ref, onMounted } from 'vue'
    import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
    import { useDocumentsStore } from '../stores/documents'
    
    const uri = import.meta.env.VITE_URL;
    const props = defineProps(['client']);

    const documentsStore = useDocumentsStore();

    const documents = ref([]); // Use ref to make documents reactive

    function fetchDocuments() {
        documentsStore.getDocuments(props.client)
        .then(res => {
            documents.value = res.files;
        })
        .catch(err => {
            console.error(err);
        }) 
    }

    const statuses = {
            'En cours': 'text-green-700 bg-green-50 ring-green-600/20',
            'En retard': 'text-red-600 bg-red-50 ring-gray-500/10',
            Payé: 'text-yellow-800 bg-yellow-50 ring-yellow-600/20',
    }

    const projects = [
        {
            id: 1,
            name: 'Abonnement Octobre 2023',
            href: '#',
            status: 'En cours',
            createdBy: 'Matthieu ANDRE',
            dueDate: '10 novembre 2023',
            dueDateTime: '2023-03-17T00:00Z',
        },
        {
            id: 2,
            name: 'Abonnement Septembre 2023',
            href: '#',
            status: 'En retard',
            createdBy: 'Matthieu ANDRE',
            dueDate: '10 octobre 2023',
            dueDateTime: '2023-05-05T00:00Z',
        },
        {
            id: 3,
            name: 'Abonnement Août 2023',
            href: '#',
            status: 'Payé',
            createdBy: 'Matthieu ANDRE',
            dueDate: '10 septembre 2023',
            dueDateTime: '2023-05-25T00:00Z',
        },
        {
            id: 4,
            name: 'Abonnement Juillet 2023',
            href: '#',
            status: 'Payé',
            createdBy: 'Matthieu ANDRE',
            dueDate: '10 août 2023',
            dueDateTime: '2023-06-07T00:00Z',
        },
        {
            id: 5,
            name: 'Abonnement Juin 2023',
            href: '#',
            status: 'Payé',
            createdBy: 'Matthieu ANDRE',
            dueDate: '10 juillet 2023',
            dueDateTime: '2023-06-10T00:00Z',
        },
    ]

    onMounted(() => {
        fetchDocuments();
    })
</script>

<template>
    <div class="space-y-10 divide-y">
        <ul role="list" class="divide-y divide-gray-100">
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
                    <a :download="`${document.name}`" :href="`${uri}/storage/documents/${client}/${document.name}`"class="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:block">Télécharger</a>
                    <a target="_blank" :href="`${uri}/storage/documents/${client}/${document.name}`"class="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:block">Visionner</a>
                </div>
            </li>
        </ul>
    </div>
</template>