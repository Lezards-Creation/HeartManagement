<script setup>
    import { computed, ref, watch } from 'vue'
    import { EllipsisVerticalIcon} from '@heroicons/vue/24/solid'
    import { useClientsStore } from '../stores/clients'
    import StarterKit from '@tiptap/starter-kit'
	import { useEditor, EditorContent } from '@tiptap/vue-3'
    import { Switch, SwitchGroup, SwitchLabel } from '@headlessui/vue'

    const uri = import.meta.env.VITE_URL;
    const props = defineProps(['client']);
    const clientsStore = useClientsStore()

    const current_user = computed(() => {
		return clientsStore.clients.find((el) => el.id_cli === props.client)
	})

    const active_tab = ref('Etat civil')
    const tabs = ref([
		{ name: 'Etat civil', href: '#' },
		{ name: 'Adresse', href: '#' },
		{ name: 'Situation', href: '#' },
		{ name: 'Enfants', href: '#' },
		{ name: 'Professionnel', href: '#' },
		{ name: 'Physique', href: '#' },
		{ name: 'Autres', href: '#' },
		{ name: 'Profil', href: '#' },
		{ name: 'Recherche', href: '#' },
		{ name: 'Annonces', href: '#' },
	])

    const editorAnn1 = useEditor({
		extensions: [
			StarterKit,
		],
		content: current_user.value.ann1_cli,
		onUpdate: () => {
			current_user.value.ann1_cli = editorAnn1.value.getHTML();
		}
	})

	const editorAnn2 = useEditor({
		extensions: [
			StarterKit,
		],
		content: current_user.value.ann2_cli,
		onUpdate: () => {
			current_user.value.ann2_cli = editorAnn2.value.getHTML();
		}
	})

    const fallbackImage = `${uri}/img/cli/vide.png`;
	function handleImageError(event, idCli) {
		event.target.src = fallbackImage;
	}

	watch(current_user, () => {
		editorAnn1.value.commands.setContent(current_user.value.ann1_cli);
		editorAnn2.value.commands.setContent(current_user.value.ann2_cli);
	})
</script>

<template>
    <div class="bg-gray-50 p-4 shadow-sm ring-1 ring-gray-900/5 sm:rounded-b-xl">
        <div class="relative border-b border-gray-200 pb-5 sm:pb-0">
            <div class="md:flex md:items-center md:justify-between">
                <h3 class="text-base font-semibold leading-6 text-gray-900"></h3>
            </div>
            <div class="mt-4">
                <div class="sm:hidden">
                    <label for="current-tab" class="sr-only">Select a tab</label>
                    <select id="current-tab" name="current-tab"
                        class="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600">
                        <option v-for="tab in tabs" :key="tab.name" :selected="tab.current"
                            @click="active_tab = tab.name">{{ tab.name }}</option>
                    </select>
                </div>
                <div class="hidden sm:block">
                    <nav class="-mb-px flex space-x-8">
                        <a @click="active_tab = tab.name" v-for="tab in tabs" :key="tab.name" :href="tab.href"
                            :class="[active_tab == tab.name ? 'border-rose-500 text-rose-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700', 'whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium']"
                            :aria-current="tab.current ? 'page' : undefined">{{ tab.name }}</a>
                    </nav>
                </div>
            </div>
        </div>

        <div class="space-y-10 divide-y divide-gray-900/10 mt-10" v-if="active_tab === 'Etat civil'">
            <div class="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
                <div class="px-4 sm:px-0">
                    <h2 class="text-base font-semibold leading-7 text-gray-900">Profil</h2>
                    <p class="mt-1 text-sm leading-6 text-gray-600">
                        Information publiques du client, utilisées sur sa fiche publique et pouvant être partagées aux autres clients.
                    </p>
                </div>
                <form class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
                    <div class="px-4 py-6 sm:p-8">
                        <div class="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            <div class="col-span-full flex">
                                <div class="photo overflow-hidden rounded-xl shadow-xl mt-0 mb-3 max-w-xs">
                                    <img @error="event => handleImageError(event, current_user.id_cli)" class="w-full h-auto"
                                        :src="`${uri}/img/cli/${current_user.id_cli}.jpg`"
                                        alt="" loading="lazy" />
                                </div>
                                <div class="droite p-10">
                                    <label for="photo"
                                        class="block text-sm font-medium leading-6 text-gray-900">Photo</label>
                                    <div class="mt-2 flex items-center gap-x-3">
                                        <button type="button"
                                            class="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Modifier</button>
                                    </div>
                                </div>
                            </div>
                            <div class="sm:col-span-3">
                                <label for="first-name"
                                    class="block text-sm font-medium leading-6 text-gray-900">Prénom(s)</label>
                                <div class="mt-2">
                                    <input type="text" v-model="current_user.pNoms_cli" name="first-name"
                                        id="first-name" autocomplete="given-name"
                                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                </div>
                            </div>
                            <div class="sm:col-span-3">
                                <label for="last-name" class="block text-sm font-medium leading-6 text-gray-900">Nom de famille</label>
                                <div class="mt-2">
                                    <input type="text" v-model="current_user.nom_cli" name="last-name" id="last-name"
                                        autocomplete="family-name"
                                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                </div>
                            </div>
                            <div class="sm:col-span-3">
                                <label for="email"
                                    class="block text-sm font-medium leading-6 text-gray-900">Naissance</label>
                                <div class="mt-2">
                                    <input id="date" v-model="current_user.dateNaiss_cli" name="email" type="date"
                                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                </div>
                            </div>
                            <div class="sm:col-span-3">
                                <label for="country"
                                    class="block text-sm font-medium leading-6 text-gray-900">Sexe</label>
                                <div class="mt-2">
                                    <select v-model="current_user.sexe_cli"
                                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:max-w-xs sm:text-sm sm:leading-6">
                                        <option value="F">Femme</option>
                                        <option value="H">Homme</option>
                                    </select>
                                </div>
                            </div>
                            <div class="sm:col-span-3">
                                <label for="website"
                                    class="block text-sm font-medium leading-6 text-gray-900">Religion</label>
                                <div class="mt-2">
                                    <div
                                        class="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-rose-600 sm:max-w-md">
                                        <input v-model="current_user.reli_cli" type="text" name="website" id="website"
                                            class="block flex-1 border-0 bg-transparent py-1.5 pl-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                                            placeholder="Indeterminé" />
                                    </div>
                                </div>
                            </div>
                            <div class="sm:col-span-3">
                                <label for="website"
                                    class="block text-sm font-medium leading-6 text-gray-900">Politique</label>
                                <div class="mt-2">
                                    <select v-model="current_user.pol_cli"
                                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:max-w-xs sm:text-sm sm:leading-6">
                                        <option value="0">Indeterminé</option>
                                        <option value="1">Sans</option>
                                        <option value="2">Extrême Gauche</option>
                                        <option value="3">Gauche</option>
                                        <option value="4">Centre</option>
                                        <option value="5">Droite</option>
                                        <option value="6">Extrême droite</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
        <div class="space-y-10 divide-y divide-gray-900/10 mt-10" v-if="active_tab === 'Adresse'">
            <div class="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
                <div class="px-4 sm:px-0">
                    <h2 class="text-base font-semibold leading-7 text-gray-900">Profil</h2>
                    <p class="mt-1 text-sm leading-6 text-gray-600">
                        Information publiques du client, utilisées sur sa fiche publique et pouvant être partagées aux autres clients.
                    </p>
                </div>
                <form class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
                    <div class="px-4 py-6 sm:p-8">
                        <div class="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            <div class="col-span-full">
                                <label for="street-address"
                                    class="block text-sm font-medium leading-6 text-gray-900">Adresse</label>
                                    <div class="mt-2">
                                        <input type="text" v-model="current_user.adr_cli" name="street-address"
                                            id="street-address" autocomplete="street-address"
                                            class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                    </div>
                            </div>
                            <div class="sm:col-span-2">
                                <label for="postal-code" class="block text-sm font-medium leading-6 text-gray-900">Code postal</label>
                                <div class="mt-2">
                                    <input type="text" v-model="current_user.cp_cli" name="postal-code" id="postal-code"
                                        autocomplete="postal-code"
                                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                </div>
                            </div>
                            <div class="sm:col-span-4">
                                <label for="city"
                                    class="block text-sm font-medium leading-6 text-gray-900">Ville</label>
                                <div class="mt-2">
                                    <input type="text" v-model="current_user.ville_cli" name="city" id="city"
                                        autocomplete="address-level2"
                                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                </div>
                            </div>
                            <div class="sm:col-span-4">
                                <label for="tel_pri" class="block text-sm font-medium leading-6 text-gray-900">Téléphone privé</label>
                                <div class="mt-2">
                                    <input id="tel_pri" v-model="current_user.telPri_cli" name="tel_pri" type="tel"
                                        autocomplete="tel"
                                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                </div>
                            </div>
                            <div class="sm:col-span-2 self-end mb-2">
                                <SwitchGroup as="div" class="flex items-center">
                                    <Switch v-model="current_user.affTelPri_cli"
                                        :class="[current_user.affTelPri_cli === 'O' ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                        <span aria-hidden="true"
                                            :class="[current_user.affTelPri_cli === 'O' ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                    </Switch>
                                    <SwitchLabel as="span" class="ml-3 text-sm">
                                        <span class="font-medium text-gray-900">Afficher</span>
                                    </SwitchLabel>
                                </SwitchGroup>
                            </div>
                            <div class="sm:col-span-4">
                                <label for="tel_pro" class="block text-sm font-medium leading-6 text-gray-900">Téléphone pro</label>
                                <div class="mt-2">
                                    <input id="tel_pro" v-model="current_user.telPro_cli" name="tel_pro" type="tel"
                                        autocomplete="tel"
                                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                </div>
                            </div>
                            <div class="sm:col-span-2 self-end mb-2">
                                <SwitchGroup as="div" class="flex items-center">
                                    <Switch v-model="current_user.affTelPro_cli"
                                        :class="[current_user.affTelPro_cli === 'O' ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                        <span aria-hidden="true"
                                            :class="[current_user.affTelPro_cli === 'O' ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                    </Switch>
                                    <SwitchLabel as="span" class="ml-3 text-sm">
                                        <span class="font-medium text-gray-900">Afficher</span>
                                    </SwitchLabel>
                                </SwitchGroup>
                            </div>
                            <div class="sm:col-span-4">
                                <label for="tel_gsm" class="block text-sm font-medium leading-6 text-gray-900">Numéro de portable</label>
                                <div class="mt-2">
                                    <input id="tel_gsm" v-model="current_user.telGsm_cli" name="tel_gsm" type="tel"
                                        autocomplete="tel"
                                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                </div>
                            </div>
                            <div class="sm:col-span-2 self-end mb-2">
                                <SwitchGroup as="div" class="flex items-center">
                                    <Switch v-model="current_user.affTelGsm_cli"
                                        :class="[current_user.affTelGsm_cli === 'O' ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                        <span aria-hidden="true"
                                            :class="[current_user.affTelGsm_cli === 'O' ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                    </Switch>
                                    <SwitchLabel as="span" class="ml-3 text-sm">
                                        <span class="font-medium text-gray-900">Afficher</span>
                                    </SwitchLabel>
                                </SwitchGroup>
                            </div>
                            <div class="sm:col-span-full">
                                <label for="email" class="block text-sm font-medium leading-6 text-gray-900">Adresse email</label>
                                <div class="mt-2">
                                    <input id="email" v-model="current_user.mail_cli" name="email" type="email"
                                        autocomplete="email"
                                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                </div>
                            </div>
                            <div class="sm:col-span-2 self-end mb-2">
                                <SwitchGroup as="div" class="flex items-center">
                                    <Switch v-model="current_user.nl_cli"
                                        :class="[current_user.nl_cli === 'O' ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                        <span aria-hidden="true"
                                            :class="[current_user.nl_cli === 'O' ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                    </Switch>
                                    <SwitchLabel as="span" class="ml-3 text-sm">
                                        <span class="font-medium text-gray-900">Newsletter</span>
                                    </SwitchLabel>
                                </SwitchGroup>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
        <div class="space-y-10 divide-y divide-gray-900/10 mt-10" v-if="active_tab === 'Situation'">
            <div class="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
                <div class="px-4 sm:px-0">
                    <h2 class="text-base font-semibold leading-7 text-gray-900">Profil</h2>
                    <p class="mt-1 text-sm leading-6 text-gray-600">
                        Information publiques du client, utilisées sur sa fiche publique et pouvant être partagées aux autres clients.
                    </p>
                </div>
                <form class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
                    <div class="px-4 py-6 sm:p-8">
                        <div class="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            <div class="sm:col-span-2 self-end mb-2">
                                <SwitchGroup as="div" class="flex items-center">
                                    <Switch v-model="current_user.situation_cli.celib_cli"
                                        :class="[current_user.situation_cli.celib_cli === 'O' ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                        <span aria-hidden="true"
                                            :class="[current_user.situation_cli.celib_cli === 'O' ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                    </Switch>
                                    <SwitchLabel as="span" class="ml-3 text-sm">
                                        <span class="font-medium text-gray-900">Célibataire</span>
                                    </SwitchLabel>
                                </SwitchGroup>
                            </div>
                            <div class="sm:col-span-2 self-end mb-2">
                                <SwitchGroup as="div" class="flex items-center">
                                    <Switch v-model="current_user.situation_cli.veuf_cli"
                                        :class="[current_user.situation_cli.veuf_cli === 'O' ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                        <span aria-hidden="true"
                                            :class="[current_user.situation_cli.veuf_cli === 'O' ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                    </Switch>
                                    <SwitchLabel as="span" class="ml-3 text-sm">
                                        <span class="font-medium text-gray-900">Veuf</span>
                                    </SwitchLabel>
                                </SwitchGroup>
                            </div>
                            <div class="sm:col-span-2 self-end mb-2">
                                <SwitchGroup as="div" class="flex items-center">
                                    <Switch v-model="current_user.situation_cli.div_cli"
                                        :class="[current_user.situation_cli.div_cli === 'O' ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                        <span aria-hidden="true"
                                            :class="[current_user.situation_cli.div_cli === 'O' ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                    </Switch>
                                    <SwitchLabel as="span" class="ml-3 text-sm">
                                        <span class="font-medium text-gray-900">Divorcé</span>
                                    </SwitchLabel>
                                </SwitchGroup>
                            </div>
                            <div class="sm:col-span-2 self-end mb-2">
                                <SwitchGroup as="div" class="flex items-center">
                                    <Switch v-model="current_user.sep_cli"
                                        :class="[current_user.situation_cli.sep_cli === 'O' ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                        <span aria-hidden="true"
                                            :class="[current_user.situation_cli.sep_cli === 'O' ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                    </Switch>
                                    <SwitchLabel as="span" class="ml-3 text-sm">
                                        <span class="font-medium text-gray-900">Séparé</span>
                                    </SwitchLabel>
                                </SwitchGroup>
                            </div>
                            <div class="sm:col-span-4 self-end mb-2">
                                <SwitchGroup as="div" class="flex items-center">
                                    <Switch v-model="current_user.situation_cli.instDiv_cli"
                                        :class="[current_user.situation_cli.instDiv_cli === 'O' ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                        <span aria-hidden="true"
                                            :class="[current_user.situation_cli.instDiv_cli === 'O' ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                    </Switch>
                                    <SwitchLabel as="span" class="ml-3 text-sm">
                                        <span class="font-medium text-gray-900">En instance de divorce</span>
                                    </SwitchLabel>
                                </SwitchGroup>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
        <div class="space-y-10 divide-y divide-gray-900/10 mt-10" v-if="active_tab === 'Enfants'">
            <div class="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
                <div class="px-4 sm:px-0">
                    <h2 class="text-base font-semibold leading-7 text-gray-900">Appréciations</h2>
                    <p class="mt-1 text-sm leading-6 text-gray-600">Plus les critères de recherche seront précis, plus
                        notre outil de matching dénichera les profils les plus pertinents.</p>
                </div>
                <form class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
                    <div class="px-4 py-6 sm:p-8">
                        <div class="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            <div class="sm:col-span-full">
                                <label for="first-name"
                                    class="block text-sm font-medium leading-6 text-gray-900">Nombre d'enfants</label>
                                <div class="mt-2 relative">
                                    <input type="text" v-model="current_user.nbEnf_cli" name="first-name"
                                        id="first-name" autocomplete="given-name"
                                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                    <div
                                        class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                        <span class="text-gray-500 text-xs" id="price-currency">enfant(s)</span>
                                    </div>
                                </div>
                            </div>
                            <div class="sm:col-span-3">
                                <label for="first-name"
                                    class="block text-sm font-medium leading-6 text-gray-900">Age minimum enfant</label>
                                <div class="mt-2 relative">
                                    <input type="text" v-model="current_user.minEnf_cli" name="first-name"
                                        id="first-name" autocomplete="given-name"
                                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                    <div
                                        class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                        <span class="text-gray-500 text-xs" id="price-currency">ans</span>
                                    </div>
                                </div>
                            </div>
                            <div class="sm:col-span-3">
                                <label for="first-name"
                                    class="block text-sm font-medium leading-6 text-gray-900">Age maximum enfant</label>
                                <div class="mt-2 relative">
                                    <input type="text" v-model="current_user.maxEnf_cli" name="first-name"
                                        id="first-name" autocomplete="given-name"
                                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                    <div
                                        class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                        <span class="text-gray-500 text-xs" id="price-currency">ans</span>
                                    </div>
                                </div>
                            </div>
                            <div class="sm:col-span-full">
                                <label for="first-name"
                                    class="block text-sm font-medium leading-6 text-gray-900">Nombre d'enfants à charge</label>
                                <div class="mt-2 relative">
                                    <input type="text" v-model="current_user.chargeEnf_cli" name="first-name"
                                        id="first-name" autocomplete="given-name"
                                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                    <div
                                        class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                        <span class="text-gray-500 text-xs" id="price-currency">enfant(s)</span>
                                    </div>
                                </div>
                            </div>
                            <div class="sm:col-span-full">
                                <label for="first-name"
                                    class="block text-sm font-medium leading-6 text-gray-900">Nombre d'enfants en garde alternée</label>
                                <div class="mt-2 relative">
                                    <input type="text" v-model="current_user.alternEnf_cli" name="first-name"
                                        id="first-name" autocomplete="given-name"
                                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                    <div
                                        class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                        <span class="text-gray-500 text-xs" id="price-currency">enfant(s)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
        <div class="space-y-10 divide-y divide-gray-900/10 mt-10" v-if="active_tab === 'Professionnel'">
            <div class="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
                <div class="px-4 sm:px-0">
                    <h2 class="text-base font-semibold leading-7 text-gray-900">Critères de recherche</h2>
                    <p class="mt-1 text-sm leading-6 text-gray-600">Plus les critères de recherche seront précis, plus
                        notre outil de matching dénichera les profils les plus pertinents.</p>
                </div>
                <form class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
                    <div class="px-4 py-6 sm:p-8">
                        <div class="max-w-2xl space-y-10">
                            <fieldset>
                                <div class="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                    <div class="sm:col-span-3">
                                        <label for="website"
                                            class="block text-sm font-medium leading-6 text-gray-900">Niveau d'étude</label>
                                        <div class="mt-2">
                                            <select v-model="current_user.etude_cli"
                                                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:max-w-xs sm:text-sm sm:leading-6">
                                                <option value="0">Indeterminé</option>
                                                <option value="1">Primaire</option>
                                                <option value="2">Secondaire</option>
                                                <option value="3">Bac à Bac +2</option>
                                                <option value="4">Bac</option>
                                                <option value="5">Bac +3 et plus</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="sm:col-span-3">
                                        <label for="profession" class="block text-sm font-medium leading-6 text-gray-900">Profession</label>
                                        <div class="mt-2">
                                            <input type="text" v-model="current_user.prof_cli" name="profession" id="profession"
                                                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                        </div>
                                    </div>
                                    <div class="sm:col-span-3">
                                        <label for="website"
                                            class="block text-sm font-medium leading-6 text-gray-900">Revenus</label>
                                        <div class="mt-2">
                                            <select v-model="current_user.tranche_cli"
                                                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:max-w-xs sm:text-sm sm:leading-6">
                                                <option value="0">Modestes (- de 900€)</option>
                                                <option value="1">Corrects (de 900€ à 1300€)</option>
                                                <option value="2">Confortables (de 1300€ à 2000€)</option>
                                                <option value="3">Très confortables (de 2000€ à 4000€)</option>
                                                <option value="4">Elevés (4000€ et plus)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="sm:col-span-3">
                                        <label for="revenus_cli" class="block text-sm font-medium leading-6 text-gray-900">Précision revenus</label>
                                        <div class="mt-2">
                                            <input type="text" v-model="current_user.revenus_cli" name="revenus_cli" id="revenus_cli"
                                                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                        </div>
                                    </div>
                                    <div class="col-span-full">
                                        <label for="about"
                                            class="block text-sm font-medium leading-6 text-gray-900">Horaires</label>
                                        <div class="mt-2">
                                            <textarea id="about" v-model="current_user.hor_cli" name="about"
                                                rows="3"
                                                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                        </div>
                                    </div>
                                </div>
                            </fieldset>
                            <fieldset>
                                <legend class="text-sm font-semibold leading-6 text-gray-900">Véhicule</legend>
                                <div class="mt-6 space-y-6">
                                    <div class="flex items-center gap-x-3">
                                        <input v-model="current_user.veh_cli" id="indetermine" name="indetermine" value="" type="radio"
                                            class="h-4 w-4 border-gray-300 text-rose-600 focus:ring-rose-600" />
                                        <label for="indetermine"
                                            class="block text-sm font-medium leading-6 text-gray-900">Indéterminé</label>
                                    </div>
                                    <div class="flex items-center gap-x-3">
                                        <input v-model="current_user.veh_cli" id="non" value="N" name="non" type="radio"
                                            class="h-4 w-4 border-gray-300 text-rose-600 focus:ring-rose-600" />
                                        <label for="non"
                                            class="block text-sm font-medium leading-6 text-gray-900">Non</label>
                                    </div>
                                    <div class="flex items-center gap-x-3">
                                        <input v-model="current_user.veh_cli" id="oui" name="oui" value="O" type="radio"
                                            class="h-4 w-4 border-gray-300 text-rose-600 focus:ring-rose-600" />
                                        <label for="oui"
                                            class="block text-sm font-medium leading-6 text-gray-900">Oui</label>
                                    </div>
                                </div>
                            </fieldset>
                            <fieldset>
                                <legend class="text-sm font-semibold leading-6 text-gray-900">Permis de conduire</legend>
                                <div class="mt-6 space-y-6">
                                    <div class="flex items-center gap-x-3">
                                        <input v-model="current_user.permis_cli" id="indetermine_permis_cli" name="indetermine_permis_cli" value="" type="radio"
                                            class="h-4 w-4 border-gray-300 text-rose-600 focus:ring-rose-600" />
                                        <label for="indetermine_permis_cli"
                                            class="block text-sm font-medium leading-6 text-gray-900">Indéterminé</label>
                                    </div>
                                    <div class="flex items-center gap-x-3">
                                        <input v-model="current_user.permis_cli" id="non_permis_cli" value="N" name="non_permis_cli" type="radio"
                                            class="h-4 w-4 border-gray-300 text-rose-600 focus:ring-rose-600" />
                                        <label for="non_permis_cli"
                                            class="block text-sm font-medium leading-6 text-gray-900">Non</label>
                                    </div>
                                    <div class="flex items-center gap-x-3">
                                        <input v-model="current_user.permis_cli" id="oui_permis_cli" name="oui_permis_cli" value="O" type="radio"
                                            class="h-4 w-4 border-gray-300 text-rose-600 focus:ring-rose-600" />
                                        <label for="oui_permis_cli"
                                            class="block text-sm font-medium leading-6 text-gray-900">Oui</label>
                                    </div>
                                </div>
                            </fieldset>
        
                            <div class="sm:col-span-full">
                                <label for="logement"
                                    class="block text-sm font-medium leading-6 text-gray-900">Logement</label>
                                <div class="mt-2">
                                    <select id="loge_cli" name="loge_cli" v-model="current_user.loge_cli"
                                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:max-w-xs sm:text-sm sm:leading-6">
                                        <option value="0">Indeterminé</option>
                                        <option value="1">Non</option>
                                        <option value="2">Oui (sans précision)</option>
                                        <option value="3">Location appartement</option>
                                        <option value="4">Location maison</option>
                                        <option value="5">Propriétaire appartement</option>
                                        <option value="6">Propriétaire maison</option>
                                        <option value="7">En famille</option>
                                        <option value="8">Autre</option>
                                    </select>
                                </div>
                            </div>
                            <div class="sm:col-span-full">
                                <label for="ms_cli"
                                    class="block text-sm font-medium leading-6 text-gray-900">Milieu social</label>
                                <div class="mt-2">
                                    <select id="ms_cli" name="ms_cli" v-model="current_user.ms_cli"
                                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:max-w-xs sm:text-sm sm:leading-6">
                                        <option value="_0">Bon</option>
                                        <option value="_1">Moyen</option>
                                        <option value="_2">Modeste</option>
                                        <option value="_3">Autre</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
        <div class="space-y-10 divide-y divide-gray-900/10 mt-10" v-if="active_tab === 'Physique'">
            <div class="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
                <div class="px-4 sm:px-0">
                    <h2 class="text-base font-semibold leading-7 text-gray-900">Appréciations</h2>
                    <p class="mt-1 text-sm leading-6 text-gray-600">Plus les critères de recherche seront précis, plus
                        notre outil de matching dénichera les profils les plus pertinents.</p>
                </div>
                <form class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
                    <div class="px-4 py-6 sm:p-8">
                        <div class="max-w-2xl space-y-10">
                            <fieldset>
                                <div class="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                    <div class="sm:col-span-3">
                                        <label for="first-name"
                                            class="block text-sm font-medium leading-6 text-gray-900">Taille</label>
                                        <div class="mt-2 relative">
                                            <input type="text" v-model="current_user.taille_cli" name="first-name"
                                                id="first-name" autocomplete="given-name"
                                                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                            <div
                                                class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                <span class="text-gray-500 text-xs" id="price-currency">cm</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="sm:col-span-3">
                                        <label for="first-name"
                                            class="block text-sm font-medium leading-6 text-gray-900">Poids</label>
                                        <div class="mt-2 relative">
                                            <input type="text" v-model="current_user.poid_cli" name="first-name"
                                                id="first-name" autocomplete="given-name"
                                                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                            <div
                                                class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                <span class="text-gray-500 text-xs" id="price-currency">kg</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="sm:col-span-3">
                                        <label for="cheveux_cli"
                                            class="block text-sm font-medium leading-6 text-gray-900">Cheveux</label>
                                        <div class="mt-2">
                                            <select name="cheveux_cli" id="cheveux_cli" v-model="current_user.cheveux_cli"
                                                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:max-w-xs sm:text-sm sm:leading-6">
                                                <option value="0">Indeterminé</option>
                                                <option value="1">Bruns</option>
                                                <option value="2">Blonds</option>
                                                <option value="3">Roux</option>
                                                <option value="4">Blancs</option>
                                                <option value="5">Chauve</option>
                                                <option value="6">Noirs</option>
                                                <option value="7">Châtains clairs</option>
                                                <option value="8">Châtains foncés</option>
                                                <option value="9">Gris</option>
                                                <option value="10">Poivre et sel</option>
                                                <option value="11">Auburn</option>
                                                <option value="12">Acajou</option>
                                                <option value="13">Mèches blondes</option>
                                                <option value="14">Mèches brunes</option>
                                                <option value="15">Autre</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="sm:col-span-3">
                                        <label for="yeux_cli"
                                            class="block text-sm font-medium leading-6 text-gray-900">Yeux</label>
                                        <div class="mt-2">
                                            <select name="yeux_cli" id="yeux_cli" v-model="current_user.yeux_cli"
                                                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:max-w-xs sm:text-sm sm:leading-6">
                                                <option value="0">Indeterminé</option>
                                                <option value="1">Bruns</option>
                                                <option value="2">Verts</option>
                                                <option value="3">Bleus</option>
                                                <option value="4">Noirs</option>
                                                <option value="5">Gris</option>
                                                <option value="6">Noisettes</option>
                                                <option value="7">Bleus/verts</option>
                                                <option value="8">Bleux/gris</option>
                                                <option value="9">Dominance bleue</option>
                                                <option value="10">Dominance verte</option>
                                                <option value="11">Dominance brune</option>
                                                <option value="12">Autres</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="sm:col-span-full">
                                        <label for="code_cli"
                                            class="block text-sm font-medium leading-6 text-gray-900">Code</label>
                                        <div class="mt-2">
                                            <select name="code_cli" id="code_cli" v-model="current_user.code_cli"
                                                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6">
                                                <option value="0">Indeterminé</option>
                                                <option value="1">1</option>
                                                <option value="2">2</option>
                                                <option value="3">3</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="sm:col-span-3">
                                        <SwitchGroup as="div" class="flex items-center">
                                            <Switch v-model="current_user.lun_cli"
                                                :class="[current_user.lun_cli === '1' ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                                <span aria-hidden="true"
                                                    :class="[current_user.lun_cli === '1' ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                            </Switch>
                                            <SwitchLabel as="span" class="ml-3 text-sm">
                                                <span class="font-medium text-gray-900">Porte des lunettes</span>
                                            </SwitchLabel>
                                        </SwitchGroup>
                                    </div>
                                    <div class="sm:col-span-3">
                                        <SwitchGroup as="div" class="flex items-center">
                                            <Switch v-model="current_user.fum_cli"
                                                :class="[current_user.fum_cli === '1' ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                                <span aria-hidden="true"
                                                    :class="[current_user.fum_cli === '1' ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                            </Switch>
                                            <SwitchLabel as="span" class="ml-3 text-sm">
                                                <span class="font-medium text-gray-900">Fumeur / Fumeuse</span>
                                            </SwitchLabel>
                                        </SwitchGroup>
                                    </div>
                                    <div class="col-span-full">
                                        <label for="sante_cli"
                                            class="block text-sm font-medium leading-6 text-gray-900">Forme
                                            physique</label>
                                        <div class="mt-2">
                                            <textarea v-model="current_user.sante_cli" id="sante_cli" name="sante_cli" rows="3"
                                                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                        </div>
                                        <p class="mt-3 text-sm leading-6 text-gray-600">Décrivez rapidement votre
                                            client.</p>
                                    </div>
                                    <div class="col-span-full">
                                        <label for="def_cli"
                                            class="block text-sm font-medium leading-6 text-gray-900">Défauts</label>
                                        <div class="mt-2">
                                            <textarea v-model="current_user.def_cli" id="def_cli" name="def_cli" rows="3"
                                                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                        </div>
                                        <p class="mt-3 text-sm leading-6 text-gray-600">Décrivez rapidement votre
                                            client.</p>
                                    </div>
                                    <div class="col-span-full">
                                        <label for="rem_cli"
                                            class="block text-sm font-medium leading-6 text-gray-900">Remarques</label>
                                        <div class="mt-2">
                                            <textarea v-model="current_user.rem_cli" id="rem_cli" name="rem_cli" rows="3"
                                                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                        </div>
                                        <p class="mt-3 text-sm leading-6 text-gray-600">Décrivez rapidement votre
                                            client.</p>
                                    </div>
                                </div>
                            </fieldset>
                        </div>
                    </div>
                </form>
            </div>
        </div>
        <div class="space-y-10 divide-y divide-gray-900/10 mt-10" v-if="active_tab === 'Autres'">
            <div class="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
                <div class="px-4 sm:px-0">
                    <h2 class="text-base font-semibold leading-7 text-gray-900">Autres</h2>
                    <p class="mt-1 text-sm leading-6 text-gray-600">Plus les critères de recherche seront précis, plus
                        notre outil de matching dénichera les profils les plus pertinents.</p>
                </div>
                <form class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
                    <div class="px-4 py-6 sm:p-8">
                        <div class="max-w-2xl space-y-10">
                            <fieldset>
                                <div class="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                    <div class="sm:col-span-full">
                                        <label for="origine_cli"
                                            class="block text-sm font-medium leading-6 text-gray-900">Origine de la demande</label>
                                        <div class="mt-2">
                                            <select name="origine_cli" id="origine_cli" v-model="current_user.origine_cli"
                                                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6">
                                                <option value="0">Indeterminé</option>
                                                <option value="1">PQR</option>
                                                <option value="2">Gratuit</option>
                                                <option value="3">Flyer/Brochure</option>
                                                <option value="4">Relation</option>
                                                <option value="5">Renouvellement</option>
                                                <option value="6">Internet</option>
                                                <option value="7">Annuaire</option>
                                                <option value="8">Vitrine/Enseigne</option>
                                                <option value="9">Relance</option>
                                                <option value="10">Autre</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="sm:col-span-full">
                                        <label for="insc_cli"
                                            class="block text-sm font-medium leading-6 text-gray-900">Date d'inscription</label>
                                        <div class="mt-2">
                                            <input id="insc_cli" v-model="current_user.insc_cli" name="insc_cli" type="date"
                                                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                        </div>
                                    </div>
                                    <div class="sm:col-span-3">
                                        <SwitchGroup as="div" class="flex items-center">
                                            <Switch v-model="current_user.vip_cli"
                                                :class="[current_user.vip_cli === 'O' ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                                <span aria-hidden="true"
                                                    :class="[current_user.vip_cli === 'O' ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                            </Switch>
                                            <SwitchLabel as="span" class="ml-3 text-sm">
                                                <span class="font-medium text-gray-900">Client VIP</span>
                                            </SwitchLabel>
                                        </SwitchGroup>
                                    </div>
                                    <div class="sm:col-span-3">
                                        <SwitchGroup as="div" class="flex items-center">
                                            <Switch v-model="current_user.ln_cli"
                                                :class="[current_user.ln_cli === 'O' ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                                <span aria-hidden="true"
                                                    :class="[current_user.ln_cli === 'O' ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                            </Switch>
                                            <SwitchLabel as="span" class="ml-3 text-sm">
                                                <span class="font-medium text-gray-900">Liste noir</span>
                                            </SwitchLabel>
                                        </SwitchGroup>
                                    </div>
                                    <div class="sm:col-span-3">
                                        <SwitchGroup as="div" class="flex items-center">
                                            <Switch v-model="current_user.cont_cli"
                                                :class="[current_user.cont_cli === 'O' ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                                <span aria-hidden="true"
                                                    :class="[current_user.cont_cli === 'O' ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                            </Switch>
                                            <SwitchLabel as="span" class="ml-3 text-sm">
                                                <span class="font-medium text-gray-900">Contact</span>
                                            </SwitchLabel>
                                        </SwitchGroup>
                                    </div>
                                    <div class="sm:col-span-3">
                                        <SwitchGroup as="div" class="flex items-center">
                                            <Switch v-model="current_user.prosp_cli"
                                                :class="[current_user.prosp_cli === 'O' ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                                <span aria-hidden="true"
                                                    :class="[current_user.prosp_cli === 'O' ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                            </Switch>
                                            <SwitchLabel as="span" class="ml-3 text-sm">
                                                <span class="font-medium text-gray-900">Prospect</span>
                                            </SwitchLabel>
                                        </SwitchGroup>
                                    </div>
                                    <div class="sm:col-span-full">
                                        <label for="rev_cli"
                                            class="block text-sm font-medium leading-6 text-gray-900">Date de révision</label>
                                        <div class="mt-2">
                                            <input id="rev_cli" v-model="current_user.rev_cli" name="rev_cli" type="date"
                                                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                        </div>
                                    </div>
                                    <div class="sm:col-span-full">
                                        <label for="duree_cli"
                                            class="block text-sm font-medium leading-6 text-gray-900">Durée du contrat</label>
                                        <div class="mt-2 relative">
                                            <input type="text" v-model="current_user.duree_cli" name="duree_cli"
                                                id="duree_cli"
                                                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                            <div
                                                class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                <span class="text-gray-500 text-xs" id="price-currency">mois</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="sm:col-span-3">
                                        <SwitchGroup as="div" class="flex items-center">
                                            <Switch v-model="current_user.libre_cli"
                                                :class="[current_user.libre_cli === 'O' ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                                <span aria-hidden="true"
                                                    :class="[current_user.libre_cli === 'O' ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                            </Switch>
                                            <SwitchLabel as="span" class="ml-3 text-sm">
                                                <span class="font-medium text-gray-900">Libre</span>
                                            </SwitchLabel>
                                        </SwitchGroup>
                                    </div>
                                    <div class="sm:col-span-3">
                                        <SwitchGroup as="div" class="flex items-center">
                                            <Switch v-model="current_user.probPaie_cli"
                                                :class="[current_user.probPaie_cli === 'O' ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                                <span aria-hidden="true"
                                                    :class="[current_user.probPaie_cli === 'O' ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                            </Switch>
                                            <SwitchLabel as="span" class="ml-3 text-sm">
                                                <span class="font-medium text-gray-900">Problème de paiement</span>
                                            </SwitchLabel>
                                        </SwitchGroup>
                                    </div>
                                </div>
                            </fieldset>
                        </div>
                    </div>
                </form>
            </div>
        </div>
        <div class="space-y-10 divide-y divide-gray-900/10 mt-10" v-if="active_tab === 'Profil'">
            <div class="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
                <div class="px-4 sm:px-0">
                    <h2 class="text-base font-semibold leading-7 text-gray-900">Psychologie et morale</h2>
                    <p class="mt-1 text-sm leading-6 text-gray-600">Plus les critères de recherche seront précis, plus
                        notre outil de matching dénichera les profils les plus pertinents.</p>
                </div>
                <form class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
                    <div class="px-4 py-6 sm:p-8">
                        <div class="max-w-2xl space-y-10">
                            <fieldset>
                                <div class="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                    <div class="col-span-full">
                                        <label for="interets_cli"
                                            class="block text-sm font-medium leading-6 text-gray-900">Centres d'intérêt</label>
                                        <div class="mt-2">
                                            <textarea v-model="current_user.interets_cli" id="interets_cli" name="interets_cli" rows="3"
                                                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                        </div>
                                        <p class="mt-3 text-sm leading-6 text-gray-600">Décrivez rapidement votre
                                            client.</p>
                                    </div>
                                    <div class="col-span-full">
                                        <label for="desc_cli"
                                            class="block text-sm font-medium leading-6 text-gray-900">Description/Caractère</label>
                                        <div class="mt-2">
                                            <textarea v-model="current_user.desc_cli" id="def_cli" name="desc_cli" rows="3"
                                                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                        </div>
                                        <p class="mt-3 text-sm leading-6 text-gray-600">Décrivez rapidement votre
                                            client.</p>
                                    </div>
                                    <div class="col-span-full">
                                        <label for="milieu_cli"
                                            class="block text-sm font-medium leading-6 text-gray-900">Milieu dans lequel vous avez été élevé</label>
                                        <div class="mt-2">
                                            <textarea v-model="current_user.milieu_cli" id="rem_cli" name="rem_cli" rows="3"
                                                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                        </div>
                                        <p class="mt-3 text-sm leading-6 text-gray-600">Décrivez rapidement votre
                                            client.</p>
                                    </div>
                                </div>
                            </fieldset>
                        </div>
                    </div>
                </form>
            </div>
        </div>
        <div class="space-y-10 divide-y divide-gray-900/10 mt-10" v-if="active_tab === 'Recherche'">
            <div class="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
                <div class="px-4 sm:px-0">
                    <h2 class="text-base font-semibold leading-7 text-gray-900">Critères de recherche</h2>
                    <p class="mt-1 text-sm leading-6 text-gray-600">Plus les critères de recherche seront précis, plus
                        notre outil de matching dénichera les profils les plus pertinents.</p>
                </div>
                <form class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
                    <div class="px-4 py-6 sm:p-8">
                        <div class="max-w-2xl space-y-10">
                            <fieldset>
                                <legend class="text-sm font-semibold leading-6 text-gray-900">Situation</legend>
                                <div class="mt-6 grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                    <div class="sm:col-span-2 self-end mb-2">
                                        <SwitchGroup as="div" class="flex items-center">
                                            <Switch v-model="current_user.desCelib_cli"
                                                :class="[current_user.desCelib_cli === 'O' ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                                <span aria-hidden="true"
                                                    :class="[current_user.desCelib_cli === 'O' ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                            </Switch>
                                            <SwitchLabel as="span" class="ml-3 text-sm">
                                                <span class="font-medium text-gray-900">Célibataire</span>
                                            </SwitchLabel>
                                        </SwitchGroup>
                                    </div>
                                    <div class="sm:col-span-2 self-end mb-2">
                                        <SwitchGroup as="div" class="flex items-center">
                                            <Switch v-model="current_user.desVeuf_cli"
                                                :class="[current_user.desVeuf_cli === 'O' ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                                <span aria-hidden="true"
                                                    :class="[current_user.desVeuf_cli === 'O' ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                            </Switch>
                                            <SwitchLabel as="span" class="ml-3 text-sm">
                                                <span class="font-medium text-gray-900">Veuf</span>
                                            </SwitchLabel>
                                        </SwitchGroup>
                                    </div>
                                    <div class="sm:col-span-2 self-end mb-2">
                                        <SwitchGroup as="div" class="flex items-center">
                                            <Switch v-model="current_user.desDiv_cli"
                                                :class="[current_user.desDiv_cli === 'O' ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                                <span aria-hidden="true"
                                                    :class="[current_user.desDiv_cli === 'O' ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                            </Switch>
                                            <SwitchLabel as="span" class="ml-3 text-sm">
                                                <span class="font-medium text-gray-900">Divorcé</span>
                                            </SwitchLabel>
                                        </SwitchGroup>
                                    </div>
                                    <div class="sm:col-span-2 self-end mb-2">
                                        <SwitchGroup as="div" class="flex items-center">
                                            <Switch v-model="current_user.desSep_cli"
                                                :class="[current_user.desSep_cli === 'O' ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                                <span aria-hidden="true"
                                                    :class="[current_user.desSep_cli === 'O' ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                            </Switch>
                                            <SwitchLabel as="span" class="ml-3 text-sm">
                                                <span class="font-medium text-gray-900">Séparé</span>
                                            </SwitchLabel>
                                        </SwitchGroup>
                                    </div>
                                </div>
                            </fieldset>
                            <fieldset>
                                <div class="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                    <div class="sm:col-span-3">
                                        <label for="last-name"
                                            class="block text-sm font-medium leading-6 text-gray-900">Age
                                            minimum</label>
                                        <div class="mt-2">
                                            <input type="text" v-model="current_user.desAge_cli.split('-')[0]"
                                                name="last-name" id="last-name" autocomplete="family-name"
                                                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                        </div>
                                    </div>
                                    <div class="sm:col-span-3">
                                        <label for="last-name"
                                            class="block text-sm font-medium leading-6 text-gray-900">Age
                                            maximum</label>
                                        <div class="mt-2">
                                            <input type="text" v-model="current_user.desAge_cli.split('-')[1]"
                                                name="last-name" id="last-name" autocomplete="family-name"
                                                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                        </div>
                                    </div>
                                    <div class="sm:col-span-3">
                                        <label for="country"
                                            class="block text-sm font-medium leading-6 text-gray-900">Nombre d'enfants
                                            acceptés</label>
                                        <div class="mt-2">
                                            <select v-model="current_user.desNbEn_cli" id="desNbEn_cli" name="desNbEn_cli"
                                                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:max-w-xs sm:text-sm sm:leading-6">
                                                <option value="0">Indéterminé</option>
                                                <option value="1">Sans</option>
                                                <option value="2">Pas d'importance</option>
                                                <option value="3">Avec</option>
                                                <option value="4">1</option>
                                                <option value="5">Jusqu'à 2</option>
                                                <option value="6">Jusqu'à 3</option>
                                                <option value="7">4 et plus</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-span-full">
                                        <label for="desPhy_cli"
                                            class="block text-sm font-medium leading-6 text-gray-900">Allure
                                            physique</label>
                                        <div class="mt-2">
                                            <textarea id="desPhy_cli" v-model="current_user.desPhy_cli" name="desPhy_cli" rows="3"
                                                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                        </div>
                                    </div>
                                    <div class="col-span-full">
                                        <label for="desCaract_cli"
                                            class="block text-sm font-medium leading-6 text-gray-900">Caractère</label>
                                        <div class="mt-2">
                                            <textarea id="desCaract_cli" v-model="current_user.desCaract_cli" name="desCaract_cli"
                                                rows="3"
                                                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                        </div>
                                    </div>
                                    <div class="sm:col-span-full self-end mb-2">
                                        <SwitchGroup as="div" class="flex items-center">
                                            <Switch v-model="current_user.desReg_cli"
                                                :class="[current_user.desReg_cli === '1' ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                                <span aria-hidden="true"
                                                    :class="[current_user.desReg_cli === '1' ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                            </Switch>
                                            <SwitchLabel as="span" class="ml-3 text-sm">
                                                <span class="font-medium text-gray-900">Exclusivement dans la région</span>
                                            </SwitchLabel>
                                        </SwitchGroup>
                                    </div>
                                    <div class="sm:col-span-3">
                                        <label for="desInst_cli"
                                            class="block text-sm font-medium leading-6 text-gray-900">Degré
                                            d'inscription</label>
                                        <div class="mt-2">
                                            <select v-model="current_user.desInst_cli" id="desInst_cli" name="desInst_cli"
                                                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:max-w-xs sm:text-sm sm:leading-6">
                                                <option value="0">Indéterminé</option>
                                                <option value="1">Au moins primaire</option>
                                                <option value="2">Au moins secondaire</option>
                                                <option value="3">Au moins Bac à Bac +3</option>
                                                <option value="4">Bac +3 et plus</option>
                                                <option value="5">Sans importance</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="sm:col-span-3">
                                        <label for="desProf_cli"
                                            class="block text-sm font-medium leading-6 text-gray-900">Profession</label>
                                        <div class="mt-2">
                                            <select v-model="current_user.desProf_cli" id="desProf_cli" name="desProf_cli"
                                                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:max-w-xs sm:text-sm sm:leading-6">
                                                <option value="0">Indéterminé</option>
                                                <option value="1">Sans importance</option>
                                                <option value="2">En activité</option>
                                                <option value="3">Retraité</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-span-full">
                                        <label for="desCarctIndisp_cli"
                                            class="block text-sm font-medium leading-6 text-gray-900">Caractéristiques indispensables</label>
                                        <div class="mt-2">
                                            <textarea id="desCarctIndisp_cli" v-model="current_user.desCarctIndisp_cli" name="desCarctIndisp_cli"
                                                rows="3"
                                                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                        </div>
                                    </div>
                                    <div class="sm:col-span-3">
                                        <label for="msRech_cli" class="block text-sm font-medium leading-6 text-gray-900">Milieu social recherché</label>
                                        <div class="mt-2">
                                            <select id="msRech_cli" name="msRech_cli" v-model="current_user.msRech_cli"
                                                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:max-w-xs sm:text-sm sm:leading-6">
                                                <option value="_0">Bon</option>
                                                <option value="_1">Moyen</option>
                                                <option value="_2">Modeste</option>
                                                <option value="_3">Autre</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div v-if="current_user.msRech_cli === '_3'" class="sm:col-span-3">
                                        <label for="msRechPrec" class="block text-sm font-medium leading-6 text-gray-900">Précisions</label>
                                        <div class="mt-2">
                                            <input type="text" v-model="current_user.msRechPrec_cli" name="msRechPrec_cli" id="msRechPrec_cli"
                                                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" />
                                        </div>
                                    </div>
                                </div>
                            </fieldset>
                        </div>
                    </div>
                </form>
            </div>
        </div>
        <div class="space-y-10 divide-y divide-gray-900/10 mt-10" v-if="active_tab === 'Annonces'">
            <div class="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
                <div class="px-4 sm:px-0">
                    <h2 class="text-base font-semibold leading-7 text-gray-900">Critères de recherche</h2>
                    <p class="mt-1 text-sm leading-6 text-gray-600">Plus les critères de recherche seront précis, plus
                        notre outil de matching dénichera les profils les plus pertinents.</p>
                </div>
                <form class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
                    <div class="px-4 py-6 sm:p-8">
                        <div class="max-w-2xl space-y-10">
                            <fieldset>
                                <span class="block text-sm font-medium leading-6 text-gray-900 mb-2">Annonce 1</span>
                                <div class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm sm:leading-6">
                                    <div class="flex gap-4 justify-between items-center mb-4 shadow-md py-2 px-4" v-if="editorAnn1">
                                        <div class="flex gap-1 items-center">
                                            <button type="button" @click="editorAnn1.chain().focus().toggleBold().run()"
                                                :disabled="!editorAnn1.can().chain().focus().toggleBold().run()"
                                                :class="{ 'bg-rose/50': editorAnn1.isActive('bold') }" class="px-2 py-1 hover:bg-slate-500/20 rounded-md duration-300 ease-out">
                                                <svg class="h-4 w-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                                                    <path d="M0 56C0 42.7 10.7 32 24 32H72 88 212c68.5 0 124 55.5 124 124c0 34.7-14.3 66.2-37.3 88.7C339.7 264.9 368 307.1 368 356c0 68.5-55.5 124-124 124H88 72 24c-13.3 0-24-10.7-24-24s10.7-24 24-24H48V256 80H24C10.7 80 0 69.3 0 56zM212 232c42 0 76-34 76-76s-34-76-76-76H96V232H212zM96 280V432H244c42 0 76-34 76-76s-34-76-76-76H212 96z"/>
                                                </svg>
                                            </button>
                                            <button type="button" @click="editorAnn1.chain().focus().toggleItalic().run()"
                                                :disabled="!editorAnn1.can().chain().focus().toggleItalic().run()"
                                                :class="{ 'bg-rose/50': editorAnn1.isActive('italic') }" class="px-2 py-1 rounded-md hover:bg-slate-500/20 duration-300 ease-out">
                                                <svg class="h-4 w-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                                                    <path d="M128 56c0-13.3 10.7-24 24-24H360c13.3 0 24 10.7 24 24s-10.7 24-24 24H291.3L144.7 432H232c13.3 0 24 10.7 24 24s-10.7 24-24 24H24c-13.3 0-24-10.7-24-24s10.7-24 24-24H92.7L239.3 80H152c-13.3 0-24-10.7-24-24z"/>
                                                </svg>
                                            </button>
                                            <button type="button" @click="editorAnn1.chain().focus().toggleBulletList().run()"
                                                :class="{ 'bg-rose/50': editorAnn1.isActive('bulletList') }" class="px-2 py-1 rounded-md hover:bg-slate-500/20 duration-300 ease-out">
                                                <svg class="h-4 w-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                                    <path d="M64 64a32 32 0 1 0 0 64 32 32 0 1 0 0-64zM176 80c-8.8 0-16 7.2-16 16s7.2 16 16 16H496c8.8 0 16-7.2 16-16s-7.2-16-16-16H176zm0 160c-8.8 0-16 7.2-16 16s7.2 16 16 16H496c8.8 0 16-7.2 16-16s-7.2-16-16-16H176zm0 160c-8.8 0-16 7.2-16 16s7.2 16 16 16H496c8.8 0 16-7.2 16-16s-7.2-16-16-16H176zM96 256a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zM64 384a32 32 0 1 0 0 64 32 32 0 1 0 0-64z"/>
                                                </svg>
                                            </button>
                                            <button type="button" @click="editorAnn1.chain().focus().toggleOrderedList().run()"
                                                :class="{ 'bg-rose/50': editorAnn1.isActive('orderedList') }" class="px-2 py-1 rounded-md hover:bg-slate-500/20 duration-300 ease-out">
                                                <svg class="h-4 w-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                                    <path d="M32 48c0 8.8 7.2 16 16 16H64V192H32c-8.8 0-16 7.2-16 16s7.2 16 16 16h96c8.8 0 16-7.2 16-16s-7.2-16-16-16H96V48c0-8.8-7.2-16-16-16H48c-8.8 0-16 7.2-16 16zM192 96c0 8.8 7.2 16 16 16H496c8.8 0 16-7.2 16-16s-7.2-16-16-16H208c-8.8 0-16 7.2-16 16zm0 160c0 8.8 7.2 16 16 16H496c8.8 0 16-7.2 16-16s-7.2-16-16-16H208c-8.8 0-16 7.2-16 16zm0 160c0 8.8 7.2 16 16 16H496c8.8 0 16-7.2 16-16s-7.2-16-16-16H208c-8.8 0-16 7.2-16 16zM58.7 323.9c11.1-11.1 29.2-10.5 39.6 1.3c9.2 10.5 8.9 26.2-.6 36.3L12.3 453.1c-4.3 4.7-5.5 11.5-3 17.3s8.3 9.6 14.7 9.6H128c8.8 0 16-7.2 16-16s-7.2-16-16-16H60.8l60.3-64.6c20.7-22.2 21.2-56.4 1.3-79.3c-22.5-25.7-62.1-27.1-86.3-2.9L20.7 316.7c-6.2 6.2-6.2 16.4 0 22.6s16.4 6.2 22.6 0l15.4-15.4z"/>
                                                </svg>
                                            </button>
                                        </div>
        
                                        <div class="flex gap-1 items-center">
                                            <button type="button" @click="editorAnn1.chain().focus().undo().run()"
                                                :disabled="!editorAnn1.can().chain().focus().undo().run()" class="px-2 py-1 rounded-md hover:bg-slate-500/20 duration-300 ease-out">
                                                <svg class="h-4 w-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                                    <path d="M135 369c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-87-87H424c22.1 0 40 17.9 40 40V456c0 13.3 10.7 24 24 24s24-10.7 24-24V288c0-48.6-39.4-88-88-88H81.9l87-87c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0L7 207c-9.4 9.4-9.4 24.6 0 33.9L135 369z"/>
                                                </svg>
                                            </button>
                                            <button type="button" @click="editorAnn1.chain().focus().redo().run()"
                                                :disabled="!editorAnn1.can().chain().focus().redo().run()" class="px-2 py-1 hover:bg-slate-500/20 rounded-md duration-300 ease-out">
                                                <svg class="h-4 w-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                                    <path d="M40 224c-13.3 0-24-10.7-24-24V56c0-13.3 10.7-24 24-24s24 10.7 24 24v80.1l20-23.5C125 63.4 186.9 32 256 32c123.7 0 224 100.3 224 224s-100.3 224-224 224c-50.4 0-97-16.7-134.4-44.8c-10.6-8-12.7-23-4.8-33.6s23-12.7 33.6-4.8C179.8 418.9 216.3 432 256 432c97.2 0 176-78.8 176-176s-78.8-176-176-176c-54.3 0-102.9 24.6-135.2 63.4l-.1 .2 0 0L93.1 176H184c13.3 0 24 10.7 24 24s-10.7 24-24 24H40z"/>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    <editor-content class="px-4" :editor="editorAnn1" />
                                </div>
                            </fieldset>
                            <fieldset>
                                <span class="block text-sm font-medium leading-6 text-gray-900 mb-2">Annonce 2</span>
                                <div class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm sm:leading-6">
                                    <div class="flex gap-4 justify-between items-center mb-4 shadow-md py-2 px-4" v-if="editorAnn2">
                                        <div class="flex gap-1 items-center">
                                            <button type="button" @click="editorAnn2.chain().focus().toggleBold().run()"
                                                :disabled="!editorAnn2.can().chain().focus().toggleBold().run()"
                                                :class="{ 'bg-rose/50': editorAnn2.isActive('bold') }" class="px-2 py-1 hover:bg-slate-500/20 rounded-md duration-300 ease-out">
                                                <svg class="h-4 w-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                                                    <path d="M0 56C0 42.7 10.7 32 24 32H72 88 212c68.5 0 124 55.5 124 124c0 34.7-14.3 66.2-37.3 88.7C339.7 264.9 368 307.1 368 356c0 68.5-55.5 124-124 124H88 72 24c-13.3 0-24-10.7-24-24s10.7-24 24-24H48V256 80H24C10.7 80 0 69.3 0 56zM212 232c42 0 76-34 76-76s-34-76-76-76H96V232H212zM96 280V432H244c42 0 76-34 76-76s-34-76-76-76H212 96z"/>
                                                </svg>
                                            </button>
                                            <button type="button" @click="editorAnn2.chain().focus().toggleItalic().run()"
                                                :disabled="!editorAnn2.can().chain().focus().toggleItalic().run()"
                                                :class="{ 'bg-rose/50': editorAnn2.isActive('italic') }" class="px-2 py-1 rounded-md hover:bg-slate-500/20 duration-300 ease-out">
                                                <svg class="h-4 w-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                                                    <path d="M128 56c0-13.3 10.7-24 24-24H360c13.3 0 24 10.7 24 24s-10.7 24-24 24H291.3L144.7 432H232c13.3 0 24 10.7 24 24s-10.7 24-24 24H24c-13.3 0-24-10.7-24-24s10.7-24 24-24H92.7L239.3 80H152c-13.3 0-24-10.7-24-24z"/>
                                                </svg>
                                            </button>
                                            <button type="button" @click="editorAnn2.chain().focus().toggleBulletList().run()"
                                                :class="{ 'bg-rose/50': editorAnn2.isActive('bulletList') }" class="px-2 py-1 rounded-md hover:bg-slate-500/20 duration-300 ease-out">
                                                <svg class="h-4 w-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                                    <path d="M64 64a32 32 0 1 0 0 64 32 32 0 1 0 0-64zM176 80c-8.8 0-16 7.2-16 16s7.2 16 16 16H496c8.8 0 16-7.2 16-16s-7.2-16-16-16H176zm0 160c-8.8 0-16 7.2-16 16s7.2 16 16 16H496c8.8 0 16-7.2 16-16s-7.2-16-16-16H176zm0 160c-8.8 0-16 7.2-16 16s7.2 16 16 16H496c8.8 0 16-7.2 16-16s-7.2-16-16-16H176zM96 256a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zM64 384a32 32 0 1 0 0 64 32 32 0 1 0 0-64z"/>
                                                </svg>
                                            </button>
                                            <button type="button" @click="editorAnn2.chain().focus().toggleOrderedList().run()"
                                                :class="{ 'bg-rose/50': editorAnn2.isActive('orderedList') }" class="px-2 py-1 rounded-md hover:bg-slate-500/20 duration-300 ease-out">
                                                <svg class="h-4 w-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                                    <path d="M32 48c0 8.8 7.2 16 16 16H64V192H32c-8.8 0-16 7.2-16 16s7.2 16 16 16h96c8.8 0 16-7.2 16-16s-7.2-16-16-16H96V48c0-8.8-7.2-16-16-16H48c-8.8 0-16 7.2-16 16zM192 96c0 8.8 7.2 16 16 16H496c8.8 0 16-7.2 16-16s-7.2-16-16-16H208c-8.8 0-16 7.2-16 16zm0 160c0 8.8 7.2 16 16 16H496c8.8 0 16-7.2 16-16s-7.2-16-16-16H208c-8.8 0-16 7.2-16 16zm0 160c0 8.8 7.2 16 16 16H496c8.8 0 16-7.2 16-16s-7.2-16-16-16H208c-8.8 0-16 7.2-16 16zM58.7 323.9c11.1-11.1 29.2-10.5 39.6 1.3c9.2 10.5 8.9 26.2-.6 36.3L12.3 453.1c-4.3 4.7-5.5 11.5-3 17.3s8.3 9.6 14.7 9.6H128c8.8 0 16-7.2 16-16s-7.2-16-16-16H60.8l60.3-64.6c20.7-22.2 21.2-56.4 1.3-79.3c-22.5-25.7-62.1-27.1-86.3-2.9L20.7 316.7c-6.2 6.2-6.2 16.4 0 22.6s16.4 6.2 22.6 0l15.4-15.4z"/>
                                                </svg>
                                            </button>
                                        </div>
        
                                        <div class="flex gap-1 items-center">
                                            <button type="button" @click="editorAnn2.chain().focus().undo().run()"
                                                :disabled="!editorAnn2.can().chain().focus().undo().run()" class="px-2 py-1 rounded-md hover:bg-slate-500/20 duration-300 ease-out">
                                                <svg class="h-4 w-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                                    <path d="M135 369c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-87-87H424c22.1 0 40 17.9 40 40V456c0 13.3 10.7 24 24 24s24-10.7 24-24V288c0-48.6-39.4-88-88-88H81.9l87-87c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0L7 207c-9.4 9.4-9.4 24.6 0 33.9L135 369z"/>
                                                </svg>
                                            </button>
                                            <button type="button" @click="editorAnn2.chain().focus().redo().run()"
                                                :disabled="!editorAnn2.can().chain().focus().redo().run()" class="px-2 py-1 hover:bg-slate-500/20 rounded-md duration-300 ease-out">
                                                <svg class="h-4 w-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                                    <path d="M40 224c-13.3 0-24-10.7-24-24V56c0-13.3 10.7-24 24-24s24 10.7 24 24v80.1l20-23.5C125 63.4 186.9 32 256 32c123.7 0 224 100.3 224 224s-100.3 224-224 224c-50.4 0-97-16.7-134.4-44.8c-10.6-8-12.7-23-4.8-33.6s23-12.7 33.6-4.8C179.8 418.9 216.3 432 256 432c97.2 0 176-78.8 176-176s-78.8-176-176-176c-54.3 0-102.9 24.6-135.2 63.4l-.1 .2 0 0L93.1 176H184c13.3 0 24 10.7 24 24s-10.7 24-24 24H40z"/>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    <editor-content class="px-4" :editor="editorAnn2" />
                                </div>
                            </fieldset>
                            <fieldset>
                                <legend class="text-sm font-semibold leading-6 text-gray-900">Situation</legend>
                                <div class="mt-6 grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                    <div class="sm:col-span-full">
                                        <label for="idAgence_cli" class="block text-sm font-medium leading-6 text-gray-900">Agence</label>
                                        <div class="mt-2">
                                            <select v-model="current_user.idAgence_cli" id="idAgence_cli" name="idAgence_cli"
                                                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6">
                                            </select>
                                        </div>
                                    </div>
        
                                    <div class="sm:col-span-3">
                                        <label for="affAnn_cli" class="block text-sm font-medium leading-6 text-gray-900">Affichage de l'annonce</label>
                                        <div class="mt-2">
                                            <select v-model="current_user.affAnn_cli" id="affAnn_cli" name="affAnn_cli"
                                                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:max-w-xs sm:text-sm sm:leading-6">
                                                <option value="I">Inderterminé</option>
                                                <option value="O">Oui</option>
                                                <option value="N">Non</option>
                                                <option value="P">Profil rare</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="sm:col-span-3">
                                        <label for="nroAnn_cli" class="block text-sm font-medium leading-6 text-gray-900">Annonce à faire apparaître</label>
                                        <div class="mt-2">
                                            <select v-model="current_user.nroAnn_cli" id="nroAnn_cli" name="nroAnn_cli"
                                                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:max-w-xs sm:text-sm sm:leading-6">
                                                <option value="0">Inderterminé</option>
                                                <option value="1">Annonce 1</option>
                                                <option value="2">Annonce 2</option>
                                            </select>
                                        </div>
                                    </div>
        
                                    <div class="sm:col-span-2 self-end mb-2">
                                        <SwitchGroup as="div" class="flex items-center">
                                            <Switch v-model="current_user.proc_cli"
                                                :class="[current_user.proc_cli === 'O' ? 'bg-rose-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2']">
                                                <span aria-hidden="true"
                                                    :class="[current_user.proc_cli === 'O' ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
                                            </Switch>
                                            <SwitchLabel as="span" class="ml-3 text-sm">
                                                <span class="font-medium text-gray-900">Procuration</span>
                                            </SwitchLabel>
                                        </SwitchGroup>
                                    </div>
                                </div>
                            </fieldset>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>