<template>
    <section class="page flex">
        <AllUsers />
        <RouterView />
        <NewUser v-if="$route.name === 'Clients'" />
    </section>
</template>
