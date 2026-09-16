<template>
  <div class="space-y-6">
    <!-- Header with Reset -->
    <div
      class="flex items-center justify-between pb-2 border-b border-border/60"
    >
      <span
        class="text-sm font-semibold uppercase tracking-wider text-muted-foreground"
      >
        {{ $t('explore.filters') }}
      </span>
      <button
        type="button"
        class="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
        @click="$emit('reset')"
      >
        <RotateCcwIcon class="size-3" />
        {{ $t('explore.reset') }}
      </button>
    </div>

    <!-- Category (Offerings & Studios) -->
    <div v-if="activeType !== 'practitioners'" class="space-y-2">
      <label
        class="text-xs font-semibold text-foreground flex items-center gap-1.5"
      >
        <TagIcon class="size-3.5 text-primary" />
        {{ $t('explore.category') }}
      </label>
      <NativeSelect
        :model-value="filters.category"
        class="w-full h-10 rounded-xl bg-card border-input text-sm"
        @update:model-value="onCategoryChange"
      >
        <option value="">{{ $t('explore.allCategories') }}</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">
          {{ cat.name }}
        </option>
      </NativeSelect>
    </div>

    <!-- Date (Offerings only) -->
    <div v-if="activeType === 'offerings'" class="space-y-2">
      <label
        class="text-xs font-semibold text-foreground flex items-center gap-1.5"
      >
        <CalendarIcon class="size-3.5 text-primary" />
        {{ $t('explore.date') }}
      </label>
      <input
        type="date"
        :value="filters.date"
        class="w-full h-10 px-3 rounded-xl border border-input bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none transition"
        @input="
          onFieldChange('date', ($event.target as HTMLInputElement).value)
        "
      />
    </div>

    <!-- Time of Day (Offerings only) -->
    <div v-if="activeType === 'offerings'" class="space-y-2">
      <label
        class="text-xs font-semibold text-foreground flex items-center gap-1.5"
      >
        <ClockIcon class="size-3.5 text-primary" />
        {{ $t('explore.timeOfDay') }}
      </label>
      <div class="grid grid-cols-3 gap-1.5 p-1 bg-muted/40 rounded-xl">
        <button
          v-for="time in timeOptions"
          :key="time.value"
          type="button"
          class="py-1.5 text-xs font-medium rounded-lg transition-all text-center"
          :class="
            filters.time === time.value
              ? 'bg-card text-foreground shadow-xs font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          "
          @click="onTimeSelect(time.value)"
        >
          {{ time.label }}
        </button>
      </div>
    </div>

    <!-- Pricing Type (Offerings only) -->
    <div v-if="activeType === 'offerings'" class="space-y-2">
      <label
        class="text-xs font-semibold text-foreground flex items-center gap-1.5"
      >
        <CreditCardIcon class="size-3.5 text-primary" />
        {{ $t('explore.pricingType') }}
      </label>
      <div class="flex flex-col gap-1">
        <button
          v-for="p in pricingOptions"
          :key="p.value"
          type="button"
          class="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition border text-left"
          :class="
            filters.pricingType === p.value
              ? 'bg-primary/10 border-primary/40 text-primary font-semibold'
              : 'bg-card border-transparent hover:bg-muted/50 text-muted-foreground hover:text-foreground'
          "
          @click="onPricingSelect(p.value)"
        >
          <span>{{ p.label }}</span>
          <span
            v-if="filters.pricingType === p.value"
            class="w-1.5 h-1.5 rounded-full bg-primary"
          />
        </button>
      </div>
    </div>

    <!-- City / Location (All types) -->
    <div class="space-y-2">
      <label
        class="text-xs font-semibold text-foreground flex items-center gap-1.5"
      >
        <MapPinIcon class="size-3.5 text-primary" />
        {{ $t('explore.city') }}
      </label>
      <div class="relative">
        <input
          type="text"
          :value="filters.city"
          :placeholder="$t('explore.cityPlaceholder')"
          class="w-full h-10 pl-3 pr-8 rounded-xl border border-input bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none transition"
          @input="onCityInput(($event.target as HTMLInputElement).value)"
        />
        <button
          v-if="filters.city"
          type="button"
          class="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          @click="onFieldChange('city', '')"
        >
          <XIcon class="size-3.5" />
        </button>
      </div>
    </div>

    <!-- Online Only Toggle (Offerings only) -->
    <div
      v-if="activeType === 'offerings'"
      class="pt-2 border-t border-border/60 flex items-center justify-between"
    >
      <label
        for="online-filter-toggle"
        class="text-sm font-medium text-foreground cursor-pointer flex items-center gap-2"
      >
        <GlobeIcon class="size-4 text-blue-500" />
        {{ $t('explore.onlineOnly') }}
      </label>
      <Switch
        id="online-filter-toggle"
        :checked="filters.online"
        @update:checked="onOnlineToggle"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AcceptableValue } from 'reka-ui'
import {
  RotateCcwIcon,
  TagIcon,
  CalendarIcon,
  ClockIcon,
  CreditCardIcon,
  MapPinIcon,
  GlobeIcon,
  XIcon
} from '@lucide/vue'

const props = defineProps<{
  activeType: string
  categories: { id: string; name: string }[]
  filters: {
    category: string
    date: string
    time: string
    pricingType: string
    city: string
    q: string
    online: boolean
    page: number
  }
}>()

const emit = defineEmits<{
  'update:filters': [filters: typeof props.filters]
  reset: []
}>()

const { t } = useI18n()

const timeOptions = computed(() => [
  { value: 'morning', label: t('explore.morning') },
  { value: 'afternoon', label: t('explore.afternoon') },
  { value: 'evening', label: t('explore.evening') }
])

const pricingOptions = computed(() => [
  { value: '', label: t('explore.allCategories', 'All Pricing Types') },
  { value: 'DROP_IN', label: t('home.dropIn', 'Single Drop-In') },
  { value: 'PACK', label: t('home.classPack', '10-Class Pack') },
  { value: 'MEMBERSHIP', label: t('home.membership', 'Monthly Membership') }
])

function onFieldChange<K extends keyof typeof props.filters>(
  field: K,
  value: (typeof props.filters)[K]
) {
  emit('update:filters', {
    ...props.filters,
    [field]: value
  })
}

function onCategoryChange(value: AcceptableValue | AcceptableValue[]) {
  onFieldChange('category', typeof value === 'string' ? value : '')
}

function onTimeSelect(val: string) {
  const nextTime = props.filters.time === val ? '' : val
  onFieldChange('time', nextTime)
}

function onPricingSelect(val: string) {
  onFieldChange('pricingType', val)
}

function onOnlineToggle(checked: boolean) {
  onFieldChange('online', checked)
}

let cityTimer: ReturnType<typeof setTimeout>
function onCityInput(val: string) {
  clearTimeout(cityTimer)
  cityTimer = setTimeout(() => {
    onFieldChange('city', val)
  }, 350)
}
</script>
