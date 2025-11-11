export interface SpotlightPost {
  id: string
  title: string
  description: string
  image: string
  author: {
    name: string
    avatar: string
  }
  stats: {
    views: number
    likes: number
  }
  tags: string[]
  badge: string | null
  detailUrl: string
}

