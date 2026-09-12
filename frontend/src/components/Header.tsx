"use client"

import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'

export default function Header() {
  const token = useAuthStore((s) => s.token)
  const logout = useAuthStore((s) => s.logout)
  const router = useRouter()
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/"> <span className="font-bold">Nebula Deploy</span> </Link>
        <nav className="space-x-3">
          {token ? (
            <>
              <Link href="/">Dashboard</Link>
              <button
                onClick={() => {
                  logout()
                  router.push('/login')
                }}
                className="ml-2 text-sm text-red-600 hover:underline"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login">Login</Link>
              <Link href="/register">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
