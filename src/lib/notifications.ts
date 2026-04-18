import { createClient } from '@/lib/supabase/client'

/**
 * Inserta una notificación. No notifica si actor === destinatario.
 */
export async function createNotification({
  userId,
  actorId,
  type,
  postId,
}: {
  userId: string
  actorId: string
  type: 'follow' | 'like' | 'comment'
  postId?: string
}) {
  if (userId === actorId) return   // no auto-notificarse
  const supabase = createClient()
  await supabase.from('notifications').insert({
    user_id:  userId,
    actor_id: actorId,
    type,
    post_id:  postId ?? null,
  })
}
