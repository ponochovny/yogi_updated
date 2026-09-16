<script lang="ts" setup>
import {
  ArrowUpDown,
  ChevronDownIcon,
  CrownIcon,
  LayersIcon,
  PencilIcon
} from '@lucide/vue'
import {
  FlexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
  type ColumnDef,
  type ColumnFiltersState,
  type ExpandedState,
  type SortingState,
  type VisibilityState
} from '@tanstack/vue-table'
import type { MembershipItemBusiness } from '~/entities/membership/schema'
import { Button } from '~/shared/ui/button'
import { valueUpdater } from '~/shared/ui/table/utils'

const props = defineProps<{
  membershipsData?: MembershipItemBusiness[]
  studioSlug: string
}>()
const emit = defineEmits<{
  (e: 'edit', membership: MembershipItemBusiness): void
}>()
const selectedType = ref('ALL')

const columns: ColumnDef<MembershipItemBusiness>[] = [
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.original.type
      return h('div', { class: 'flex items-center gap-2' }, [
        h(
          'div',
          { class: 'bg-muted rounded-sm p-1 border' },
          h(type === 'MEMBERSHIP' ? CrownIcon : LayersIcon, {
            class: 'h-4 w-4'
          })
        ),
        h(
          'div',
          { class: 'text-sm font-medium lowercase first-letter:uppercase' },
          type
        )
      ])
    }
  },
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: 'ghost',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
        },
        () => ['Name', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })]
      )
    },
    cell: ({ row }) => h('div', row.getValue('name'))
  },
  {
    accessorKey: 'credits',
    header: 'Credits',
    cell: ({ row }) => {
      const credits = row.original.credits
      return h('div', credits ? `${credits} credits` : 'Unlimited')
    }
  },
  {
    accessorKey: 'expiryRule',
    header: 'Validity',
    cell: ({ row }) => {
      const pricing = row.original
      return h(
        'div',
        pricing.expiryRule === 'END_OF_YEAR'
          ? `Year end${pricing.expiryBufferDays ? ` + ${pricing.expiryBufferDays}d` : ''}`
          : `${pricing.durationDays} days`
      )
    }
  },
  {
    accessorKey: 'maxBookingsPerDay',
    header: () =>
      h(
        'span',
        { title: 'Maximum number of bookings allowed per day for this pass' },
        'Daily bookings limit'
      ),
    cell: ({ row }) =>
      h(
        'div',
        row.original.maxBookingsPerDay
          ? `${row.original.maxBookingsPerDay}/day`
          : 'Unlimited'
      )
  },
  {
    accessorKey: 'price',
    header: () => h('div', { class: 'text-right' }, 'Price'),
    cell: ({ row }) => {
      const price = row.original.price
      const text = price === 0 ? 'Free' : `$${(price / 100).toFixed(2)}`
      return h('div', { class: 'text-right font-medium' }, text)
    }
  },
  {
    id: 'actions',
    header: '',
    enableHiding: false,
    cell: ({ row }) =>
      h(
        Button,
        {
          variant: 'ghost',
          size: 'icon',
          title: 'Edit pricing option',
          onClick: () => emit('edit', row.original)
        },
        () => h(PencilIcon, { class: 'h-4 w-4' })
      )
  }
]
const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
const columnVisibility = ref<VisibilityState>({})
const expanded = ref<ExpandedState>({})
const table = useVueTable({
  data: props.membershipsData || [],
  columns,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getExpandedRowModel: getExpandedRowModel(),
  onSortingChange: updaterOrValue => valueUpdater(updaterOrValue, sorting),
  onColumnFiltersChange: updaterOrValue =>
    valueUpdater(updaterOrValue, columnFilters),
  onColumnVisibilityChange: updaterOrValue =>
    valueUpdater(updaterOrValue, columnVisibility),
  onExpandedChange: updaterOrValue => valueUpdater(updaterOrValue, expanded),
  state: {
    get sorting() {
      return sorting.value
    },
    get columnFilters() {
      return columnFilters.value
    },
    get columnVisibility() {
      return columnVisibility.value
    },
    get expanded() {
      return expanded.value
    }
  }
})

watch(
  () => props.membershipsData,
  memberships => {
    table.setOptions(previous => ({ ...previous, data: memberships || [] }))
  },
  { deep: true }
)

const setTypeFilter = (type: string) => {
  selectedType.value = type
  table.getColumn('type')?.setFilterValue(type === 'ALL' ? undefined : type)
}
</script>

<template>
  <div>
    <div class="w-full">
      <div class="flex items-center py-4">
        <Input
          class="max-w-sm"
          placeholder="Filter names..."
          :model-value="table.getColumn('name')?.getFilterValue() as string"
          @update:model-value="table.getColumn('name')?.setFilterValue($event)"
        />
        <div
          class="ml-4 flex flex-wrap gap-1"
          aria-label="Filter by pricing type"
        >
          <Button
            v-for="type in [
              { value: 'ALL', label: 'All' },
              { value: 'MEMBERSHIP', label: 'Membership' },
              { value: 'PACK', label: 'Pack' },
              { value: 'DROP_IN', label: 'Drop-in' }
            ]"
            :key="type.value"
            size="sm"
            :variant="selectedType === type.value ? 'default' : 'outline'"
            @click="setTypeFilter(type.value)"
          >
            {{ type.label }}
          </Button>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="outline" class="ml-auto">
              Columns <ChevronDownIcon class="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuCheckboxItem
              v-for="column in table
                .getAllColumns()
                .filter(column => column.getCanHide())"
              :key="column.id"
              class="capitalize"
              :model-value="column.getIsVisible()"
              @update:model-value="
                value => {
                  column.toggleVisibility(!!value)
                }
              "
            >
              {{ column.id }}
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div class="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow
              v-for="headerGroup in table.getHeaderGroups()"
              :key="headerGroup.id"
            >
              <TableHead v-for="header in headerGroup.headers" :key="header.id">
                <FlexRender
                  v-if="!header.isPlaceholder"
                  :render="header.column.columnDef.header"
                  :props="header.getContext()"
                />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <template v-if="table.getRowModel().rows?.length">
              <template v-for="row in table.getRowModel().rows" :key="row.id">
                <TableRow :data-state="row.getIsSelected() && 'selected'">
                  <TableCell
                    v-for="cell in row.getVisibleCells()"
                    :key="cell.id"
                  >
                    <FlexRender
                      :render="cell.column.columnDef.cell"
                      :props="cell.getContext()"
                    />
                  </TableCell>
                </TableRow>
                <TableRow v-if="row.getIsExpanded()">
                  <TableCell :colspan="row.getAllCells().length">
                    {{ JSON.stringify(row.original) }}
                  </TableCell>
                </TableRow>
              </template>
            </template>
            <TableRow v-else>
              <TableCell :colspan="columns.length" class="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <div class="flex items-center justify-end space-x-2 py-4">
        <div class="space-x-2">
          <Button
            variant="outline"
            size="sm"
            :disabled="!table.getCanPreviousPage()"
            @click="table.previousPage()"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            :disabled="!table.getCanNextPage()"
            @click="table.nextPage()"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
