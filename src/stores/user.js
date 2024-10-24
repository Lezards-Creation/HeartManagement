import axios from 'axios'
import { ref } from 'vue';
import { defineStore, acceptHMRUpdate } from 'pinia';

const instance = axios.create({
	baseURL: 'https://api.heartmanagement.fr/api/',
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
				console.log(err)
				reject(err.response.data.error);
            })
        }) 
    }

	const logout = () => {
		return new Promise((resolve) => {
			userLog.value = null;
			resolve();
		})
    }
	
	const checkToken = (id, token) => {
		return new Promise((resolve, reject) => {
			let data = new FormData;
			data.append('id_util', id);
			data.append('token', token);
			
			instance({
					url: 'checkToken',
					method: 'POST',
					data: data
				})
				.then(res => {
					resolve(res);
				})
				.catch(err => {
					reject(err);
			})
		}) 
	}

	return {
		// Variables
		userLog,
		// Functions
		login,
		checkToken,
		logout
	}
}, { persistedState: { persist: true } })

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot));
}
