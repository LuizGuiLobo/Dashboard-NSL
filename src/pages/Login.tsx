import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'

export function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErro('')
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) setErro(error.message === 'Invalid login credentials' ? 'Email ou senha incorretos.' : error.message)
    setLoading(false)
  }

  const inputClass = 'w-full bg-dark-surface2 border border-dark-border rounded-lg px-4 py-3 text-sm text-onsurface font-body placeholder-dark-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all'

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display tracking-widest text-onsurface">NSL DIESEL</h1>
          <p className="text-sm text-dark-muted font-body mt-1">Sistema de Gestão Operacional</p>
        </div>

        <form onSubmit={handleLogin} className="bg-dark-surface border border-dark-border rounded-2xl p-6 space-y-4 shadow-2xl">
          <div>
            <label className="text-xs font-body font-semibold text-dark-muted uppercase tracking-wider mb-1.5 block">Email</label>
            <input
              type="email"
              className={inputClass}
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs font-body font-semibold text-dark-muted uppercase tracking-wider mb-1.5 block">Senha</label>
            <input
              type="password"
              className={inputClass}
              value={senha}
              onChange={e => setSenha(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {erro && (
            <p className="text-sm text-red-400 font-body bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-accent text-black font-body font-bold text-sm hover:bg-accent-hover transition-all shadow-lg shadow-accent/20 disabled:opacity-50 mt-2"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
