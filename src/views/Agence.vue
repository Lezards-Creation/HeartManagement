<script setup>
    import { computed, ref, watch } from "vue"
    import { useRoute } from 'vue-router'
    import { useAgencesStore } from '../stores/agences'
    import FicheAgence from '../components/FicheAgence.vue';


    const agencesStore = useAgencesStore()
    const route = useRoute()

    const conseillers = ref(null);
    const agence = ref(null)
    const responsable = ref(null);

    const fetchConseiller = () => {
        agencesStore.getAgence(route.params.id)
        .then(res => {
            responsable.value = res.responsable ? res.responsable : null;
            agence.value = res.agence ? res.agence : null;
            conseillers.value = res.conseillers ? res.conseillers : null;
        })
        .catch(err => {
            console.error(err);
        }) 
    }
    watch(() => route.params.id, fetchConseiller, {immediate: true});
</script>

<template>
    <section class="page flex">
        <div class="h-screen border-r border-r-gray-100">
            <nav class="h-screen overflow-y-auto w-96  bg-white/80 backdrop-blur-sm relative" aria-label="Directory">
                <div v-if="responsable" class="relative">
                    <div class="sticky top-0 z-10 border-y border-b-gray-200 border-t-gray-100 bg-gray-50 px-3 py-1.5 text-sm font-semibold leading-6 text-rose">
                        <h3>Responsable</h3>
                    </div>
                    <ul role="list" class="divide-y divide-gray-100">
                        <li class="flex gap-x-4 px-3 py-5 hover:bg-rose-50 items-center transition-all pointer">
                            <div class="min-w-0">
                                <p class="text-sm font-medium  text-gray-900">
                                    {{ responsable.prenom }} {{ responsable.nom }}
                                </p>
                            </div>
                        </li>
                    </ul>
                </div>
                <div  class="relative">
                    <div class="sticky top-0 z-10 border-y border-b-gray-200 border-t-gray-100 bg-gray-50 px-3 py-1.5 text-sm font-semibold leading-6 text-rose">
                        <h3>Conseillers</h3>
                    </div>
                    <ul role="list" class="divide-y divide-gray-100">
                        <li v-for="conseiller in conseillers" :key="conseiller.ID"
                            class="flex gap-x-4 px-3 py-5 hover:bg-rose-50 items-center transition-all pointer">
                            <div class="min-w-0">
                                <p class="text-sm font-medium  text-gray-900">
                                    {{ conseiller.prenom }} {{ conseiller.nom }}
                                </p>
                            </div>
                        </li>
                    </ul>
                </div>
            </nav>
        </div>

        <FicheAgence v-if="agence" :agence="agence"/>
    </section>
</template>
