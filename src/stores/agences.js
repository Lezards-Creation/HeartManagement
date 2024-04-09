import axios from 'axios'
import { ref } from 'vue';
import { defineStore, acceptHMRUpdate } from 'pinia';
import { useUserStore } from './user';

const instance = axios.create({
	baseURL: 'http://127.0.0.1:8000/api/',
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

	return {
		// Variables
		agences,
		// Functions
		getAgences,
        getAgence
    }
}, { persistedState: { persist: false } })

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useAgencesStore, import.meta.hot));
}
