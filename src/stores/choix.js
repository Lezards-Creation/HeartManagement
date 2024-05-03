import axios from 'axios'
import { ref } from 'vue';
import { defineStore, acceptHMRUpdate } from 'pinia';
import { useUserStore } from './user';

const instance = axios.create({
	baseURL: 'https://api.heartmanagement.fr/api/',
})

export const useChoixStore = defineStore('choix-store', () => {    
	const userStore = useUserStore();
	
    const getChoices = (id) => {
        return new Promise((resolve, reject) => {
			instance({
				url: `choix/${id}`,
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

	const addChoice = (payload) => {
		return new Promise((resolve, reject) => {
			instance({
				url: `choix/create`,
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

	const updateChoice = (payload) => {
		return new Promise((resolve, reject) => {
			instance({
				url: `choix/${payload.id_choix}/update`,
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
        getChoices,
		addChoice,
		updateChoice
	}
}, { persistedState: { persist: true } })

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useChoixStore, import.meta.hot));
}
