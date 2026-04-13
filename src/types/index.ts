export type UserRole =
  | 'artist'
  | 'producer'
  | 'engineer'
  | 'manager'
  | 'marketer'
  | 'designer'
  | 'lawyer'
  | 'educator'

export interface Profile {
  id: string
  email: string
  name: string
  username: string
  avatar_url: string | null
  cover_url: string | null
  roles: UserRole[]
  bio: string | null
  location: string | null
  website: string | null
  followers_count: number
  following_count: number
  services_count: number
  created_at: string
}

export type PostType = 'work' | 'service' | 'achievement' | 'product' | 'course'

export interface Post {
  id: string
  user_id: string
  type: PostType
  content: string
  media_url: string | null
  metadata: Record<string, unknown>
  likes_count: number
  comments_count: number
  created_at: string
  profile?: Profile
  liked_by_me?: boolean
}

export type ServiceCategory =
  | 'production'
  | 'mixing'
  | 'mastering'
  | 'composition'
  | 'design'
  | 'marketing'
  | 'legal'
  | 'vocal'
  | 'other'

export interface Service {
  id: string
  user_id: string
  title: string
  description: string
  category: ServiceCategory
  cover_url: string | null
  pricing: {
    basic?: { price: number; label: string; description: string; delivery_days: number }
    standard?: { price: number; label: string; description: string; delivery_days: number }
    premium?: { price: number; label: string; description: string; delivery_days: number }
  }
  rating: number
  reviews_count: number
  sales_count: number
  tags: string[]
  created_at: string
  profile?: Profile
}
