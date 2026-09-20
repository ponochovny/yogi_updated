<script setup lang="ts">
import { toast } from 'vue-sonner'

const props = defineProps<{
  studioId: string
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  accepted: []
}>()

const pending = ref(false)
const waiver = ref<{ name: string; text: string; version: number } | null>(null)
const accepted = ref(false)

const reset = () => {
  waiver.value = null
  accepted.value = false
}

const loadWaiver = async () => {
  try {
    const response = await $fetch<{
      studio: { name: string; waiver: string | null; version: number }
    }>(`/api/waivers/${props.studioId}`)
    if (response.studio.waiver) {
      waiver.value = {
        name: response.studio.name,
        text: response.studio.waiver,
        version: response.studio.version
      }
    }
  } catch {
    toast.error('Unable to load the studio waiver')
    emit('update:open', false)
  }
}

watch(
  () => props.open,
  async open => {
    if (!open) {
      reset()
      return
    }
    if (!waiver.value) await loadWaiver()
  },
  { immediate: true }
)

const close = () => {
  reset()
  emit('update:open', false)
}

const updateOpen = (value: boolean) => {
  if (!value) reset()
  emit('update:open', value)
}

const confirm = async () => {
  if (!waiver.value || !accepted.value) return
  pending.value = true
  try {
    await $fetch(`/api/waivers/${props.studioId}`, {
      method: 'POST',
      body: { version: waiver.value.version }
    })
    close()
    emit('accepted')
  } catch (error) {
    const statusCode = (error as { statusCode?: number }).statusCode
    if (statusCode === 409) {
      reset()
      await loadWaiver()
    }
    toast.error(
      (error as { data?: { message?: string } }).data?.message ||
        'Unable to save consent'
    )
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="updateOpen">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Health and safety waiver</DialogTitle>
        <DialogDescription>
          Please review and accept {{ waiver?.name }}'s current waiver before
          your first booking.
        </DialogDescription>
      </DialogHeader>
      <div
        class="max-h-64 overflow-y-auto rounded-md border p-4 text-sm whitespace-pre-wrap"
      >
        {{ waiver?.text }}
      </div>
      <label class="flex items-start gap-3 text-sm">
        <Checkbox v-model:checked="accepted" class="mt-0.5" />
        <span>I have read and agree to this waiver.</span>
      </label>
      <DialogFooter>
        <Button variant="outline" :disabled="pending" @click="close">
          Cancel
        </Button>
        <Button :disabled="pending || !accepted" @click="confirm">
          <Spinner v-if="pending" class="animate-spin" />
          Accept and continue
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
