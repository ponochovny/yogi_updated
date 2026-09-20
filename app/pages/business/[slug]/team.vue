<script lang="ts" setup>
import { toast } from 'vue-sonner'
import InviteTeamMember from './_components/InviteTeamMember.vue'

type Member = {
  linkId: string
  role: string
  isActive: boolean
  compensationType: string
  compensationRate: number
  user: { name: string; email: string; emailVerified: boolean }
}
type Payroll = {
  practitionerId: string
  name: string
  compensationType: string
  compensationRate: number
  attended: number
  amount: number
}
const route = useRoute()
const slug = computed(() => String(route.params.slug))
const month = ref(new Date().toISOString().slice(0, 7))
const { data, refresh } = await useFetch<{
  members: Member[]
  payroll: Payroll[]
}>(`/api/business/studios/${slug.value}/team`, {
  query: computed(() => ({ month: month.value }))
})
const editing = ref<Record<string, { type: string; rate: number }>>({})
const edit = (member: Member) => {
  editing.value[member.linkId] = {
    type: member.compensationType,
    rate: member.compensationRate / 100
  }
}
const clearEditing = (linkId: string) => {
  const { [linkId]: _editingMember, ...remaining } = editing.value
  editing.value = remaining
}
const save = async (member: Member) => {
  const value = editing.value[member.linkId]
  if (!value) return

  await $fetch(`/api/business/studios/${slug.value}/members/${member.linkId}`, {
    method: 'PATCH',
    body: { compensationType: value.type, compensationRate: Number(value.rate) }
  })
  clearEditing(member.linkId)
  await refresh()
  toast.success('Compensation saved')
}
const resend = async (member: Member) => {
  await $fetch(
    `/api/business/studios/${slug.value}/members/${member.linkId}/resend`,
    { method: 'POST' }
  )
  toast.success(`Invite sent to ${member.user.email}`)
}
const formatRate = (member: Member) =>
  member.compensationType === 'REVENUE_SHARE'
    ? `${(member.compensationRate / 100).toFixed(2)}%`
    : `${(member.compensationRate / 100).toFixed(2)}`
</script>

<template>
  <div class="space-y-8">
    <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 class="text-2xl font-semibold">Team and payroll</h1>
        <p class="text-sm text-muted-foreground">
          Manage trainer compensation and monthly payouts.
        </p>
      </div>
      <InviteTeamMember :slug="slug" @invited="refresh" />
    </div>
    <section class="space-y-3">
      <h2 class="text-lg font-semibold">Team</h2>
      <div class="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Trainer </TableHead>
              <TableHead>Status </TableHead>
              <TableHead>Commercial terms </TableHead>
              <TableHead>Rate </TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="member in data?.members || []"
              :key="member.linkId"
            >
              <TableCell>
                <div class="font-medium">{{ member.user.name }}</div>
                <div class="text-xs text-muted-foreground">
                  {{ member.user.email }}
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  :variant="member.user.emailVerified ? 'default' : 'secondary'"
                  >{{
                    member.user.emailVerified ? 'Active' : 'Waiting to sign in'
                  }}
                </Badge>
              </TableCell>
              <TableCell>
                <template v-if="editing[member.linkId]">
                  <NativeSelect
                    v-model="editing[member.linkId].type"
                    class="w-44"
                  >
                    <NativeSelectOption value="FLAT_RATE"
                      >Flat Rate / class
                    </NativeSelectOption>
                    <NativeSelectOption value="PER_ATTENDEE"
                      >Per Attendee
                    </NativeSelectOption>
                    <NativeSelectOption value="REVENUE_SHARE"
                      >Revenue Share
                    </NativeSelectOption>
                  </NativeSelect>
                </template>
                <span v-else>{{ member.compensationType }} </span>
              </TableCell>
              <TableCell>
                <template v-if="editing[member.linkId]">
                  <Input
                    v-model.number="editing[member.linkId].rate"
                    type="number"
                    min="0"
                    class="w-28"
                  />
                </template>
                <span v-else>{{ formatRate(member) }} </span>
              </TableCell>
              <TableCell class="space-x-2">
                <template v-if="editing[member.linkId]">
                  <Button size="sm" @click="save(member)">Save </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    @click="clearEditing(member.linkId)"
                    >Cancel
                  </Button>
                </template>
                <template v-else>
                  <Button size="sm" variant="outline" @click="edit(member)"
                    >Terms
                  </Button>
                  <Button
                    v-if="!member.user.emailVerified"
                    size="sm"
                    variant="ghost"
                    @click="resend(member)"
                    >Resend invite
                  </Button>
                </template>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </section>
    <section class="space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">Payroll ledger</h2>
        <Input v-model="month" type="month" class="w-44" />
      </div>
      <div class="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Trainer </TableHead>
              <TableHead>Attended classes </TableHead>
              <TableHead>Terms </TableHead>
              <TableHead class="text-right">Accrued </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="row in data?.payroll || []"
              :key="row.practitionerId"
            >
              <TableCell>{{ row.name }} </TableCell>
              <TableCell>{{ row.attended }} </TableCell>
              <TableCell>{{ row.compensationType }} </TableCell>
              <TableCell class="text-right font-medium"
                >{{ (row.amount / 100).toFixed(2) }}
              </TableCell>
            </TableRow>
            <TableRow v-if="!data?.payroll?.length">
              <TableCell
                colspan="4"
                class="h-20 text-center text-muted-foreground"
                >No payroll entries for this month.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </section>
  </div>
</template>
