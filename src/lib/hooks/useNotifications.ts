'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useCurrentUser } from './useCurrentUser'

export interface Notification {
  id: string
  type: 'follow' | 'like' | 'comment'
  read: boolean
  created_at: string
  post_id: string | null
  actor: {
    id: string
    name: string
    username: string
    avatar_url: string | null
  }
}

export function useNotifications() {
  const currentUser = useCurrentUser()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount,   setUnreadCount]   = useState(0)

  const fetchNotifications = useCallback(async () => {
    if (!currentUser) return
    const supabase = createClient()
    const { data } = await supabase
      .from('notifications')
      .select('id, type, read, created_at, post_id, actor:profiles!notifications_actor_id_fkey(id, name, username, avatar_url)')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })
      .limit(30)

    const list = (data ?? []) as unknown as Notification[]
    setNotifications(list)
    setUnreadCount(list.filter(n => !n.read).length)
  }, [currentUser])

  // Carga inicial
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Realtime: escucha inserts en la tabla notifications filtrado por user_id
  useEffect(() => {
    if (!currentUser) return
    const supabase = createClient()
    const channel = supabase
      .channel('notifications-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${currentUser.id}`,
      }, () => {
        fetchNotifications()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [currentUser, fetchNotifications])

  async function markAllRead() {
    if (!currentUser || unreadCount === 0) return
    const supabase = createClient()
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', currentUser.id)
      .eq('read', false)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  return { notifications, unreadCount, markAllRead, refresh: fetchNotifications }
}
