<script lang="ts" setup>
import {
  MenuIcon,
  XIcon,
  GlobeIcon,
  CoinsIcon,
  ChevronDownIcon,
  CompassIcon,
  LogOutIcon,
  CalendarIcon,
  UserCircle2Icon,
  Building2Icon
} from '@lucide/vue'
import { signOut, useSession } from '@/utils/auth-client'
import Darkmodetoggle from '~/features/darkmodetoggle.vue'
import {
  getUserAvatarUrl,
  getUserDisplayName,
  getUserInitials
} from '~/utils/profile-menu'

const session = useSession()
const { locale, locales, setLocale } = useI18n()
const { currency, currencySymbol, currencies, setCurrency } = useCurrency()
const mobileMenuOpen = ref(false)
const scrolled = ref(false)

const currentUser = computed(() => session.value?.data?.user || null)
const currentUserName = computed(() =>
  getUserDisplayName({
    name: currentUser.value?.name,
    email: currentUser.value?.email
  })
)
const currentUserInitials = computed(() =>
  getUserInitials(currentUser.value?.name, currentUser.value?.email)
)
const currentUserAvatar = computed(() =>
  getUserAvatarUrl(currentUser.value?.image)
)

const signOutHandler = async () => {
  mobileMenuOpen.value = false
  await signOut()
  await navigateTo('/')
}

const goToProfile = () => {
  mobileMenuOpen.value = false
  navigateTo('/profile')
}

const goToBookings = () => {
  mobileMenuOpen.value = false
  navigateTo('/my-bookings')
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
        <div class="flex items-center gap-6">
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

          <!-- Desktop Navigation -->
          <nav class="hidden md:flex items-center gap-1">
            <NuxtLinkLocale
              to="/explore"
              class="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2 px-3 rounded-xl hover:bg-muted/50"
              active-class="text-primary font-semibold bg-primary/10"
            >
              <CompassIcon class="size-4" />
              {{ $t('header.explore') }}
            </NuxtLinkLocale>
            <NuxtLinkLocale
              to="/for-business"
              class="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2 px-3 rounded-xl hover:bg-muted/50"
              active-class="text-primary font-semibold bg-primary/10 hover:bg-primary/10 hover:text-primary"
            >
              <Building2Icon class="size-4" />
              For Business
            </NuxtLinkLocale>
          </nav>
        </div>

        <!-- Desktop Controls -->
        <div class="hidden md:flex items-center gap-1.5">
          <!-- Language Switcher -->
          <DropdownMenu :modal="false">
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
          <DropdownMenu :modal="false">
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
            <DropdownMenu :modal="false">
              <DropdownMenuTrigger as-child>
                <Button
                  variant="ghost"
                  size="sm"
                  class="gap-2.5 rounded-xl px-2.5 py-1.5 hover:bg-muted/70"
                >
                  <Avatar class="h-8 w-8 rounded-full border border-border/80">
                    <AvatarImage
                      :src="currentUserAvatar"
                      :alt="currentUserName"
                    />
                    <AvatarFallback
                      class="rounded-full bg-primary/10 text-primary text-[10px] font-semibold"
                    >
                      {{ currentUserInitials }}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    class="flex flex-col items-start text-left leading-none"
                  >
                    <span class="text-sm font-medium">{{
                      currentUserName
                    }}</span>
                    <span
                      class="text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
                    >
                      {{ $t('header.profile') }}
                    </span>
                  </span>
                  <ChevronDownIcon class="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" class="w-64 p-2">
                <div class="flex items-center gap-3 rounded-lg bg-muted/50 p-2">
                  <Avatar class="h-9 w-9 rounded-full">
                    <AvatarImage
                      :src="currentUserAvatar"
                      :alt="currentUserName"
                    />
                    <AvatarFallback
                      class="rounded-full bg-primary/10 text-primary text-xs font-semibold"
                    >
                      {{ currentUserInitials }}
                    </AvatarFallback>
                  </Avatar>
                  <div class="min-w-0">
                    <p class="truncate text-sm font-medium">
                      {{ currentUserName }}
                    </p>
                    <p class="truncate text-xs text-muted-foreground">
                      {{ currentUser?.email || 'Profile' }}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator class="my-2" />
                <DropdownMenuItem class="gap-2" @click="goToProfile">
                  <UserCircle2Icon class="size-4" />
                  <span>{{ $t('header.profile') }}</span>
                </DropdownMenuItem>
                <DropdownMenuItem class="gap-2" @click="goToBookings">
                  <CalendarIcon class="size-4" />
                  <span>My bookings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator class="my-2" />
                <DropdownMenuItem
                  variant="destructive"
                  class="gap-2 text-destructive focus:text-destructive"
                  @click="signOutHandler"
                >
                  <LogOutIcon class="size-4" />
                  <span>{{ $t('header.signout') }}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                  <!-- Navigation -->
                  <div class="space-y-1">
                    <NuxtLinkLocale
                      to="/explore"
                      class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-muted transition-colors"
                      active-class="bg-primary/10 text-primary font-semibold"
                      @click="mobileMenuOpen = false"
                    >
                      <CompassIcon class="size-4 text-primary" />
                      {{ $t('header.explore') }}
                    </NuxtLinkLocale>
                    <NuxtLinkLocale
                      to="/for-business"
                      class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-muted transition-colors"
                      active-class="bg-primary/10 text-primary font-semibold"
                      @click="mobileMenuOpen = false"
                    >
                      <Building2Icon class="size-4 text-primary" />
                      {{ $t('header.forBusiness') }}
                    </NuxtLinkLocale>
                  </div>

                  <Separator />

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
                      <div
                        class="rounded-xl border border-border bg-muted/30 p-2"
                      >
                        <div class="flex items-center gap-3">
                          <Avatar class="h-10 w-10 rounded-full">
                            <AvatarImage
                              :src="currentUserAvatar"
                              :alt="currentUserName"
                            />
                            <AvatarFallback
                              class="rounded-full bg-primary/10 text-primary text-xs font-semibold"
                            >
                              {{ currentUserInitials }}
                            </AvatarFallback>
                          </Avatar>
                          <div class="min-w-0 flex-1">
                            <p class="truncate text-sm font-medium">
                              {{ currentUserName }}
                            </p>
                            <p class="truncate text-xs text-muted-foreground">
                              {{ currentUser?.email || 'Profile' }}
                            </p>
                          </div>
                        </div>
                        <div class="mt-3 space-y-2">
                          <Button
                            variant="outline"
                            class="w-full justify-start gap-2"
                            @click="goToProfile"
                          >
                            <UserCircle2Icon class="size-4" />
                            {{ $t('header.profile') }}
                          </Button>
                          <Button
                            variant="outline"
                            class="w-full justify-start gap-2"
                            @click="goToBookings"
                          >
                            <CalendarIcon class="size-4" />
                            My bookings
                          </Button>
                          <Button
                            variant="destructive"
                            class="w-full justify-start gap-2"
                            @click="signOutHandler"
                          >
                            <LogOutIcon class="size-4" />
                            {{ $t('header.signout') }}
                          </Button>
                        </div>
                      </div>
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
