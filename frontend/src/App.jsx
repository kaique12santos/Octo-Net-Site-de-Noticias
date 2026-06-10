import { useStore } from './store/useStore'
import { Button } from './components/ui/button'

function App() {
  // Puxando o estado global do Zustand
  const { noticiasLidas, lerNoticia } = useStore()

  return (
    
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground gap-8 p-4">
      
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-primary">Octo-Net</h1>
        <p className="text-muted-foreground">Setup de Infraestrutura Validado</p>
      </div>

      <div className="flex flex-col items-center gap-4 border border-border p-8 rounded-lg shadow-sm">
        <p className="text-lg">
          Notícias lidas (Zustand): <span className="font-bold text-primary">{noticiasLidas}</span>
        </p>
        
        <Button onClick={lerNoticia}>
          Simular Leitura
        </Button>
      </div>

    </div>
  )
}

export default App