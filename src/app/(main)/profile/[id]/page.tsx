import { redirect } from 'next/navigation'

/* Legacy route — redirect to username-based URLs */
export default async function ProfileLegacy({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // "me" → redirect to the mock current user; otherwise treat id as username
  redirect(id === 'me' ? '/elenarios' : `/${id}`)
}
