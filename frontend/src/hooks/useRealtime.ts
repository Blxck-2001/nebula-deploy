"use client"

import { useEffect, useRef, useCallback } from 'react'

// Use dynamic require to avoid static TS resolution issues in this environment


export function useWebSocket({ url, onMessage }: { url: string; onMessage: (d: any) => void }) {
  const connRef = useRef<{ close: () => void; send?: (d: any) => void } | null>(null)

  useEffect(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod: any = require('../lib/realtime')
      connRef.current = mod.connectWebSocket(url, onMessage)
    } catch (e) {
      // ignore
    }
    return () => connRef.current?.close()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url])

  const send = useCallback((data: unknown) => {
    connRef.current?.send?.(data)
  }, [])

  return { send }
}

export function useSSE({ url, onMessage }: { url: string; onMessage: (d: any) => void }) {
  const connRef = useRef<{ close: () => void } | null>(null)

  useEffect(() => {
    if (!url) return
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod: any = require('../lib/realtime')
      connRef.current = mod.connectSSE(url, onMessage)
    } catch (e) {
      // ignore
    }
    return () => connRef.current?.close()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url])
}
