import axios from 'axios'
import { ref } from 'vue';
import { defineStore, acceptHMRUpdate } from 'pinia';
import { useUserStore } from './user';

const instance = axios.create({
	baseURL: 'http://127.0.0.1:8000/api/',
})

export const useDocumentsStore = defineStore('documents-store', () => {    
	const userStore = useUserStore();
	
    const getDocuments = (id) => {
        return new Promise((resolve, reject) => {
			instance({
				url: `document/${id}`,
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
        getDocuments
	}
}, { persistedState: { persist: true } })

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useDocumentsStore, import.meta.hot));
}
