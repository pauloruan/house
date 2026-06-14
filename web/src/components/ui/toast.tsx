import { toast } from "sonner"

export function notify(title: string, description: string) {
  toast(title, {
    description,
  })
}
