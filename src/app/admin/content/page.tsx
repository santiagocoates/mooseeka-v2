'use client'

import { useState } from 'react'
import { Eye, Trash2, Flag, CheckCircle } from 'lucide-react'

const MOCK_SERVICES = [
  { id: '1', title: 'Mastering Profesional de Alta Fidelidad', seller: 'Marta Sound', category: 'Mastering', price: '€45', sales: 89, status: 'active',    reported: false },
  { id: '2', title: 'Producción de Trap',                      seller: 'Acid Beat',   category: 'Producción', price: '€60', sales: 34, status: 'active',    reported: false },
  { id: '3', title: 'Beat Drill personalizado',                seller: 'DJ Slime',    category: 'Producción', price: '€80', sales: 2,  status: 'active',    reported: true  },
  { id: '4', title: 'Mezcla y masterización completa',         seller: 'Elena Ríos',  category: 'Mixing',     price: '€120',sales: 12, status: 'paused',    reported: false },
]

export default function ContentPage() {
  const [services, setServices] = useState(MOCK_SERVICES)

  function removeService(id: string) {
    setServices(prev => prev.filter(s => s.id !== id))
  }
  function clearReport(id: string) {
    setServices(prev => prev.map(s => s.id === id ? { ...s, reported: false } : s))
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black text-white" style={{ letterSpacing: '-0.02em' }}>Contenido</h1>
        <p className="text-sm mt-1" style={{ color: '#7A6890' }}>Moderá los servicios y publicaciones de la plataforma</p>
      </div>

      {/* Reported alert */}
      {services.some(s => s.reported) && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
          <Flag size={16} style={{ color: '#ef4444' }} />
          <p className="text-sm font-semibold" style={{ color: '#ef4444' }}>
            {services.filter(s => s.reported).length} servicio(s) reportado(s) requieren revisión
          </p>
        </div>
      )}

      {/* Services table */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(20,0,40,0.8)', border: '1px solid rgba(123,47,255,0.15)' }}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(123,47,255,0.12)' }}>
          <h2 className="text-sm font-bold text-white">Servicios publicados</h2>
        </div>
        <div className="divide-y" style={{ borderColor: 'rgba(123,47,255,0.08)' }}>
          {services.map(svc => (
            <div key={svc.id} className="flex items-center gap-4 px-5 py-3.5">
              {svc.reported && (
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: '#ef4444' }} />
              )}
              {!svc.reported && <div className="w-2 shrink-0" />}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-white truncate">{svc.title}</p>
                  {svc.reported && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                      style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>
                      Reportado
                    </span>
                  )}
                </div>
                <p className="text-xs mt-0.5" style={{ color: '#7A6890' }}>
                  {svc.seller} · {svc.category} · {svc.price} · {svc.sales} ventas
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {svc.reported && (
                  <button onClick={() => clearReport(svc.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all"
                    style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }}>
                    <CheckCircle size={11} /> OK
                  </button>
                )}
                <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/8 transition-colors"
                  style={{ color: '#7A6890' }}>
                  <Eye size={15} />
                </button>
                <button onClick={() => removeService(svc.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-red-500/10"
                  style={{ color: '#7A6890' }}>
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
