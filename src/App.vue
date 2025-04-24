<script setup>
	import { useRouter, useRoute } from 'vue-router'
	const route = useRoute();
</script>

<template>
	<main class="sm:h-screen sm:overflow-hidden">
		<Sidebar
			v-if="route.name !== 'Connexion'
				&& route.name !== 'Tutoriels'
				&& route.name !== 'password'"
			/>
		<RouterView v-else/>
	</main>
</template>
