import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SYSTEM_AGENTS } from '@/lib/seed-agents'

export async function POST() {
  try {
    const existing = await prisma.agent.count({ where: { isSystem: true } })
    if (existing > 0) {
      return NextResponse.json({ message: `${existing} agents système déjà présents` })
    }

    await prisma.agent.createMany({ data: SYSTEM_AGENTS })
    return NextResponse.json({ message: `${SYSTEM_AGENTS.length} agents créés` }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
