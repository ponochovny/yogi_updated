<script setup lang="ts">
import { PlusIcon } from '@lucide/vue'
import { toast } from 'vue-sonner'
import { userRoles } from '~~/server/auth/config'

const props = defineProps<{ slug: string }>()
const emit = defineEmits<{ invited: [] }>()

const isOpen = ref(false)
const isSubmitting = ref(false)
const form = ref({
  name: '',
  email: '',
  role: userRoles.PRACTITIONER,
  bio: '',
  salaryActive: true
})

const reset = () => {
  form.value = {
    name: '',
    email: '',
    role: userRoles.PRACTITIONER,
    bio: '',
    salaryActive: true
  }
}

const invite = async () => {
  isSubmitting.value = true
  try {
    const response = await $fetch<{ invitationSent: boolean }>(
      `/api/business/studios/${props.slug}/members`,
      {
        method: 'POST',
        body: form.value
      }
    )
    toast[response.invitationSent ? 'success' : 'warning'](
      response.invitationSent ? 'Invitation sent' : 'Member added',
      {
        description: response.invitationSent
          ? `${form.value.name} will receive a link to activate their account.`
          : 'The member was added, but the activation email could not be sent. Use Resend invite from the table.'
      }
    )
    isOpen.value = false
    reset()
    emit('invited')
  } catch (error) {
    toast.error(
      (error as { data?: { message?: string } }).data?.message ||
        'Unable to send invitation'
    )
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <Sheet v-model:open="isOpen">
    <SheetTrigger as-child>
      <Button>
        <PlusIcon class="size-4" />
        Invite practitioner
      </Button>
    </SheetTrigger>
    <SheetContent>
      <SheetHeader>
        <SheetTitle>Invite a practitioner</SheetTitle>
        <SheetDescription>
          We will create a team profile and email a secure link to set a
          password.
        </SheetDescription>
      </SheetHeader>
      <form class="flex flex-col gap-4 px-4" @submit.prevent="invite">
        <div>
          <label class="mb-1 block text-sm font-medium" for="invite-name"
            >Name</label
          >
          <Input
            id="invite-name"
            v-model="form.name"
            required
            placeholder="Jane Doe"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium" for="invite-email"
            >Email</label
          >
          <Input
            id="invite-email"
            v-model="form.email"
            required
            type="email"
            placeholder="jane@example.com"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium" for="invite-role"
            >Role</label
          >
          <NativeSelect id="invite-role" v-model="form.role" class="w-full">
            <NativeSelectOption :value="userRoles.PRACTITIONER">
              Practitioner
            </NativeSelectOption>
            <NativeSelectOption :value="userRoles.MANAGER">
              Manager
            </NativeSelectOption>
          </NativeSelect>
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium" for="invite-bio"
            >Bio (optional)</label
          >
          <Textarea
            id="invite-bio"
            v-model="form.bio"
            maxlength="500"
            placeholder="Short profile bio"
          />
        </div>
        <Button type="submit" :disabled="isSubmitting">
          <Spinner v-if="isSubmitting" class="animate-spin" />
          Send invitation
        </Button>
      </form>
    </SheetContent>
  </Sheet>
</template>
