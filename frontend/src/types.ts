export interface YarnPhoto {
  id: number
  square_url?: string
  medium_url?: string
}

export interface YarnWeight {
  id?: number
  name?: string
  ply?: string
  knit_gauge?: string
}

export interface Yarn {
  id: number
  name: string
  permalink: string
  yarn_company_name?: string
  rating_average?: number
  rating_count?: number
  yarn_weight?: YarnWeight
  first_photo?: YarnPhoto
}

export interface YarnDetail extends Yarn {
  min_needle_size?: { metric: number }
  yarn_fibers: Array<{ fiber_type: { name: string } }>
}

export interface Designer {
  id?: number
  name?: string
  permalink?: string
  favorites_count?: number
}

export interface Pattern {
  id: number
  name: string
  permalink: string
  free?: boolean
  rating_average?: number
  designer?: Designer
  first_photo?: YarnPhoto
}

export interface YarnPatternMatches {
  source_yarn: YarnDetail
  similar_yarns: Yarn[]
  patterns: Pattern[]
}

export type Screen = 'search' | 'confirm' | 'results'
