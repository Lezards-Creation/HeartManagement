<template>
      <div class="feed p-10">
            <div class="border-b border-gray-200 pb-5">
                  <h3 class="text-base font-semibold leading-6 text-gray-900">Activités</h3>
            </div>

            <ul role="list" class="space-y-6 pt-6">
                  <li v-for="(activityItem, activityItemIdx) in activity" :key="activityItem.id" class="relative flex gap-x-4">
                        <div
                              :class="[activityItemIdx === activity.length - 1 ? 'h-6' : '-bottom-6', 'absolute left-0 top-0 flex w-6 justify-center']">
                              <div class="w-px bg-gray-200" />
                        </div>
                        <template v-if="activityItem.type === 'commented'">
                              <img :src="activityItem.person.imageUrl" alt=""
                                    class="relative mt-3 h-6 w-6 flex-none rounded-full bg-gray-50" />
                              <div class="flex-auto rounded-md p-3 ring-1 ring-inset ring-gray-200">
                                    <div class="flex justify-between gap-x-4">
                                          <div class="py-0.5 text-xs leading-5 text-gray-500">
                                                <span class="font-medium text-gray-900">{{ activityItem.person.name }}</span>
                                                a commenté
                                          </div>
                                          <time :datetime="activityItem.dateTime"
                                                class="flex-none py-0.5 text-xs leading-5 text-gray-500">{{ activityItem.date
                                                }}</time>
                                    </div>
                                    <p class="text-sm leading-6 text-gray-500">{{ activityItem.comment }}</p>
                              </div>
                        </template>
                        <template v-else>
                              <div class="relative flex h-6 w-6 flex-none items-center justify-center bg-white">
                                    <CheckCircleIcon v-if="activityItem.type === 'paid'" class="h-6 w-6 text-rose-600"
                                          aria-hidden="true" />
                                    <div v-else class="h-1.5 w-1.5 rounded-full bg-gray-100 ring-1 ring-gray-300" />
                              </div>
                              <p class="flex-auto py-0.5 text-xs leading-5 text-gray-500">
                                    <span class="font-medium text-gray-900">{{ activityItem.person.name }}</span> {{
                                          activityItem.type }}
                              </p>
                              <time :datetime="activityItem.dateTime" class="flex-none py-0.5 text-xs leading-5 text-gray-500">{{
                                    activityItem.date }}</time>
                        </template>
                  </li>
            </ul>

            <!-- New comment form -->
            <div class="mt-6 flex gap-x-3">
                  <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                        alt="" class="h-6 w-6 flex-none rounded-full bg-gray-50" />
                  <form action="#" class="relative flex-auto">
                        <div
                              class="overflow-hidden rounded-lg pb-12 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-rose-600">
                              <label for="comment" class="sr-only">Ajouter un commentaire</label>
                              <textarea rows="2" name="comment" id="comment"
                                    class="block w-full resize-none border-0 bg-transparent py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                                    placeholder="Ajouter un commentaire..." />
                        </div>

                        <div class="absolute inset-x-0 bottom-0 flex justify-between py-2 pl-3 pr-2">
                              <div class="flex items-center space-x-5">
                                    <div class="flex items-center">
                                          <button type="button"
                                                class="-m-2.5 flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500">
                                                <PaperClipIcon class="h-5 w-5" aria-hidden="true" />
                                                <span class="sr-only">Déposer un fichier</span>
                                          </button>
                                    </div>
                                    <div class="flex items-center">
                                          <Listbox as="div" v-model="selected">
                                                <ListboxLabel class="sr-only">Your mood</ListboxLabel>
                                                <div class="relative">
                                                      <ListboxButton
                                                            class="relative -m-2.5 flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500">
                                                            <span class="flex items-center justify-center">
                                                                  <span v-if="selected.value === null">
                                                                        <FaceSmileIcon class="h-5 w-5 flex-shrink-0"
                                                                              aria-hidden="true" />
                                                                        <span class="sr-only">Add your mood</span>
                                                                  </span>
                                                                  <span v-if="!(selected.value === null)">
                                                                        <span
                                                                              :class="[selected.bgColor, 'flex h-8 w-8 items-center justify-center rounded-full']">
                                                                              <component :is="selected.icon"
                                                                                    class="h-5 w-5 flex-shrink-0 text-white"
                                                                                    aria-hidden="true" />
                                                                        </span>
                                                                        <span class="sr-only">{{ selected.name }}</span>
                                                                  </span>
                                                            </span>
                                                      </ListboxButton>

                                                      <transition leave-active-class="transition ease-in duration-100"
                                                            leave-from-class="opacity-100" leave-to-class="opacity-0">
                                                            <ListboxOptions
                                                                  class="absolute bottom-10 z-10 -ml-6 w-60 rounded-lg bg-white py-3 text-base shadow ring-1 ring-black ring-opacity-5 focus:outline-none sm:ml-auto sm:w-64 sm:text-sm">
                                                                  <ListboxOption as="template" v-for="mood in moods"
                                                                        :key="mood.value" :value="mood" v-slot="{ active }">
                                                                        <li
                                                                              :class="[active ? 'bg-gray-100' : 'bg-white', 'relative cursor-default select-none px-3 py-2']">
                                                                              <div class="flex items-center">
                                                                                    <div
                                                                                          :class="[mood.bgColor, 'flex h-8 w-8 items-center justify-center rounded-full']">
                                                                                          <component :is="mood.icon"
                                                                                                :class="[mood.iconColor, 'h-5 w-5 flex-shrink-0']"
                                                                                                aria-hidden="true" />
                                                                                    </div>
                                                                                    <span class="ml-3 block truncate font-medium">{{
                                                                                          mood.name }}</span>
                                                                              </div>
                                                                        </li>
                                                                  </ListboxOption>
                                                            </ListboxOptions>
                                                      </transition>
                                                </div>
                                          </Listbox>
                                    </div>
                              </div>
                              <button type="submit"
                                    class="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Valider</button>
                        </div>
                  </form>
            </div>
      </div>
</template>

<script setup>
import { ref } from 'vue'
import { CheckCircleIcon } from '@heroicons/vue/24/solid'
import {
      FaceFrownIcon,
      FaceSmileIcon,
      FireIcon,
      HandThumbUpIcon,
      HeartIcon,
      PaperClipIcon,
      XMarkIcon,
} from '@heroicons/vue/20/solid'
import { Listbox, ListboxButton, ListboxLabel, ListboxOption, ListboxOptions } from '@headlessui/vue'

const activity = [
      { id: 1, type: 'a créé un nouveau profil', person: { name: 'Gilbert Andrianne' }, date: 'il y a 6j', dateTime: '2023-01-23T10:32' },
      { id: 2, type: 'a modifié un profil', person: { name: 'Gilbert Andrianne' }, date: 'il y a 6j', dateTime: '2023-01-23T11:03' },
      { id: 3, type: 'a organisé une rencontre', person: { name: 'Juliette Mathieu' }, date: 'il y a 6j', dateTime: '2023-01-23T11:24' },
      {
            id: 4,
            type: 'commented',
            person: {
                  name: 'Elsa Costa',
                  imageUrl:
                        'https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
            },
            comment: 'La rencontre ne s\'est pas bien passée. Michael est parti au bout de 5 minutes.',
            date: 'Il y a 3j',
            dateTime: '2023-01-23T15:56',
      },
      { id: 5, type: 's\'est connectée', person: { name: 'Valentine Corde' }, date: 'Il y a 2j', dateTime: '2023-01-24T09:12' },
      { id: 6, type: 'a payé', person: { name: 'Leila Bennis' }, date: 'Hier', dateTime: '2023-01-24T09:20' },
]
const moods = [
      { name: 'Excited', value: 'excited', icon: FireIcon, iconColor: 'text-white', bgColor: 'bg-red-500' },
      { name: 'Loved', value: 'loved', icon: HeartIcon, iconColor: 'text-white', bgColor: 'bg-pink-400' },
      { name: 'Happy', value: 'happy', icon: FaceSmileIcon, iconColor: 'text-white', bgColor: 'bg-green-400' },
      { name: 'Sad', value: 'sad', icon: FaceFrownIcon, iconColor: 'text-white', bgColor: 'bg-yellow-400' },
      { name: 'Thumbsy', value: 'thumbsy', icon: HandThumbUpIcon, iconColor: 'text-white', bgColor: 'bg-blue-500' },
      { name: 'I feel nothing', value: null, icon: XMarkIcon, iconColor: 'text-gray-400', bgColor: 'bg-transparent' },
]

const selected = ref(moods[5])
</script>