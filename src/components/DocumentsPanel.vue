<script setup>
	import { computed, ref, onMounted, watch } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import { useDocumentsStore } from '../stores/documents'
    import { Menu, MenuButton, MenuItems, MenuItem,  TransitionRoot, TransitionChild, Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'
    import { ChevronDownIcon } from '@heroicons/vue/20/solid'
    import DropZone from './DropZone.vue';
    import FilesListPreview from './FilesListPreview.vue';
    import useFileList from '../compositions/file-list'
    import { useClientsStore } from '../stores/clients'
    import { useAgencesStore } from '../stores/agences'
    
    const uri = import.meta.env.VITE_URL;
    const props = defineProps(['client']);
    const { files, addFiles, removeFile } = useFileList()
    const clientsStore = useClientsStore();
    const isOpen = ref(false);
    const currentModel = ref({});
    const current_user = ref({});
    const current_agence = ref({});
    const current_responsable = ref({});
    const pdf_model = ref({})

    const documentsStore = useDocumentsStore();
    const agencesStore = useAgencesStore();

    const documents = ref([]); // Use ref to make documents reactive
    const documentsLoaded = ref(false);

    const map_politique = ref({
        0: 'Indeterminé',
        0: 'Sans',
        2: 'Extrême Gauche',
        3: 'Gauche',
        4: 'Centre',
        5: 'Droite',
        6: 'Extrême droite'
    })

    const map_revenus = ref({
        0: 'Modestes (- de 1500€)',
        1: 'Corrects (de 1500€ à 2000€)',
        2: 'Confortables (de 2000€ à 3000€)',
        3: 'Très confortables (de 3000€ à 5000€)',
        4: 'Elevés (5000€ et plus)'
    })

    const map_etude = ref({
        0: 'Indeterminé',
        1: 'Primaire',
        2: 'Secondaire',
        3: 'Bac à Bac+2',
        4: 'Back + 3 et plus'
    })

    const map_logement = ref({
        0: 'Indeterminé',
        1: 'Non',
        2: 'Oui (sans précision)',
        3: 'Location appartement',
        4: 'Location maison',
        5: 'Propriétaire appartement',
        6: 'Propriétaire maison',
        7: 'En famille',
        8: 'Autre'
    })

    const map_cheveux = ref({
        0: 'Indeterminé',
        1: 'Bruns',
        2: 'Blonds',
        3: 'Roux',
        4: 'Blancs',
        5: 'Chauve',
        6: 'Noirs',
        7: 'Châtains clairs',
        8: 'Châtains foncés',
        9: 'Gris',
        10: 'Poivre et sel',
        11: 'Auburn',
        12: 'Acajou',
        13: 'Mèches blondes',
        14: 'Mèches brunes',
        15: 'Autre'
    })

    const map_yeux = ref({
        0: 'Indeterminé',
        1: 'Bruns',
        2: 'Verts',
        3: 'Bleus',
        4: 'Noirs',
        5: 'Gris',
        6: 'Noisettes',
        7: 'Bleus/verts',
        8: 'Bleus/gris',
        9: 'Dominance bleue',
        10: 'Dominance verte',
        11: 'Dominance brune',
        12: 'Autres',
    })

    const map_desIns = ref({
        0: 'Indertéminé',
        1: 'Au moins primaire',
        2: 'Au moins secondaire',
        3: 'Au moins Bac à Bac +3',
        4: 'Bac + 3 et plus',
        5: 'Sans importance',
    })

    const map_desProf = ref({
        0: 'Indeterminé',
        1: 'Sans importance',
        2: 'En activité',
        3: 'Retraité'
    })

    const map_msRech_cli = ref({
        '_0': 'Bon',
        '_1': 'Moyen',
        '_2': 'Modeste',
        '_3': 'Autre'
    })
    
    const fetchDocuments = () => {
        handleGetClient(props.client)
        documentsLoaded.value = false
        documentsStore.getDocuments(props.client)
        .then(res => {
            documents.value = res.files;
            documentsLoaded.value = true;
        })
        .catch(err => {
            documentsLoaded.value = true;
            console.error(err);
        }) 
    }

    const uploadDocs = () => {
        documentsStore.addDocuments(files.value, props.client)
        .then(res => {
            files.value = [];
            fetchDocuments();
        })
        .catch(err => console.error(err))
    }

    const onInputChange = (e) => {
        addFiles(e.target.files)
        e.target.value = null
    }

    const deleteDoc = (name) => {
        documentsStore.deleteDocument(name, props.client)
        .then(res => {
            fetchDocuments();
        })
        .catch(err => console.error(err)) 
    }

    const openModal = (model) => {
        isOpen.value = true;
        currentModel.value = pdf_model.value[model];
    }

    const generatePDF = (model = null, input_list = null) => {
        if(model && input_list){
            currentModel.value.model = model;
            currentModel.value.input_list = {};
        }


        documentsStore.createDocument(currentModel.value.model, currentModel.value.input_list, props.client)
        .then(res => {
            if(res.url){
                window.open(res.url)
                isOpen.value = false;
                fetchDocuments();
            }
        })
        .catch(err => console.error(err))

        if(currentModel.value.model === 'contrat_de_credit'){
            let inputToFill = pdf_model.value.informations_europeenes_commun.input_list
            let refInput = currentModel.value.input_list;
            if(inputToFill){
                inputToFill.forEach(element => {
                    element.value = refInput.find(obj => obj.name === element.name).value              
                });
            }

            setTimeout(() => {
                documentsStore.createDocument('informations_europeenes_commun', inputToFill, props.client)
                .then(res => {
                    if(res.url){
                        window.open(res.url)
                    }
                })
                .catch(err => console.error(err))
            }, 1500)
            
        }   

    }

    const closeModal = () => {
        isOpen.value = false;
        currentModel.value = '';
    }

    const fetchAgence = (agence) => {
        return new Promise((resolve, reject) => {
            agencesStore.getAgence(agence)
            .then(res => {
                current_agence.value = res.agence;
                console.log(res);
                current_responsable.value = res.responsable
                resolve();
            })
        })
    }

    const calculateAge = (dateString) => {
		let today = new Date()
		let birthDate = new Date(dateString)
		let age = today.getFullYear() - birthDate.getFullYear()
		let monthDifference = today.getMonth() - birthDate.getMonth()
		if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
			age--
		}
		return age
	}

    const handleGetClient = (client) => {
		clientsStore.getClient(client)
		.then(res => {
			current_user.value = res.client
			let age = res.client.desAge_cli.split('-');
            pdf_model.value = {
                portrait: {
                    model: 'portrait',
                    input_list: [
                        {
                            label: 'Nom / Prénom',
                            name: 'nom_prenom',
                            type: 'text',
                            value: current_user.value.nom_cli + ' ' + current_user.value.pNoms_cli,
                        },
                        {
                            label: 'Référence',
                            name: 'ref',
                            type: 'text',
                            value: current_user.value.ref_cli,
                        },
                        {
                            label: 'Age',
                            name: 'age',
                            type: 'text',
                            value: calculateAge(current_user.value.dateNaiss_cli),
                        },
                        {
                            label: 'Né(e) le',
                            name: 'naissance',
                            type: 'date',
                            value: current_user.value.dateNaiss_cli,
                        },
                        {
                            label: 'Nationalité',
                            name: 'nationalite',
                            type: 'text',
                            value: current_user.value.nat_cli,
                        },
                        {
                            label: 'CVDS',
                            name: 'cvds',
                            type: 'text',
                            value: '',
                        },
                        {
                            label: 'Fumeur',
                            name: 'fumeur',
                            type: 'checkbox',
                            value: current_user.value.fum_cli === 1 ? true : false,
                        },
                        {
                            label: 'Enfants',
                            name: 'enfants',
                            type: 'number',
                            value: current_user.value.nbEnf_cli,
                        },
                        {
                            label: 'F(âges)',
                            name: 'f_ages',
                            type: 'text',
                            value: '',
                        },
                        {
                            label: 'G(âges)',
                            name: 'g_ages',
                            type: 'text',
                            value: '',
                        },
                        {
                            label: 'À charge',
                            name: 'a_charge',
                            type: 'checkbox',
                            value: current_user.value.chargeEnf > 0 ? true : false,
                        },
                        {
                            label: 'Tendances politiques',
                            name: 'tendances',
                            type: 'text',
                            value: map_politique.value[current_user.value.pol_cli],
                        },
                        {
                            label: 'Religion',
                            name: 'religion',
                            type: 'text',
                            value: current_user.value.reli_cli,
                        },
                        {
                            label: 'Code',
                            name: 'code',
                            type: 'text',
                            value: current_user.value.code_cli,
                        },
                        {
                            label: 'Profession',
                            name: 'profession',
                            type: 'text',
                            value: current_user.value.prof_cli,
                        },
                        {
                            label: 'Revenus',
                            name: 'revenus',
                            type: 'text',
                            value: map_revenus.value[current_user.value.tranche_cli],
                        },
                        {
                            label: 'Horaires',
                            name: 'horaires',
                            type: 'text',
                            value: current_user.value.hor_cli,
                        },
                        {
                            label: 'Instruction',
                            name: 'instruction',
                            type: 'text',
                            value: map_etude.value[current_user.value.etude_cli],
                        },
                        {
                            label: 'Voiture',
                            name: 'voiture',
                            type: 'text',
                            value: current_user.value.veh_cli == 'O' ? 'Oui' : 'Non',
                        },
                        {
                            label: 'Permis',
                            name: 'permis',
                            type: 'text',
                            value: current_user.value.permis_cli == 'O' ? 'Oui' : 'Non',
                        },
                        {
                            label: 'Logement',
                            name: 'logement',
                            type: 'text',
                            value: map_logement.value[current_user.value.loge_cli],
                        },
                        {
                            label: 'Taille',
                            name: 'taille',
                            type: 'text',
                            value: current_user.value.taille_cli,
                        },
                        {
                            label: 'Poids',
                            name: 'poids',
                            type: 'text',
                            value: current_user.value.poid_cli,
                        },
                        {
                            label: 'Cheveux',
                            name: 'cheveux',
                            type: 'text',
                            value: map_cheveux.value[current_user.value.cheveux_cli],
                        },
                        {
                            label: 'Yeux',
                            name: 'yeux',
                            type: 'text',
                            value: map_yeux.value[current_user.value.yeux_cli],
                        },
                        {
                            label: 'Santé',
                            name: 'sante',
                            type: 'text',
                            value: current_user.value.sante_cli,
                        },
                        {
                            label: 'Lunettes',
                            name: 'lunettes',
                            type: 'text',
                            value: current_user.value.lun_cli ? 'Oui' : 'Non',
                        },
                        {
                            label: 'Caractère',
                            name: 'caractere',
                            type: 'textarea',
                            value: current_user.value.desc_cli,
                            max: 320,
                        },
                        {
                            label: 'Goûts / loisirs',
                            name: 'gouts',
                            type: 'textarea',
                            value: current_user.value.interets_cli,
                            max: 355,
                        },
                        {
                            label: 'Milieu d\'éducation',
                            name: 'education',
                            type: 'textarea',
                            value: current_user.value.milieu_cli,
                            max: 140
                        },
                        {
                            type: 'title',
                            label: 'Profil recherché'
                        },
                        {
                            label: 'Age de',
                            name: 'age_1',
                            type: 'text',
                            value: current_user.value.desAge_cli.split('-')[0],
                        },
                        {
                            label: 'à',
                            name: 'age_2',
                            type: 'text',
                            value: current_user.value.desAge_cli.split('-')[1],
                        },
                        {
                            label: 'Célibataire',
                            name: 'celibataire',
                            type: 'text',
                            value: current_user.value.desCelib_cli ? 'Oui' : 'Non',
                        },
                        {
                            label: 'Veuf(ve)',
                            name: 'veuf',
                            type: 'text',
                            value: current_user.value.desVeuf_cli ? 'Oui' : 'Non',
                        },
                        {
                            label: 'Divorcé(e)',
                            name: 'divorce',
                            type: 'text',
                            value: current_user.value.desDiv_cli ? 'Oui' : 'Non',
                        },
                        {
                            label: 'Séparé(e)',
                            name: 'separe',
                            type: 'text',
                            value: current_user.value.desSep_cli ? 'Oui' : 'Non',
                        },
                        {
                            label: 'Avec enfants',
                            name: 'avec_enfants',
                            type: 'text',
                            value: current_user.value.desNbEn_cli > 2 ? 'Oui' : 'Non',
                        },
                        {
                            label: 'À charge',
                            name: 'a_charge_2',
                            type: 'text',
                            value: '',
                        },
                        {
                            label: 'Allure et physique',
                            name: 'allure',
                            type: 'textarea',
                            value: current_user.value.desPhy_cli,
                            max: 220,
                        },
                        {
                            label: 'Caractère',
                            name: 'caractere_2',
                            type: 'textarea',
                            value: current_user.value.desCaract_cli,
                            max: 330
                        },
                        {
                            label: 'Degré d\'instruction',
                            name: 'instruction_2',
                            type: 'text',
                            value: map_desIns.value[current_user.value.desInst_cli],
                        },
                        {
                            label: 'Profession',
                            name: 'profession_2',
                            type: 'text',
                            value: map_desProf.value[current_user.value.desProf_cli],
                        },
                        {
                            label: 'Milieu social',
                            name: 'milieu_social',
                            type: 'text',
                            value: map_msRech_cli.value[current_user.value.msRech_cli],
                        },
                        {
                            label: 'Caractéristiques indispensables à toute rencontre',
                            name: 'indispensables',
                            type: 'text',
                            value: current_user.value.desCarctIndisp_cli,
                        },
                    ],
                    format: 'L'
                },
                additif_vip: {
                    input_list: {
                    },
                    format: 'P'
                },
                contrat_adhesion: {
                    model: 'contrat_adhesion',
                    input_list: [
                        {
                            label: 'En-tête',
                            name: 'more',
                            type: 'text',
                            value: '',
                        },
                        {
                            label: 'N° de contrat',
                            name: 'numero_contrat',
                            type: 'text',
                            value: current_user.value.ref_cli,
                        },
                        {
                            label: 'Nom',
                            name: 'nom',
                            type: 'text',
                            value: current_user.value.nom_cli,
                        },
                        {
                            label: 'Prénom',
                            name: 'prenom',
                            type: 'text',
                            value: current_user.value.pNoms_cli,
                        },
                        {
                            label: 'Adresse',
                            name: 'adresse',
                            type: 'text',
                            value: current_user.value.adr_cli + ', ' + current_user.value.ville_cli + ' ' + current_user.value.cp_cli,
                        },
                        {
                            label: 'Date et lieu de naissance',
                            name: 'date_naissance',
                            type: 'text',
                            value: current_user.value.dateNaiss_cli,
                        },
                        {
                            label: 'Pièce d\'identité n°',
                            name: 'piece_identite',
                            type: 'text',
                            value: '',
                        },
                        {
                            label: 'Employeur',
                            name: 'employeur',
                            type: 'text',
                            value: '',
                        },
                        {
                            label: 'Durée',
                            name: 'duree',
                            type: 'text',
                            value: current_user.value.duree_cli,
                        },
                        {
                            label: 'euros TTC',
                            name: 'ttc',
                            type: 'text',
                            value: '',
                        },
                        {
                            label: 'euros Hors TVA',
                            name: 'hors_tva',
                            type: 'text',
                            value: '',
                        },
                        {
                            label: 'euros TVA à 20%',
                            name: 'tva',
                            type: 'text',
                            value: '',
                        },
                        {
                            label: 'Mode de règlement',
                            name: 'mode_de_reglement',
                            type: 'text',
                            value: '',
                        },
                        {
                            label: 'Date de paiement',
                            name: 'date_de_paiement',
                            type: 'text',
                            value: '',
                        },
                        {
                            label: 'Tranche Age minimum',
                            name: 'age_min',
                            type: 'number',
                            value: age[0],
                        },
                        {
                            label: 'Tranche Age maximum',
                            name: 'age_max',
                            type: 'number',
                            value: age[1],
                        },
                        {
                            label: 'Degré d\'instruction',
                            name: 'degre_instruction',
                            type: 'text',
                            value: current_user.value.desInst_cli === 0 ? 
                                'Indéterminé' : current_user.value.desInst_cli === 1 ? 
                                'Au moins primaire' : current_user.value.desInst_cli === 2 ? 
                                'Au moins secondaire' : current_user.value.desInst_cli === 3 ? 
                                'Au moins Bac à Bac +3' : current_user.value.desInst_cli === 4 ? 
                                'Bac +3 et plus' : 'Sans importance',
                        },
                        {
                            label: 'Région',
                            name: 'region',
                            type: 'text',
                            value: current_user.value.desReg_cli === 0 ? 'Non' : 'Oui',
                        },
                        {
                            label: 'Caractéristique indispensable',
                            name: 'caracteristique',
                            type: 'text',
                            value: current_user.value.desCarctIndisp_cli,
                        },
                        {
                            label: 'Allure et physique',
                            name: 'allure',
                            type: 'textarea',
                            value: current_user.value.desPhy_cli,
                            max: 185
                        },
                        {
                            label: 'Caractère',
                            name: 'caractere',
                            type: 'textarea',
                            value: current_user.value.desCaract_cli,
                            max: 310
                        },
                    ]
                },
                contrat_de_credit: {
                    model: 'contrat_de_credit',
                    input_list: [
                        {
                            label: 'Nom emprunteur',
                            name: 'nom_emprunteur',
                            type: 'text',
                            value: current_user.value.nom_cli,
                        },
                        {
                            label: 'Prénom emprunteur',
                            name: 'prenom_emprunteur',
                            type: 'text',
                            value: current_user.value.pNoms_cli,
                        },
                        {
                            label: 'Nom de jeune fille',
                            name: 'nom_jeune_fille',
                            type: 'text',
                            value: '',
                        },
                        {
                            label: 'Né(e) le',
                            name: 'date_naissance',
                            type: 'date',
                            value: current_user.value.dateNaiss_cli,
                        },
                        {
                            label: 'Lieux de naissance',
                            name: 'lieu_naissance',
                            type: 'text',
                            value: '',
                        },
                        {
                            label: 'Département de naissance',
                            name: 'departement_naissance',
                            type: 'text',
                            value: '',
                        },
                        {
                            label: 'Nom Co-emprunteur',
                            name: 'nom_co-emprunteur',
                            type: 'text',
                            value: '',
                        },
                        {
                            label: 'Prénom Co-emprunteur',
                            name: 'prenom_co-emprunteur',
                            type: 'text',
                            value: '',
                        },
                        {
                            label: 'Nom de jeune fille (Co-emprunteur)',
                            name: 'nom_jeune_fille_co',
                            type: 'text',
                            value: '',
                        },
                        {
                            label: 'Né(e) le (Co-emprunteur)',
                            name: 'date_naissance_co',
                            type: 'date',
                            value: '',
                        },
                        {
                            label: 'Lieux de naissance (Co-emprunteur)',
                            name: 'lieu_naissance_co',
                            type: 'text',
                            value: '',
                        },
                        {
                            label: 'Département de naissance (Co-emprunteur)',
                            name: 'departement_naissance_co',
                            type: 'text',
                            value: '',
                        },
                        {
                            label: 'N° de dossier',
                            name: 'ref_cli',
                            type: 'text',
                            value: current_user.value.ref_cli,
                        },
                        {
                            label: 'Montant du crédit',
                            name: 'total_credit',
                            type: 'text',
                            value: '',
                        },
                        {
                            label: 'Total du contrat',
                            name: 'total_contrat',
                            type: 'text',
                            value: '',
                        },
                        {
                            label: 'Durée du contrat',
                            name: 'duree_cli',
                            type: 'number',
                            value: current_user.value.duree_cli,
                        },
                        {
                            label: 'Nombre de mensualité',
                            name: 'mensualite',
                            type: 'number',
                            value: current_user.value.duree_cli,
                        },
                        {
                            label: 'Coût de la mensualité',
                            name: 'prix_mensualite',
                            type: 'text',
                            value: '',
                        },
                        {
                            label: 'Date du prélevement',
                            name: 'prelevement',
                            type: 'text',
                            value: '',
                        },
                        {
                            label: 'Taux de débiteur fixe',
                            name: 'taux_debiteur',
                            type: 'text',
                            value: '',
                        },
                        {
                            label: 'TAEG',
                            name: 'taeg',
                            type: 'text',
                            value: '',
                        },
                        {
                            label: 'Montant total',
                            name: 'montant_total',
                            type: 'text',
                            value: '',
                        },
                        {
                            label: 'Domiciliation bancaire',
                            name: 'domiciliation_bancaire',
                            type: 'text',
                            value: '',
                        },
                    ]
                },
                informations_europeenes_commun: {
                    model: 'informations_europeenes_commun',
                    input_list: [
                        {
                            label: 'Montant total',
                            name: 'montant_total',
                            type: 'text',
                            value: '',
                        },
                        {
                            label: 'Durée du contrat',
                            name: 'duree_cli',
                            type: 'number',
                            value: current_user.value.duree_cli,
                        },
                        {
                            label: 'Nombre de mensualité',
                            name: 'mensualite',
                            type: 'number',
                            value: current_user.value.duree_cli,
                        },
                        {
                            label: 'Coût de la mensualité',
                            name: 'prix_mensualite',
                            type: 'text',
                            value: '',
                        },
                        {
                            label: 'Total crédit',
                            name: 'total_credit',
                            type: 'text',
                            value: '',
                        },
                        {
                            label: 'Taux de débiteur fixe',
                            name: 'taux_debiteur',
                            type: 'text',
                            value: '',
                        },
                        {
                            label: 'TAEG',
                            name: 'taeg',
                            type: 'text',
                            value: '',
                        },
                    ]
                },
            }

            if(res.client.idAgence_cli){
                fetchAgence(res.client.idAgence_cli)
                .then(res => {
                    pdf_model.value.informations_prealable_conso = {
                        model: 'informations_prealable_conso',
                        input_list: [
                            {
                                label: 'Directeur',
                                name: 'directeur',
                                type: 'text',
                                value: current_responsable.value.prenom + ' ' + current_responsable.value.nom,
                            },
                            {
                                label: 'Adresse',
                                name: 'adresse',
                                type: 'text',
                                value: current_agence.value.adr_agence,
                            },
                            {
                                label: 'Code postal',
                                name: 'zipcode',
                                type: 'text',
                                value: current_agence.value.cp_agence,
                            },
                            {
                                label: 'Ville',
                                name: 'ville',
                                type: 'text',
                                value: current_agence.value.lib_agence,
                            },
                            {
                                label: 'Téléphone',
                                name: 'telephone',
                                type: 'text',
                                value: current_agence.value.tel_agence,
                            },
                            {
                                label: 'SIRET',
                                name: 'siret',
                                type: 'text',
                                value: current_agence.value.siren_agence,
                            },
                            {
                                label: 'APE',
                                name: 'ape',
                                type: 'text',
                                value: '',
                            },
                        ]
                    }

                    pdf_model.value.additif_vip = {
                        model: 'additif_vip',
                        input_list: [
                            {
                                label: 'Adresse de l\'agence',
                                name: 'adresse_agence',
                                type: 'text',
                                value: current_agence.value.adr_agence + ' ' + current_agence.value.cp_agence + ' ' + current_agence.value.lib_agence,
                            },
                            {
                                label: 'Télephone',
                                name: 'telephone_agence',
                                type: 'text',
                                value: 'Tél. ' + current_agence.value.tel_agence,
                            },
                            {
                                label: 'Email',
                                name: 'email_agence',
                                type: 'text',
                                value: current_agence.value.mail_agence,
                            },
                            {
                                label: 'SIRET',
                                name: 'siret',
                                type: 'text',
                                value: 'SIREN: ' + current_agence.value.siren_agence,
                            }
                        ],
                    }
                })
                .catch(err => {
                    console.log(err)
                })
            }
		})
	}

    watch(() => props.client, fetchDocuments, {immediate: true})
</script>

<template>
    <div class="overflow-hidden">
        <ul v-if="documents.length > 0" role="list" class="divide-y divide-gray-200">
            <li v-for="document in documents"
                class="flex items-cente flex-wrap justify-between gap-x-6 py-5">
                <div class="min-w-0">
                    <div class="flex items-start gap-x-3">
                        <p class="text-sm font-semibold leading-6 text-gray-900">{{ document.name }}</p>
                    </div>
                    <div class="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500">
                        <p class="whitespace-nowrap">
                            Taille
                        </p>
                        <svg viewBox="0 0 2 2" class="h-0.5 w-0.5 fill-current">
                            <circle cx="1" cy="1" r="1" />
                        </svg>
                        <p class="truncate">{{ (document.size / 1048576).toFixed(2)}} Mo</p>
                    </div>
                </div>
                <div class="flex flex-none items-center gap-x-4 lg:mt-0 mt-5">
                    <a :download="`${document.name}`" :href="`${uri}/storage/documents/${client}/${document.name}`" class="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:block">Télécharger</a>
                    <a target="_blank" :href="`${uri}/storage/documents/${client}/${document.name}`" class="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:block">Visionner</a>
                    <a @click="deleteDoc(document.name)" class="hidden rounded-md bg-rose px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rose-600 sm:block">Supprimer</a>
                </div>
            </li>
        </ul>
        
        <div v-else-if="documentsLoaded">
            <p class="text-gray-400 text-2xl text-center py-4">Aucun documents...</p>
        </div>
        <ul v-else>
            <SkeletonRow />
        </ul>

        <DropZone class="drop-area" @files-dropped="addFiles" #default="{ dropZoneActive }">
            <div v-show="!files.length" :class="[dropZoneActive ? 'border-solid border-rose' : 'border-dashed','mt-2 flex justify-center rounded-lg border border-gray-900/25 px-6 py-10']">
                <div class="text-center">
                    <PhotoIcon class="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
                    <div class="mt-4 flex text-sm leading-6 text-gray-600">
                        <label for="file-upload" class="relative cursor-pointer rounded-md bg-white font-semibold text-rose-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-rose-600 focus-within:ring-offset-2 hover:text-rose-500">
                            <span>Téléverser un document</span>
                            <input id="file-upload" @change="onInputChange" name="file-upload" type="file" class="sr-only" />
                        </label>
                        <p class="pl-1">ou glisser, déposer</p>
                    </div>
                    <p class="text-xs leading-5 text-gray-600">PDF, PNG, JPG, DOCX, jusqu'à 10 Mo...</p>
                </div>
            </div>

            <ul v-show="files.length">
                <FilesListPreview v-for="file of files" :key="file.id" :file="file" tag="li" @remove="removeFile" />
            </ul>
        </DropZone>
        <div v-if="files.length" class="mt-5 gap-x-2 flex items-center justify-center mb-10">
            <button type="button" class="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Annuler</button>
            <button @click="uploadDocs" type="button" class="rounded-md bg-rose px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm">Valider</button>
        </div>
    </div>

    <Menu as="div" class="relative inline-block text-left mt-10">
        <div>
            <MenuButton class="inline-flex w-full justify-center rounded-md bg-rose px-4 py-2 text-sm font-medium text-white hover:bg-rose/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75">
                Générer un document
                <ChevronDownIcon class="-mr-1 ml-2 h-5 w-5 text-violet-200 hover:text-violet-100" aria-hidden="true" />
            </MenuButton>
        </div>

        <transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
            <MenuItems class="absolute left-0 bottom-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                <div class="px-1 py-1">
                    <MenuItem v-slot="{ active }">
                        <button @click="openModal('additif_vip')" type="button" :class="[ active ? 'bg-rose-500 text-white' : 'text-gray-900', 'group flex w-full items-center rounded-md px-2 py-2 text-sm']">
                            Additif VIP
                        </button>
                    </MenuItem>
                    <MenuItem v-slot="{ active }">
                        <button @click="openModal('contrat_adhesion')" type="button" :class="[active ? 'bg-rose-500 text-white' : 'text-gray-900','group flex w-full items-center rounded-md px-2 py-2 text-sm',]">
                            Contrat d'adhésion
                        </button>
                    </MenuItem>
                    <MenuItem v-slot="{ active }">
                        <button  @click="openModal('contrat_de_credit')" type="button" :class="[active ? 'bg-rose-500 text-white' : 'text-gray-900','group flex w-full items-center rounded-md px-2 py-2 text-sm',]">
                            Contrat de crédit
                        </button>
                    </MenuItem>
                    <MenuItem v-slot="{ active }">
                        <button @click="openModal('informations_europeenes_commun')" type="button" :class="[active ? 'bg-rose-500 text-white' : 'text-gray-900','group flex w-full items-center text-left rounded-md px-2 py-2 text-sm',]">
                            Information précontractuelles Européene
                        </button>
                    </MenuItem>
                    <MenuItem v-slot="{ active }">
                        <button type="button" @click="generatePDF('pre-requis_adherents', {})" :class="[active ? 'bg-rose-500 text-white' : 'text-gray-900','group flex w-full items-center rounded-md px-2 py-2 text-sm',]">
                            Pré-requis adhérent
                        </button>
                    </MenuItem>
                    <MenuItem v-slot="{ active }">
                        <button @click="openModal('informations_prealable_conso')" type="button" :class="[active ? 'bg-rose-500 text-white' : 'text-gray-900','group flex w-full items-center text-left rounded-md px-2 py-2 text-sm',]">
                            Information préalable du consommateur
                        </button>
                    </MenuItem>
                    <MenuItem v-slot="{ active }">
                        <button @click="openModal('portrait')" type="button" :class="[active ? 'bg-rose-500 text-white' : 'text-gray-900','group flex w-full items-center text-left rounded-md px-2 py-2 text-sm',]">
                            Portrait à compléter
                        </button>
                    </MenuItem>
                </div>
            </MenuItems>
        </transition>
    </Menu>

    <TransitionRoot appear :show="isOpen" as="template">
        <Dialog as="div" @close="closeModal" class="relative z-[999999]">
        <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
            <div class="fixed inset-0 bg-black/25" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
            <div class="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
                <DialogPanel class="w-full max-w-[85vw] transform overflow-hidden rounded-md bg-white sm:p-12 p-5 text-left align-middle shadow-xl transition-all">
                <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
                    Génération d'un document
                    <p class="text-sm text-gray-500">Veuillez remplir le formulaire afin de renseigner les informations nécessaires pour la génération du document téléchargeable.</p>
                </DialogTitle>

                <form @submit.prevent="generatePDF" class="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-12 items-end" action="">
                    <div v-for="input in currentModel.input_list" :class="[input.type === 'textarea' ? 'sm:col-span-6' : input.type === 'title' ? 'col-span-full' : 'sm:col-span-3', 'col-span-full']">
                        <div v-if="input.type === 'textarea'">    
                            <label :for="input.name" class="block text-sm/6 font-medium text-gray-900">{{ input.label }}</label>
                            <div class="mt-2">
                                <textarea v-model="input.value" rows="2" :maxlength="input.max" :name="input.name" :id="input.name" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose sm:text-sm/6"></textarea>
                            </div>
                        </div>

                        <div v-if="input.type === 'checkbox'" class="relative flex gap-x-3">
                            <div class="flex h-6 items-center">
                                <input v-model="input.value" :id="input.name" :name="input.name" type="checkbox" class="size-4 rounded border-gray-300 text-rose focus:ring-rose">
                            </div>
                            <div class="text-sm/6">
                                <label :for="input.name" class="font-medium text-gray-900">{{input.label}}</label>
                            </div>
                        </div>

                        <h2 v-if="input.type === 'title'" class="text-base/7 font-semibold text-gray-900 border-b border-gray-900/10 sm:pb-2 mt-4">{{ input.label }}</h2>

                        <div v-if="input.type === 'text' || input.type === 'number' || input.type === 'email' || input.type === 'date'">
                            <label :for="input.name" class="block text-sm/6 font-medium text-gray-900">{{ input.label }}</label>
                            <div class="mt-2">
                                <input v-model="input.value" :type="input.type" :name="input.name" :id="input.name" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose sm:text-sm/6">
                            </div>
                        </div>
                    </div>
                    <div class="mt-4 space-x-2 col-span-full">
                        <button @click="closeModal" type="button" class="inline-flex justify-center rounded-md border border-transparent bg-rose px-4 py-2 text-sm font-medium text-white hover:bg-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2" >
                            Annuler
                        </button>
                        <button type="submit" class="inline-flex justify-center rounded-md border border-transparent bg-rose px-4 py-2 text-sm font-medium text-white hover:bg-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2" >
                            Générer le document
                        </button>
                    </div>
                </form>
                </DialogPanel>
            </TransitionChild>
            </div>
        </div>
        </Dialog>
    </TransitionRoot>
</template>