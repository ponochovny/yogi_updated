<script lang="ts" setup>
import { format } from 'date-fns'

useHead({ title: 'My earnings' })
definePageMeta({ title: 'My earnings' })

const month = ref(new Date().toISOString().slice(0, 7))
const { data, pending, error } = await useFetch('/api/practitioner/earnings', {
  query: computed(() => ({ month: month.value }))
})
</script>

<template>
  <div class="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
    <div
      class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
    >
      <div>
        <h1 class="text-2xl font-semibold">My earnings</h1>
        <p class="text-sm text-muted-foreground">
          Transparent breakdown of payouts for each class and the total for the
          current period.
        </p>
      </div>
      <Input v-model="month" type="month" class="w-44" />
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Total due</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-3xl font-semibold">
            ${{ ((data?.total || 0) / 100).toFixed(2) }}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Classes</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-3xl font-semibold">{{ data?.rows.length || 0 }}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Attended</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-3xl font-semibold">
            {{
              data?.rows.reduce((sum, row) => sum + row.attendedCount, 0) || 0
            }}
          </div>
        </CardContent>
      </Card>
    </div>

    <div
      v-if="pending"
      class="rounded-lg border p-6 text-sm text-muted-foreground"
    >
      Loading earnings…
    </div>
    <div
      v-else-if="error"
      class="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700"
    >
      Error loading earnings: {{ error.message }}
    </div>
    <div
      v-else-if="!data?.rows?.length"
      class="rounded-lg border border-dashed p-6 text-sm text-muted-foreground"
    >
      No earnings for this period yet.
    </div>

    <div v-else class="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Studio</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Attended</TableHead>
            <TableHead>Revenue</TableHead>
            <TableHead class="text-right">Payout</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="row in data.rows" :key="row.id">
            <TableCell>{{
              format(new Date(row.startTime), 'MMM d, yyyy')
            }}</TableCell>
            <TableCell>
              <NuxtLink
                v-if="row.studio?.slug"
                :to="`/studios/${row.studio.slug}`"
                class="font-medium text-primary underline-offset-4 hover:underline"
              >
                {{ row.studio.name }}
              </NuxtLink>
              <span v-else>{{ row.studio?.name || 'Studio' }}</span>
            </TableCell>
            <TableCell>
              <NuxtLink
                v-if="row.offering?.slug"
                :to="`/offerings/${row.offering.slug}`"
                class="font-medium text-primary underline-offset-4 hover:underline"
              >
                {{ row.offering.name }}
              </NuxtLink>
              <span v-else>{{ row.offering?.name || 'Class' }}</span>
            </TableCell>
            <TableCell>{{ row.attendedCount }}</TableCell>
            <TableCell>${{ (row.revenue || 0).toFixed(2) }}</TableCell>
            <TableCell class="text-right font-medium"
              >${{ (row.payout || 0).toFixed(2) }}</TableCell
            >
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
