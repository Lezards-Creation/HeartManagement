<script setup>
	import { useRouter, useRoute } from 'vue-router'
	const location = useRoute();
</script>

<template>
	<main class="h-screen overflow-hidden">
		<div class="flex h-full">
			<div v-if="location.name !== 'Connexion'" class="sidebar basis-auto grow-0 shrink-0 sm:rounded-tl-3xl sm:rounded-bl-3xl sm:relative sm:w-auto w-full fixed bottom-0 left-0 z-10">
				<Sidebar />
			</div>
			<div class="view grow rounded-br-3xl rounded-tr-3xl h-full no-scrollbar">
				<RouterView />
			</div>
		</div>
	</main>
</template>
