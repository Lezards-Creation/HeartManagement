<script setup>
    import {ref, watch} from 'vue';
    import { useClientsStore } from '../stores/clients';
    import { useAgencesStore } from '../stores/agences';
    import { TransitionRoot, TransitionChild, Dialog,  DialogTitle } from '@headlessui/vue'
    import moment from "moment";
    import fr from 'moment/dist/locale/fr';

    import * as htmlToImage from 'html-to-image';
    import { jsPDF } from "jspdf";

    moment.updateLocale('fr', fr);
    
    // #region VARIABLES
    const props = defineProps(['client', 'targetClient', 'isOpen', 'generate', 'type', 'inverse']);
    const emit = defineEmits(["modal-close", "base64generated"]);
    
    const clientsStore = useClientsStore();
    const agencesStore = useAgencesStore();
    
    const current_user = ref(null);
    const target_user = ref(null);
    const current_agence = ref(null);
    const current_type = ref('');

    const page = ref(null);
    const blobImage = ref(null);
    const choixAgence = ref('client');
    const isPDFOpen = ref(false);
    const hasAddress = ref(null);
    // #endregion

    // #region FUNCTIONS 
    const handlePDF = () => {
        if(props.isOpen){
            current_type.value = props.type;
            document.querySelector('html, body').classList.add('noscroll');
            
            if(props.inverse){
                let temp1 = current_user.value;
                let temp2 = props.inverse;

                current_user.value = temp2;
                target_user.value = temp1;

                target_user.value.situation_cli = JSON.parse(temp2.situation_cli);
            } else {
                target_user.value = props.targetClient;
                try {
                    target_user.value.situation_cli = JSON.parse(props.targetClient.situation_cli);
                }
                catch(error){
                    console.log(error)
                }
            }
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

            doc.save(`courrier-client-${current_user.value.ref_cli}.pdf`);
        })
    }

    const getBlobImage = () => {
        return new Promise((resolve) => {
            clientsStore.getClientImage(target_user.value.id_cli)
            .then(res => {
                blobImage.value = res;
                resolve()
            })
            .catch(err => console.error(err))
        })
        
    }

    const openPDF = async () => {
        try {
            await fetchAgence(choixAgence.value);
        } catch {
            console.log('error')
        }
        
        if(!props.generate.state){
            isPDFOpen.value = true;
            props.isOpen = false;
        
            emit('modal-close'); 
            setTimeout(createPDF, 1000)
        } else {
            await generateAttachment();

            props.isOpen = false;
            emit('modal-close'); 
        }
        
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
                emit('base64generated', {file: pdfBase64.split(',')[1], email: props.generate.email, subject: 'Courrier de', name: `${target_user.value.pNoms_cli}`});
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
        return new Promise((resolve, reject) => {
            let id = agence !== 'client' ? agence : current_user.value.idAgence_cli === 0 ? 5 : current_user.value.idAgence_cli
            agencesStore.getAgence(id)
            .then(res => {
                current_agence.value = res.agence;
                resolve();
            })
        })
    }

    watch(() => props.isOpen, handlePDF, {immediate: true});
    watch(() => props.client, fetchClient, {immediate: true});
    // #endregion
</script>

<template>
    <!-- #region POPUP COURRIER -->
    <div v-if="current_user && current_agence && target_user" :class="isPDFOpen ? 'pointer-events-all left-0' : 'pointer-events-none -left-[9999px]'" class="overflow-hidden fixed top-0 w-full h-full z-50">
        <div class="wrapperPDF">
            <button type="button" @click="() => {isPDFOpen = false}" class="absolute top-8 right-8 z-[2] w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer bg-rose">
                <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                    <path fill="white" d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/>
                </svg>
            </button>
            
            <div class="wrapperPDF__background bg-black/30 absolute top-0 left-0 w-full h-full z-[-1] backdrop-blur-sm"></div>
            <div class="wrapperPDF__content absolute top-0 left-0 w-full h-full z-[1] overflow-y-scroll">
                <div id="pdf">
                    <div class="page flex flex-col overflow-hidden relative p-8" ref="page">
                        <!-- #region HEADER COURRIER -->
                        <div class="border-b border-bleu/20 pb-2 flex justify-between">
                            <div class="basis-4/6">
                                <div>
                                    <p class="text-bleu text-sm mb-2">{{current_user.sexe_cli === 'H' ? 'M.' : 'Mme.' }} {{ current_user.nom_cli }} {{ current_user.pNoms_cli }} - Votre numéro de dossier : n°{{ current_user.ref_cli }}</p>
                                    <p class="text-rose text-sm">Merci de nous retourner impérativement ce coupon entier complet et signé par mail à contact@harmonie.fr ou par voie postale :</p>
                                    <p class="font-[Avenir] text-sm">Service client - Harmonie Matrimoniale</p>
                                    <span class="font-[Avenir] text-sm">{{ current_agence.adr_agence }} {{ current_agence.cp_agence }} {{ current_agence.ville_agence }}</span>
                                </div>
                            </div>
                            <div>
                                <svg width="161" height="65" viewBox="0 0 161 65" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M111.661 28.9086C109.118 30.4217 110.104 30.0657 111.557 29.2202C113.01 28.3746 114.826 27.5736 111.557 30.5107C111.142 30.9557 112.335 30.1102 114.203 28.5971C117.835 25.6155 118.458 23.6574 124.684 24.1469C130.911 24.6364 129.147 23.1234 131.378 21.4768C133.868 19.6967 134.75 19.2962 136.203 19.4742C136.515 19.5187 135.736 18.7176 134.491 17.6941C132.519 16.092 132.052 15.914 130.496 16.1365C128.835 16.4035 128.783 16.359 128.524 14.7569C128.42 13.8224 127.798 11.2412 127.227 9.06064C126.604 6.83553 125.981 3.89838 125.722 2.60781C125.099 -0.373841 124.996 -0.329339 123.698 1.53976C121.882 4.87743 122.349 3.23084 121.831 1.09473C121.312 -1.04138 121.467 0.382697 120.222 1.71777C117.264 4.69942 116.486 7.54756 116.279 11.3748C116.071 15.202 116.901 16.1365 118.458 18.0946L119.547 19.0736L117.939 20.5422C117.057 21.2988 115.397 22.9898 114.93 24.4139C114.463 25.838 113.736 27.4401 112.854 28.1521" fill="#01238B"/>
                                    <path d="M144.09 48.6677C129.302 54.542 112.958 59.1257 99.4154 61.1728C92.3069 62.2409 78.5049 62.2409 73.4719 61.1728C66.0002 59.6152 60.5002 57.1231 56.92 53.7409C54.9483 51.8718 54.9483 51.7828 55.2077 49.0682C55.4671 45.9085 57.2313 42.3039 60.0332 38.9662C61.953 36.6076 62.0049 35.762 60.2407 34.3825C59.203 33.5814 59.0473 33.6259 55.3634 35.317C52.4058 36.6521 51.1086 37.5421 49.8115 39.1887C47.5803 41.9923 41.7171 47.3326 41.2501 46.9766C41.0945 46.7986 41.4058 45.9975 41.9765 45.1965C43.585 42.8379 43.7926 41.5028 42.5992 40.3458L41.5614 39.2777L40.4199 40.6128C38.2926 43.0604 33.6227 47.0656 33.2076 46.7986C31.9105 46.1311 39.5897 38.3432 42.6511 37.2751C43.4813 36.9636 44.1558 36.4741 44.1558 36.207C44.1558 35.317 42.5992 33.7149 41.7171 33.7149C39.2265 33.7149 34.3492 37.0971 31.1322 41.1023C29.835 42.7489 29.368 43.7724 29.368 45.152C29.368 46.5316 29.2642 47.0656 26.9293 47.9556C24.1274 48.9792 22.8821 49.0682 22.8821 48.2672C22.8821 47.0211 24.4906 42.5264 25.3208 41.3693C27.1369 38.9217 29.3161 36.8301 29.9907 36.8301C31.3397 36.8301 35.802 34.961 36.0614 34.2934C36.3209 33.7594 36.0614 33.6704 35.2312 33.9374C34.5567 34.1154 33.3633 34.338 32.585 34.4715L31.1322 34.694L32.6888 32.1128C36.0095 26.4166 36.0095 23.4794 32.6888 23.4794C29.368 23.4794 30.4057 23.7909 29.5756 24.1469C28.1746 24.77 28.0189 25.0815 28.0189 26.8616C28.0189 28.6417 27.5001 29.7542 26.6699 31.1783C24.4387 35.139 24.3869 35.1835 19.7689 35.406C13.3868 35.7175 13.3349 35.673 18.0567 30.9558C24.6982 24.2359 28.6935 18.6732 29.368 15.113C29.6274 13.5999 29.5237 13.2439 28.4859 12.6208C27.1369 11.8198 25.9954 11.7753 23.3491 12.4428C20.1321 13.1994 19.717 13.8669 19.717 17.8721C19.717 23.2124 17.5897 27.0841 11.7264 32.6914C9.49531 34.8275 9.08021 35.0055 6.33021 35.317C1.40095 35.8065 0 36.4741 0 38.4322C0 40.3903 1.86793 41.0133 2.49057 39.8562C3.11322 38.6992 5.18869 38.5212 5.18869 39.0107C5.18869 39.5002 4.87737 39.6337 4.46228 39.9007C3.32076 40.7463 1.55661 44.262 1.55661 45.7305C1.55661 47.1991 1.86793 47.6441 2.28303 48.3562C3.26888 49.9137 7.1604 52.9399 7.9387 52.7174C8.3538 52.6284 8.66512 50.8038 8.87267 47.4661C9.08021 43.6834 9.39154 41.8588 10.2217 40.3458L11.3114 38.2542L14.5802 37.9871C16.3963 37.8091 18.7831 37.5866 19.9246 37.4086L21.9482 37.1861L19.6133 39.9897C15.2548 45.3745 15.0991 46.6651 18.4718 49.7357C20.4435 51.5603 21.2218 51.9608 22.6227 51.9608C24.6982 51.9608 28.5378 50.4923 29.8869 49.2462C30.3539 48.8012 31.3397 48.4007 32.0661 48.4007C32.7925 48.4007 34.0897 47.7331 35.3869 46.6206C37.6699 44.6625 37.9812 44.529 37.5661 45.508C37.0473 46.5761 38.7595 48.4007 40.2643 48.4007C41.769 48.4007 45.8681 45.2855 49.3964 41.1913C50.953 39.4112 52.4058 38.1651 52.9766 38.1651C53.5473 38.1651 54.2737 38.0316 54.7407 37.8981C55.4671 37.6311 55.4671 37.8981 54.4813 39.5447C51.42 44.6625 50.6417 49.0237 52.1983 52.2279C53.4435 54.7645 59.3068 59.5262 63.6653 61.4398C69.9436 64.2435 74.1983 65 83.7974 65C95.5757 65 104.864 63.3534 120.897 58.3247C127.486 56.2776 149.798 47.2436 149.331 46.8431C149.175 46.7096 146.84 47.5106 144.038 48.6232L144.09 48.6677Z" fill="#01238B"/>
                                    <path d="M159.916 17.0711C159.258 17.4864 158.86 17.1304 158.722 16.003L158.566 14.8459C158.566 14.8014 158.463 14.7569 158.463 14.8459L156.491 16.3145C155.349 17.1601 153.378 18.3616 152.081 18.9847C150.783 19.6077 149.123 20.4977 148.345 20.9428C147.447 21.4768 146.684 21.3433 146.062 20.5422C144.142 18.0056 143 17.7386 140.25 19.2072C138.486 20.1417 138.486 20.1862 139.524 20.5867C140.717 21.0763 140.977 21.4768 142.015 24.859C142.43 26.194 143.052 29.0422 144.816 29.9322C147.359 31.1783 146.892 32.7359 146.892 36.207C146.892 39.6782 146.684 40.5237 146.84 39.9897C147.359 37.2306 148.137 37.3641 147.982 39.3667C147.826 41.3693 148.864 35.6285 149.279 30.8668C149.59 27.6181 149.694 27.2621 150.576 27.4401C153.43 28.1076 158.255 24.859 159.552 21.4323C161.576 16.1365 161.265 16.27 159.916 17.1156V17.0711Z" fill="#01238B"/>
                                    <path d="M124.165 28.9532C123.231 29.7542 123.491 32.8694 124.529 32.8694C125.566 32.8694 125.514 32.1573 126.293 31.3118C127.486 30.0212 127.642 29.5762 127.175 29.0867C126.397 28.2856 124.996 28.2411 124.165 28.9532Z" fill="#01238B"/>
                                    <path d="M136.826 38.9661C137.397 38.0316 137.448 37.7646 136.93 37.7646C136.411 37.7646 131.741 42.7043 132.156 43.0604C132.519 43.3719 135.996 40.3457 136.826 38.9661Z" fill="white"/>
                                    <path d="M140.354 40.7908C136.566 44.3509 133.038 46.6651 131.378 46.6651C129.717 46.6651 130.184 45.419 132.571 44.2174C133.816 43.5944 135.944 42.0813 137.241 40.8798C139.368 38.9217 139.628 38.4766 139.628 36.6521C139.628 31.8013 134.387 33.5814 128.316 40.4792C125.463 43.7724 121.156 47.2881 120.481 46.9321C119.496 46.398 119.807 45.6415 122.505 41.9033C125.359 37.8981 125.826 35.8065 124.114 34.4714C123.18 33.7149 123.076 33.8039 121.415 36.4295C118.717 40.7463 111.246 47.8221 110.208 46.9766C109.897 46.6651 111.194 44.5735 114.255 40.5237C116.382 37.7201 116.797 36.8746 116.59 35.8065C116.279 34.5604 115.5 33.8039 114.566 33.7594C114.359 33.7594 113.217 34.5159 111.972 35.4505C108.184 38.3876 108.236 38.3431 108.236 36.385C108.236 35.406 107.821 34.3379 107.406 33.9374C106.68 33.3589 106.42 33.5369 104.967 36.0735C102.996 39.4557 98.9484 43.9949 97.8588 43.9949C96.7691 43.9949 97.1323 43.8614 97.8588 42.6599C98.8446 41.0133 98.8446 40.0342 97.8588 39.6782C96.6135 39.2777 95.3682 40.6573 95.4201 42.4373C95.4201 43.7279 95.1087 44.2619 93.3446 45.5525C89.9719 48.0446 88.3116 47.5551 89.5568 44.4844C91.0097 40.7908 95.5238 36.8746 98.3257 36.8746C101.128 36.8746 99.7786 36.6966 99.9342 36.474C100.401 35.851 97.2361 33.7594 95.8352 33.7594C94.4342 33.7594 89.8163 36.474 87.7408 39.0997C84.3681 43.3719 78.453 48.2671 78.453 46.7541C78.453 45.241 79.9577 44.3509 81.8257 41.8143C85.2502 37.0971 85.6134 36.1625 84.6795 34.6049C83.8493 33.3589 82.8115 33.5814 80.321 35.5395C79.0757 36.5185 77.9342 37.3196 77.7266 37.3196C77.5191 37.3196 77.4153 36.8301 77.4153 36.2515C77.4153 35.1835 76.2219 33.7594 75.3398 33.7594C74.4577 33.7594 73.1606 35.0055 71.137 36.474C68.9577 38.0761 67.7124 38.7882 68.0756 38.2096C68.7502 37.1416 68.4388 34.9165 67.5049 33.8929C66.6747 33.0919 66.0002 33.1809 66.0002 34.1154C66.0002 35.05 64.4954 37.0081 62.6275 39.5892C59.0992 44.3954 58.5803 46.131 59.9813 47.8221C60.8634 48.8012 60.552 48.9792 64.5473 44.4399C66.1558 42.6154 68.6983 40.0787 70.203 38.8772L72.8492 36.6521L71.0332 38.8772C67.5049 43.2384 66.6747 45.864 68.3351 47.7331C69.269 48.7567 69.1653 48.8457 70.9294 45.8195C72.4341 43.2829 75.8068 39.9007 79.2313 37.6311L81.3068 36.207L79.3351 38.5211C76.637 41.7253 75.236 44.5735 75.6511 46.0865C76.5332 49.3352 78.5568 49.2907 82.6559 45.9085L85.7172 43.4164V45.1965C85.7172 48.6677 89.4531 49.5577 93.3965 47.0656C94.5899 46.309 95.5757 45.508 95.5757 45.2855C95.5757 45.063 96.4059 44.885 97.3918 44.885C98.9484 44.885 99.2078 45.0185 99.2078 45.9085C99.2078 46.7986 100.713 48.9347 101.076 48.1781C101.646 47.0211 105.849 42.1703 108.236 39.9452C111.557 36.7856 112.75 36.2515 110.675 38.8327C107.665 42.5263 106.783 45.5525 108.029 47.5996C109.014 49.1127 110.986 48.6232 114.047 46.1755L116.849 43.8614V45.152C116.849 46.8876 118.198 48.4451 119.651 48.4451C121.104 48.4451 124.788 46.22 125.774 44.885C126.656 43.6389 126.967 43.7724 127.071 45.3745C127.331 48.7122 131.066 49.3352 134.906 46.7096C138.071 44.5735 143.831 39.1442 143.831 38.3431C143.831 37.5421 142.482 38.8327 140.406 40.7908H140.354ZM136.93 37.7646C137.448 37.7646 137.397 38.0316 136.826 38.9662C135.996 40.3457 132.519 43.3719 132.156 43.0604C131.741 42.7044 136.203 37.7646 136.93 37.7646Z" fill="#01238B"/>
                                    <path d="M91.0097 26.0605C89.6607 27.1731 88.1559 28.0631 87.6889 28.0186C87.0144 28.0186 87.0663 27.9296 87.8965 27.4846C90.2314 26.2385 91.788 24.5475 91.788 23.2124C91.788 20.9428 90.0758 21.4323 85.7691 25.037C81.722 28.3746 80.321 28.6862 81.722 25.8825C82.3446 24.592 82.5521 24.4584 83.2786 24.9925C84.005 25.482 84.2125 25.4375 84.8352 24.7255C85.2503 24.2804 85.5616 23.3014 85.5616 22.6339C85.5616 21.4768 85.4059 21.3878 84.1606 21.6548C83.2786 21.7883 81.255 23.2569 79.1795 25.126L75.6512 28.2856L77.2597 26.016C78.0899 24.77 78.8163 23.3904 78.8163 22.9899C78.8163 21.8773 77.3635 21.6103 76.1701 22.5448C75.1842 23.3014 75.1323 23.3014 74.3021 22.2778L73.4719 21.2543L72.4861 22.9009C71.2927 24.948 67.5568 28.0631 66.4153 28.0186C65.7927 28.0186 65.9483 27.7961 66.8823 27.2621C69.4247 25.7935 70.5144 24.5475 70.5144 23.1679C70.5144 21.7883 70.3068 21.8328 69.2691 21.8328C68.2313 21.8328 67.0898 22.7229 64.8068 24.8145C62.6794 26.8171 61.7455 27.4846 61.953 26.8171C62.2125 26.1495 62.0049 25.482 61.4342 24.948C60.6559 24.1914 60.6559 24.1024 61.486 23.7019C62.6794 23.1234 62.0568 21.8328 60.5521 21.8328C59.0474 21.8328 57.3351 22.8564 55.986 24.7255C54.637 26.6391 54.7926 28.5082 56.4011 29.2202C57.5426 29.7097 57.4908 29.7097 55.7266 30.5553C54.1181 31.3118 53.8068 31.3118 53.3917 30.7333C52.6134 29.7097 52.8209 26.7281 53.8068 24.3249C54.5332 22.5448 55.0002 22.0108 56.3492 21.6548C58.6323 20.9873 59.0474 20.4977 57.3351 20.4977C55.6228 20.4977 55.9341 20.3642 56.2455 19.6967C57.1275 17.9166 57.1275 17.2936 56.2455 16.4925C55.7266 16.003 55.1558 15.6025 55.0002 15.647C54.8445 15.647 53.1841 17.0711 51.3681 18.7622L48.0992 21.8328H44.6228C42.703 21.8328 40.8869 21.6103 40.5756 21.3433C39.486 20.4087 39.3822 21.6993 40.4718 22.9009C41.1983 23.7019 42.0284 24.0579 43.17 24.0579C44.8303 24.0579 44.7785 24.0579 42.0284 25.66C39.7454 26.9951 39.3822 27.3511 40.0567 27.7071C41.1464 28.1966 43.4294 27.2176 46.6464 24.948C47.9436 24.0134 49.5002 23.1679 50.1228 22.9899C51.2124 22.6784 51.2124 22.7674 50.953 25.9715C50.7454 28.5527 50.8492 29.6207 51.5238 30.7333C52.3021 32.1128 52.3021 32.2908 51.5238 33.0029C50.2785 34.1599 50.953 35.1835 52.9766 35.1835C55.0002 35.1835 55.2596 34.6495 59.0992 31.1783C63.3021 27.3066 63.5096 27.1731 64.0285 28.1521C64.703 29.4872 66.3634 29.6652 67.92 28.5972C68.7502 28.032 69.4611 28.0498 70.0474 28.6417C70.6337 29.2335 71.1889 29.1 71.7078 28.2411C72.1229 27.5291 73.0049 26.5501 73.5757 26.0605L74.7172 25.215L74.1983 26.461C73.7832 27.3066 73.7832 27.9296 74.1465 28.5527C74.8729 29.7097 75.8068 29.6207 77.2597 28.2856L78.505 27.1286L79.1795 28.2856C80.0616 29.6652 81.722 29.7542 83.3305 28.4636L84.472 27.4846L85.4578 28.5082C86.8069 29.9322 88.3635 29.4872 91.4767 26.7726C94.7456 23.9244 94.3824 23.3904 91.0097 26.0605ZM87.4814 25.838C87.6371 25.3485 89.4531 23.9689 89.4531 23.9689C89.4531 23.9689 89.8682 23.6129 90.1276 23.6129C90.3871 23.6129 89.038 24.859 89.038 24.9035L88.104 25.7045C88.104 25.7045 87.3776 26.2385 87.5333 25.7935L87.4814 25.838ZM66.2078 25.838C66.3634 25.3485 68.1795 23.9689 68.1795 23.9689C68.1795 23.9689 68.5946 23.6129 68.854 23.6129C69.1134 23.6129 67.7644 24.859 67.7644 24.9035L66.8304 25.7045C66.8304 25.7045 66.104 26.2385 66.2596 25.7935L66.2078 25.838ZM51.9907 20.9873C51.3681 21.4323 51.42 21.2098 52.3021 20.1417C53.5473 18.5841 54.2738 18.2281 53.4436 19.5187C53.1841 19.9637 52.5096 20.6313 51.9907 20.9873ZM54.2738 32.7359C52.9766 33.7149 51.8351 34.1599 51.8351 33.6704C51.8351 33.1809 55.104 31.6233 55.4672 31.6233C55.6228 31.6233 55.0521 32.1573 54.2738 32.7359ZM59.0992 26.283C58.4766 26.9951 57.854 27.6181 57.7502 27.6181C57.387 27.6181 58.0096 26.7281 58.9955 25.7045C60.2408 24.5029 60.2926 24.8145 59.0992 26.283Z" fill="#01238B"/>
                                </svg>
                            </div>
                        </div>
                        <!-- #endregion -->

                        <!-- #region CORPS COURRIER -->
                        <div class="flex justify-end mt-4 pr-20 relative">
                            <svg class="absolute -left-4 top-0 -translate-x-3/4 -translate-y-8" width="344px" height="341px" viewBox="0 0 344 341" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                                <title>Group</title>
                                <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" opacity="0.25">
                                    <g id="Group" transform="translate(-49.120532, -51.620532)">
                                        <ellipse id="Oval" fill="#F43D80" fill-rule="nonzero" opacity="0.50" transform="translate(373.738532, 285.453546) rotate(140.197000) translate(-373.738532, -285.453546) " cx="373.738532" cy="285.453546" rx="7.75202" ry="7.71689"></ellipse>
                                        <path d="M272.825832,379.840546 C270.623532,377.197546 270.990532,373.261546 273.645532,371.049546 C276.300532,368.837546 280.238032,369.186546 282.440232,371.829546 C284.642532,374.472546 284.275532,378.408546 281.620532,380.620546 C278.965532,382.832546 275.028032,382.483546 272.825832,379.840546 Z" id="Path" fill="#FFECF2" fill-rule="nonzero"></path>
                                        <path d="M221.120532,384.620532 C255.842543,384.620532 288.036589,373.797031 314.512834,355.339867 C356.89109,325.797066 384.620532,276.697078 384.620532,221.120532 C384.620532,130.821975 311.419089,57.6205319 221.120532,57.6205319 C130.821975,57.6205319 57.6205319,130.821975 57.6205319,221.120532 C57.6205319,311.419089 130.821975,384.620532 221.120532,384.620532 Z" id="Oval" stroke="#BE3668" stroke-width="2" stroke-dasharray="75,75" transform="translate(221.120532, 221.120532) rotate(-28.000000) translate(-221.120532, -221.120532) "></path>
                                        <path d="M219.120532,372.620532 C298.958054,372.620532 363.679153,304.120099 363.679153,219.620532 C363.679153,135.120965 298.958054,66.6205319 219.120532,66.6205319 C139.28301,66.6205319 74.5619113,135.120965 74.5619113,219.620532 C74.5619113,304.120099 139.28301,372.620532 219.120532,372.620532 Z" id="Oval" stroke="#F43D80" stroke-width="3" stroke-dasharray="35,35"></path>
                                    </g>
                                </g>
                            </svg>

                            <address v-if="hasAddress" class="ml-auto text-xs not-italic font-[Avenir]">
                                {{ current_user.sexe_cli === 'H' ? 'M.' : 'Mme.' }} {{ current_user.nom_cli }} {{ current_user.pNoms_cli }}<br>
                                {{ current_user.adr_cli }}<br>
                                {{ current_user.cp_cli }} {{ current_user.ville_cli }}
                            </address>
                        </div>

                        <div class="flex justify-center mt-12 flex-wrap">
                            <div class="basis-full">
                                <p class="text-center" v-if="type === 'choix' || current_type === 'choix'">
                                    <span class="text-bleu block text-lg leading-5">Bonne nouvelle {{ current_user.pNoms_cli }},</span>
                                    <span class="text-rose block text-lg leading-5">{{ target_user.pNoms_cli }} vous a choisi !</span>
                                </p>
                                <p class="text-center" v-else-if="type === 'renc' || current_type === 'renc'">
                                    <span class="text-bleu block text-lg leading-5">{{ current_user.pNoms_cli }}, vous allez rencontrer</span>
                                    <span class="text-rose block text-lg leading-5">{{ target_user.pNoms_cli }}</span>
                                </p>
                                <p class="text-center" v-else-if="type === 'prop' || current_type === 'prop'">
                                    <span class="text-bleu block text-lg leading-5">{{ current_user.pNoms_cli }}, Harmonie vous propose</span>
                                    <span class="text-rose block text-lg leading-5">de rencontrer {{ target_user.pNoms_cli }}</span>
                                </p>
                            </div>
                            <div v-if="blobImage" class="w-[310px] h-[200px] relative rounded-[60px] overflow-hidden mt-4">
                                <img class="absolute top-0 left-0 object-contain w-full h-full" :src="blobImage" alt="">
                            </div>
                        </div>

                        <div class="border-2 rounded-3xl border-rose pt-5 pb-5 px-10 mt-4 relative">
                            <svg class="absolute -top-12 -left-0" width="60px" height="58px" viewBox="0 0 28 26" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                                <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                    <g id="Group-3" transform="translate(0.192095, -0.000000)" fill="#F43D80">
                                        <path d="M5.56490518,1.1 C3.93990518,3.01 3.51290518,4.834 3.39790518,7.286 L3.39790518,7.286 C3.28490518,9.738 3.74090518,10.336 4.59590518,11.591 L4.59590518,11.591 L5.19390518,12.218 L4.31090518,13.158 C3.82590518,13.643 2.91390518,14.726 2.65790518,15.639 L2.65790518,15.639 C2.40090518,16.55 2.00190518,17.576 1.51690518,18.033 L1.51690518,18.033 L0.860905178,18.517 C-0.535094822,19.486 0.00590517797,19.259 0.804905178,18.717 L0.804905178,18.717 C1.60290518,18.175 2.59990518,17.662 0.804905178,19.544 L0.804905178,19.544 C0.576905178,19.828 1.23190518,19.287 2.25790518,18.318 L2.25790518,18.318 C4.25290518,16.408 4.59590518,15.154 8.01590518,15.467 L8.01590518,15.467 C11.4369052,15.781 10.4679052,14.812 11.6939052,13.757 L11.6939052,13.757 C13.0619052,12.617 13.5469052,12.36 14.3449052,12.474 L14.3449052,12.474 C14.5159052,12.502 14.0889052,11.989 13.4049052,11.334 L13.4049052,11.334 C12.3209052,10.308 12.0649052,10.194 11.2099052,10.336 L11.2099052,10.336 C10.2969052,10.507 10.2689052,10.479 10.1259052,9.452 L10.1259052,9.452 C10.0689052,8.854 9.72690518,7.2 9.41290518,5.804 L9.41290518,5.804 C9.07090518,4.379 8.72890518,2.497 8.58690518,1.671 L8.58690518,1.671 C8.24490518,-0.24 8.18690518,-0.211 7.47490518,0.986 L7.47490518,0.986 C6.47690518,3.124 6.73390518,2.069 6.44890518,0.701 L6.44890518,0.701 C6.34290518,0.195 6.28790518,0 6.22690518,0 L6.22690518,0 C6.12190518,0 5.99590518,0.562 5.56490518,1.1" id="Fill-1"></path>
                                        <path d="M26.5739052,9.51 L25.4919052,10.45 C24.8639052,10.992 23.7809052,11.762 23.0679052,12.16 L23.0679052,12.16 C22.3559052,12.56 21.4429052,13.13 21.0159052,13.415 L21.0159052,13.415 C20.5229052,13.757 20.1029052,13.671 19.7609052,13.158 L19.7609052,13.158 C18.7059052,11.534 18.0789052,11.363 16.5679052,12.303 L16.5679052,12.303 C16.1229052,12.579 15.8819052,12.734 15.8079052,12.845 L15.8079052,12.845 L15.8079052,12.981 C15.8579052,13.044 15.9839052,13.104 16.1689052,13.187 L16.1689052,13.187 C16.8259052,13.5 16.9679052,13.757 17.5379052,15.923 L17.5379052,15.923 C17.7659052,16.778 18.1079052,18.603 19.0769052,19.173 L19.0769052,19.173 C20.4739052,19.971 20.2179052,20.969 20.2179052,23.193 L20.2179052,23.193 C20.2179052,25.415 20.1029052,25.957 20.1889052,25.615 L20.1889052,25.615 C20.4739052,23.848 20.9019052,23.933 20.8159052,25.217 L20.8159052,25.217 C20.7309052,26.499 21.2999052,22.822 21.5289052,19.772 L21.5289052,19.772 C21.6999052,17.691 21.7569052,17.463 22.2419052,17.576 L22.2419052,17.576 C23.8089052,18.004 26.4599052,15.923 27.1729052,13.728 L27.1729052,13.728 C27.4739052,12.808 27.6809052,12.144 27.8079052,11.676 L27.8079052,11.676 L27.8079052,10.691 C27.7059052,10.722 27.5569052,10.828 27.3729052,10.963 L27.3729052,10.963 L27.3729052,10.934 C27.0119052,11.201 26.7929052,10.973 26.7169052,10.251 L26.7169052,10.251 L26.6309052,9.51 C26.6309052,9.494 26.6119052,9.477 26.5959052,9.477 L26.5959052,9.477 C26.5839052,9.477 26.5739052,9.485 26.5739052,9.51" id="Fill-7"></path>
                                    </g>
                                </g>
                            </svg>

                            <div class="flex justify-between">
                                <div>
                                    <p class="font-normal text-sm leading-5 space-x-1">
                                        <span class="text-rose font-black">Référence : </span>
                                        <span class="font-[Avenir]">{{ target_user.ref_cli }}</span>
                                    </p>
                                    <p class="font-normal text-sm leading-5 space-x-1">
                                        <span class="text-rose font-black">Profession : </span>
                                        <span class="font-[Avenir]">{{ target_user.prof_cli }}</span>
                                    </p>
                                    <p class="font-normal text-sm leading-5 space-x-1">
                                        <span class="text-rose font-black">Âge :</span >
                                        <span class="font-[Avenir]">{{ calculateAge(target_user.dateNaiss_cli) }} ans</span>
                                    </p>
                                </div>
                                
                                <div>
                                    <p class="font-normal text-sm leading-5 space-x-1">
                                        <span class="text-rose font-black">Taille :</span>
                                        <span class="font-[Avenir]">{{ target_user.taille_cli }} cm</span>
                                    </p>
                                    <p class="font-normal text-sm leading-5 space-x-1">
                                        <span class="text-rose font-black">État civil :</span>
                                        <span class="font-[Avenir]">
                                            {{ target_user.situation_cli.celib_cli ? 'Célibataire,' : '' }}
                                            {{ target_user.situation_cli.veuf_cli ? 'Veuf(ve),' : '' }}
                                            {{ target_user.situation_cli.div_cli ? 'Divorcé(e),' : '' }}
                                            {{ target_user.situation_cli.sep_cli ? 'Séparé(e)' : '' }}
                                        </span>
                                    </p>
                                    <p class="font-normal text-sm leading-5 space-x-1">
                                        <span class="text-rose font-black">Charges de famille :</span >
                                        <span class="font-[Avenir]">{{ target_user.chargeEnf_cli }} enfant(s) à charge </span>
                                    </p>
                                </div>
                            </div>

                            <div class="space-y-2 mt-4">
                                <p class="font-normal text-sm leading-5 space-x-1">
                                    <span class="text-rose font-black">Description/caractère : </span>
                                    <span class="font-[Avenir]">{{ target_user.desc_cli }}</span>
                                </p>

                                <p class="font-normal text-sm leading-5 space-x-1">
                                    <span class="text-rose font-black">Centres d'intérêt : </span>
                                    <span class="font-[Avenir]">{{ target_user.interets_cli }}</span>
                                </p>

                                <p class="font-normal text-sm leading-5 space-x-1">
                                    <span class="text-rose font-black">Remarques : </span>
                                    <span class="font-[Avenir]" v-if="target_user.rem_cli">{{ target_user.rem_cli }}</span>
                                    <span class="font-[Avenir]">..................................................................................................................................<br>........................................................................................................................................................</span>
                                </p>
                            </div>
                        </div>
                        <!-- #endregion -->

                        <!-- #region FOOTER -->
                        <div class="border-y border-bleu/20 mt-4 py-4">
                            <div class="font-[Avenir]" v-if="current_type !== 'renc'">
                                <div class="flex items-center gap-8">
                                    <span class="text-bleu text-sm font-semibold underline">Je souhaitre rencontrer cette personne* : </span>
                                    
                                    <span class="text-bleu text-sm font-semibold flex items-center gap-2">
                                        <span class="inline-block w-4 h-4 rounded-[5px] border border-rose"></span>
                                        <span class="leading-none">Oui</span>
                                    </span>
                                    
                                    <span class="text-bleu text-sm font-semibold flex items-center gap-2">
                                        <span class="inline-block w-4 h-4 rounded-[5px] border border-rose"></span>
                                        <span class="leading-none">Non</span>
                                    </span>
                                </div>

                                <div class="flex items-center justify-end gap-24 mt-6 pr-24">
                                    <span class="text-bleu text-sm font-semibold flex items-center gap-2">
                                        <span class="leading-none">Date*:</span>
                                    </span>
                                    
                                    <span class="text-bleu text-sm font-semibold flex items-center gap-2">
                                        <span class="leading-none">Signature*:</span>
                                    </span>
                                </div>

                                <div class="mt-4">
                                    <span class="text-bleu text-sm font-semibold flex items-center gap-2">
                                        <span class="leading-none">Pour information :</span>
                                    </span>

                                    <div class="mt-2" v-if="target_user.affAnn_cli === 'O'">
                                        <p class="text-xs" v-html="target_user.nroAnn_cli == '1' ? target_user.ann1_cli : target_user.ann2_cli"></p>
                                    </div>
                                </div>
                            </div>
                            <div class="font-[Avenir]" v-else>
                                <div class="grid grid-cols-6 gap-y-5">
                                    <span class="text-bleu text-sm font-semibold underline col-span-2">La rencontre a eu lieu* : </span>
                                    
                                    <div class="col-span-4 flex items-center gap-12">
                                        <span class="text-bleu text-sm font-semibold flex items-center gap-2">
                                            <span class="inline-block w-4 h-4 rounded-[5px] border border-rose"></span>
                                            <span class="leading-none">Oui</span>
                                        </span>
                                        
                                        <span class="text-bleu text-sm font-semibold flex items-center gap-2">
                                            <span class="inline-block w-4 h-4 rounded-[5px] border border-rose"></span>
                                            <span class="leading-none">Non</span>
                                        </span>
                                    </div>

                                    <span class="text-bleu text-sm font-semibold underline col-span-2">Cette rencontre se poursuit*  :</span>
                                    
                                    <div class="col-span-4 flex items-center gap-12">
                                        <span class="text-bleu text-sm font-semibold flex items-center gap-2">
                                            <span class="inline-block w-4 h-4 rounded-[5px] border border-rose"></span>
                                            <span class="leading-none">Oui</span>
                                        </span>
                                        
                                        <span class="text-bleu text-sm font-semibold flex items-center gap-2">
                                            <span class="inline-block w-4 h-4 rounded-[5px] border border-rose"></span>
                                            <span class="leading-none">Non</span>
                                        </span>
                                    </div>

                                    <span class="text-bleu text-sm font-semibold underline col-span-2">Je désire une autre rencontre*  :</span>
                                    
                                    <div class="col-span-4 flex items-center gap-12">
                                        <span class="text-bleu text-sm font-semibold flex items-center gap-2">
                                            <span class="inline-block w-4 h-4 rounded-[5px] border border-rose"></span>
                                            <span class="leading-none">Oui</span>
                                        </span>
                                        
                                        <span class="text-bleu text-sm font-semibold flex items-center gap-2">
                                            <span class="inline-block w-4 h-4 rounded-[5px] border border-rose"></span>
                                            <span class="leading-none">Non</span>
                                        </span>
                                    </div>
                                </div>

                                <p class="font-normal text-sm leading-5 space-x-1 mt-4">
                                    <span class="text-bleu text-sm font-semibold flex items-center gap-2">Commentaires : </span>
                                </p>

                                <div class="flex items-center justify-end gap-24 mt-6 pr-24">
                                    <span class="text-bleu text-sm font-semibold flex items-center gap-2">
                                        <span class="leading-none">Date*:</span>
                                    </span>
                                    
                                    <span class="text-bleu text-sm font-semibold flex items-center gap-2">
                                        <span class="leading-none">Signature*:</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <span class="font-[Avenir] text-xs mt-2">Une question sur ce profil ? Contactez-nous. N° Vert 0800 77 82 37 (appel gratuit depuis un poste fixe).</span>
                        <!-- #endregion -->
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- #endregion -->
    
    <!-- #region POPUP CHOIX AGENCE -->
    <TransitionRoot appear :show="isOpen" as="template">
        <Dialog as="div" @close="isOpen = false" class="relative z-50">
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
                                            <input v-model="hasAddress" id="has_address" name="has_address" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600" />
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
                                    Valider
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
        font-family: 'Baloo Bhai', sans-serif;
        
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