import axios from 'axios'
import { ref } from 'vue';
import { defineStore, acceptHMRUpdate } from 'pinia';
import { useUserStore } from './user';

const instance = axios.create({
	baseURL: 'http://127.0.0.1:8000/api/',
})

export const useClientsStore = defineStore('clients-store', () => {    
	const userStore = useUserStore();
	const clients = ref(null);

	const getClients = (filter) => {
		return new Promise((resolve, reject) => {
			instance({
				url: 'clients',
				method: 'GET',
				params: {
					filter: filter
				}, 
				headers: {
                    Authorization: `Bearer ${userStore.userLog.token}`
                }
			})
            .then(res => {
				console.log(res.data);

				clients.value = res.data.clients.map(obj=> {
					return {...obj, situation_cli: JSON.parse(obj.situation_cli)};
				});
				
				const sortedUsers = [...clients.value].sort((a, b) => {
					return a.nom_cli.localeCompare(b.name);
				});
						
				const groupedUsers = sortedUsers.reduce((acc, user) => {
					if(user?.nom_cli){
						const lastName = user.nom_cli
							.split(' ')
							.pop()

						let lastNameInitial
						if(lastName !== ""){
							lastNameInitial = lastName[0]
							.toUpperCase();
						} else {
							user.nom_cli[0].toUpperCase();
						}


						if (!acc[lastNameInitial]) {
							acc[lastNameInitial] = [];
						}

						acc[lastNameInitial].push(user);
					}
					return acc;
				}, {});

				const sortedKeys = Object.keys(groupedUsers).sort();
				const sortedDirectory = {};
				sortedKeys.forEach(key => {
					sortedDirectory[key] = groupedUsers[key];
				});

				let data = {
					directory: sortedDirectory,
					clients_count: res.data.clients_count
				}

				resolve(data);
            })
            .catch(err => {
				reject(err);
            })
		})
	}

	return {
		// Variables
		clients,
		// Functions
		getClients
    }
}, { persistedState: { persist: false } })

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useClientsStore, import.meta.hot));
}
