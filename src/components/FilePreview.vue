

<script setup>
	import { XMarkIcon } from '@heroicons/vue/24/solid';

    defineProps({
        file: { type: Object, required: true },
        tag: { type: String, default: 'li' },
    })

    defineEmits(['remove'])
</script>

<template>
	<component :is="tag" class="file-preview relative">
		<button @click="$emit('remove', file)" class="close-icon flex items-center justify-center rounded-full bg-rose w-8 h-8 absolute top-0 left-0 z-10 -translate-x-1/2 -translate-y-1/2">
			<XMarkIcon class="w-5 h-5 text-white"/> 
		</button>

		<div class="aspect-square w-[300px] relative overflow-hidden">
			<img class="object-cover absolute top-0 left-0 w-full h-full" :src="file.url" :alt="file.file.name" :title="file.file.name" />
		</div>

		<span class="status-indicator loading-indicator" v-show="file.status == 'loading'">In Progress</span>
		<span class="status-indicator success-indicator" v-show="file.status == true">Uploaded</span>
		<span class="status-indicator failure-indicator" v-show="file.status == false">Error</span>
	</component>
</template>