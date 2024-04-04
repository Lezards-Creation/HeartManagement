import { createPinia } from 'pinia'
import { createPersistedStatePlugin } from 'pinia-plugin-persistedstate-2'

export const plugin = (app) => {
    const pinia = createPinia();
    const installPersistedStatePlugin = createPersistedStatePlugin();
    pinia.use((context) => installPersistedStatePlugin(context));
    app.use(pinia)
}