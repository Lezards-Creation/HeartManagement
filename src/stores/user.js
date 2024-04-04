import axios from 'axios'
import { ref } from 'vue';
import { defineStore, acceptHMRUpdate } from 'pinia';

const instance = axios.create({
	baseURL: 'http://127.0.0.1:8000/api/',
})

export const useUserStore = defineStore('user-store', () => {    
    const userLog = ref(null);
	
	const login = (logs) => {
        return new Promise((resolve, reject) => {
            let data = new FormData;
            data.append('login', logs.login);
            data.append('password', logs.password);

			instance({
				url: 'login',
				method: 'POST',
				data: data
			})
            .then(res => {
				userLog.value = res.data;
				resolve(res);
            })
            .catch(err => {
				reject(err.response.data.error);
            })
        }) 
    }
	
	
	return {
		// Variables
		userLog,
		// Functions
		login
	}
}, { persistedState: { persist: true } })

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot));
}
