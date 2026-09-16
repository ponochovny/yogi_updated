import type { InternalApi } from 'nitropack'
type UnwrapSerializeObject<T> = T extends object
  ? T extends infer O
    ? { [K in keyof O]: UnwrapSerializeObject<O[K]> }
    : never
  : T

export type ExploreResultItemRaw =
  InternalApi['/api/explore']['get']['items'][number]
export type ExploreResultItem = UnwrapSerializeObject<ExploreResultItemRaw>

export type ExploreResponse = UnwrapSerializeObject<
  InternalApi['/api/explore']['get']
>

export type ExploreOfferingItem = Extract<
  ExploreResponse,
  { type: 'offerings' }
>['items'][number]

export type ExploreStudioItem = Extract<
  ExploreResponse,
  { type: 'studios' }
>['items'][number]

export type ExplorePractitionerItem = Extract<
  ExploreResponse,
  { type: 'practitioners' }
>['items'][number]
