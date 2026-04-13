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
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Si el usuario se creó hace menos de 10 segundos → es nuevo → onboarding
      const createdAt = new Date(data.user.created_at).getTime()
      const now = Date.now()
      const isNewUser = now - createdAt < 10_000

      return NextResponse.redirect(`${origin}${isNewUser ? '/onboarding' : '/home'}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
