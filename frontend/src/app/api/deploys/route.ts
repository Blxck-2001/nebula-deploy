import { NextResponse } from 'next/server'

export async function GET() {
  // Dev API: no local mock deploys exposed. Frontend landing visuals still use internal mocks.
  return NextResponse.json([])
}
