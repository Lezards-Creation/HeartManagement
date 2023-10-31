<template>
      <Navigation />
      <Statistic />
      <div class="flex w-full bg-gradient-to-b from-white/80 to-white/0 relative max-w-7xl mx-auto bg-white shadow rounded-lg">
            <UsersList />
            <Feed />
      </div>
      
</template>

<script setup>
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { MagnifyingGlassIcon } from '@heroicons/vue/20/solid'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/vue/24/outline'
</script>