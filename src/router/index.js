import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Connexion from '../views/Connexion.vue'
import Clients from '../views/Clients.vue'
import Client from '../views/Client.vue'
import Creation from '../views/CreationFiche.vue'
import Agences from '../views/Agences.vue'
import Agence from '../views/Agence.vue'
import Rencontre from '../views/Rencontre.vue'
import Message from '../views/Message.vue'
import Matching from '../views/Matching.vue'
import Leads from '../views/Leads.vue'
import Reglages from '../views/Reglages.vue'
import Facture from '../views/Facture.vue'
import PageNotFound from '../views/404.vue'


import { useUserStore } from '../stores/user'
const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'Dashboard',
			component: Dashboard,
			meta: {
				requiresAuth: true
			}
		},
		{
			path: '/connexion',
			name: 'Connexion',
			component: Connexion,
			meta: {
				requiresAuth: false
			}
		},
		{
			path: '/clients',
			name: 'Clients',
			component: Clients,
			children: [
				{ path: 'fiche/:id', name: 'Client', component: Client},
				{ path: 'fiche/creation', name: 'Creation', component: Creation}
			],
			meta: {
				requiresAuth: true
			}
		},
		{
			path: '/factures',
			name: 'Factures',
			component: Facture,
			meta: {
				requiresAuth: true
			}
		},
		{
			path: '/matchings',
			name: 'Matchings',
			component: Matching,
			meta: {
				requiresAuth: true
			}
		},
		{
			path: '/rencontres',
			name: 'Rencontres',
			component: Rencontre,
			meta: {
				requiresAuth: true
			}
		},
		{
			path: '/messages',
			name: 'Messages',
			component: Message,
			meta: {
				requiresAuth: true
			}
		},
		{
			path: '/agences/',
			name: 'Agences',
			component: Agences,
			meta: {
				requiresAuth: true
			}
		},
		{
			path: '/leads/',
			name: 'Leads',
			component: Leads,
			meta: {
				requiresAuth: true
			}
		},
		{
			path: '/reglages/',
			name: 'Reglages',
			component: Reglages,
			meta: {
				requiresAuth: true
			}
		},
		{
			path: '/agence/:id',
			name: 'Agence',
			component: Agence,
			meta: {
				requiresAuth: true
			}
		},
		{ 
			path: '/:pathMatch(.*)*', 
			name: 'NotFound',
			component: PageNotFound 
		},
	],
})

router.beforeEach((to) => {
	const store = useUserStore();
	if (to.meta.requiresAuth && !store.userLog?.token){
		return {
			name: 'Connexion'
		};
	}
})

export default router
