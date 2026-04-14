'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface CurrentUser {
  id: string
  username: string
  name: string
  avatar_url: string | null
  is_admin: boolean
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (!authUser) return
      supabase
        .from('profiles')
        .select('id, username, name, avatar_url, is_admin')
        .eq('id', authUser.id)
        .single()
        .then(({ data }) => { if (data) setUser(data) })
    })
  }, [])

  return user
}
