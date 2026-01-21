import { SidebarProvider } from '@/components/SidebarContext'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SidebarProvider>{children}</SidebarProvider>
}

