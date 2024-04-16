<script setup>
    import { PlusIcon } from '@heroicons/vue/24/outline'
    const props = defineProps(['title']);

    const toggleAccordeon = (e) => {
        let target = e.currentTarget;
        target.classList.toggle('active');
	
        var panel = target.nextElementSibling;
        if (panel.style.maxHeight) {
            panel.style.maxHeight = null;
        } else {
            panel.style.maxHeight = panel.scrollHeight + "px";
        }	
    }
</script>

<template>
    <div class="accordion relative border-b pb-1 mb-4">
        <button ref="firstAccordion" type="button" class="accordio flex items-center gap-2 group" @click="toggleAccordeon">
            <PlusIcon class="h-5 w-auto text-rose group-[.active]:rotate-45 duration-300 ease-out"/>
            {{ title }}
        </button>
        <div class="panel p-0 max-h-0 overflow-hidden duration-300 ease-out">
            <slot />
        </div>
    </div>
</template>