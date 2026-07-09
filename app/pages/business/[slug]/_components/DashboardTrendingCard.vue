<script lang="ts" setup>
import { TrendingDownIcon, TrendingUpIcon } from '@lucide/vue'

defineProps<{
  isTrendingUp: boolean
  title: string
  difference: number
  indicator: string
  downMessage: string
  upMessage: string
  downAdvice: string
  upAdvice: string
}>()
</script>

<template>
  <Card class="@container/card" :class="{ 'from-red-500/10!': !isTrendingUp }">
    <CardHeader>
      <CardDescription>{{ title }}</CardDescription>
      <CardTitle
        class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl"
      >
        {{ indicator }}
      </CardTitle>
      <CardAction>
        <Badge variant="outline">
          <TrendingUpIcon v-if="isTrendingUp" />
          <TrendingDownIcon v-else />
          {{ difference > 0 ? '+' : '' }}{{ difference }}%
        </Badge>
      </CardAction>
    </CardHeader>
    <CardFooter class="flex-col items-start gap-1.5 text-sm">
      <div class="line-clamp-1 flex gap-2 font-medium">
        {{ isTrendingUp ? upMessage : downMessage }}
        <TrendingUpIcon v-if="isTrendingUp" class="size-4 shrink-0" />
        <TrendingDownIcon v-else class="size-4 shrink-0" />
      </div>
      <div class="text-muted-foreground">
        {{ isTrendingUp ? upAdvice : downAdvice }}
      </div>
    </CardFooter>
  </Card>
</template>
