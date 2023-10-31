<script setup>
import Layout from "../Layouts/default.vue";
import { useClientsStore } from '../stores/clients'
const clientsStore = useClientsStore()

</script>

<template>
      <Layout>
            <img src="../assets/images/beams-home.jpeg" class="absolute top-0 z-0 pointer-events-none right-0 object-contain w-full opacity-20 " loading="lazy" />
            <section class="page flex">
                  <AllUsers />
                  <NewUser v-if="clientsStore.selected_client == null" />
                  <SelectedClient v-else/>
            </section>
      </Layout>
</template>