<script setup lang="ts">
import { PlusIcon } from '@lucide/vue'
import { toast } from 'vue-sonner'
import MembersDataTable from '~/widgets/Studio/members-data-table.vue'
import { userRoles } from '~~/server/auth/config'

definePageMeta({
  title: 'Team Management',
  breadcrumbs: [{ name: 'Businesses', url: '/business' }, { name: 'Team' }]
})

const route = useRoute()
const slug = route.params.slug as string

const form = ref({
  name: '',
  email: '',
  role: userRoles.PRACTITIONER
})

const isSubmitting = ref(false)
const membersTableRef = ref<{ refresh: () => Promise<void> | void } | null>(
  null
)

const addTeamMember = async () => {
  if (!form.value.email || !form.value.name) return
  isSubmitting.value = true

  try {
    await $fetch(`/api/business/studios/${slug}/members`, {
      method: 'POST',
      body: form.value
    })

    form.value.name = ''
    form.value.email = ''
    isSheetOpen.value = false
    await membersTableRef.value?.refresh()
  } catch (error) {
    toast.error((error as Error).message || 'Error adding team member')
  } finally {
    isSubmitting.value = false
  }
}

const isSheetOpen = ref(false)

useHead({
  title: () => `${slug || 'Studio'} - Team Management`
})
</script>

<template>
  <div class="">
    <h1 class="text-2xl font-bold mb-6">Studio members</h1>

    <Sheet v-model:open="isSheetOpen">
      <SheetTrigger as-child>
        <Button class="w-full sm:w-auto">
          <PlusIcon class="size-4" />
          Invite Team Member
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add Team Member</SheetTitle>
          <SheetDescription>
            Fill in the details for the new team member.
          </SheetDescription>
        </SheetHeader>
        <form class="flex flex-col gap-4 px-4" @submit.prevent="addTeamMember">
          <div class="flex-1">
            <label class="block text-sm font-medium mb-1">Name</label>
            <Input
              v-model="form.name"
              type="text"
              class="w-full"
              placeholder="John Doe"
              required
            />
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium mb-1">Email</label>
            <Input
              v-model="form.email"
              type="email"
              class="w-full"
              placeholder="john@example.com"
              required
            />
          </div>
          <div class="w-40">
            <label class="block text-sm font-medium mb-1">Role</label>
            <div class="*:w-full">
              <NativeSelect v-model="form.role">
                <NativeSelectOption :value="userRoles.PRACTITIONER">
                  Trainer
                </NativeSelectOption>
                <NativeSelectOption :value="userRoles.MANAGER">
                  Manager
                </NativeSelectOption>
              </NativeSelect>
            </div>
          </div>
          <Button type="submit" :disabled="isSubmitting">
            <Spinner v-if="isSubmitting" class="animate-spin" />
            Add Member
          </Button>
        </form>
      </SheetContent>
    </Sheet>

    <members-data-table ref="membersTableRef" />
  </div>
</template>
