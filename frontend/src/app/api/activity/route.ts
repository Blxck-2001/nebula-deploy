import { NextResponse } from 'next/server'

export async function GET() {
  // Dev API: do not expose local recent activity mock data
  return NextResponse.json([])
}
