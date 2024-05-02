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

	const addDocuments = (files, id) => {
		return new Promise((resolve, reject) => {
			const formData = new FormData();
			console.log(files);
			if (files && files.length) {
				for (let i = 0; i < files.length; i++) {
					formData.append(`files_${i}`, files[i].file, files[i].file.name);
				}
			}

			instance({
				url: `document/${id}/add`,
				method: 'POST',
				data: formData,
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
        getDocuments,
		addDocuments
	}
}, { persistedState: { persist: true } })

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useDocumentsStore, import.meta.hot));
}
