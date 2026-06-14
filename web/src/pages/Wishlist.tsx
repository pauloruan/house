import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { useWishlist, useAddWishlistItem, useDeleteWishlistItem } from "@/hooks/useWishlist"
import { useUserProfile } from "@/hooks/useUser"
import { Loading } from "@/components/shared/Loading"
import { notify } from "@/components/ui/toast"
import { HouseSelection } from "@/components/house/HouseSelection"
import { ExternalLink, Trash2, Plus } from "lucide-react"

export default function WishlistPage() {
  const { data: items, isLoading } = useWishlist()
  const { profile } = useUserProfile()
  const { mutate: addItem, isPending: isAdding } = useAddWishlistItem()
  const { mutate: deleteItem, isPending: isDeleting } = useDeleteWishlistItem()
  const [url, setUrl] = useState("")
  const [showForm, setShowForm] = useState(false)
  const currentUserId = profile?.user?.id
  const house = profile?.user?.house

  if (!house) {
    return (
      <div className="w-full">
        <HouseSelection />
      </div>
    )
  }

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return
    addItem(url.trim(), {
      onSuccess: () => {
        setUrl("")
        setShowForm(false)
        notify("✅ Item adicionado", "O link foi adicionado à lista de desejos.")
      },
      onError: () => {
        notify("⚠️ Erro", "Não foi possível adicionar o link.")
      },
    })
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-end">
        {!showForm && (
          <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-3 w-3 mr-1" />Adicionar
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-xs border border-zinc-200 p-3 space-y-3">
          <FieldGroup>
            <Field>
              <FieldLabel>Link do produto</FieldLabel>
              <input type="url" placeholder="https://www.exemplo.com/produto" value={url} onChange={(e) => setUrl(e.target.value)} disabled={isAdding}
                className="w-full px-3 py-2 border border-zinc-200 rounded-xs bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </Field>
          </FieldGroup>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)} disabled={isAdding} className="flex-1">Cancelar</Button>
            <Button type="submit" disabled={isAdding || !url.trim()} className="flex-1">{isAdding ? "Adicionando..." : "Adicionar"}</Button>
          </div>
        </form>
      )}

      {isLoading ? <Loading /> : !items || items.length === 0 ? (
        <p className="text-sm text-zinc-400 text-center py-12">Nenhum item na lista de desejos.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xs border border-zinc-200 overflow-hidden">
              {item.image_url ? (
                <img src={item.image_url} alt={item.title} className="w-full h-48 object-cover" referrerPolicy="no-referrer"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
              ) : (
                <div className="w-full h-24 bg-zinc-100 flex items-center justify-center">
                  <ExternalLink className="h-6 w-6 text-zinc-300" />
                </div>
              )}
              <div className="p-3">
                <p className="font-medium text-sm text-zinc-900 line-clamp-2">{item.title}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-zinc-400">
                    por {item.user_name} · {new Date(item.created_at).toLocaleDateString("pt-BR")}
                  </p>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => window.open(item.url, "_blank")} title="Abrir link">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                    {currentUserId === item.user_id && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" disabled={isDeleting}
                        onClick={() => deleteItem(item.id, { onSuccess: () => notify("🗑️ Removido", "Item removido da lista.") })} title="Remover">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
