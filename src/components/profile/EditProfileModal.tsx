'use client'

import { useState } from 'react'
import { X, Camera, Plus, Trash2 } from 'lucide-react'
import { SOCIAL_CONFIG } from './SocialIcons'

const ROLES = [
  'Artista', 'Productor', 'Ingeniero de Mezcla', 'Masterizador',
  'Compositor', 'DJ', 'Manager', 'Marketer', 'Diseñador',
  'Abogado Musical', 'Educador', 'Otro',
]

interface EditProfileModalProps {
  open: boolean
  onClose: () => void
}

export default function EditProfileModal({ open, onClose }: EditProfileModalProps) {
  const [name, setName] = useState('Elena Ríos')
  const [username, setUsername] = useState('elenarios')
  const [bio, setBio] = useState('Especializada en diseño sonoro para proyectos indie y música experimental.')
  const [location, setLocation] = useState('Barcelona, ES')
  const [website, setWebsite] = useState('')
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['Productora', 'Ingeniero de Mezcla'])
  const [highlight1, setHighlight1] = useState('"Resonancia" (Álbum)')
  const [highlight2, setHighlight2] = useState('')
  const [activeTab, setActiveTab] = useState<'info' | 'roles' | 'highlights' | 'redes'>('info')
  const [socials, setSocials] = useState<Record<string, string>>({
    instagram: 'elenarios.music',
    tiktok: '',
    spotify: '',
    youtube: '',
    soundcloud: '',
    twitter: '',
  })

  const BIO_LIMIT = 200

  function toggleRole(role: string) {
    setSelectedRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : prev.length < 4 ? [...prev, role] : prev
    )
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>

      <div className="w-full max-w-lg rounded-2xl flex flex-col overflow-hidden"
        style={{ background: '#0E001C', border: '1px solid rgba(123,47,255,0.25)', maxHeight: '90vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: '1px solid rgba(123,47,255,0.15)' }}>
          <h3 className="text-white font-bold text-base">Editar perfil</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors hover:bg-white/10" style={{ color: '#7A6890' }}>
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-5 pt-4 gap-1 shrink-0 overflow-x-auto pb-0.5">
          {(['info', 'roles', 'highlights', 'redes'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all shrink-0"
              style={activeTab === tab
                ? { background: 'linear-gradient(135deg, #8B3FFF, #FF1A8C)', color: '#fff' }
                : { color: '#7A6890', background: 'rgba(255,255,255,0.04)' }}>
              {tab === 'info' ? 'Info' : tab === 'roles' ? 'Roles' : tab === 'highlights' ? 'Highlights' : '🔗 Redes'}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">

          {/* ── Tab: Info ── */}
          {activeTab === 'info' && (
            <div className="flex flex-col gap-5">
              {/* Cover + Avatar */}
              <div className="relative">
                <div className="h-28 rounded-xl overflow-hidden relative group cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, #15002A, #0E001C)' }}>
                  <img src="/covers/studio1.jpg" alt="cover" className="w-full h-full object-cover opacity-70" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="flex flex-col items-center gap-1.5 text-white">
                      <Camera size={20} />
                      <span className="text-xs font-semibold">Cambiar portada</span>
                    </div>
                  </div>
                </div>
                {/* Avatar */}
                <div className="absolute -bottom-6 left-4 group cursor-pointer">
                  <img src="/users/productores.jpg" alt="avatar"
                    className="w-14 h-14 rounded-full object-cover"
                    style={{ border: '3px solid #0E001C', outline: '2px solid rgba(123,47,255,0.5)' }} />
                  <div className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: 'rgba(0,0,0,0.6)' }}>
                    <Camera size={14} className="text-white" />
                  </div>
                </div>
              </div>
              <div className="h-8" /> {/* space for avatar overlap */}

              <FormField label="Nombre" value={name} onChange={setName} placeholder="Tu nombre completo" />
              <FormField label="Usuario" value={username} onChange={setUsername} placeholder="tu_usuario" prefix="@" />
              <div>
                <label className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: '#7A6890' }}>Bio</label>
                <textarea value={bio} onChange={e => setBio(e.target.value.slice(0, BIO_LIMIT))} rows={3}
                  placeholder="Cuéntanos algo sobre ti, tu estilo, tu experiencia..."
                  className="w-full text-white placeholder-[#7A6890] text-sm resize-none rounded-xl px-3 py-2.5 focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(123,47,255,0.2)' }} />
                <div className="flex justify-end mt-1">
                  <span className="text-xs" style={{ color: bio.length > BIO_LIMIT * 0.85 ? '#FF1A8C' : '#7A6890' }}>
                    {bio.length}/{BIO_LIMIT}
                  </span>
                </div>
              </div>
              <FormField label="Ubicación" value={location} onChange={setLocation} placeholder="Ciudad, País" />
              <FormField label="Sitio web" value={website} onChange={setWebsite} placeholder="https://tu-sitio.com" />
            </div>
          )}

          {/* ── Tab: Roles ── */}
          {activeTab === 'roles' && (
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-white font-semibold text-sm mb-1">¿Qué haces en la industria?</p>
                <p className="text-xs" style={{ color: '#7A6890' }}>Elige hasta 4 roles. Aparecen en tu perfil público.</p>
              </div>
              {selectedRoles.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#7A6890' }}>
                    Seleccionados ({selectedRoles.length}/4)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedRoles.map(role => (
                      <button key={role} onClick={() => toggleRole(role)}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full text-white transition-all hover:opacity-80 gradient-magenta">
                        {role}
                        <X size={11} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#7A6890' }}>Todos los roles</p>
                <div className="flex flex-wrap gap-2">
                  {ROLES.filter(r => !selectedRoles.includes(r)).map(role => (
                    <button key={role} onClick={() => toggleRole(role)}
                      disabled={selectedRoles.length >= 4}
                      className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all disabled:opacity-40"
                      style={{ background: 'rgba(255,255,255,0.05)', color: '#C0A8D8', border: '1px solid rgba(123,47,255,0.2)' }}
                      onMouseOver={e => !e.currentTarget.disabled && (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.5)')}
                      onMouseOut={e => (e.currentTarget.style.borderColor = 'rgba(123,47,255,0.2)')}>
                      <Plus size={11} />
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Tab: Redes ── */}
          {activeTab === 'redes' && (
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-white font-semibold text-sm mb-1">Tus redes sociales</p>
                <p className="text-xs" style={{ color: '#7A6890' }}>
                  Opcional. Las redes que completes aparecerán como íconos en tu perfil público.
                </p>
              </div>

              {SOCIAL_CONFIG.map(s => (
                <div key={s.id}>
                  <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 mb-2"
                    style={{ color: '#7A6890' }}>
                    <span className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: `${s.color}22`, color: s.color }}>
                      {s.icon}
                    </span>
                    {s.label}
                  </label>
                  <div className="flex items-center rounded-xl overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(123,47,255,0.2)' }}>
                    <span className="px-3 py-2.5 text-xs shrink-0 border-r select-none"
                      style={{ color: '#7A6890', borderColor: 'rgba(123,47,255,0.15)' }}>
                      {s.prefix}
                    </span>
                    <input
                      value={socials[s.id] ?? ''}
                      onChange={e => setSocials(prev => ({ ...prev, [s.id]: e.target.value }))}
                      placeholder={s.placeholder}
                      className="flex-1 bg-transparent px-3 py-2.5 text-sm text-white placeholder-[#7A6890] focus:outline-none"
                    />
                    {socials[s.id] && (
                      <button onClick={() => setSocials(prev => ({ ...prev, [s.id]: '' }))}
                        className="px-3 transition-colors hover:text-[#FF1A8C]" style={{ color: '#7A6890' }}>
                        <X size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <div className="rounded-xl p-3 flex items-start gap-2.5"
                style={{ background: 'rgba(139,63,255,0.07)', border: '1px dashed rgba(139,63,255,0.25)' }}>
                <span className="text-base shrink-0">💡</span>
                <p className="text-xs leading-relaxed" style={{ color: '#7A6890' }}>
                  Completa solo las redes donde tienes presencia activa. Los íconos vacíos no se muestran en tu perfil.
                </p>
              </div>
            </div>
          )}

          {/* ── Tab: Highlights ── */}
          {activeTab === 'highlights' && (
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-white font-semibold text-sm mb-1">Highlights del perfil</p>
                <p className="text-xs" style={{ color: '#7A6890' }}>Estos datos aparecen en el panel derecho de tu perfil.</p>
              </div>

              {[
                { emoji: '🎵', label: 'Proyecto actual', value: highlight1, onChange: setHighlight1, placeholder: 'Ej: "Resonancia" (Álbum)' },
                { emoji: '🔗', label: 'Colaboración destacada', value: highlight2, onChange: setHighlight2, placeholder: 'Ej: Mix para @Artista' },
              ].map(h => (
                <div key={h.label}>
                  <label className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: '#7A6890' }}>
                    {h.emoji} {h.label}
                  </label>
                  <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(123,47,255,0.2)' }}>
                    <input value={h.value} onChange={e => h.onChange(e.target.value)} placeholder={h.placeholder}
                      className="flex-1 bg-transparent text-white placeholder-[#7A6890] text-sm focus:outline-none" />
                    {h.value && (
                      <button onClick={() => h.onChange('')} style={{ color: '#7A6890' }} className="hover:text-[#FF1A8C] transition-colors">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <div className="rounded-xl p-4 mt-2"
                style={{ background: 'rgba(139,63,255,0.08)', border: '1px solid rgba(139,63,255,0.2)' }}>
                <p className="text-xs font-semibold mb-1" style={{ color: '#A855F7' }}>📍 Ubicación</p>
                <p className="text-white text-sm">{location || 'No configurada'}</p>
                <p className="text-xs mt-1" style={{ color: '#7A6890' }}>Se toma de la pestaña Info</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 flex items-center justify-between shrink-0"
          style={{ borderTop: '1px solid rgba(123,47,255,0.15)' }}>
          <button onClick={onClose} className="text-sm font-medium px-4 py-2 rounded-full transition-all"
            style={{ color: '#7A6890' }} onMouseOver={e => (e.currentTarget.style.color = '#fff')}
            onMouseOut={e => (e.currentTarget.style.color = '#7A6890')}>
            Cancelar
          </button>
          <button onClick={onClose}
            className="text-white font-bold px-6 py-2.5 rounded-full text-sm transition-all gradient-magenta glow-btn hover:opacity-90">
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  )
}

function FormField({ label, value, onChange, placeholder, prefix }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; prefix?: string
}) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#7A6890' }}>{label}</label>
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(123,47,255,0.2)' }}>
        {prefix && <span className="text-sm shrink-0" style={{ color: '#7A6890' }}>{prefix}</span>}
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="flex-1 bg-transparent text-white placeholder-[#7A6890] text-sm focus:outline-none" />
      </div>
    </div>
  )
}
