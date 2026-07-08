<script lang="ts" setup>
import {
  ArrowUpDown,
  CalendarClockIcon,
  ChevronDownIcon,
  MoreHorizontalIcon,
  PencilSparklesIcon
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
import { createReusableTemplate } from '@vueuse/core'
import type { OfferingItemBusiness } from '~/entities/offering/schema'
import { Badge } from '~/shared/ui/badge'
import { Button } from '~/shared/ui/button'
import { Checkbox } from '~/shared/ui/checkbox'
import { valueUpdater } from '~/shared/ui/table/utils'

const route = useRoute()

const { data: offeringsData } = await useFetch(
  `/api/business/studios/${route.params.slug}/offerings`
)
const offerings = computed(() => offeringsData.value?.offerings || [])

const [DefineTemplate, ReuseTemplate] = createReusableTemplate<{
  offering: OfferingItemBusiness
  onExpand: () => void
}>()
const columns: ColumnDef<OfferingItemBusiness>[] = [
  {
    id: 'select',
    header: ({ table }) =>
      h(Checkbox, {
        modelValue:
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate'),
        'onUpdate:modelValue': value =>
          table.toggleAllPageRowsSelected(!!value),
        ariaLabel: 'Select all'
      }),
    cell: ({ row }) =>
      h(Checkbox, {
        modelValue: row.getIsSelected(),
        'onUpdate:modelValue': value => row.toggleSelected(!!value),
        ariaLabel: 'Select row'
      }),
    enableSorting: false,
    enableHiding: false
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
    accessorKey: 'activityType',
    header: 'Activity Type',
    cell: ({ row }) => {
      const activityType = row.getValue('activityType') as string
      return h(
        'div',
        h(
          Badge,
          {
            variant: 'secondary',
            class: {
              'bg-amber-100 text-amber-800 dark:bg-amber-700 dark:text-amber-100':
                activityType === 'EVENT',
              'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100':
                activityType === 'CLASS',
              'inline-block lowercase first-letter:uppercase font-medium': true
            }
          },
          () => row.getValue('activityType')
        )
      )
    }
  },
  {
    accessorKey: 'location',
    header: 'Location',
    cell: ({ row }) => {
      const locationValue = row.getValue('location') as {
        name: string
        address: string
        city: string
        country: string
      } | null
      const location: string = locationValue ? locationValue.name : 'Online'
      return h(
        'div',
        {
          title: locationValue
            ? `${locationValue.address}, ${locationValue.city}, ${locationValue.country}`
            : ''
        },
        location
      )
    }
  },
  {
    accessorKey: 'isPublished',
    header: () => h('div', { class: 'text-right' }, 'Published'),
    cell: ({ row }) => {
      const isPublished = row.getValue('isPublished')
      return h(
        'div',
        { class: 'text-right font-medium' },
        h(
          Badge,
          {
            variant: isPublished ? 'success' : 'destructive'
          },
          () => [isPublished ? 'Published' : 'Draft']
        )
      )
    }
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const offering = row.original
      return h(ReuseTemplate, {
        offering,
        onExpand: row.toggleExpanded
      })
    }
  }
]
const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
const columnVisibility = ref<VisibilityState>({})
const rowSelection = ref({})
const expanded = ref<ExpandedState>({})
const table = useVueTable({
  data: offerings.value,
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
  onRowSelectionChange: updaterOrValue =>
    valueUpdater(updaterOrValue, rowSelection),
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
    get rowSelection() {
      return rowSelection.value
    },
    get expanded() {
      return expanded.value
    }
  }
})
</script>

<template>
  <div>
    <DefineTemplate v-slot="{ offering }">
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="ghost" class="h-8 w-8 p-0">
            <span class="sr-only">Open menu</span>
            <MoreHorizontalIcon class="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            @click="
              $router.push(
                `/business/${route.params.slug}/offerings/${offering.slug}/edit`
              )
            "
          >
            <PencilSparklesIcon /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            @click="
              $router.push(
                `/business/${route.params.slug}/offerings/${offering.slug}/schedule`
              )
            "
          >
            <CalendarClockIcon /> Schedule
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </DefineTemplate>
    <div class="w-full">
      <div class="flex items-center py-4">
        <Input
          class="max-w-sm"
          placeholder="Filter names..."
          :model-value="table.getColumn('name')?.getFilterValue() as string"
          @update:model-value="table.getColumn('name')?.setFilterValue($event)"
        />
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
        <div class="flex-1 text-sm text-muted-foreground">
          {{ table.getFilteredSelectedRowModel().rows.length }} of
          {{ table.getFilteredRowModel().rows.length }} row(s) selected.
        </div>
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
