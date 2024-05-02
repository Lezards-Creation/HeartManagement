<script setup>
	import { XMarkIcon } from '@heroicons/vue/24/solid';
    import { DocumentTextIcon } from '@heroicons/vue/24/outline';

    import moment from "moment";
    import fr from 'moment/dist/locale/fr';
    moment.updateLocale('fr', fr);


    defineProps({
        file: { type: Object, required: true },
        tag: { type: String, default: 'li' },
    })

    defineEmits(['remove'])
</script>

<template>
	<component :is="tag" class="file-preview relative my-4 divide-y divide-gray-200 rounded-lg bg-white shadow p-6">
		<div class="flex items-center gap-x-4 flex-wrap">
            <div>
                <div class="flex items-center gap-x-3">
                    <DocumentTextIcon class="w-5 h-5"/>
                    <span>{{ file.file.name }}</span>
                </div>
                <span class="text-xs text-gray-400">{{ moment(file.file.lastModified).format('ll') }} • {{ (file.file.size / (1024*1024)).toFixed(2)}} Mo</span>
            </div>
            <button @click="$emit('remove', file)" class="close-icon flex items-center justify-center rounded-full bg-rose w-8 h-8 ml-auto">
                <XMarkIcon class="w-5 h-5 text-white"/>
            </button>
        </div>

		<span class="status-indicator loading-indicator" v-show="file.status == 'loading'">In Progress</span>
		<span class="status-indicator success-indicator" v-show="file.status == true">Uploaded</span>
		<span class="status-indicator failure-indicator" v-show="file.status == false">Error</span>
	</component>
</template>