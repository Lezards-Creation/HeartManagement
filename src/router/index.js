import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Connexion from '../views/Connexion.vue'
import Profils from '../views/Profil.vue'
import Profil from '../views/Client.vue'
import Agence from '../views/Agence.vue'
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
			path: '/profils',
			name: 'Profils',
			component: Profils,
			meta: {
				requiresAuth: true
			}
		},
		{
			path: '/profil/:id',
			name: 'Profil',
			component: Profil,
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
