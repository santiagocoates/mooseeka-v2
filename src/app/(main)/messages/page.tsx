import { MessageSquare } from 'lucide-react'

export default function MessagesPage() {
  return (
    <div className="flex items-center justify-center h-full min-h-screen">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full gradient-purple flex items-center justify-center mx-auto mb-4">
          <MessageSquare size={28} className="text-white" />
        </div>
        <h2 className="text-white text-xl font-bold mb-2">Mensajes</h2>
        <p className="text-[#b0b0b0] text-sm max-w-xs">
          El chat en tiempo real estará disponible muy pronto. ¡Estamos trabajando en ello!
        </p>
        <span className="inline-block mt-4 bg-[#8b5cf6]/20 text-[#8b5cf6] text-xs font-medium px-3 py-1.5 rounded-full border border-[#8b5cf6]/30">
          Próximamente
        </span>
      </div>
    </div>
  )
}
