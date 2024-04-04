import axios from 'axios'
import { defineStore } from 'pinia';
import { ref } from 'vue';

const instance = axios.create({
    baseURL: '',
})

export const useMainStore = defineStore('main-store', () => {
    return {
        // Variables
    
        // Functions

    }
}, { persistedState: { persist: false } })