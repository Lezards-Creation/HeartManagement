<script setup>
import { useUserStore } from "../stores/user";
import { useRouter }from "vue-router";
import { ref } from 'vue';
const login = ref(null)
const message = ref(null);
const password = ref(null);
const userStore = useUserStore();
const router = useRouter();

const handleConnexion = async () => {
      let connexion = await userStore.log(login.value, password.value);
      if(connexion == 200) {
            message.value = `Bonjour ${userStore.login}`;
            setTimeout(() => {
                  router.push('/')
            }, 2000);
      } else {
            message.value = `Désolé, vos identifiants sont incorrects.`;
      }
}
</script>
<template>
      <div
            class="flex min-h-full items-center justify-center px-4 py-12 sm:px-6 lg:px-8"
      >
            <div class="w-full max-w-sm space-y-10">
                  <div>
                        <img
                              class="mx-auto h-20 w-auto"
                              src="../assets/images/logo.png"
                              alt="Agence Harmonie"
                        />
                        <h2
                              class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900"
                        >
                              Connectez-vous à votre compte
                        </h2>
                  </div>

                  <div class="fond absolute bottom-0 left-0 max-w-xl">
                        <img
                              src="../assets/images/connexion.png"
                              clas="w-full h-full object-cover"
                        />
                  </div>

                  <form class="space-y-6 z-10 relative backdrop-blur-sm p-4" @submit.prevent="handleConnexion()">
                        <div class="relative -space-y-px rounded-md shadow-sm">
                              <div
                                    class="pointer-events-none absolute inset-0 z-10 rounded-md ring-1 ring-inset ring-gray-300"
                              ></div>
                              <div>
                                    <label for="email-address" class="sr-only"
                                          >Identifiant</label
                                    >
                                    <input
                                          id="username"
                                          name="login"
                                          type="text"
                                          autocomplete="username"
                                          required
                                          v-model="login"
                                          class="relative block w-full rounded-t-md border-0 py-2 text-gray-900 ring-1 ring-inset ring-gray-100 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-rose-500 sm:text-sm sm:leading-6"
                                          placeholder="Identifiant"
                                    />
                              </div>
                              <div>
                                    <label for="password" class="sr-only"
                                          >Mot de passe</label
                                    >
                                    <input
                                          id="password"
                                          name="password"
                                          type="password"
                                          autocomplete="current-password"
                                          v-model="password"
                                          required
                                          class="relative block w-full rounded-b-md border-0 py-2 text-gray-900 ring-1 ring-inset ring-gray-100 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-rose-500 sm:text-sm sm:leading-6"
                                          placeholder="Mot de passe"
                                    />
                              </div>
                             
                        </div>

                        <div class="text-center text-rose-800 text-sm">{{ message }}</div>

                        <div class="flex items-center justify-between">
                              <div class="flex items-center">
                                    <input
                                          id="remember-me"
                                          name="remember-me"
                                          type="checkbox"
                                          class="h-4 w-4 rounded border-gray-300 text-rose-500 focus:ring-rose-500"
                                    />
                                    <label
                                          for="remember-me"
                                          class="ml-3 block text-xs leading-6 text-slate-600"
                                          >Se souvenir de moi</label
                                    >
                              </div>

                              <div class="text-sm leading-6">
                                    <a
                                          href="#"
                                          class="font-medium text-rose-500 hover:text-rose-600"
                                          >Mot de passe oublié ?</a
                                    >
                              </div>
                        </div>

                        <div>
                              <button
                                    type="submit"
                                    class="flex w-full justify-center rounded-md bg-rose-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white hover:bg-rose-600 transition-all hover:translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
                              >
                                    Connexion
                              </button>
                        </div>
                  </form>
            </div>
      </div>
</template>
