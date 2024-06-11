<script setup>
	import { useRouter, useRoute } from 'vue-router'
	const location = useRoute();

	console.log(location.name)
</script>

<template>
	<main class="h-screen overflow-hidden">
		<Sidebar v-if="location.name !== 'Connexion'"  />
		<RouterView v-else />
	</main>
</template>
