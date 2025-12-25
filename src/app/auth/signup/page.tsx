'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('鍮꾨?踰덊샇媛 ?쇱튂?섏? ?딆뒿?덈떎.')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <main className='min-h-screen flex items-center justify-center p-4'>
        <div className='card w-full max-w-md text-center'>
          <div className='text-5xl mb-4'>?됵툘</div>
          <h1 className='text-2xl font-bold mb-4'>?대찓?쇱쓣 ?뺤씤?댁＜?몄슂!</h1>
          <p className='text-gray-600 mb-6'>
            {email}?쇰줈 ?뺤씤 硫붿씪??諛쒖넚?덉뒿?덈떎.<br/>
            硫붿씪??留곹겕瑜??대┃?섏뿬 媛?낆쓣 ?꾨즺?댁＜?몄슂.
          </p>
          <Link href='/auth/login' className='text-orange-500 font-semibold hover:underline'>
            濡쒓렇???섏씠吏濡??뚯븘媛湲?          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className='min-h-screen flex items-center justify-center p-4'>
      <div className='card w-full max-w-md'>
        <h1 className='text-2xl font-bold text-center mb-6'>
          <span className='text-orange-500'>?뚯썝媛??/span>
        </h1>
        
        <form onSubmit={handleSignup} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium mb-2'>?대찓??/label>
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
            <label className='block text-sm font-medium mb-2'>鍮꾨?踰덊샇</label>
            <input
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='input-field'
              placeholder='理쒖냼 6???댁긽'
              minLength={6}
              required
            />
          </div>

          <div>
            <label className='block text-sm font-medium mb-2'>鍮꾨?踰덊샇 ?뺤씤</label>
            <input
              type='password'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className='input-field'
              placeholder='鍮꾨?踰덊샇瑜??ㅼ떆 ?낅젰?댁＜?몄슂'
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
            {loading ? '媛??以?..' : '?뚯썝媛??}
          </button>
        </form>

        <p className='text-center mt-6 text-gray-600'>
          ?대? 怨꾩젙???덉쑝?좉???{' '}
          <Link href='/auth/login' className='text-orange-500 font-semibold hover:underline'>
            濡쒓렇??          </Link>
        </p>
      </div>
    </main>
  )
}
