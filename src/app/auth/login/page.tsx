'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <main className='min-h-screen flex items-center justify-center p-4'>
      <div className='card w-full max-w-md'>
        <h1 className='text-2xl font-bold text-center mb-6'>
          <span className='text-orange-500'>YouTube</span> Crawler
        </h1>
        
        <form onSubmit={handleLogin} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium mb-2'>Email</label>
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='input-field'
              placeholder='your@email.com'
              required
            />
          </div>
          
          <div>
            <label className='block text-sm font-medium mb-2'>Password</label>
            <input
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='input-field'
              placeholder='********'
              required
            />
          </div>

          {error && (
            <p className='text-red-500 text-sm'>{error}</p>
          )}

          <button 
            type='submit' 
            className='btn-primary w-full'
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className='text-center mt-6 text-gray-600'>
          No account?{' '}
          <Link href='/auth/signup' className='text-orange-500 font-semibold hover:underline'>
            Sign Up
          </Link>
        </p>
      </div>
    </main>
  )
}