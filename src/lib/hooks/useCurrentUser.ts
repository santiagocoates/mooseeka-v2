'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const CACHE_KEY = 'mooseeka_current_user'

interface CurrentUser {
  id: string
  username: string
  name: string
  avatar_url: string | null
  is_admin: boolean
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(() => {
    if (typeof window === 'undefined') return null
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      return cached ? JSON.parse(cached) : null
    } catch { return null }
  })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (!authUser) {
        localStorage.removeItem(CACHE_KEY)
        setUser(null)
        return
      }
      supabase
        .from('profiles')
        .select('id, username, name, avatar_url, is_admin')
        .eq('id', authUser.id)
        .single()
        .then(({ data }) => {
          if (data) {
            localStorage.setItem(CACHE_KEY, JSON.stringify(data))
            setUser(data)
          }
        })
    })
  }, [])

  return user
}
