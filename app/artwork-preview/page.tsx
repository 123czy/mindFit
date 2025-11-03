"use client"

import { useState } from "react"
import { ArtworkPreview } from "@/components/artwork-preview"
import { Button } from "@/components/ui/button"

const mockArtworks = [
  {
    id: "1",
    title: "FlowFar",
    description: "Each NFT will be minted using a pre-revealed asset until you upload and reveal your final artwork.",
    imageUrl: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&q=80",
    author: "SlowFi",
    size: "9MB",
    type: "image" as const,
  },
  {
    id: "2",
    title: "Digital Dreams",
    description: "A collection of abstract digital art exploring the boundaries of creativity.",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
    author: "ArtMaster",
    size: "12MB",
    type: "image" as const,
  },
  {
    id: "3",
    title: "Cyber Punk",
    description: "Futuristic cityscapes and neon lights captured in stunning detail.",
    imageUrl: "https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=800&q=80",
    author: "NeonArt",
    size: "15MB",
    type: "image" as const,
  },
  {
    id: "4",
    title: "Abstract Art",
    description: "Modern abstract patterns and vibrant colors.",
    imageUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80",
    author: "ModernArt",
    size: "8MB",
    type: "image" as const,
  },
  {
    id: "5",
    title: "Nature Flow",
    description: "Organic forms and natural beauty captured in digital form.",
    imageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80",
    author: "NatureLover",
    size: "11MB",
    type: "image" as const,
  },
]

export default function ArtworkPreviewPage() {
  const [showPreview, setShowPreview] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <ArtworkPreview
          items={mockArtworks}
          folderName="Artwork"
          onClose={() => setShowPreview(false)}
          onSave={(items) => {
            console.log("保存的作品:", items)
            alert("作品已保存！")
          }}
        />
    </div>
  )
}

