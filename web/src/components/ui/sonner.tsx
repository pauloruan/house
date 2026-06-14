import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="top-center"
      gap={8}
      toastOptions={{
        className:
          "max-w-[90vw] w-fit mx-auto bg-zinc-900 text-white border border-zinc-700 shadow-2xl",
        descriptionClassName:
          "text-zinc-300",
      }}
      {...props}
    />
  )
}

export { Toaster }
