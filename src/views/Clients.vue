<script setup>
    import { useClientsStore } from '../stores/clients'
    const clientsStore = useClientsStore()
</script>

<template>
    <section class="page flex">
        <AllUsers />
    </section>
</template>