import { NextResponse } from 'next/server'

export async function GET() {
  // Dev API: stats endpoint returns no local mock data in server API
  return NextResponse.json([])
}
