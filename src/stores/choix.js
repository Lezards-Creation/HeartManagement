import axios from 'axios'
import { ref } from 'vue';
import { defineStore, acceptHMRUpdate } from 'pinia';
import { useUserStore } from './user';

const instance = axios.create({
	baseURL: 'https://api.heartmanagement.fr/api/',
})

export const useChoixStore = defineStore('choix-store', () => {    
	const userStore = useUserStore();
	
    const getAllCommonChoices = (page, sort, filters) => {
		return new Promise((resolve, reject) => {
			instance({
				url: `choix/all/communs`,
				method: 'GET',
				headers: {
					Authorization: `Bearer ${userStore.userLog.token}`
				},
				params: {
					page: page,
					sort: sort,
					filters: filters,
					user_agences: userStore.userLog.agences
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

	const getAllChoices = (page, sort, filters) => {
		return new Promise((resolve, reject) => {
			instance({
				url: `choix/all/choix`,
				method: 'GET',
				headers: {
					Authorization: `Bearer ${userStore.userLog.token}`
				},
				params: {
					page: page,
					sort: sort,
					filters: filters,
					user_agences: userStore.userLog.agences
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
		getAllCommonChoices,
		getAllChoices,
        getChoices,
		addChoice,
		updateChoice
	}
}, { persistedState: { persist: true } })

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useChoixStore, import.meta.hot));
}
