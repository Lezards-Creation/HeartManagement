import axios from 'axios'
import { ref } from 'vue';
import { defineStore, acceptHMRUpdate } from 'pinia';
import { useUserStore } from './user';

const instance = axios.create({
	baseURL: 'https://laravel.heartmanagement.fr/api/',
})

export const useAgencesStore = defineStore('agences-store', () => {    
	const userStore = useUserStore();
	const agences = ref(null);

	const getAgences = () => {
		return new Promise((resolve, reject) => {
			instance({
				url: 'agences',
				method: 'GET',
				headers: {
                    Authorization: `Bearer ${userStore.userLog.token}`
                }
			})
            .then(res => {
				agences.value = res.data.agences;
				
				let data = {
                    agences: res.data.agences
				}
				resolve(data);
            })
            .catch(err => {
				reject(err);
            })
		})
	}

    const getAgence = (id) => {
        return new Promise((resolve, reject) => {
			instance({
				url: `agence/${id}`,
				method: 'GET',
				headers: {
                    Authorization: `Bearer ${userStore.userLog.token}`
                }
			})
            .then(res => {
				resolve(res.data);
            })
            .catch(err => {
				reject(err);
            })
		})
    }

	const addUserToAgence = (id_agence, id_util) => {
		return new Promise((resolve, reject) => {
			instance({
				url: `conseiller`,
				method: 'POST',
				data: {
					id_agence: id_agence,
					id_util: id_util
				},
				headers: {
                    Authorization: `Bearer ${userStore.userLog.token}`
                }
			})
            .then(res => {
				if(userStore.userLog.id_util === id_util){
					userStore.userLog.agences.push(id_agence)
				}
				resolve(res.data);
            })
            .catch(err => {
				reject(err);
            })
		})
	}

	const removeUserFromAgence = (id_agence, id_util) => {
		return new Promise((resolve, reject) => {
			instance({
				url: `conseiller`,
				method: 'DELETE',
				data: {
					id_agence: id_agence,
					id_util: id_util
				},
				headers: {
                    Authorization: `Bearer ${userStore.userLog.token}`
                }
			})
            .then(res => {
				if(userStore.userLog.id_util === id_util){
					const index = userStore.userLog.agences.indexOf(id_agence);
					const x = userStore.userLog.agences.splice(index, 1);
				}
				resolve(res.data);
            })
            .catch(err => {
				reject(err);
            })
		})
	}

	return {
		// Variables
		agences,
		addUserToAgence,
		removeUserFromAgence,
		// Functions
		getAgences,
        getAgence
    }
}, { persistedState: { persist: false } })

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useAgencesStore, import.meta.hot));
}
