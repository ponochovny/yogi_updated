<template>
  <div>
    <!-- ============================== -->
    <!-- HERO SECTION -->
    <!-- ============================== -->

    <section class="relative -mt-20 overflow-hidden">
      <!-- Background gradient -->
      <div
        class="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-background z-0"
      />
      <div
        class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent z-0"
      />

      <!-- Decorative blobs -->
      <div
        class="absolute top-20 -right-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        class="absolute -bottom-20 -left-32 w-80 h-80 rounded-full bg-accent/10 blur-3xl"
      />

      <div
        class="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-32 pb-20 lg:pt-40 lg:pb-28"
      >
        <div class="text-center max-w-3xl mx-auto space-y-6">
          <h1
            class="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]"
          >
            <span
              class="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text"
            >
              {{ $t('home.heroTitle') }}
            </span>
          </h1>
          <p class="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            {{ $t('home.heroSubtitle') }}
          </p>

          <!-- Smart Search Bar -->
          <div
            class="mt-8 bg-card/80 backdrop-blur-xl border border-border/60 rounded-2xl p-2 shadow-xl shadow-primary/5 max-w-3xl mx-auto"
          >
            <form
              class="flex flex-col sm:flex-row items-stretch gap-2"
              @submit.prevent="handleSearch"
            >
              <!-- Category -->
              <div class="flex-1 min-w-0">
                <NativeSelect
                  id="hero-category"
                  v-model="searchCategory"
                  class="w-full h-12 rounded-xl border-0 bg-muted/50 px-4 text-sm focus:ring-2 focus:ring-primary"
                >
                  <option value="">
                    {{ $t('home.searchCategoryPlaceholder') }}
                  </option>
                  <option
                    v-for="cat in homeData?.popularCategories || []"
                    :key="cat.id"
                    :value="cat.id"
                  >
                    {{ cat.name }}
                  </option>
                </NativeSelect>
              </div>

              <!-- Date -->
              <div class="flex-1 min-w-0">
                <label for="hero-date" class="sr-only">
                  {{ $t('home.searchDate') }}
                </label>
                <input
                  id="hero-date"
                  v-model="searchDate"
                  type="date"
                  :placeholder="$t('home.searchDatePlaceholder')"
                  class="w-full h-12 rounded-xl border-0 bg-muted/50 px-4 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <!-- Location -->
              <div class="flex-1 min-w-0">
                <input
                  id="hero-location"
                  v-model="searchLocation"
                  type="text"
                  :placeholder="$t('home.searchLocationPlaceholder')"
                  class="w-full h-12 rounded-xl border-0 bg-muted/50 px-4 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <!-- Search Button -->
              <Button
                type="submit"
                size="lg"
                class="h-12 px-8 rounded-xl text-sm font-semibold shadow-lg shadow-primary/25 shrink-0"
              >
                <SearchIcon class="size-4 mr-2" />
                {{ $t('home.searchButton') }}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>

    <div class="home-page px-4 sm:px-6 lg:px-8 mx-auto w-full max-w-7xl">
      <!-- ============================== -->
      <!-- POPULAR CATEGORIES -->
      <!-- ============================== -->
      <section
        v-if="homeData?.popularCategories?.length"
        class="py-16 lg:py-20"
      >
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-2xl sm:text-3xl font-bold">
            {{ $t('home.popularCategories') }}
          </h2>
          <NuxtLink
            to="/explore"
            class="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
          >
            {{ $t('explore.title') }}
            <ArrowRightIcon class="size-4" />
          </NuxtLink>
        </div>
        <div
          class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
        >
          <NuxtLink
            v-for="(cat, index) in homeData.popularCategories"
            :key="cat.id"
            :to="`/explore?category=${cat.id}`"
            class="group relative overflow-hidden rounded-2xl aspect-[4/3] border border-border/50 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10"
          >
            <img
              :src="getCategoryImage(cat.slug, index)"
              :alt="cat.name"
              class="absolute inset-0 w-full h-full object-cover transition-transform duration-500"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent"
            />
            <div
              class="relative z-10 flex flex-col justify-end h-full p-4 text-white"
            >
              <h3
                class="text-sm sm:text-base font-bold text-white group-hover:text-primary transition-colors line-clamp-1"
              >
                {{ cat.name }}
              </h3>
              <p class="text-xs text-white/80 font-medium mt-0.5">
                {{ $t('home.studiosCount', cat.studioCount) }}
              </p>
            </div>
          </NuxtLink>
        </div>
      </section>

      <!-- ============================== -->
      <!-- POPULAR STUDIOS -->
      <!-- ============================== -->
      <section v-if="homeData?.popularStudios?.length" class="py-16 lg:py-20">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-2xl sm:text-3xl font-bold">
            {{ $t('home.popularStudios') }}
          </h2>
          <NuxtLink
            to="/explore?type=studios"
            class="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
          >
            {{ $t('home.viewAllStudios') }}
            <ArrowRightIcon class="size-4" />
          </NuxtLink>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StudioCard
            v-for="studio in homeData.popularStudios"
            :key="studio.id"
            :studio="studio"
          />
        </div>
      </section>

      <!-- ============================== -->
      <!-- POPULAR CLASSES (Filling Up Fast) -->
      <!-- ============================== -->
      <section v-if="homeData?.popularOfferings?.length" class="py-16 lg:py-20">
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-2xl sm:text-3xl font-bold">
            {{ $t('home.popularClasses') }}
          </h2>
          <NuxtLink
            to="/explore"
            class="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
          >
            {{ $t('home.viewAllClasses') }}
            <ArrowRightIcon class="size-4" />
          </NuxtLink>
        </div>
        <p class="text-muted-foreground mb-8">
          {{ $t('home.popularClassesSubtitle') }}
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <OfferingCard
            v-for="offering in homeData.popularOfferings"
            :key="offering.id"
            :offering="offering"
          />
        </div>
      </section>

      <!-- ============================== -->
      <!-- ONLINE CLASSES -->
      <!-- ============================== -->
      <section v-if="homeData?.onlineOfferings?.length" class="py-16 lg:py-20">
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-2xl sm:text-3xl font-bold">
            {{ $t('home.onlineClasses') }}
          </h2>
          <NuxtLink
            to="/explore?online=true"
            class="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
          >
            {{ $t('home.viewAllOnline') }}
            <ArrowRightIcon class="size-4" />
          </NuxtLink>
        </div>
        <p class="text-muted-foreground mb-8">
          {{ $t('home.onlineClassesSubtitle') }}
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <OfferingCard
            v-for="offering in homeData.onlineOfferings"
            :key="offering.id"
            :offering="offering"
          />
        </div>
      </section>

      <!-- ============================== -->
      <!-- PRICING OPTIONS -->
      <!-- ============================== -->
      <section class="py-16 lg:py-20">
        <div class="text-center mb-12 max-w-2xl mx-auto">
          <h2 class="text-2xl sm:text-3xl font-bold mb-3">
            {{ $t('home.pricingTitle') }}
          </h2>
          <p class="text-muted-foreground">
            {{ $t('home.pricingSubtitle') }}
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          <!-- Drop-In -->
          <div
            class="pricing-card group relative rounded-2xl border border-border bg-card p-6 lg:p-8 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 hover:-translate-y-1 flex flex-col"
          >
            <div
              class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5"
            >
              <TicketIcon class="size-6 text-primary" />
            </div>
            <h3 class="text-xl font-bold mb-2">{{ $t('home.dropIn') }}</h3>
            <p class="text-sm text-muted-foreground mb-6">
              {{ $t('home.dropInDesc') }}
            </p>
            <ul class="space-y-3 mb-8 flex-1">
              <li class="flex items-start gap-2 text-sm">
                <CheckIcon class="size-4 text-primary mt-0.5 shrink-0" />
                <span>{{ $t('home.dropInFeature1') }}</span>
              </li>
              <li class="flex items-start gap-2 text-sm">
                <CheckIcon class="size-4 text-primary mt-0.5 shrink-0" />
                <span>{{ $t('home.dropInFeature2') }}</span>
              </li>
              <li class="flex items-start gap-2 text-sm">
                <CheckIcon class="size-4 text-primary mt-0.5 shrink-0" />
                <span>{{ $t('home.dropInFeature3') }}</span>
              </li>
            </ul>
            <NuxtLink to="/explore?pricingType=DROP_IN" as-child>
              <Button variant="outline" class="w-full">
                {{ $t('home.dropInCta') }}
              </Button>
            </NuxtLink>
          </div>

          <!-- Class Pack (featured) -->
          <div
            class="pricing-card group relative rounded-2xl border-2 border-primary bg-card p-6 lg:p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1 flex flex-col ring-1 ring-primary/20"
          >
            <div
              class="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full"
            >
              Popular
            </div>
            <div
              class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5"
            >
              <PackageIcon class="size-6 text-primary" />
            </div>
            <h3 class="text-xl font-bold mb-2">{{ $t('home.classPack') }}</h3>
            <p class="text-sm text-muted-foreground mb-6">
              {{ $t('home.classPackDesc') }}
            </p>
            <ul class="space-y-3 mb-8 flex-1">
              <li class="flex items-start gap-2 text-sm">
                <CheckIcon class="size-4 text-primary mt-0.5 shrink-0" />
                <span>{{ $t('home.classPackFeature1') }}</span>
              </li>
              <li class="flex items-start gap-2 text-sm">
                <CheckIcon class="size-4 text-primary mt-0.5 shrink-0" />
                <span>{{ $t('home.classPackFeature2') }}</span>
              </li>
              <li class="flex items-start gap-2 text-sm">
                <CheckIcon class="size-4 text-primary mt-0.5 shrink-0" />
                <span>{{ $t('home.classPackFeature3') }}</span>
              </li>
            </ul>
            <NuxtLink to="/explore?pricingType=PACK" as-child>
              <Button class="w-full">
                {{ $t('home.classPackCta') }}
              </Button>
            </NuxtLink>
          </div>

          <!-- Membership -->
          <div
            class="pricing-card group relative rounded-2xl border border-border bg-card p-6 lg:p-8 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 hover:-translate-y-1 flex flex-col"
          >
            <div
              class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5"
            >
              <CrownIcon class="size-6 text-primary" />
            </div>
            <h3 class="text-xl font-bold mb-2">{{ $t('home.membership') }}</h3>
            <p class="text-sm text-muted-foreground mb-6">
              {{ $t('home.membershipDesc') }}
            </p>
            <ul class="space-y-3 mb-8 flex-1">
              <li class="flex items-start gap-2 text-sm">
                <CheckIcon class="size-4 text-primary mt-0.5 shrink-0" />
                <span>{{ $t('home.membershipFeature1') }}</span>
              </li>
              <li class="flex items-start gap-2 text-sm">
                <CheckIcon class="size-4 text-primary mt-0.5 shrink-0" />
                <span>{{ $t('home.membershipFeature2') }}</span>
              </li>
              <li class="flex items-start gap-2 text-sm">
                <CheckIcon class="size-4 text-primary mt-0.5 shrink-0" />
                <span>{{ $t('home.membershipFeature3') }}</span>
              </li>
            </ul>
            <NuxtLink to="/explore?pricingType=MEMBERSHIP" as-child>
              <Button variant="outline" class="w-full">
                {{ $t('home.membershipCta') }}
              </Button>
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- ============================== -->
      <!-- HOW BOOKING WORKS -->
      <!-- ============================== -->
      <section class="py-16 lg:py-20">
        <div class="text-center mb-12 max-w-2xl mx-auto">
          <h2 class="text-2xl sm:text-3xl font-bold mb-3">
            {{ $t('home.howItWorksTitle') }}
          </h2>
          <p class="text-muted-foreground">
            {{ $t('home.howItWorksSubtitle') }}
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div
            v-for="(step, index) in bookingSteps"
            :key="index"
            class="relative text-center group"
          >
            <!-- Connector line (desktop) -->
            <div
              v-if="index < bookingSteps.length - 1"
              class="hidden lg:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/30 to-primary/10"
            />

            <div
              class="relative z-10 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 mb-4 group-hover:scale-110 transition-transform duration-300"
            >
              <component :is="step.icon" class="size-7 text-primary" />
            </div>
            <div
              class="text-xs font-bold text-primary mb-2 uppercase tracking-wider"
            >
              Step {{ index + 1 }}
            </div>
            <h3 class="text-lg font-bold mb-2">{{ step.title }}</h3>
            <p class="text-sm text-muted-foreground">{{ step.desc }}</p>
          </div>
        </div>
      </section>

      <!-- ============================== -->
      <!-- B2B SECTION -->
      <!-- ============================== -->
      <section class="py-16 lg:py-20 -mx-4 sm:-mx-6 lg:-mx-8">
        <div
          class="relative overflow-hidden rounded-3xl mx-4 sm:mx-6 lg:mx-8 bg-linear-to-br from-foreground to-foreground/90 dark:from-card dark:to-card/90 dark:border dark:border-border"
        >
          <!-- Decorative elements -->
          <div
            class="absolute top-0 right-0 w-72 h-72 rounded-full bg-primary/10 blur-3xl"
          />
          <div
            class="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-accent/10 blur-3xl"
          />

          <div
            class="relative z-10 px-6 sm:px-12 lg:px-16 py-12 lg:py-16 flex flex-col lg:flex-row items-center gap-10 lg:gap-16"
          >
            <div class="flex-1 space-y-6 text-center lg:text-left">
              <h2
                class="text-3xl sm:text-4xl font-bold text-background dark:text-foreground"
              >
                {{ $t('home.b2bTitle') }}
              </h2>
              <p class="text-lg text-background/70 dark:text-muted-foreground">
                {{ $t('home.b2bSubtitle') }}
              </p>
              <ul class="space-y-3 inline-block text-left">
                <li
                  v-for="(feature, i) in b2bFeatures"
                  :key="i"
                  class="flex items-center gap-3 text-sm text-background/80 dark:text-foreground/80"
                >
                  <div
                    class="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0"
                  >
                    <CheckIcon class="size-3.5 text-primary" />
                  </div>
                  {{ feature }}
                </li>
              </ul>
              <div class="pt-2">
                <NuxtLink to="/register" as-child>
                  <Button
                    size="lg"
                    class="px-8 rounded-xl shadow-lg shadow-primary/30 text-base"
                  >
                    <BuildingIcon class="size-5 mr-2" />
                    {{ $t('home.b2bCta') }}
                  </Button>
                </NuxtLink>
              </div>
            </div>

            <!-- Decorative illustration side -->
            <div class="flex-shrink-0 w-64 h-64 lg:w-80 lg:h-80 relative">
              <div
                class="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-sm border border-background/10 dark:border-border/30 flex items-center justify-center"
              >
                <NuxtImg
                  src="/img/logoBg.svg"
                  alt="Yogi for Business"
                  class="w-32 h-32 opacity-40"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  SearchIcon,
  ArrowRightIcon,
  CheckIcon,
  TicketIcon,
  PackageIcon,
  CrownIcon,
  CompassIcon,
  MousePointerClickIcon,
  CreditCardIcon,
  SparklesIcon,
  BuildingIcon
} from '@lucide/vue'
import OfferingCard from '~/entities/offering/ui/Card.vue'
import StudioCard from '~/entities/studio/ui/Card.vue'

usePageSeo('home')

// Search state
const searchCategory = ref('')
const searchDate = ref('')
const searchLocation = ref('')

// Fetch home data
const { data: homeDataRaw } = await useFetch('/api/home-data')
const homeData = computed(() => homeDataRaw.value?.data || null)

const localePath = useLocalePath()

// Handle search
const handleSearch = () => {
  const params = new URLSearchParams()
  if (searchCategory.value) params.set('category', searchCategory.value)
  if (searchDate.value) params.set('date', searchDate.value)
  if (searchLocation.value) params.set('city', searchLocation.value)
  return navigateTo(localePath(`/explore?${params.toString()}`))
}

// Booking steps
const { t } = useI18n()
const bookingSteps = computed(() => [
  { icon: CompassIcon, title: t('home.step1Title'), desc: t('home.step1Desc') },
  {
    icon: MousePointerClickIcon,
    title: t('home.step2Title'),
    desc: t('home.step2Desc')
  },
  {
    icon: CreditCardIcon,
    title: t('home.step3Title'),
    desc: t('home.step3Desc')
  },
  { icon: SparklesIcon, title: t('home.step4Title'), desc: t('home.step4Desc') }
])

// B2B features
const b2bFeatures = computed(() => [
  t('home.b2bFeature1'),
  t('home.b2bFeature2'),
  t('home.b2bFeature3'),
  t('home.b2bFeature4')
])

// Category images
const categoryImageMap: Record<string, string> = {
  yoga: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&auto=format&fit=crop&q=80',
  meditation:
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&auto=format&fit=crop&q=80',
  pilates:
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&auto=format&fit=crop&q=80',
  fitness:
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=80',
  sound:
    'https://images.unsplash.com/photo-1511295742362-92c96b124e52?w=500&auto=format&fit=crop&q=80',
  crossfit:
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=80',
  dancing:
    'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=80',
  breathwork:
    'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=500&auto=format&fit=crop&q=80'
}

const defaultCategoryImages = [
  'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=500&auto=format&fit=crop&q=80'
]

function getCategoryImage(slug?: string, index = 0) {
  if (slug && categoryImageMap[slug.toLowerCase()]) {
    return categoryImageMap[slug.toLowerCase()]
  }
  return defaultCategoryImages[index % defaultCategoryImages.length]
}
</script>
