<script lang="ts" setup>
import DashboardTrendingCard from './DashboardTrendingCard.vue'
import StudioHeader from './StudioHeader.vue'

const route = useRoute()

const { data: studioData } = await useFetch(
  `/api/business/studios/${route.params.slug}`
)
const studio = computed(() => studioData.value?.studio || null)

useHead({
  title: () => studio.value?.name || 'Loading Studio...'
})
</script>

<template>
  <div class="@container/main space-y-8">
    <StudioHeader :studio="studio" />

    <div
      class="*:data-[slot=card]:from-green-500/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @4xl/main:grid-cols-4"
    >
      <DashboardTrendingCard
        v-for="(card, index) in [
          {
            title: 'Total Revenue',
            isTrendingUp: true,
            difference: 12.5,
            indicator: '$1,250.00',
            downMessage: 'Revenue decreased.',
            upMessage: 'Trending up this month.',
            downAdvice: 'Review pricing and marketing.',
            upAdvice: 'Expand offerings.'
          },
          {
            title: 'New Customers',
            isTrendingUp: false,
            difference: -5.2,
            indicator: '125',
            downMessage: 'Down 5.2% this period.',
            upMessage: 'New customers up.',
            downAdvice: 'Boost acquisition efforts.',
            upAdvice: 'Keep engaging and promoting.'
          },
          {
            title: 'Active Subscriptions',
            isTrendingUp: true,
            difference: 8.3,
            indicator: '1,250',
            downMessage: 'Subscriptions decreased.',
            upMessage: 'Strong user retention.',
            downAdvice: 'Improve retention strategies.',
            upAdvice: 'Engagement exceeds targets.'
          },
          {
            title: 'Churn Rate',
            isTrendingUp: false,
            difference: -3.1,
            indicator: '3.1%',
            downMessage: 'Churn rate increased.',
            upMessage: 'Churn rate decreased.',
            downAdvice: 'Analyze feedback and improve.',
            upAdvice: 'Focus on satisfaction.'
          }
        ]"
        :key="index"
        :title="card.title"
        :is-trending-up="card.isTrendingUp"
        :difference="card.difference"
        :indicator="card.indicator"
        :down-message="card.downMessage"
        :up-message="card.upMessage"
        :down-advice="card.downAdvice"
        :up-advice="card.upAdvice"
      />
    </div>
  </div>
</template>
