import { NextResponse } from 'next/server'

export async function GET() {
  // Dev API: resources endpoint should not return local mock data
  return NextResponse.json([])
}
