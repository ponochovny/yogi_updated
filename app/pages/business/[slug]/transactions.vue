<script lang="ts" setup>
import { format } from 'date-fns'
import { CheckIcon, CopyIcon } from '@lucide/vue'

import { TransactionStatus } from '~~/server/db/schema/payment'
import type { StudioTransactionItem } from '../../../entities/payment/schema'

const route = useRoute()
const slug = computed(() => String(route.params.slug))
const provider = ref('')
const status = ref('')
const customer = ref('')
const copiedId = ref<string | null>(null)
const query = computed(() => ({
  provider: provider.value || undefined,
  status: status.value || undefined,
  customer: customer.value || undefined
}))
const {
  data: transactions,
  pending,
  refresh
} = await useFetch<StudioTransactionItem[]>(
  `/api/business/studios/${slug.value}/transactions`,
  { query }
)
const money = (item: StudioTransactionItem) =>
  `${(item.amount / 100).toFixed(2)} ${item.currency}`
const downloadReceipt = (transactionId: string) => {
  window.open(
    `/api/business/studios/${slug.value}/transactions/${transactionId}/receipt`,
    '_blank'
  )
}
const shortId = (id: string) => `${id.slice(0, 6)}...${id.slice(-4)}`
const copyId = async (id: string) => {
  await navigator.clipboard.writeText(id)
  copiedId.value = id
  window.setTimeout(() => {
    if (copiedId.value === id) copiedId.value = null
  }, 1600)
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-semibold">Transactions</h1>
      <p class="text-sm text-muted-foreground">Studio cash register</p>
    </div>
    <div class="flex flex-wrap gap-3">
      <Input v-model="customer" placeholder="Search customer" class="w-56" />
      <NativeSelect v-model="provider" class="w-40">
        <NativeSelectOption value="">All payment types </NativeSelectOption>
        <NativeSelectOption value="CASH">Cash </NativeSelectOption>
        <NativeSelectOption value="STRIPE">Stripe </NativeSelectOption>
      </NativeSelect>
      <NativeSelect v-model="status" class="w-40">
        <NativeSelectOption value="">All statuses </NativeSelectOption>
        <NativeSelectOption value="SUCCESS">Success </NativeSelectOption>
        <NativeSelectOption value="PENDING">Pending </NativeSelectOption>
      </NativeSelect>
      <Button variant="outline" @click="refresh">Refresh </Button>
    </div>
    <div class="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date </TableHead>
            <TableHead>Customer </TableHead>
            <TableHead>Payment type </TableHead>
            <TableHead>Status / reason </TableHead>
            <TableHead class="text-right">Amount </TableHead>
            <TableHead>Transaction IDs </TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="item in transactions || []" :key="item.id">
            <TableCell
              >{{ format(new Date(item.createdAt), 'MMM d, yyyy HH:mm') }}
            </TableCell>
            <TableCell>
              <div class="font-medium">{{ item.customer.name }}</div>
              <div class="text-xs text-muted-foreground">
                {{ item.customer.email }}
              </div>
            </TableCell>
            <TableCell>
              <span>
                {{ item.provider === 'CASH' ? '💵' : '💳' }}
              </span>
              {{ item.provider }}
            </TableCell>
            <TableCell>
              <Badge
                :class="{
                  'bg-gray-500': item.status === TransactionStatus.REFUNDED,
                  'bg-green-400/20 text-green-700':
                    item.status === TransactionStatus.SUCCESS,
                  'bg-rose-500/20 text-rose-700':
                    item.status === TransactionStatus.FAILED,
                  'bg-blue-400': item.status === TransactionStatus.PENDING
                }"
                >{{ item.status }}
              </Badge>
              <p
                v-if="
                  item.status === TransactionStatus.FAILED && item.failureReason
                "
                class="mt-1 max-w-xs text-xs text-destructive"
              >
                {{ item.failureReason }}
              </p>
            </TableCell>
            <TableCell class="text-right font-medium">
              {{ money(item) }}
            </TableCell>
            <TableCell>
              <div class="flex flex-col items-start flex-wrap gap-1">
                <Button
                  variant="link"
                  size="sm"
                  class="h-7 gap-1 px-1 text-xs"
                  :title="`Copy internal transaction ID: ${item.id}`"
                  @click="copyId(item.id)"
                >
                  <component
                    :is="copiedId === item.id ? CheckIcon : CopyIcon"
                    class="size-3.5"
                  />
                  Internal {{ shortId(item.id) }}
                </Button>
                <Button
                  v-if="item.providerTransactionId"
                  variant="link"
                  size="sm"
                  class="h-7 gap-1 px-1 text-xs"
                  :title="`Copy provider transaction ID: ${item.providerTransactionId}`"
                  @click="copyId(item.providerTransactionId)"
                >
                  <component
                    :is="
                      copiedId === item.providerTransactionId
                        ? CheckIcon
                        : CopyIcon
                    "
                    class="size-3.5"
                  />
                  Provider {{ shortId(item.providerTransactionId) }}
                </Button>
              </div>
            </TableCell>
            <TableCell>
              <Button
                v-if="item.status === TransactionStatus.SUCCESS"
                size="sm"
                variant="outline"
                @click="downloadReceipt(item.id)"
              >
                Download receipt
              </Button>
            </TableCell>
          </TableRow>
          <TableRow v-if="!pending && !transactions?.length">
            <TableCell
              colspan="7"
              class="h-24 text-center text-muted-foreground"
            >
              No transactions found.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
