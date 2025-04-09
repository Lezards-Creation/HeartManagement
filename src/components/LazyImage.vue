<template>
	<div ref="containerRef" :class="wrapperClass">
		<img
			v-if="isVisible"
			:src="src"
			:class="imgClass"
			:loading="loading"
			@error="handleError"
		/>
	</div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
	src: String,
	imgClass: String,
	wrapperClass: String, // optional, to style the outer div
	loading: { type: String, default: 'lazy' },
	onError: Function,
})

const containerRef = ref(null)
const isVisible = ref(false)
let observer = null

const handleError = (event) => {
	if (props.onError) props.onError(event)
}

onMounted(() => {
	if (!containerRef.value) return
	observer = new IntersectionObserver(([entry]) => {
		if (entry.isIntersecting) {
			isVisible.value = true
			observer.disconnect()
		}
	}, {
		rootMargin: '200px',
	})
	observer.observe(containerRef.value)
})

onBeforeUnmount(() => {
	if (observer) observer.disconnect()
})
</script>