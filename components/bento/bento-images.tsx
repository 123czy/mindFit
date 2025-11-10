
import Masonry from "@/components/Masonry"
import { useEffect, useState } from "react"
import { Button } from "../ui/button"
import { X, EyeOff, Trash2, CheckSquare } from "lucide-react"

interface Item {
  id: string
  img: string
  url: string
  height: number
  hidden?: boolean
}

interface BentoImagesProps {
  items: Item[]
  isEditing?: boolean
  onClose?: () => void
  onHideSelected?: (ids: string[]) => void
  onDeleteSelected?: (ids: string[]) => void
}

export function BentoImages({
  items,
  isEditing = false,
  onClose,
  onHideSelected,
  onDeleteSelected,
}: BentoImagesProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    )
  }

  const handleHide = () => {
    if (selectedIds.length === 0) return
    onHideSelected?.(selectedIds)
    setSelectedIds([])
  }

  const handleDelete = () => {
    if (selectedIds.length === 0) return
    if (!confirm("确定要删除选择的图片吗？该操作不可恢复。")) return
    onDeleteSelected?.(selectedIds)
    setSelectedIds([])
  }

  const selectAll = () => setSelectedIds(items.map((item) => item.id))
  const clearSelection = () => setSelectedIds([])

  useEffect(() => {
    clearSelection()
  }, [items])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold">我的图库</h3>
          {isEditing ? (
            <p className="text-sm text-muted-foreground">
              已选择 {selectedIds.length} 张图片
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              双击图片可在新页面打开
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isEditing && (
            <>
              <Button
                variant="outline"
                size="sm"
                disabled={selectedIds.length === 0}
                onClick={handleHide}
                className="rounded-full"
              >
                <EyeOff className="mr-2 h-4 w-4" />
                隐藏
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={selectedIds.length === 0}
                onClick={handleDelete}
                className="rounded-full"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                删除
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full"
                onClick={selectedIds.length === items.length ? clearSelection : selectAll}
              >
                <CheckSquare className="mr-2 h-4 w-4" />
                {selectedIds.length === items.length ? "取消全选" : "全选"}
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => {
              clearSelection()
              onClose?.()
            }}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <Masonry
        items={items}
        ease="power3.out"
        duration={0.6}
        stagger={0.05}
        animateFrom="bottom"
        scaleOnHover={!isEditing}
        hoverScale={0.95}
        blurToFocus={!isEditing}
        colorShiftOnHover={!isEditing}
        selectable={isEditing}
        selectedIds={selectedIds}
        onItemClick={isEditing ? (item) => toggleSelect(item.id) : undefined}
      />
    </div>
  )
}
