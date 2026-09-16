<script lang="ts" setup>
import StudioHeader from './StudioHeader.vue'

const route = useRoute()
const slug = computed(() => String(route.params.slug))
const { data: studioData } = await useFetch(
  `/api/business/studios/${slug.value}`
)
const { data, pending, error } = await useFetch(
  `/api/business/studios/${slug.value}/dashboard`
)
const studio = computed(() => studioData.value?.studio || null)
const formatMoney = (value: number) =>
  `${(value / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })} ${data.value?.currency || ''}`
const maxSales = computed(() =>
  Math.max(...(data.value?.salesByDay?.map(day => day.amount) || [1]), 1)
)
useHead({ title: () => `${studio.value?.name || 'Studio'} dashboard` })
</script>

<template>
  <div class="space-y-8">
    <StudioHeader :studio="studio" />
    <div v-if="pending" class="text-muted-foreground">Loading analytics...</div>
    <div v-else-if="error" class="text-destructive">
      Unable to load dashboard.
    </div>
    <template v-else-if="data">
      <div class="grid gap-4 md:grid-cols-3">
        <div class="rounded-xl border bg-card p-5">
          <p class="text-sm text-muted-foreground">Realized revenue</p>
          <p class="mt-2 text-3xl font-semibold">
            {{ formatMoney(data.kpis.realizedRevenue) }}
          </p>
        </div>
        <div class="rounded-xl border bg-card p-5">
          <p class="text-sm text-muted-foreground">Pending receivables</p>
          <p class="mt-2 text-3xl font-semibold">
            {{ formatMoney(data.kpis.pendingReceivables) }}
          </p>
        </div>
        <div class="rounded-xl border bg-card p-5">
          <p class="text-sm text-muted-foreground">Occupancy rate</p>
          <p class="mt-2 text-3xl font-semibold">
            {{ data.kpis.occupancyRate }}%
          </p>
        </div>
      </div>
      <div class="grid gap-6 lg:grid-cols-[1fr_300px]">
        <section class="rounded-xl border bg-card p-5">
          <div class="flex items-center justify-between">
            <h2 class="font-semibold">Sales, last 30 days</h2>
            <span class="text-xs text-muted-foreground">{{
              data.currency
            }}</span>
          </div>
          <div class="mt-6 flex h-56 items-end gap-1 border-b border-l px-2">
            <div
              v-for="day in data.salesByDay"
              :key="day.date"
              class="group relative flex h-full flex-1 items-end"
            >
              <div
                class="w-full bg-emerald-500/80 transition-colors group-hover:bg-emerald-400"
                :style="{
                  height: `${Math.max((day.amount / maxSales) * 100, day.amount ? 4 : 0)}%`
                }"
                :title="`${day.date}: ${formatMoney(day.amount)}`"
              />
            </div>
          </div>
        </section>
        <section class="rounded-xl border bg-card p-5">
          <h2 class="font-semibold">Attendance</h2>
          <div class="mt-6 space-y-5">
            <div>
              <div class="flex justify-between text-sm">
                <span>Attended</span
                ><strong>{{ data.attendance.attended }}</strong>
              </div>
              <div class="mt-2 h-2 rounded bg-muted">
                <div
                  class="h-full rounded bg-emerald-500"
                  :style="{
                    width: `${data.attendance.attended ? (data.attendance.attended / (data.attendance.attended + data.attendance.noShow)) * 100 : 0}%`
                  }"
                />
              </div>
            </div>
            <div>
              <div class="flex justify-between text-sm">
                <span>No show</span
                ><strong>{{ data.attendance.noShow }}</strong>
              </div>
              <div class="mt-2 h-2 rounded bg-muted">
                <div
                  class="h-full rounded bg-rose-500"
                  :style="{
                    width: `${data.attendance.noShow ? (data.attendance.noShow / (data.attendance.attended + data.attendance.noShow)) * 100 : 0}%`
                  }"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
      <NuxtLink :to="`/business/${slug}/schedule`"
        ><Button>Open schedule</Button></NuxtLink
      >
    </template>
  </div>
</template>
