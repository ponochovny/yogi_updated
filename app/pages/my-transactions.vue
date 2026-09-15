<script setup lang="ts">
import { format } from 'date-fns'
import { CreditCardIcon, DownloadIcon } from '@lucide/vue'

definePageMeta({
  title: 'My transactions',
  breadcrumbs: [{ name: 'My transactions' }]
})
const { data, pending, error } = await useFetch('/api/account/transactions')
const transactions = computed(() => data.value?.transactions ?? [])
const formatMoney = (amount: number, currency: string) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(
    amount / 100
  )
</script>

<template>
  <section class="space-y-6">
    <div>
      <p class="text-sm text-muted-foreground">Wallet</p>
      <h1 class="text-3xl font-semibold tracking-tight">Transaction history</h1>
    </div>
    <p v-if="pending" class="text-muted-foreground">Loading transactions...</p>
    <p v-else-if="error" class="text-destructive">
      Failed to load transactions.
    </p>
    <div
      v-else-if="!transactions.length"
      class="rounded-xl border border-dashed p-10 text-center text-muted-foreground"
    >
      No transactions yet.
    </div>
    <div v-else class="overflow-x-auto rounded-xl border bg-card">
      <table class="w-full min-w-[780px] text-left text-sm">
        <thead class="border-b bg-muted/40 text-muted-foreground">
          <tr>
            <th class="p-4">Date</th>
            <th class="p-4">Studio</th>
            <th class="p-4">Service</th>
            <th class="p-4">Amount</th>
            <th class="p-4">Payment method</th>
            <th class="p-4">Status</th>
            <th class="p-4">Receipt</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="transaction in transactions"
            :key="transaction.id"
            class="border-b last:border-0"
          >
            <td class="p-4">
              {{ format(new Date(transaction.createdAt), 'MMM d, yyyy') }}
            </td>
            <td class="p-4">{{ transaction.studio.name }}</td>
            <td class="p-4">{{ transaction.service }}</td>
            <td class="p-4 font-medium">
              {{ formatMoney(transaction.amount, transaction.currency) }}
            </td>
            <td class="p-4">
              <span class="inline-flex items-center gap-2"
                ><CreditCardIcon class="size-4" />{{
                  transaction.provider
                }}</span
              >
            </td>
            <td class="p-4">{{ transaction.status }}</td>
            <td class="p-4">
              <a
                v-if="transaction.status === 'SUCCESS'"
                class="inline-flex items-center gap-2 text-primary hover:underline"
                :href="`/api/account/transactions/${transaction.id}/receipt`"
                download
                ><DownloadIcon class="size-4" />Get receipt</a
              ><span v-else class="text-muted-foreground"
                >Available after payment</span
              >
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
