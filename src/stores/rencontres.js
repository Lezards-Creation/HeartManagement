import axios from 'axios'
import { ref } from 'vue';
import { defineStore, acceptHMRUpdate } from 'pinia';
import { useUserStore } from './user';

const instance = axios.create({
	baseURL: 'https://api.heartmanagement.fr/api/',
})

export const useRencontresStore = defineStore('rencontres-store', () => {    
	const userStore = useUserStore();
	
    const getRencontres = (id) => {
        return new Promise((resolve, reject) => {
			instance({
				url: `rencontre/${id}`,
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

	const updateRencontre = (payload) => {
		return new Promise((resolve, reject) => {
			instance({
				url: `rencontre/${payload.id_renc}/update`,
				method: 'POST',
				data: payload,
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

	const createRencontre = (payload) => {
		return new Promise((resolve, reject) => {
			instance({
				url: `rencontre/create`,
				method: 'POST',
				data: payload,
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

	return {
		// Variables
		// Functions
        getRencontres,
		updateRencontre,
		createRencontre
	}
}, { persistedState: { persist: true } })

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useRencontresStore, import.meta.hot));
}
