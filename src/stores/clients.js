import { ref, computed } from 'vue'
import { defineStore, acceptHMRUpdate } from 'pinia'
import liste_client from "../data/clients.json";

export const useClientsStore = defineStore('clients', {
      state: () => ({
            clients: liste_client,
            selected_client: null,
      }),
      actions: {
            
      },
      getters: {
            directory(state) {
                   const sortedUsers = [...state.clients].sort((a, b) => {
                        return a.nom_cli.localeCompare(b.name);
                  });
                        
                  const groupedUsers = sortedUsers.reduce((acc, user) => {
                        const lastNameInitial = user.nom_cli.split(' ').pop()[0].toUpperCase();

                        if (!acc[lastNameInitial]) {
                              acc[lastNameInitial] = [];
                        }

                        acc[lastNameInitial].push(user);

                        return acc;
                  }, {});

                  // 3. Trier les clés et construire le nouvel objet
                  const sortedKeys = Object.keys(groupedUsers).sort();
                  const sortedDirectory = {};
                  sortedKeys.forEach(key => {
                  sortedDirectory[key] = groupedUsers[key];
                  });

                  return sortedDirectory;
            },
            current_client(state) {
                  return state.clients.find(el => el.id_cli == state.selected_client);
            }
      },
      persist: {
            enabled: true
      }
})

// make sure to pass the right store definition, `useAuth` in this case.
if (import.meta.hot) {
      import.meta.hot.accept(acceptHMRUpdate(useClientsStore, import.meta.hot))
}