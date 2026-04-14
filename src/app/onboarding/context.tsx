'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

export interface OnboardingData {
  name: string
  username: string
  avatarFile: File | null
  avatarPreview: string | null
  bannerFile: File | null
  bannerPreview: string | null
  roles: string[]
  genres: string[]
  objetivo: string
}

interface OnboardingCtx extends OnboardingData {
  update: (patch: Partial<OnboardingData>) => void
}

const Ctx = createContext<OnboardingCtx | null>(null)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>({
    name: '',
    username: '',
    avatarFile: null,
    avatarPreview: null,
    bannerFile: null,
    bannerPreview: null,
    roles: [],
    genres: [],
    objetivo: '',
  })

  function update(patch: Partial<OnboardingData>) {
    setData(prev => ({ ...prev, ...patch }))
  }

  return <Ctx.Provider value={{ ...data, update }}>{children}</Ctx.Provider>
}

export function useOnboarding() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider')
  return ctx
}
