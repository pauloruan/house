import { Footer } from "@/components/layout/Footer"
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Bell, CalendarDays, Gift, LayoutDashboard, Menu, Receipt, Settings, UserCircle } from "lucide-react"
import { useState } from "react"
import { Link, Outlet, useLocation } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { NotificationListener } from "@/components/shared/NotificationListener"
import { proxifyAvatar } from "@/services/api"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "../ui/breadcrumb"

export function DashboardLayout() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  // Resgata os dados do usuário
  const userData = localStorage.getItem("user")
  const user = userData ? JSON.parse(userData) : null
  const displayId = user?.id ? String(user.id).slice(-6).toUpperCase() : "N/A"

  const menuItems = [
    { name: "Painel", path: "/dashboard", icon: LayoutDashboard },
    { name: "Notificações", path: "/notifications", icon: Bell },
    { name: "Contas", path: "/bills", icon: Receipt },
    { name: "Eventos", path: "/events", icon: CalendarDays },
    { name: "Desejos", path: "/wishlist", icon: Gift },
    { name: "Perfil", path: "/profile", icon: UserCircle },
    { name: "Configurações", path: "/settings", icon: Settings }
  ]

  const currentPage =
    menuItems.find((item) => item.path === location.pathname)?.name || "Página"

  return (
    // Wrapper principal restrito ao tamanho de celular (mobile-first)
    <div className="flex flex-col min-h-screen bg-zinc-50 md:max-w-md md:mx-auto md:border-x md:border-zinc-200 md:shadow-xl">
      <Toaster />
      <NotificationListener />
      {/* Header Fixo no Topo (Visível na tela principal) */}
      <header className="flex items-center justify-between p-4 border-b border-zinc-200 bg-white sticky top-0 z-10">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/dashboard">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{currentPage}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Componente Sheet do Shadcn agindo como Sidebar Mobile */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Abrir menu">
              <Menu size={24} className="text-zinc-900" />
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="w-[85%] max-w-sm flex flex-col p-0">
            {/* 1. TÍTULO EM CIMA */}
            <div className="p-5 border-b border-zinc-200">
              <SheetTitle className="font-bold text-xl text-zinc-900 flex items-center gap-2">
                🏠 Minha Casa
              </SheetTitle>
              <SheetDescription className="sr-only">Menu de navegação</SheetDescription>
            </div>

            {/* 2. MENU LOGO EM BAIXO (flex-1 para empurrar o rodapé para baixo) */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)} // Fecha o menu ao clicar
                  className="flex items-center p-3 rounded-xs hover:bg-zinc-100 transition-colors text-zinc-700"
                >
                  <item.icon size={22} className="shrink-0" />
                  <span className="ml-3 text-base font-medium">{item.name}</span>
                </Link>
              ))}
            </nav>

            {/* 3. ID COM A FOTO EMBAIXO (No final do sidebar) */}
            <div className="p-4 border-t border-zinc-200 flex items-center gap-2 bg-zinc-50">
              <Avatar className="h-12 w-12 border border-zinc-200">
                <AvatarImage
                  src={proxifyAvatar(user?.profile_picture)}
                  alt={user?.name}
                />
                <AvatarBadge className="bg-green-500 border-white h-4 w-4 rounded-full bottom-0 right-0" />
                <AvatarFallback className="bg-zinc-200">
                  <UserCircle size={28} className="text-zinc-500" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col overflow-hidden">
                <p className="font-semibold text-sm truncate text-zinc-900">
                  {user?.name || "Usuário"}
                </p>
                <p className="text-xs font-medium text-zinc-500">
                  id: {displayId}
                </p>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Área Principal (Onde as páginas internas serão renderizadas) */}
      <main className="flex-1 flex flex-col p-4 overflow-y-auto">
        <div className="flex-1">
          <Outlet />
        </div>

        <Footer />
      </main>
    </div>
  )
}
