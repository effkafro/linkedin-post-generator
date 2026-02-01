import PostGenerator from './components/PostGenerator'
import { ThemeProvider } from './components/theme-provider'
import { ModeToggle } from './components/mode-toggle'

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="relative min-h-screen bg-background text-foreground transition-colors duration-300">
        <div className="absolute top-4 right-4 z-50">
          <ModeToggle />
        </div>
        <PostGenerator />
      </div>
    </ThemeProvider>
  )
}
