<script setup>
    import {ref, watch} from 'vue';
    import { useClientsStore } from '../stores/clients';
    import { useAgencesStore } from '../stores/agences';
    import { TransitionRoot, TransitionChild, Dialog,  DialogTitle } from '@headlessui/vue'
    import moment from "moment";
    import fr from 'moment/dist/locale/fr';

    import * as htmlToImage from 'html-to-image';
    import { jsPDF } from "jspdf";
    
    import keyMap from '../assets/json/keyMap.json';

    moment.updateLocale('fr', fr);
    
    // #region VARIABLES
    const props = defineProps(['client', 'isOpen', 'generate']);
    const emit = defineEmits(["modal-close", "base64generated"]);
    const clientsStore = useClientsStore();
    const agencesStore = useAgencesStore();
    const current_user = ref(null);
    const current_agence = ref(null);
    const page = ref(null);
    const blobImage = ref(null);
    const choixAgence = ref('client');
    const isPDFOpen = ref(false);

    // #endregion

    // #region FUNCTIONS 
    const handlePDF = () => {
        if(props.isOpen){
            document.querySelector('html, body').classList.add('noscroll');
            createPDF();
        }
    }

    function calculateAge(dateString) {
		let today = new Date()
		let birthDate = new Date(dateString)
		let age = today.getFullYear() - birthDate.getFullYear()
		let monthDifference = today.getMonth() - birthDate.getMonth()
		if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
			age--
		}
		return age
	}

    const createPDF = async () => {  
        await getBlobImage().then(async () => {
            let pdf = page.value

            let doc = new jsPDF({ compress: false });

            const fontEmbedCss = await htmlToImage.getFontEmbedCSS(pdf);
            const dataUrl1 = await htmlToImage.toJpeg(pdf, { quality: 0.9, pixelRatio: 1.5, fontEmbedCss });
            doc.addImage(dataUrl1, 'JPEG', 0, 0, 210, 297);

            doc.save(`portrait-client-${current_user.value.ref_cli}.pdf`);
        })
    }

    const getBlobImage = () => {
        return new Promise((resolve) => {
            clientsStore.getClientImage(props.client)
            .then(res => {
                blobImage.value = res;
                resolve()
            })
            .catch(err => console.error(err))
        })
        
    }

    const openPDF = async () => {
        fetchAgence(choixAgence.value);

        isPDFOpen.value = true;
        emit('modal-close'); 

    }

    const closePDF = () => {
        emit('modal-close');
        document.querySelector('html, body').classList.remove('noscroll');
    }

    const generateAttachment = async () => {
        if(props?.generate?.state){
            await getBlobImage().then(async () => {
                let pdf = page.value

                let doc = new jsPDF({ compress: false });

                const dataUrl1 = await htmlToImage.toJpeg(pdf, { quality: 0.9, pixelRatio: 1.5, skipFonts: true });
                doc.addImage(dataUrl1, 'JPEG', 0, 0, 210, 297);
                
                var pdfBase64 = doc.output('datauristring');
                emit('base64generated', {file: pdfBase64.split(',')[1], email: props.generate.email});
            })
        }
    }

    const fetchClient = () => {
        clientsStore.getClient(props.client)
		.then(res => {
            current_user.value = res.client
            if(res.client.situation_cli){
                current_user.value.situation_cli = JSON.parse(res.client.situation_cli);
            }
		})
    }

    const fetchAgence = (agence) => {
        let id = agence !== 'client' ? agence : current_user.value.idAgence_cli
        agencesStore.getAgence(id)
		.then(res => {
            current_agence.value = res.agence;
		})
    }

    const mapKey = (key, value) => {
        return keyMap[key][value]
    }

    // watch(() => props.isOpen, handlePDF, {immediate: true});
    // watch(() => props.generate, generateAttachment, {immediate: true});
    watch(() => props.client, fetchClient, {immediate: true});
    // watch(() => props.agence, fetchAgence, {immediate: true});
    // #endregion
</script>

<template>
    <div v-if="client && current_user && current_agence" :class="isPDFOpen ? 'pointer-events-all left-0' : 'pointer-events-none -left-[9999px]'" class="overflow-hidden fixed top-0 w-full h-full z-50">
        <div class="wrapperPDF">
            <button @click="isPDFOpen = false" class="absolute top-8 right-8 z-[2] w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer">
                <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                    <path fill="white" d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/>
                </svg>
            </button>
            
            <div class="wrapperPDF__background bg-black/30 absolute top-0 left-0 w-full h-full z-[-1] backdrop-blur-sm"></div>
            <div class="wrapperPDF__content absolute top-0 left-0 w-full h-full z-[1] overflow-y-scroll">
                <div id="pdf" class="<font-[Avenir]">
                    <div class="page flex flex-col overflow-hidden relative p-8" ref="page">
                        Adresse : 
                        {{ current_agence.adr_agence }}

                        Code postal :
                        {{ current_agence.cp_agence }}

                        Ville : 
                        {{ current_agence.ville_agence }}
                        
                        Tél. 
                        {{ current_agence.tel_agence }}

                        <slot></slot>
                    </div>
                </div>
            </div>
        </div>
    </div>
    

    <!-- #region POPUP CHOIX AGENCE -->
    <TransitionRoot appear :show="isOpen" as="template">
        <Dialog as="div" @close="isOpen = false" class="relative z-10">
            <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
                <div class="fixed inset-0 bg-black/25" />
            </TransitionChild>

            <div class="fixed inset-0 overflow-y-auto">
                <div class="flex min-h-full items-center justify-center p-4 text-center">
                    <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
                        <DialogPanel class="w-full max-w-xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                            <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900 text-center">
                                Génération du courrier
                            </DialogTitle>
                            
                            <fieldset class="mt-10">
                                <legend class="sr-only">Notifications</legend>
                                <div class="space-y-5 mb-5">
                                    <div class="relative flex items-start">
                                        <div class="flex h-6 items-center">
                                            <input id="candidates" aria-describedby="candidates-description" name="candidates" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                                        </div>
                                        <div class="ml-3 text-sm leading-6">    
                                        <label for="candidates" class="font-medium text-gray-900">Afficher l'adresse</label>
                                            {{ ' ' }}
                                            <span id="candidates-description" class="text-gray-500"><span class="sr-only">Afficher l'adresse </span>du client sur le courrier.</span>
                                        </div>
                                    </div>
                                </div>
                            </fieldset>

                            <div>
                                <label for="agence" class="block text-sm font-medium leading-6 text-gray-900">Choix de l'agence</label>
                                <select v-model="choixAgence" id="agence" name="agence" class="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
                                    <option value="5">Agence de Nancy</option>
                                    <option value="client">Agence du client</option>
                                </select>
                            </div>

                            <div class="mt-4 justify-center gap-2 flex">
                                <button type="button" class="inline-flex gap-2 items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50" @click="closePDF" >
                                    Fermer
                                </button>

                                <button @click="openPDF" type="button" class="inline-flex justify-center rounded-md border border-transparent bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-400 duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2">
                                    Modifier
                                </button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
    <!-- #endregion -->
</template>

<style lang="scss"> 
    @font-face {
        font-family: 'Baloo Bhai';
        src: url('../assets/fonts/BalooBhai-Regular.woff2') format('woff2'),
        url('../assets/fonts/BalooBhai-Regular.woff') format('woff');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
    }   
    
    div.wrapperPDF {
        // font-family: 'Baloo Bhai', sans-serif;
        #pdf {
            width: 210mm;
            min-height: 297mm;
            padding: 5mm;
            margin: 10mm auto;
            border: 1px #D3D3D3 solid;
            border-radius: 5px;
            background: white;
            box-shadow: 0 0 5px rgb(0 0 0 / 10%);

            @media screen and (max-width: 1024px){
                transform: scale(0.5) translateY(-50%);
            }

            @media screen and (max-width: 767px){
                transform: scale(0.5) translateX(-50%) translateY(-50%);
            }

            div.page {
                height: 287mm;
                font-size: 10px;
                background-color: white;
            }
        }
    }
</style>