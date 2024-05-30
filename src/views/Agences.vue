<template>
    <section class="page flex">
        <AllAgences />
        <RouterView />
        <NewUser v-if="$route.name === 'Agences'" />
    </section>
</template>