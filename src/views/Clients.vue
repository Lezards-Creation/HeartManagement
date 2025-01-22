<template>
    <section class="page flex flex-wrap">
        <AllUsers />
        <RouterView />
        <NewUser v-if="$route.name === 'Clients'" />
    </section>
</template>
