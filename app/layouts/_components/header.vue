<script lang="ts" setup>
import {
  MenuIcon,
  XIcon,
  GlobeIcon,
  CoinsIcon,
  ChevronDownIcon
} from '@lucide/vue'
import { signOut, useSession } from '@/utils/auth-client'
import Darkmodetoggle from '~/features/darkmodetoggle.vue'

const session = useSession()
const { locale, locales, setLocale } = useI18n()
const { currency, currencySymbol, currencies, setCurrency } = useCurrency()
const mobileMenuOpen = ref(false)
const scrolled = ref(false)

const signOutHandler = async () => {
  mobileMenuOpen.value = false
  await signOut()
  await navigateTo('/')
}

const currentLocaleName = computed(() => {
  const found = locales.value.find(
    (l: { code: string }) => l.code === locale.value
  )
  return found && typeof found !== 'string' ? found.name : locale.value
})

function handleSetLocale(code: string) {
  setLocale(code as 'en' | 'fil')
}

// Track scroll for header shadow
if (import.meta.client) {
  const onScroll = () => {
    scrolled.value = window.scrollY > 10
  }
  onMounted(() =>
    window.addEventListener('scroll', onScroll, { passive: true })
  )
  onUnmounted(() => window.removeEventListener('scroll', onScroll))
}
</script>

<template>
  <header
    class="fixed left-0 top-0 w-full z-50 transition-all duration-300"
    :class="[
      scrolled
        ? 'bg-background/80 backdrop-blur-xl shadow-lg border-b border-border/50'
        : 'bg-background/60 backdrop-blur-md border-b border-transparent'
    ]"
  >
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center justify-between gap-4">
        <!-- Logo -->
        <NuxtLinkLocale
          to="/"
          class="shrink-0 transition-opacity hover:opacity-80"
        >
          <NuxtImg
            src="/img/logoBg.svg"
            width="48"
            height="48"
            alt="Yogi App"
            class="h-12 w-12"
          />
        </NuxtLinkLocale>

        <!-- Desktop Controls -->
        <div class="hidden md:flex items-center gap-1.5">
          <!-- Language Switcher -->
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button
                variant="ghost"
                size="sm"
                class="gap-1.5 text-sm font-medium"
              >
                <GlobeIcon class="h-4 w-4" />
                <span class="hidden lg:inline">{{ currentLocaleName }}</span>
                <span class="lg:hidden">{{ locale.toUpperCase() }}</span>
                <ChevronDownIcon class="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="min-w-[140px]">
              <DropdownMenuLabel class="text-xs text-muted-foreground">
                {{ $t('header.language') }}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                v-for="loc in locales"
                :key="typeof loc === 'string' ? loc : loc.code"
                class="cursor-pointer"
                :class="{
                  'bg-accent/50':
                    locale === (typeof loc === 'string' ? loc : loc.code)
                }"
                @click="
                  handleSetLocale(typeof loc === 'string' ? loc : loc.code)
                "
              >
                {{ typeof loc === 'string' ? loc : loc.name }}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <!-- Currency Switcher -->
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button
                variant="ghost"
                size="sm"
                class="gap-1.5 text-sm font-medium"
              >
                <CoinsIcon class="h-4 w-4" />
                <span>{{ currencySymbol }} {{ currency }}</span>
                <ChevronDownIcon class="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="min-w-[160px]">
              <DropdownMenuLabel class="text-xs text-muted-foreground">
                {{ $t('header.currency') }}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                v-for="cur in currencies"
                :key="cur.code"
                class="cursor-pointer justify-between"
                :class="{ 'bg-accent/50': currency === cur.code }"
                @click="setCurrency(cur.code)"
              >
                <span>{{ cur.symbol }} {{ cur.name }}</span>
                <span class="text-xs text-muted-foreground">{{
                  cur.code
                }}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <!-- Separator -->
          <Separator orientation="vertical" class="h-6 mx-1" />

          <!-- Theme Toggle -->
          <Darkmodetoggle />

          <!-- Separator -->
          <Separator orientation="vertical" class="h-6 mx-1" />

          <!-- Auth Buttons -->
          <template v-if="session.isPending">
            <div class="h-9 w-20 rounded-md bg-muted animate-pulse" />
          </template>
          <template v-else-if="!session.data?.user">
            <NuxtLink to="/login" as-child>
              <Button variant="ghost" size="sm">{{
                $t('header.login')
              }}</Button>
            </NuxtLink>
            <NuxtLink to="/register" as-child>
              <Button
                size="sm"
                class="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {{ $t('header.signup') }}
              </Button>
            </NuxtLink>
          </template>
          <template v-else>
            <Button
              variant="ghost"
              size="sm"
              @click="$router.push('/profile/settings')"
            >
              {{ $t('header.profile') }}
            </Button>
            <Button variant="outline" size="sm" @click="signOutHandler">
              {{ $t('header.signout') }}
            </Button>
          </template>
        </div>

        <!-- Mobile Menu Trigger -->
        <div class="flex md:hidden items-center gap-2">
          <Darkmodetoggle />
          <Sheet v-model:open="mobileMenuOpen">
            <SheetTrigger as-child>
              <Button variant="ghost" size="icon" class="h-9 w-9">
                <MenuIcon class="h-5 w-5" />
                <span class="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" class="w-[300px] sm:w-[360px] p-0">
              <div class="flex flex-col h-full">
                <!-- Mobile Header -->
                <div
                  class="flex items-center justify-between p-4 border-b border-border"
                >
                  <NuxtLinkLocale to="/" @click="mobileMenuOpen = false">
                    <NuxtImg
                      src="/img/logoBg.svg"
                      width="40"
                      height="40"
                      alt="Yogi App"
                      class="h-10 w-10"
                    />
                  </NuxtLinkLocale>
                  <Button
                    variant="ghost"
                    size="icon"
                    class="h-8 w-8"
                    @click="mobileMenuOpen = false"
                  >
                    <XIcon class="h-4 w-4" />
                  </Button>
                </div>

                <!-- Mobile Menu Content -->
                <div class="flex-1 overflow-y-auto p-4 space-y-6">
                  <!-- Language -->
                  <div class="space-y-2">
                    <p
                      class="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      {{ $t('header.language') }}
                    </p>
                    <div class="flex gap-2">
                      <Button
                        v-for="loc in locales"
                        :key="typeof loc === 'string' ? loc : loc.code"
                        :variant="
                          locale === (typeof loc === 'string' ? loc : loc.code)
                            ? 'default'
                            : 'outline'
                        "
                        size="sm"
                        class="flex-1"
                        @click="
                          handleSetLocale(
                            typeof loc === 'string' ? loc : loc.code
                          )
                        "
                      >
                        {{ typeof loc === 'string' ? loc : loc.name }}
                      </Button>
                    </div>
                  </div>

                  <!-- Currency -->
                  <div class="space-y-2">
                    <p
                      class="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      {{ $t('header.currency') }}
                    </p>
                    <div class="flex gap-2">
                      <Button
                        v-for="cur in currencies"
                        :key="cur.code"
                        :variant="currency === cur.code ? 'default' : 'outline'"
                        size="sm"
                        class="flex-1"
                        @click="setCurrency(cur.code)"
                      >
                        {{ cur.symbol }} {{ cur.code }}
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <!-- Auth Section -->
                  <div class="space-y-2">
                    <template v-if="session.isPending">
                      <div
                        class="h-10 w-full rounded-md bg-muted animate-pulse"
                      />
                    </template>
                    <template v-else-if="!session.data?.user">
                      <NuxtLink to="/register" as-child>
                        <Button class="w-full" @click="mobileMenuOpen = false">
                          {{ $t('header.signup') }}
                        </Button>
                      </NuxtLink>
                      <NuxtLink to="/login" as-child>
                        <Button
                          variant="outline"
                          class="w-full"
                          @click="mobileMenuOpen = false"
                        >
                          {{ $t('header.login') }}
                        </Button>
                      </NuxtLink>
                    </template>
                    <template v-else>
                      <Button
                        variant="outline"
                        class="w-full"
                        @click="
                          $router.push('/profile/settings')
                          mobileMenuOpen = false
                        "
                      >
                        {{ $t('header.profile') }}
                      </Button>
                      <Button
                        variant="secondary"
                        class="w-full"
                        @click="signOutHandler"
                      >
                        {{ $t('header.signout') }}
                      </Button>
                    </template>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  </header>
</template>
