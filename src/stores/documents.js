import axios from 'axios'
import { ref } from 'vue';
import { defineStore, acceptHMRUpdate } from 'pinia';
import { useUserStore } from './user';

const instance = axios.create({
	baseURL: 'https://api.heartmanagement.fr/api/',
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

	const deleteDocument = (docname, id) => {
		return new Promise((resolve, reject) => {
			instance({
				url: `document/${id}/delete`,
				method: 'POST',
				data: {
					filename: docname
				},
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

	const createDocument = (model, input) => {
		return new Promise((resolve, reject) => {
			const formData = new FormData();
			formData.append('data', JSON.stringify(input));

			instance({
				url: `pdf/${model}`,
				method: 'POST',
				headers: {
					"Content-Type": "multipart/form-data",
				},
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
		addDocuments,
		deleteDocument,
		createDocument
	}
}, { persistedState: { persist: true } })

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useDocumentsStore, import.meta.hot));
}
