<template>
  <div class="explore-page px-4 sm:px-6 lg:px-8 mx-auto w-full max-w-7xl">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl sm:text-4xl font-bold mb-2">
        {{ $t('explore.title') }}
      </h1>

      <!-- Type Tabs -->
      <div
        class="flex items-center gap-1 mt-6 p-1 bg-muted/50 rounded-xl w-fit"
      >
        <button
          v-for="tab in tabs"
          :key="tab.value"
          class="px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
          :class="
            activeType === tab.value
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          "
          @click="setActiveType(tab.value)"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <div class="flex gap-8">
      <!-- ============================== -->
      <!-- FILTERS SIDEBAR (Desktop) -->
      <!-- ============================== -->
      <aside class="hidden lg:block w-72 shrink-0">
        <div class="sticky top-24 space-y-6">
          <ExploreFilters
            :active-type="activeType"
            :categories="categories"
            :filters="filters"
            @update:filters="updateFilters"
            @reset="resetFilters"
          />
        </div>
      </aside>

      <!-- ============================== -->
      <!-- RESULTS -->
      <!-- ============================== -->
      <div class="flex-1 min-w-0">
        <!-- Mobile Filter Button + Search -->
        <div class="flex items-center gap-3 mb-6">
          <div class="relative flex-1">
            <SearchIcon
              class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
            />
            <input
              v-model="filters.q"
              type="text"
              :placeholder="$t('explore.searchPlaceholder')"
              class="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none transition"
              @input="debouncedFetch"
            />
          </div>
          <!-- Mobile filter trigger -->
          <Sheet v-model:open="mobileFiltersOpen">
            <SheetTrigger as-child>
              <Button
                variant="outline"
                size="icon"
                class="lg:hidden h-11 w-11 shrink-0"
              >
                <SlidersHorizontalIcon class="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" class="w-xs p-0">
              <div class="p-6 overflow-y-auto h-full">
                <h3 class="text-lg font-bold mb-6">
                  {{ $t('explore.filters') }}
                </h3>
                <ExploreFilters
                  :active-type="activeType"
                  :categories="categories"
                  :filters="filters"
                  @update:filters="
                    (f: typeof filters) => {
                      updateFilters(f)
                      mobileFiltersOpen = false
                    }
                  "
                  @reset="resetFilters"
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <!-- Active filters chips -->
        <div v-if="hasActiveFilters" class="flex flex-wrap gap-2 mb-4">
          <span
            v-if="filters.category"
            class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
          >
            {{ getCategoryName(filters.category) }}
            <button @click="((filters.category = ''), fetchData())">
              <XIcon class="size-3" />
            </button>
          </span>
          <span
            v-if="filters.date"
            class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
          >
            {{ filters.date }}
            <button @click="((filters.date = ''), fetchData())">
              <XIcon class="size-3" />
            </button>
          </span>
          <span
            v-if="filters.city"
            class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
          >
            {{ filters.city }}
            <button @click="((filters.city = ''), fetchData())">
              <XIcon class="size-3" />
            </button>
          </span>
          <span
            v-if="filters.pricingType"
            class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
          >
            {{ filters.pricingType }}
            <button @click="((filters.pricingType = ''), fetchData())">
              <XIcon class="size-3" />
            </button>
          </span>
          <span
            v-if="filters.time"
            class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
          >
            {{ filters.time }}
            <button @click="((filters.time = ''), fetchData())">
              <XIcon class="size-3" />
            </button>
          </span>
          <span
            v-if="filters.online"
            class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 text-xs font-medium"
          >
            Online
            <button @click="((filters.online = false), fetchData())">
              <XIcon class="size-3" />
            </button>
          </span>
          <button
            class="text-xs text-muted-foreground hover:text-foreground transition-colors"
            @click="resetFilters"
          >
            {{ $t('explore.reset') }}
          </button>
        </div>

        <!-- Results count -->
        <div
          v-if="!pending && exploreData"
          class="text-sm text-muted-foreground mb-4"
        >
          {{ exploreData.total }}
          {{ exploreData.total === 1 ? 'result' : 'results' }}
        </div>

        <!-- Loading skeleton -->
        <div
          v-if="pending"
          class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          <div
            v-for="i in 6"
            :key="i"
            class="rounded-2xl border border-border bg-card overflow-hidden"
          >
            <div class="aspect-16/10 bg-muted animate-pulse" />
            <div class="p-4 space-y-3">
              <div class="h-5 w-3/4 bg-muted animate-pulse rounded" />
              <div class="h-4 w-full bg-muted animate-pulse rounded" />
              <div class="h-4 w-1/2 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </div>

        <!-- Results Grid -->
        <template v-else-if="exploreData?.items?.length">
          <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            <!-- Offerings -->
            <template v-if="activeType === 'offerings'">
              <OfferingCard
                v-for="item in exploreData.items"
                :key="item.id"
                :offering="item"
              />
            </template>
            <!-- Studios -->
            <template v-else-if="activeType === 'studios'">
              <StudioCard
                v-for="item in exploreData.items"
                :key="item.id"
                :studio="item"
              />
            </template>
            <!-- Practitioners -->
            <template v-else-if="activeType === 'practitioners'">
              <PractitionerCard
                v-for="item in exploreData.items"
                :key="item.id"
                :practitioner="item"
              />
            </template>
          </div>

          <!-- Load More -->
          <div
            v-if="exploreData.page < exploreData.totalPages"
            class="mt-10 text-center"
          >
            <Button
              variant="outline"
              size="lg"
              class="px-10 rounded-xl"
              :disabled="loadingMore"
              @click="loadMore"
            >
              <template v-if="loadingMore">
                <Spinner class="size-4 mr-2" />
              </template>
              {{ $t('explore.loadMore') }}
            </Button>
          </div>
        </template>

        <!-- Empty State -->
        <div v-else class="text-center py-20">
          <div
            class="w-20 h-20 mx-auto rounded-2xl bg-muted/50 flex items-center justify-center mb-4"
          >
            <SearchIcon class="size-8 text-muted-foreground" />
          </div>
          <h3 class="text-lg font-semibold mb-2">
            {{ $t('explore.noResults') }}
          </h3>
          <p class="text-sm text-muted-foreground">
            {{ $t('explore.noResultsDesc') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SearchIcon, SlidersHorizontalIcon, XIcon } from '@lucide/vue'
import OfferingCard from '~/entities/offering/ui/Card.vue'
import StudioCard from '~/entities/studio/ui/Card.vue'
import PractitionerCard from '~/pages/explore/_components/PractitionerCard.vue'
import ExploreFilters from '~/pages/explore/_components/ExploreFilters.vue'
import Spinner from '~/shared/ui/spinner/Spinner.vue'

usePageSeo('explore')

const { t } = useI18n()
const route = useRoute()

// Tabs
const tabs = computed(() => [
  { value: 'offerings', label: t('explore.offerings') },
  { value: 'studios', label: t('explore.studios') },
  { value: 'practitioners', label: t('explore.practitioners') }
])

const activeType = ref((route.query.type as string) || 'offerings')
const mobileFiltersOpen = ref(false)
const loadingMore = ref(false)

// Filters
const filters = reactive({
  category: (route.query.category as string) || '',
  date: (route.query.date as string) || '',
  time: (route.query.time as string) || '',
  pricingType: (route.query.pricingType as string) || '',
  city: (route.query.city as string) || '',
  q: (route.query.q as string) || '',
  online: route.query.online === 'true',
  page: 1
})

const hasActiveFilters = computed(
  () =>
    !!(
      filters.category ||
      filters.date ||
      filters.time ||
      filters.pricingType ||
      filters.city ||
      filters.online ||
      filters.q
    )
)

// Categories for filter dropdown
const { data: paramsData } = await useFetch('/api/params')
const categories = computed(() => paramsData.value?.params?.categories || [])

function getCategoryName(id: string) {
  return (
    categories.value.find((c: { id: string; name: string }) => c.id === id)
      ?.name || id
  )
}

// Build query params
function buildQueryParams() {
  const params: Record<string, string> = { type: activeType.value }
  if (filters.category) params.category = filters.category
  if (filters.date) params.date = filters.date
  if (filters.time) params.time = filters.time
  if (filters.pricingType) params.pricingType = filters.pricingType
  if (filters.city) params.city = filters.city
  if (filters.q) params.q = filters.q
  if (filters.online) params.online = 'true'
  params.page = String(filters.page)
  params.limit = '12'
  return params
}

// Fetch data
const pending = ref(false)
const exploreData = ref<{
  items: any[]
  total: number
  page: number
  totalPages: number
} | null>(null)

async function fetchData() {
  filters.page = 1
  pending.value = true
  try {
    const params = buildQueryParams()
    const data = await $fetch('/api/explore', { params })
    exploreData.value = data as any

    // Update URL without navigation
    const urlParams = new URLSearchParams()
    if (activeType.value !== 'offerings')
      urlParams.set('type', activeType.value)
    if (filters.category) urlParams.set('category', filters.category)
    if (filters.date) urlParams.set('date', filters.date)
    if (filters.time) urlParams.set('time', filters.time)
    if (filters.pricingType) urlParams.set('pricingType', filters.pricingType)
    if (filters.city) urlParams.set('city', filters.city)
    if (filters.q) urlParams.set('q', filters.q)
    if (filters.online) urlParams.set('online', 'true')
    const qs = urlParams.toString()
    if (import.meta.client) {
      history.replaceState(null, '', qs ? `/explore?${qs}` : '/explore')
    }
  } finally {
    pending.value = false
  }
}

async function loadMore() {
  if (
    !exploreData.value ||
    exploreData.value.page >= exploreData.value.totalPages
  )
    return
  loadingMore.value = true
  try {
    filters.page = exploreData.value.page + 1
    const params = buildQueryParams()
    const data = (await $fetch('/api/explore', { params })) as any
    exploreData.value = {
      ...data,
      items: [...exploreData.value!.items, ...data.items]
    }
  } finally {
    loadingMore.value = false
  }
}

function setActiveType(type: string) {
  activeType.value = type
  fetchData()
}

function updateFilters(newFilters: typeof filters) {
  Object.assign(filters, newFilters)
  fetchData()
}

function resetFilters() {
  filters.category = ''
  filters.date = ''
  filters.time = ''
  filters.pricingType = ''
  filters.city = ''
  filters.q = ''
  filters.online = false
  fetchData()
}

// Debounced search
let debounceTimer: ReturnType<typeof setTimeout>
function debouncedFetch() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => fetchData(), 400)
}

// Initial fetch
await fetchData()
</script>
