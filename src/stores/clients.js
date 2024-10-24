import axios from 'axios'
import { ref } from 'vue';
import { defineStore, acceptHMRUpdate } from 'pinia';
import { useUserStore } from './user';

const instance = axios.create({
	baseURL: 'https://api.heartmanagement.fr/api/',
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

	const getClient = (id) => {
		return new Promise((resolve, reject) => {
			instance({
				url: `clients/${id}`,
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

	const createClient = (payload, files) => {
		return new Promise((resolve, reject) => {
			// Create a FormData instance
			const formData = new FormData();

			// Append payload as a JSON string (if it needs to be sent as JSON)
			formData.append('data', JSON.stringify(payload));
			
			if (files && files.length) {
				formData.append('photo', files[0].file, files[0].file.name);
			}


			instance({
				url: 'clients/create',
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
				clients.value = [...clients.value, res.data.client]				
				resolve(res.data);
            })
            .catch(err => {
				reject(err);
            })
		})
	}

	const updateClient = (payload, files) => {
		return new Promise((resolve, reject) => {
			const formData = new FormData();
			// Append payload as a JSON string (if it needs to be sent as JSON)
			formData.append('data', JSON.stringify(payload));
			
			if (files && files.length) {
				formData.append('photo', files[0].file, files[0].file.name);
			}

			instance({
				url: `clients/${payload.id_cli}/update`,
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

	const getClientImage = (id) => {
		return new Promise((resolve, reject) => {
			instance({
				url: `image/${id}`,
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

	const sendMail = (email, attachment) => {
		return new Promise((resolve, reject) => {
			instance({
				url: 'send-portrait',
				method: 'POST', 
				data: {
					email: email,
					subject: attachment.subject,
					attachment: attachment.base64,
					attachment_name: attachment.filename
				},
				headers: {
                    Authorization: `Bearer ${userStore.userLog.token}`
                }
			})
			.then(res => {
				resolve(res.data)
			})
			.catch(err => {
				reject(err);
			})
		})
	}

	const getMatch = (id, filters) => {
		return new Promise((resolve, reject) => {
			instance({
				url: `clients/${id}/match`,
				method: 'GET', 
				params: {
					filters: filters
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

	const getLastClients = () => {
		return new Promise((resolve, reject) => {
			instance({
				url: `clients/last/newclients`,
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

	const searchClient = (query, sexe) => {
		return new Promise((resolve, reject) => {
			instance({
				url: `clients/search/${query}`,
				method: 'GET', 
				params: {
					sexe: sexe
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

	const getClientByRef = (ref) => {
		return new Promise((resolve, reject) => {
			instance({
				url: `clients/ref/${ref}`,
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
		//#region Variables
			clients,
		//#endregion

		//#region Functions
			getClients,
			getClient,
			createClient,
			updateClient,
			getClientImage,
			sendMail,
			getMatch,
			getLastClients,
			searchClient,
			getClientByRef
		//#endregion
    }
}, { persistedState: { persist: false } })

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useClientsStore, import.meta.hot));
}
