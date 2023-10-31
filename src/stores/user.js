import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
      state: () => ({
            login: null,
            isLogged: false,
      }),
      actions: {
            async log(login, password) {
                  if(login === "lezardscreation" && password === "lezardscreation") {
                        this.isLogged = true;
                        this.login = login;
                        return 200;
                  } else {
                        return 500;
                  }
            }
      },
    
      persist: {
            enabled: true
      }
})
