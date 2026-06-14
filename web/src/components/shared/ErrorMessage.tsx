interface ErrorMessageProps {
  message?: string
}

export function ErrorMessage({
  message = "Ocorreu um erro inesperado."
}: ErrorMessageProps) {
  return (
    <div className="flex flex-col w-full min-h-[50vh] items-center justify-center p-8 gap-4">
      <p className="text-red-500 font-semibold text-center text-lg">
        {message}
      </p>
      <img
        src="/public/error-gif.gif"
        alt="Gato encarando um erro"
        className="w-full h-full object-cover rounded-xs shadow-sm"
      />
    </div>
  )
}
