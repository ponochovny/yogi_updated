<script lang="ts" setup>
import { HeartIcon } from '@lucide/vue'
</script>

<template>
  <footer
    class="relative mt-20 border-t border-border bg-card/50 backdrop-blur-sm"
  >
    <!-- Main Footer Content -->
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8"
      >
        <!-- Brand Column -->
        <div class="sm:col-span-2 lg:col-span-1 space-y-4">
          <NuxtLinkLocale to="/" class="inline-block">
            <NuxtImg
              src="/img/logoBg.svg"
              width="56"
              height="56"
              alt="Yogi App"
              class="h-14 w-14"
            />
          </NuxtLinkLocale>
          <p class="text-sm text-muted-foreground leading-relaxed max-w-xs">
            {{ $t('footer.tagline') }}
          </p>
        </div>

        <!-- Quick Links -->
        <div class="space-y-4">
          <h3
            class="text-sm font-semibold uppercase tracking-wider text-foreground"
          >
            {{ $t('footer.explore') }}
          </h3>
          <ul class="space-y-2.5">
            <li>
              <NuxtLinkLocale
                to="/"
                class="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                {{ $t('footer.home') }}
              </NuxtLinkLocale>
            </li>
            <li>
              <NuxtLinkLocale
                to="/explore"
                class="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                {{ $t('header.explore') }}
              </NuxtLinkLocale>
            </li>
            <li>
              <NuxtLinkLocale
                to="/studios"
                class="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                {{ $t('footer.studios') }}
              </NuxtLinkLocale>
            </li>
            <li>
              <NuxtLinkLocale
                to="/offerings"
                class="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                {{ $t('footer.offerings') }}
              </NuxtLinkLocale>
            </li>
            <li>
              <NuxtLinkLocale
                to="/causes"
                class="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                {{ $t('footer.causes') }}
              </NuxtLinkLocale>
            </li>
          </ul>
        </div>

        <!-- Legal Links -->
        <div class="space-y-4">
          <h3
            class="text-sm font-semibold uppercase tracking-wider text-foreground"
          >
            {{ $t('footer.legal') }}
          </h3>
          <ul class="space-y-2.5">
            <li>
              <NuxtLinkLocale
                to="/terms-of-service"
                class="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                {{ $t('footer.terms') }}
              </NuxtLinkLocale>
            </li>
            <li>
              <NuxtLinkLocale
                to="/membership-promo"
                class="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                {{ $t('footer.membership') }}
              </NuxtLinkLocale>
            </li>
          </ul>
        </div>

        <!-- Payment Methods -->
        <div class="space-y-4">
          <h3
            class="text-sm font-semibold uppercase tracking-wider text-foreground"
          >
            {{ $t('footer.weAccept') }}
          </h3>
          <div class="grid grid-cols-2 gap-2.5">
            <!-- Stripe -->
            <div
              class="flex items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-2.5 transition-colors hover:border-primary/30"
            >
              <div
                class="flex h-7 w-7 items-center justify-center rounded-md bg-[#635bff]/10"
              >
                <svg
                  class="h-4 w-4 text-[#635bff]"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"
                  />
                </svg>
              </div>
              <span class="text-xs font-medium text-foreground">Stripe</span>
            </div>

            <!-- Apple Pay -->
            <div
              class="flex items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-2.5 transition-colors hover:border-primary/30"
            >
              <div
                class="flex h-7 w-7 items-center justify-center rounded-md bg-foreground/5"
              >
                <svg
                  class="h-4 w-4 text-foreground"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    d="M7.078 23.55c-.473-.316-.893-.703-1.244-1.15-.383-.463-.738-.95-1.064-1.454-.766-1.12-1.365-2.345-1.78-3.636-.5-1.502-.743-2.94-.743-4.347 0-1.57.34-2.94 1.002-4.09.49-.9 1.22-1.653 2.1-2.182.85-.53 1.84-.82 2.84-.84.35 0 .73.05 1.13.15.29.08.64.21 1.07.37.55.21.85.34.95.37.32.12.59.17.8.17.16 0 .39-.05.645-.13.145-.05.42-.14.81-.31.386-.14.692-.26.935-.35.37-.11.728-.21 1.05-.26.39-.06.777-.02 1.16.1.67.22 1.22.59 1.64 1.08-.59.36-1.076.81-1.45 1.44-.37.63-.54 1.33-.5 2.09.04.85.32 1.58.84 2.17.247.283.543.522.876.71.167.097.33.18.505.25-.12.36-.27.71-.45 1.06-.45.88-1.03 1.73-1.74 2.54-.56.64-1.12 1.07-1.68 1.28-.56.22-1.15.19-1.77-.06-.44-.18-.9-.32-1.37-.43-.48-.12-.95-.14-1.43-.07-.44.07-.87.21-1.28.42-.44.22-.85.47-1.22.74l-.02.01zm8.33-21.98c-.1.04-.26.12-.47.23-.37.2-.73.46-1.05.78-.37.36-.67.75-.9 1.18-.26.48-.39.97-.38 1.48 0 .08.01.16.02.24l.02.14c.41.01.81-.06 1.19-.2.38-.15.73-.37 1.03-.65.31-.28.56-.61.74-.97.21-.42.33-.84.36-1.27 0-.07 0-.14-.01-.21l-.01-.09c-.06-.01-.15-.01-.27-.01-.12 0-.24.02-.36.05l.09-.04z"
                  />
                </svg>
              </div>
              <span class="text-xs font-medium text-foreground">Apple Pay</span>
            </div>

            <!-- M-Pesa -->
            <div
              class="flex items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-2.5 transition-colors hover:border-primary/30"
            >
              <div
                class="flex h-7 w-7 items-center justify-center rounded-md bg-[#4caf50]/10"
              >
                <svg
                  class="h-4 w-4 text-[#4caf50]"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6zm4 4h-2v-2h2v2zm0-4h-2V7h2v6z"
                  />
                </svg>
              </div>
              <span class="text-xs font-medium text-foreground">M-Pesa</span>
            </div>

            <!-- Cash -->
            <div
              class="flex items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-2.5 transition-colors hover:border-primary/30"
            >
              <div
                class="flex h-7 w-7 items-center justify-center rounded-md bg-[#f59e0b]/10"
              >
                <svg
                  class="h-4 w-4 text-[#f59e0b]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <span class="text-xs font-medium text-foreground">{{
                $t('footer.cash')
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="border-t border-border">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
        <div
          class="flex flex-col sm:flex-row items-center justify-between gap-3"
        >
          <p class="text-xs text-muted-foreground flex items-center gap-1">
            © {{ new Date().getFullYear() }} Yogi App. {{ $t('footer.rights') }}
            <span class="inline-flex items-center gap-0.5">
              — {{ $t('footer.madeWith') }}
              <HeartIcon class="h-3 w-3 text-primary fill-primary" />
            </span>
          </p>
          <div class="flex items-center gap-4">
            <NuxtLinkLocale
              to="/terms-of-service"
              class="text-xs text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              {{ $t('footer.terms') }}
            </NuxtLinkLocale>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>
