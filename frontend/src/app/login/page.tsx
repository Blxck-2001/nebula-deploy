"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import api from '@/lib/axios'
import { useRouter } from 'next/navigation'
import { Logo } from "@/components/landing/Logo";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const resp = await api.post('/api/auth/login', { email: data.email, password: data.password })
      const token = resp.data?.accessToken
      if (!token) throw new Error('no token')
      const userObj = {
        id: "1",
        name: data.email.split('@')[0],
        email: data.email,
        role: "administrator",
      }
      login(userObj, token)
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          // Persist zustand's persist shape to ensure token is available
          const payload = { state: { user: userObj, token: token, isAuthenticated: true } }
          window.localStorage.setItem('nebula-auth', JSON.stringify(payload))
        }
      } catch (e) {
        // ignore storage errors
      }
      router.push('/plataforma')
    } catch (err) {
      // simple error feedback
      // eslint-disable-next-line no-alert
      alert('Falha ao autenticar')
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-6">
      <div className="pointer-events-none absolute inset-0 bg-nebula-gradient" />
      <div className="pointer-events-none absolute top-1/4 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[100px]" />

      <div className="relative w-full max-w-md">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
        >
          <ArrowLeft size={16} />
          Voltar
        </Link>

        <div className="glass-card p-8">
          <div className="mb-8 flex justify-center">
            <Logo />
          </div>

          <h1 className="mb-2 text-center text-xl font-bold text-white">
            Acessar plataforma
          </h1>
          <p className="mb-6 text-center text-sm text-slate-400">
            Entre com suas credenciais para continuar
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-slate-300"
              >
                E-mail
              </label>
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                {...register("email")}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-slate-300"
              >
                Senha
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                {...register("password")}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-500 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
