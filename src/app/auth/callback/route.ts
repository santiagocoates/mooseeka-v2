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
    return NextResponse.redirect(`${origin}/login?error=auth`)
  }

  // Check if user needs onboarding
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', data.user.id)
    .maybeSingle()

  const needsOnboarding = !profile || !profile.onboarding_completed
  const response = NextResponse.redirect(`${origin}${needsOnboarding ? '/onboarding' : '/home'}`)

  // Apply session cookies directly to the redirect response
  newCookies.forEach(({ name, value, options }) => {
    response.cookies.set({ name, value, ...options })
  })

  return response
}
