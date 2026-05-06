import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  if (!webhookUrl) return NextResponse.json({ ok: false })

  try {
    const { name, username, roles } = await req.json()

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🎉 *Nuevo usuario en Mooseeka*\n*Nombre:* ${name}\n*Usuario:* @${username}${roles?.length ? `\n*Roles:* ${roles.join(', ')}` : ''}\n*Perfil:* https://app.mooseeka.com/${username}`,
      }),
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[slack/signup]', err)
    return NextResponse.json({ ok: false })
  }
}
