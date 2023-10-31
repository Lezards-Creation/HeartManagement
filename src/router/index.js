import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Connexion from '../views/Connexion.vue'
import Profils from '../views/Profil.vue'
import Profil from '../views/Client.vue'
import { useUserStore } from '../stores/user'
const router = createRouter({
      history: createWebHistory(import.meta.env.BASE_URL),
      routes: [
            {
                  path: '/',
                  name: 'dashboard',
                  component: Dashboard,
			meta: {
				requiresAuth: true
			}
            },
            {
                  path: '/connexion',
                  name: 'Connexion',
                  component: Connexion,
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
      ],
})

router.beforeEach((to) => {
	const store = useUserStore();
	if (to.meta.requiresAuth && !store.isLogged) return '/connexion'
})

export default router
