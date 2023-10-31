<script setup>
      import { computed, ref } from 'vue'
      import { useClientsStore } from "../stores/clients";
      import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems, Combobox, ComboboxInput, ComboboxOptions, ComboboxOption, Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue'
      import { MagnifyingGlassIcon } from '@heroicons/vue/20/solid'
      import { Bars3Icon, BellIcon, XMarkIcon, ChevronRightIcon, UsersIcon } from '@heroicons/vue/24/outline'

      const clients_store = useClientsStore();
      const openSearch = ref(false)
      const query = ref('')
      const recent = [clients_store.clients[1], clients_store.clients[100], clients_store.clients[130], clients_store.clients[300], clients_store.clients[600], clients_store.clients[900], clients_store.clients[1600]]
      const filteredPeople = computed(() =>
            query.value === '' ? [] : clients_store.clients.filter((person) => {
                  return person.nom_cli.toLowerCase().includes(query.value.toLowerCase())
            })
      )

      function calculateAge(dateString) {
            let today = new Date();
            let birthDate = new Date(dateString);
            let age = today.getFullYear() - birthDate.getFullYear();
            let monthDifference = today.getMonth() - birthDate.getMonth();
            if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
                  age--;
            }
            return age;
      }

      function onSelect(person) {
            //window.location = person.url
      }
</script>


<template>
      <Disclosure as="nav" class="bg-white relative z-20 shadow" v-slot="{ open }">
            <div class="px-2 sm:px-4 lg:px-8">
                  <div class="flex h-16 justify-between">
                        <div class="flex flex-1 items-center justify-start px-2">
                              <div class="w-full max-w-lg lg:max-w-xs">
                                    <label for="search" class="sr-only">Recherche</label>
                                    <div class="relative">
                                          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                                          </div>
                                          <input id="search" name="search" class="block w-full rounded-md border-0 bg-white py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6" placeholder="Recherche" type="search" @click="openSearch = !openSearch" />
                                    </div>
                              </div>
                        </div>
                        <div class="flex items-center lg:hidden">
                              <!-- Mobile menu button -->
                              <DisclosureButton class="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-rose-500">
                                    <span class="absolute -inset-0.5" />
                                    <span class="sr-only">Open main menu</span>
                                    <Bars3Icon v-if="!open" class="block h-6 w-6" aria-hidden="true" />
                                    <XMarkIcon v-else class="block h-6 w-6" aria-hidden="true" />
                              </DisclosureButton>
                        </div>
                        <div class="hidden lg:ml-4 lg:flex lg:items-center">
                              <button type="button" class="relative flex-shrink-0 rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2">
                                    <span class="absolute -inset-1.5" />
                                    <span class="sr-only">View notifications</span>
                                    <BellIcon class="h-6 w-6" aria-hidden="true" />
                              </button>

                              <!-- Profile dropdown -->
                              <Menu as="div" class="relative ml-4 flex-shrink-0">
                                    <div>
                                          <MenuButton class="relative flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2">
                                                <span class="absolute -inset-1.5" />
                                                <span class="sr-only">Open user menu</span>
                                                <img class="h-8 w-8 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
                                          </MenuButton>
                                    </div>
                                    <transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
                                          <MenuItems class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                <MenuItem v-slot="{ active }">
                                                      <a href="#" :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']">Your Profile</a>
                                                </MenuItem>
                                                <MenuItem v-slot="{ active }">
                                                      <a href="#" :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']">Settings</a>
                                                </MenuItem>
                                                <MenuItem v-slot="{ active }">
                                                      <a href="#" :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']">Sign out</a>
                                                </MenuItem>
                                          </MenuItems>
                                    </transition>
                              </Menu>
                        </div>
                  </div>
            </div>

            <DisclosurePanel class="lg:hidden">
                  <div class="space-y-1 pb-3 pt-2">
                        <!-- Current: "bg-rose-50 border-rose-500 text-rose-700", Default: "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800" -->
                        <DisclosureButton as="a" href="#" class="block border-l-4 border-rose-500 bg-rose-50 py-2 pl-3 pr-4 text-base font-medium text-rose-700"> Dashboard</DisclosureButton>
                        <DisclosureButton as="a" href="#" class="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800"> Profils</DisclosureButton>
                        <DisclosureButton as="a" href="#" class="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800"> Projects</DisclosureButton>
                        <DisclosureButton as="a" href="#" class="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800"> Calendar</DisclosureButton>
                  </div>
                  <div class="border-t border-gray-200 pb-3 pt-4">
                        <div class="flex items-center px-4">
                              <div class="flex-shrink-0">
                                    <img class="h-10 w-10 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
                              </div>
                              <div class="ml-3">
                                    <div class="text-base font-medium text-gray-800">Tom Cook</div>
                                    <div class="text-sm font-medium text-gray-500">tom@example.com</div>
                              </div>
                              <button type="button" class="relative ml-auto flex-shrink-0 rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2">
                                    <span class="absolute -inset-1.5" />
                                    <span class="sr-only">View notifications</span>
                                    <BellIcon class="h-6 w-6" aria-hidden="true" />
                              </button>
                        </div>
                        <div class="mt-3 space-y-1">
                              <DisclosureButton as="a" href="#" class="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"> Your Profile</DisclosureButton>
                              <DisclosureButton as="a" href="#" class="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"> Settings</DisclosureButton>
                              <DisclosureButton as="a" href="#" class="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"> Sign out</DisclosureButton>
                        </div>
                  </div>
            </DisclosurePanel>
      </Disclosure>
      <TransitionRoot :show="openSearch" as="template" @after-leave="query = ''" appear>
            <Dialog as="div" class="relative z-50" @close="openSearch = false">
                  <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
                        <div class="fixed inset-0 bg-black backdrop-blur-sm bg-opacity-50 transition-opacity" />
                  </TransitionChild>

                  <div class="fixed inset-0 z-10 w-screen overflow-y-auto p-4 sm:p-6 md:p-20">
                        <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="ease-in duration-200" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
                              <DialogPanel class="mx-auto max-w-3xl transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition-all">
                                    <Combobox v-slot="{ activeOption }" @update:modelValue="onSelect">
                                          <div class="relative">
                                                <MagnifyingGlassIcon class="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                                                <ComboboxInput class="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm" placeholder="Recherche..." @change="query = $event.target.value" />
                                          </div>

                                          <ComboboxOptions v-if="query === '' || filteredPeople.length > 0" class="flex transform-gpu divide-x divide-gray-100" as="div" static hold>
                                                <div :class="['max-h-96 min-w-0 flex-auto scroll-py-4 overflow-y-auto px-6 py-4', activeOption && 'sm:h-96']">
                                                      <h2 v-if="query === ''" class="mb-4 mt-2 text-xs font-semibold text-gray-500">Recherches récentes</h2>
                                                      <div hold class="-mx-2 text-sm text-gray-700">
                                                            <ComboboxOption v-for="person in query === '' ? recent : filteredPeople" :key="person.id" :value="person" as="template" v-slot="{ active }">
                                                                  <div :class="['group flex cursor-default select-none items-center rounded-md p-2', active && 'bg-gray-100 text-gray-900']">
                                                                        <img :src="`https://heartmanagement.fr/soft/images/cli/${person.id_cli}.jpg`" alt="" class="h-6 w-6 flex-none rounded-full bg-gray-200 object-cover" />
                                                                        <span class="ml-3 flex-auto truncate">{{ person.pNoms_cli }} {{ person.nom_cli }}</span>
                                                                        <ChevronRightIcon v-if="active" class="ml-3 h-5 w-5 flex-none text-gray-400" aria-hidden="true" />
                                                                  </div>
                                                            </ComboboxOption>
                                                      </div>
                                                </div>

                                                <div v-if="activeOption" class="hidden h-96 w-1/2 flex-none flex-col divide-y divide-gray-100 overflow-y-auto sm:flex">
                                                      <div class="flex-none p-6 text-center">
                                                            <img :src="`https://heartmanagement.fr/soft/images/cli/${activeOption.id_cli}.jpg`" loading="lazy" alt="" class="mx-auto h-16 w-16 rounded-full object-cover" />
                                                            <h2 class="mt-3 font-semibold text-gray-900">
                                                                  {{ activeOption.pNoms_cli }} {{ activeOption.nom_cli }}
                                                            </h2>
                                                            <p class="text-sm leading-6 text-gray-500">
                                                                  {{ activeOption.prof_cli }} - {{ activeOption.dateNaiss_cli ? calculateAge(activeOption.dateNaiss_cli) + " ans" : '' }}
                                                            </p>
                                                      </div>
                                                      <div class="flex flex-auto flex-col justify-between p-6">
                                                            <dl class="grid grid-cols-1 gap-x-6 gap-y-3 text-xs text-gray-700">
                                                                  <dt class="col-end-1 font-semibold text-gray-900" v-if="activeOption.telPri_cli">Téléphone</dt>
                                                                  <dd v-if="activeOption.telPri_cli">
                                                                        {{ activeOption.telPri_cli }}
                                                                  </dd>
                                                                  <dt class="col-end-1 font-semibold text-gray-900">Ville</dt>
                                                                  <dd class="text-xs">
                                                                        {{ activeOption.cp_cli }} {{ activeOption.ville_cli }}
                                                                  </dd>
                                                                  <dt class="col-end-1 font-semibold text-gray-900">Caractéristiques</dt>
                                                                  <dd class="text-xs">
                                                                        {{ activeOption.taille_cli }} cm, {{  activeOption.poid_cli }} kg
                                                                  </dd>
                                                                  <dt class="col-end-1 font-semibold text-gray-900">Description</dt>
                                                                  <dd class="text-xs">
                                                                        {{ activeOption.desc_cli }} 
                                                                  </dd>
                                                            </dl>
                                                            <button type="button" class="mt-6 w-full rounded-md bg-rose-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600">Voir le profil complet</button>
                                                      </div>
                                                </div>
                                          </ComboboxOptions>

                                          <div v-if="query !== '' && filteredPeople.length === 0" class="px-6 py-14 text-center text-sm sm:px-14">
                                                <UsersIcon class="mx-auto h-6 w-6 text-gray-400" aria-hidden="true" />
                                                <p class="mt-4 font-semibold text-gray-900">Aucun profil trouvé</p>
                                                <p class="mt-2 text-gray-500">Nous n'avons trouvé personne selon vos critères</p>
                                          </div>
                                    </Combobox>
                              </DialogPanel>
                        </TransitionChild>
                  </div>
            </Dialog>
      </TransitionRoot>
</template>

