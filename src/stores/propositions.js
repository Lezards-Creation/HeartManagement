import axios from 'axios'
import { ref } from 'vue';
import { defineStore, acceptHMRUpdate } from 'pinia';
import { useUserStore } from './user';

const instance = axios.create({
	baseURL: 'https://api.heartmanagement.fr/api/',
})

export const usePropositionsStore = defineStore('propositions-store', () => {    
	const userStore = useUserStore();
	
	const getAllPropositions = (page, sort) => {
        return new Promise((resolve, reject) => {
			instance({
				url: `propositions`,
				method: 'GET',
				headers: {
                    Authorization: `Bearer ${userStore.userLog.token}`
                },
				params: {
					page: page,
					sort: sort
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

    const getPropositions = (id) => {
        return new Promise((resolve, reject) => {
			instance({
				url: `proposition/${id}`,
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

	const addProposition = (payload) => {
		return new Promise((resolve, reject) => {
			instance({
				url: `proposition/create`,
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

	const updateProposition = (payload) => {
		return new Promise((resolve, reject) => {
			instance({
				url: `proposition/${payload.id_prop}/update`,
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
		getAllPropositions,
        getPropositions,
		addProposition,
		updateProposition
	}
}, { persistedState: { persist: true } })

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(usePropositionsStore, import.meta.hot));
}
