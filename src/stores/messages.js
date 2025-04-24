import axios from 'axios'
import { ref } from 'vue';
import { defineStore, acceptHMRUpdate } from 'pinia';
import { useUserStore } from './user';

const instance = axios.create({
	baseURL: 'https://laravel.heartmanagement.fr/api/',
})

export const useMessageStore = defineStore('message-store', () => {    
	const userStore = useUserStore();
	
	const getMessages = () => {
		return new Promise((resolve, reject) => {
			instance({
				url: `messages`,
				method: 'GET',
				headers: {
					Authorization: `Bearer ${userStore.userLog.token}`
				},
			})
			.then(res => {
				resolve(res.data);
			})
			.catch(err => {
				reject(err);
			})
		})
		
	}

	const deleteMessage = (id) =>{
		return new Promise((resolve, reject) => {
			instance({
				url: `message/${id}`,
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${userStore.userLog.token}`
				},
			})
			.then(res => {
				resolve(res.data);
			})
			.catch(err => {
				reject(err);
			})
		})
	}

	const getMessagesCount = () => {
		return new Promise((resolve, reject) => {
			instance({
				url: `messages/count`,
				method: 'GET',
				headers: {
					Authorization: `Bearer ${userStore.userLog.token}`
				},
			})
			.then(res => {
				resolve(res.data);
			})
			.catch(err => {
				reject(err);
			})
		})
	}

	const updateMessageStatus = (type, id) => {
		return new Promise((resolve, reject) => {
			instance({
				url: `message/${id}`,
				method: 'POST',
				params: {
					status: type
				},
				headers: {
					Authorization: `Bearer ${userStore.userLog.token}`
				},
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
		getMessages,
		getMessagesCount,
		deleteMessage,
		updateMessageStatus
	}
}, { persistedState: { persist: true } })

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useMessageStore, import.meta.hot));
}
