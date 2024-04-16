import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Connexion from '../views/Connexion.vue'
import Clients from '../views/Clients.vue'
import Agence from '../views/Agence.vue'
import Rencontre from '../views/Rencontre.vue'
import Message from '../views/Message.vue'
import Matching from '../views/Matching.vue'
import Facture from '../views/Facture.vue'

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
			path: '/agence/:id',
			name: 'Agence',
			component: Agence,
			meta: {
				requiresAuth: true
			}
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
