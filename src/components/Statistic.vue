<template>
      <img src="../assets/images/beams.jpg" class="absolute top-0 left-0 w-full h-auto opacity-50" />
      <div class="p-10 relative max-w-7xl mx-auto">
            
            <h3 class="text-base font-semibold leading-6 text-gray-900 flex items-end gap-2">
                  Chiffres clés
                  <span class="text-xs font-normal text-gray-500 -translate-y-[2px]">30 derniers jours</span>
            </h3>

            <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <div v-for="item in stats" :key="item.id"
                        class="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6">
                        <dt>
                              <div class="absolute rounded-md bg-rose-500 p-3">
                                    <component :is="item.icon" class="h-6 w-6 text-white" aria-hidden="true" />
                              </div>
                              <p class="ml-16 truncate text-sm font-medium text-gray-500">{{ item.name }}</p>
                        </dt>
                        <dd class="ml-16 flex items-baseline pb-6 sm:pb-7">
                              <p class="text-2xl font-semibold text-gray-900">{{ item.stat }}</p>
                              <p
                                    :class="[item.changeType === 'increase' ? 'text-green-600' : 'text-red-600', 'ml-2 flex items-baseline text-sm font-semibold']">
                                    <ArrowUpIcon v-if="item.changeType === 'increase'"
                                          class="h-5 w-5 flex-shrink-0 self-center text-green-500" aria-hidden="true" />
                                    <ArrowDownIcon v-else class="h-5 w-5 flex-shrink-0 self-center text-red-500"
                                          aria-hidden="true" />
                                    <span class="sr-only"> {{ item.changeType === 'increase' ? 'Increased' : 'Decreased' }} by
                                    </span>
                                    {{ item.change }}
                              </p>
                              <div class="absolute inset-x-0 bottom-0 bg-gray-50 px-4 py-4 sm:px-6">
                                    <div class="text-sm">
                                          <a href="#" class="font-medium text-rose-600 hover:text-rose-500">Tout voir<span
                                                      class="sr-only"> {{ item.name }} stats</span></a>
                                    </div>
                              </div>
                        </dd>
                  </div>
            </dl>
      </div>
</template>

<script setup>
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/vue/20/solid'
import { CursorArrowRaysIcon, EnvelopeOpenIcon, UsersIcon, HeartIcon } from '@heroicons/vue/24/outline'

const stats = [
      { id: 1, name: 'Nouveaux inscrits', stat: '34', icon: UsersIcon, change: '4%', changeType: 'increase' },
      { id: 2, name: 'Message envoyés', stat: '478', icon: EnvelopeOpenIcon, change: '5.4%', changeType: 'increase' },
      { id: 3, name: 'Matching', stat: '10', icon: HeartIcon, change: '23%', changeType: 'decrease' },
]
</script>