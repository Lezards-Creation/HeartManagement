<script setup>
    import { ref } from 'vue'
    import { CheckCircleIcon } from '@heroicons/vue/24/outline'
    import { XMarkIcon } from '@heroicons/vue/20/solid'

    const props = defineProps(['title', 'state']);

</script>


<template>
    <!-- Global notification live region, render this permanently at the end of the document -->
    <div aria-live="assertive" class="pointer-events-none fixed w-full bottom-4 right-0 flex items-end px-4 py-6 sm:items-start sm:p-6 z-50">
        <div class="flex w-full justify-end items-end space-y-4">
        <!-- Notification panel, dynamically insert this into the live region when it needs to be displayed -->
            <transition enter-active-class="transform ease-out duration-300 transition" enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2" enter-to-class="translate-y-0 opacity-100 sm:translate-x-0" leave-active-class="transition ease-in duration-100" leave-from-class="opacity-100" leave-to-class="opacity-0">
                <div v-if="state" class="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-rose shadow-lg">
                    <div class="p-2">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <CheckCircleIcon class="h-6 w-6 text-white" aria-hidden="true" />
                            </div>
                            <div class="ml-3 w-0 flex-1 flex items-center justify-between gap-3 pt-0.5">
                                <p class="text-sm font-medium text-white">{{ title }}</p>
                                <slot></slot>
                            </div>
                            <div class="ml-4 flex flex-shrink-0">
                                <button type="button" @click="state = false" class="inline-flex rounded-md text-white hover:text-black focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                                    <span class="sr-only">Close</span>
                                    <XMarkIcon class="h-5 w-5" aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </transition>
        </div>
    </div>
</template>

