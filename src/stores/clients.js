import axios from 'axios'
import { ref } from 'vue';
import { defineStore, acceptHMRUpdate } from 'pinia';

const instance = axios.create({
	baseURL: '',
})

export const useClientsStore = defineStore('clients-store', () => {    
	return {
		// Variables

		// Functions

    }
}, { persistedState: { persist: false } })

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useClientsStore, import.meta.hot));
}
