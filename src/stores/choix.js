import axios from 'axios'
import { ref } from 'vue';
import { defineStore, acceptHMRUpdate } from 'pinia';
import { useUserStore } from './user';

const instance = axios.create({
	baseURL: 'http://127.0.0.1:8000/api/',
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
	return {
		// Variables
		// Functions
        getChoices
	}
}, { persistedState: { persist: true } })

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useChoixStore, import.meta.hot));
}
