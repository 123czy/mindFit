import { FallbackImage } from "../ui/fallback-image"

const covers = [
  {
    id: "cover1",
    src: "https://otahonvekikpyxyjfhdz.supabase.co/storage/v1/object/sign/mindFit_web3/cover1.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lMzg2NDY1My1lMDI0LTQxYzUtYTNhYi1hMjYwMGMzYjEyNGIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtaW5kRml0X3dlYjMvY292ZXIxLnBuZyIsImlhdCI6MTc2MTQ1NjAyOCwiZXhwIjoxNzkyOTkyMDI4fQ.R49CzfZhizlvLyBDN86YT4ASdl-KwmoIiahEV-7YESI",
    title: "封面1"
  },
  {
    id: "cover2",
    src: "https://otahonvekikpyxyjfhdz.supabase.co/storage/v1/object/sign/mindFit_web3/cover2.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lMzg2NDY1My1lMDI0LTQxYzUtYTNhYi1hMjYwMGMzYjEyNGIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtaW5kRml0X3dlYjMvY292ZXIyLnBuZyIsImlhdCI6MTc2MTQ1NjA2OCwiZXhwIjoxNzkyOTkyMDY4fQ.tDtke2RgFQ-svbPmb3x-LHIKWpmz-6WQekAHiEhL6uM",
    title: "封面2"
  },
  {
    id: "cover3",
    src: "https://otahonvekikpyxyjfhdz.supabase.co/storage/v1/object/sign/mindFit_web3/cover3.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lMzg2NDY1My1lMDI0LTQxYzUtYTNhYi1hMjYwMGMzYjEyNGIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtaW5kRml0X3dlYjMvY292ZXIzLnBuZyIsImlhdCI6MTc2MTQ1NjA5MSwiZXhwIjoxNzkyOTkyMDkxfQ.4o7RBm1oR4_YghcGPOVVGdB7S7n4Edg1NP_WdW14SCU",
    title: "封面3"
  },
  {
    id: "cover4",
    src: "https://otahonvekikpyxyjfhdz.supabase.co/storage/v1/object/sign/mindFit_web3/cover4.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lMzg2NDY1My1lMDI0LTQxYzUtYTNhYi1hMjYwMGMzYjEyNGIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtaW5kRml0X3dlYjMvY292ZXI0LnBuZyIsImlhdCI6MTc2MTQ1NjExMywiZXhwIjoxNzkyOTkyMTEzfQ.66k6ZOmjc_ai58JiJ2Z0Stv1l4d9loa6JEd3EgDKoYs",
    title: "封面4"
  }
]

interface CoverItem {
  id: string
  src: string
  title: string
}

export function CoverSelector({ handleCoverSelect, cover }: { handleCoverSelect: (coverItem: CoverItem["id"]) => void, cover: CoverItem["id"] }) {
  
  return (
        <div className="grid grid-cols-4 gap-4 h-[220px] cursor-pointer" >
            {
                covers.map((coverItem: CoverItem) => (
                    <div key={coverItem.id} className={`rounded-lg overflow-hidden bg-muted p-2 hover:bg-muted/80 transition-all transform hover:scale-105 ${cover === coverItem.id ? "border-2 border-primary shadow-lg scale-105" : ""}`}  onClick={() => handleCoverSelect(coverItem.id)}>
                        <span className="text-sm text-muted-foreground">{coverItem.title}</span>
                        <FallbackImage src={coverItem.src} alt={coverItem.title} width={120} height={120} className="w-full h-full object-cover" />
                    </div>
                ))
            }
        </div>
  )
}