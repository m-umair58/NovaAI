import { Toaster as SonnerToaster } from 'sonner'
import { useThemeContext } from '@/contexts/theme-context'

export function ThemedToaster() {
  const { theme } = useThemeContext()
  return <SonnerToaster richColors position="top-right" theme={theme} />
}
