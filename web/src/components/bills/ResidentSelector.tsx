import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { ResidentInfo } from "@/services/bills"
import { proxifyAvatar } from "@/services/api"

interface ResidentSelectorProps {
  residents: ResidentInfo[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
  label?: string
  lockedId?: string
}

export function ResidentSelector({ residents, selectedIds, onChange, label = "Dividir com", lockedId }: ResidentSelectorProps) {
  const allIDs = residents.map(r => r.id)
  const initial = selectedIds && selectedIds.length > 0 ? selectedIds : allIDs
  const [selected, setSelected] = useState<Set<string>>(() => new Set(initial))

  useEffect(() => {
    onChange(allIDs)
  }, [])

  const toggle = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
    onChange(Array.from(next))
  }

  const toggleAll = () => {
    if (selected.size === residents.length) {
      setSelected(new Set())
      onChange([])
    } else {
      const all = new Set(residents.map(r => r.id))
      setSelected(all)
      onChange(Array.from(all))
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-zinc-500">{label}</p>
        <button type="button" onClick={toggleAll} className="text-xs text-blue-500 hover:underline">
          {selected.size === residents.length ? "Remover todos" : "Selecionar todos"}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {residents.map((r) => {
          const isSelected = selected.has(r.id)
          const isLocked = lockedId && r.id === lockedId
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => !isLocked && toggle(r.id)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-xs border text-xs transition-all ${
                isSelected || isLocked
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-zinc-200 text-zinc-400 opacity-50"
              } ${isLocked ? "cursor-default" : ""}`}
            >
              <Avatar className="h-5 w-5">
                <AvatarImage src={proxifyAvatar(r.profile_picture)} />
                <AvatarFallback className="text-[10px]">{r.name.charAt(0)}</AvatarFallback>
              </Avatar>
              {r.name.split(" ")[0]}
            </button>
          )
        })}
      </div>
    </div>
  )
}
