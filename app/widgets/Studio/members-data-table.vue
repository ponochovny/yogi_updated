<script lang="ts" setup>
import { ArrowUpDown, ChevronDownIcon } from '@lucide/vue'
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
import { NuxtImg } from '#components'
import type { StudioMemberItem } from '~/entities/practitioner/schema'
import { Badge } from '~/shared/ui/badge'
import { Button } from '~/shared/ui/button'
import { valueUpdater } from '~/shared/ui/table/utils'
import { userRoles } from '~~/server/auth/config'
import { placeholderImageUrl } from '~/config/constants'

const route = useRoute()
const slug = route.params.slug as string

const { data } = await useFetch(`/api/business/studios/${slug}/members`)
const team = computed(() => data.value?.team || [])

const columns: ColumnDef<StudioMemberItem>[] = [
  {
    accessorFn: row => row.user.name,
    id: 'name',
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
    cell: ({ row }) => {
      const member = row.original

      const imageUrl =
        member.user.image?.replace(
          '/upload/',
          '/upload/w_100,h_100,c_thumb,g_custom/'
        ) || placeholderImageUrl

      return h('div', { class: 'flex items-center gap-3' }, [
        // @ts-expect-error: NuxImg something
        h(NuxtImg, {
          src: imageUrl,
          class: 'w-10 h-10 rounded-full bg-gray-100 object-cover'
        }),
        h('div', [
          h('div', { class: 'font-medium' }, member.user.name),
          h(
            'div',
            { class: 'text-muted-foreground text-sm' },
            member.user.email
          )
        ])
      ])
    }
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
      const member = row.original
      const role = member.role
      return h(
        'div',
        h(
          Badge,
          {
            variant: 'secondary',
            class: {
              'bg-amber-100 text-amber-800 dark:bg-amber-700 dark:text-amber-100':
                role === userRoles.PRACTITIONER,
              'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100':
                role === userRoles.MANAGER,
              'inline-block lowercase first-letter:uppercase font-medium': true
            }
          },
          role
        )
      )
    }
  },
  {
    accessorKey: 'emailVerified',
    header: 'Status',
    cell: ({ row }) => {
      const member = row.original
      const isVerified = member.user.emailVerified
      const text = isVerified ? 'Active' : 'Waiting to sign in'
      return h(
        'div',
        h(
          Badge,
          {
            class: {
              'inline-block lowercase first-letter:uppercase font-medium': true,
              'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100':
                isVerified,
              'bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-yellow-100':
                !isVerified
            }
          },
          text
        )
      )
    }
  }
]
const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
const columnVisibility = ref<VisibilityState>({})
const expanded = ref<ExpandedState>({})
const table = useVueTable({
  data: team.value,
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
