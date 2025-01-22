<script setup>
	import { useRouter, useRoute } from 'vue-router'
	const location = useRoute();
</script>

<template>
	<main class="sm:h-screen sm:overflow-hidden">
		<Sidebar v-if="location.name !== 'Connexion'"  />
		<RouterView v-else />
	</main>
</template>
