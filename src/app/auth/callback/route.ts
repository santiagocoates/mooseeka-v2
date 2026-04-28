import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth`)
  }

  const cookieStore = await cookies()

  // Collect cookies Supabase wants to set, apply them to the response later
  const newCookies: { name: string; value: string; options: Partial<ResponseCookie> }[] = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(c => newCookies.push(c))
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user) {
    // El código puede haber sido ya usado (refresh / doble redirect).
    // Si hay sesión activa, mandamos al home en vez de mostrar error.
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      return NextResponse.redirect(`${origin}/home`)
    }
    return NextResponse.redirect(`${origin}/login?error=auth`)
  }

  // Leer parámetro next (para volver al producto después del login/signup)
  const next = searchParams.get('next')
  const safeNext = next && next.startsWith('/') ? next : null

  // Check if user needs onboarding
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', data.user.id)
    .maybeSingle()

  const needsOnboarding = !profile || !profile.onboarding_completed
  let destination: string

  if (safeNext) {
    // Si viene de un producto, ignorar onboarding y llevar directo al destino
    destination = safeNext
  } else {
    destination = needsOnboarding ? '/onboarding' : '/home'
  }

  const response = NextResponse.redirect(`${origin}${destination}`)

  // Apply session cookies directly to the redirect response
  newCookies.forEach(({ name, value, options }) => {
    response.cookies.set({ name, value, ...options })
  })

  return response
}
