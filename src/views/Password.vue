<script setup>
    import { ref, onMounted } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import { useUserStore } from '../stores/user';

    const router = useRouter();
    const route         = useRoute();
    const userStore     = useUserStore();
    const step          = ref(1);
    const login         = ref('');
    const token         = ref('');
    const password      = ref('');
    const password_confirmation = ref('');
    const error         = ref(null);

    onMounted(() => {
        if (route.query.login && route.query.token) {
            login.value = route.query.login;
            token.value = route.query.token;
            step.value  = 3;
        }
    });

    const onVerifyUsername = async () => {
        error.value = null;
        try {
            await userStore.checkUsername(login.value);
            await userStore.sendResetLink(login.value);
            step.value = 2;
        } catch (e) {
            error.value = e.response?.data?.message || 'Erreur inattendue';
        }
    };

    const onResetPassword = async () => {
        error.value = null;
        try {
            await userStore.resetPassword({
                login: login.value,
                token: token.value,               // include the token
                password: password.value,
                password_confirmation: password_confirmation.value,
            });

            router.push({name: 'Connexion'})

        } catch (e) {
            error.value = e.response?.data?.message || 'Erreur inattendue';
        }
    };
</script>

<template>
    <div class="flex min-h-full items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
		<div class="w-full max-w-sm space-y-2">
			<div>
				<img class="mx-auto h-20 w-auto" src="../assets/images/logo.png" alt="Agence Harmonie"/>
				<h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">Renseigner votre identifiant</h2>
			</div>

			<div class="fond absolute bottom-0 left-0 max-w-xl">
				<img src="../assets/images/connexion.png" class="w-full h-full object-cover"/>
			</div>

            <div class="forgot-password-container">
                <!-- Étape 1 : saisie de l’identifiant -->
                <form v-if="step === 1" @submit.prevent="onVerifyUsername" class="space-y-6 z-10 relative backdrop-blur-sm p-4">
                    <div class="mb-2">
                        <label class="sr-only" for="login">Identifiant</label>
                        <input
                            id="login"
                            v-model="login"
                            required
                            placeholder="Votre identifiant"
                            class="relative block w-full rounded-md py-2 text-gray-900 placeholder:text-gray-400 sm:text-sm sm:leading-6"
                        />
                    </div>
                    
                    <div v-if="error" class="text-center text-red-500 text-sm">{{ error }}</div>

                    <div class="flex justify-end">
                        <button 
                            class="flex justify-center rounded-md bg-rose-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white hover:bg-rose-600 transition-all hover:translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
                            type="submit">Continuer</button>
                    </div>
                </form>

                <!-- Étape 2 : envoi du lien -->
                <div v-if="step === 2" class="message">
                    <p class="text-center text-lg font-medium mt-5 text-green-600">Vérification réussie ! Un lien de réinitialisation a été envoyé à votre email.</p>
                </div>

                <!-- Étape 3 (optionnelle) : formulaire de reset direct -->
                <form v-if="step === 3" @submit.prevent="onResetPassword" class="space-y-6 z-10 relative backdrop-blur-sm p-4">
                    <div class="mb-2">
                        <label class="sr-only" for="password">Nouveau mot de passe</label>
                        <input
                            id="password"
                            type="password"
                            v-model="password"
                            required
                            placeholder="Nouveau mot de passe"
                            class="relative block w-full rounded-md py-2 text-gray-900 placeholder:text-gray-400 sm:text-sm sm:leading-6"
                        />
                    </div>

                    <div class="mb-2">
                        <label class="sr-only" for="password_confirmation">Confirmez le mot de passe</label>
                        <input
                            id="password_confirmation"
                            type="password"
                            v-model="password_confirmation"
                            required
                            placeholder="Confirmation"
                            class="relative block w-full rounded-md py-2 text-gray-900 placeholder:text-gray-400 sm:text-sm sm:leading-6"
                        />
                    </div>

                    <div v-if="error" class="text-center text-red-500 text-sm">{{ error }}</div>

                    <div class="flex justify-end">
                        <button 
                            class="flex justify-center rounded-md bg-rose-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white hover:bg-rose-600 transition-all hover:translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
                            type="submit">
                            Valider
                        </button>
                    </div>
                </form>
            </div>
		</div>
    </div>
</template>