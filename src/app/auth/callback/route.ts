import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const createdAt = new Date(data.user.created_at).getTime()
      const isNewUser = Date.now() - createdAt < 10_000
      const redirectTo = isNewUser ? '/onboarding' : '/home'

      // Build the redirect and copy all cookies onto it
      const response = NextResponse.redirect(`${origin}${redirectTo}`)
      cookieStore.getAll().forEach(({ name, value }) => {
        response.cookies.set(name, value)
      })
      return response
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
