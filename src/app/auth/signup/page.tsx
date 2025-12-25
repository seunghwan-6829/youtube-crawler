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

    if (password.length < 6) {
      setError('鍮꾨?踰덊샇??6???댁긽?댁뼱???⑸땲??')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setError('?뚯썝媛?낆뿉 ?ㅽ뙣?덉뒿?덈떎. ?ㅼ떆 ?쒕룄?댁＜?몄슂.')
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className='dark min-h-screen flex' style={{background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)'}}>
      {/* ?쇱そ 釉뚮옖???곸뿭 */}
      <div className='hidden lg:flex lg:w-1/2 items-center justify-center p-12'>
        <div className='max-w-md'>
          <Link href='/' className='flex items-center gap-3 mb-8'>
            <div className='w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center'>
              <span className='text-white font-bold text-xl'>RC</span>
            </div>
            <span className='text-3xl font-bold text-white'>
              <span className='gradient-text'>由щ???/span> ?щ·??            </span>
          </Link>
          <h1 className='text-4xl font-bold text-white mb-4 leading-tight'>
            吏湲?諛붾줈<br/>臾대즺濡??쒖옉?섏꽭??          </h1>
          <p className='text-gray-400 text-lg'>
            媛?낇븯怨??좏뒠釉??곗씠???섏쭛???덈줈???멸퀎瑜?寃쏀뿕?섏꽭??
          </p>
          <div className='mt-8 space-y-4'>
            <div className='flex items-center gap-3 text-gray-300'>
              <span className='text-green-400'>??/span>
              <span>臾대즺濡??쒖옉 媛??/span>
            </div>
            <div className='flex items-center gap-3 text-gray-300'>
              <span className='text-green-400'>??/span>
              <span>?ㅼ떆媛??좏뒠釉??곗씠??寃??/span>
            </div>
            <div className='flex items-center gap-3 text-gray-300'>
              <span className='text-green-400'>??/span>
              <span>媛꾪렪???곗씠???섏쭛</span>
            </div>
          </div>
        </div>
      </div>

      {/* ?ㅻⅨ履??뚯썝媛????*/}
      <div className='w-full lg:w-1/2 flex items-center justify-center p-8'>
        <div className='w-full max-w-md'>
          <div className='lg:hidden mb-8'>
            <Link href='/' className='flex items-center gap-2 justify-center'>
              <div className='w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center'>
                <span className='text-white font-bold'>RC</span>
              </div>
              <span className='text-2xl font-bold text-white'>
                <span className='gradient-text'>由щ???/span> ?щ·??              </span>
            </Link>
          </div>

          <div className='card' style={{background: '#1a1a1a', border: '1px solid #333'}}>
            <h2 className='text-2xl font-bold text-white text-center mb-2'>?뚯썝媛??/h2>
            <p className='text-gray-400 text-center mb-8'>??怨꾩젙??留뚮뱾?대낫?몄슂</p>
            
            <form onSubmit={handleSignup} className='space-y-5'>
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>?대찓??/label>
                <input
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='input-field'
                  style={{background: '#0f0f0f', borderColor: '#333', color: 'white'}}
                  placeholder='your@email.com'
                  required
                />
              </div>
              
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>鍮꾨?踰덊샇</label>
                <input
                  type='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='input-field'
                  style={{background: '#0f0f0f', borderColor: '#333', color: 'white'}}
                  placeholder='6???댁긽 ?낅젰'
                  minLength={6}
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>鍮꾨?踰덊샇 ?뺤씤</label>
                <input
                  type='password'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className='input-field'
                  style={{background: '#0f0f0f', borderColor: '#333', color: 'white'}}
                  placeholder='鍮꾨?踰덊샇瑜??ㅼ떆 ?낅젰'
                  required
                />
              </div>

              {error && (
                <div className='p-3 bg-red-500/10 border border-red-500/20 rounded-lg'>
                  <p className='text-red-400 text-sm'>{error}</p>
                </div>
              )}

              <button 
                type='submit' 
                className='btn-primary w-full py-3'
                disabled={loading}
              >
                {loading ? '媛??以?..' : '?뚯썝媛??}
              </button>
            </form>

            <div className='mt-6 text-center'>
              <p className='text-gray-400'>
                ?대? 怨꾩젙???덉쑝?좉???{' '}
                <Link href='/auth/login' className='text-orange-500 font-semibold hover:text-orange-400 transition-colors'>
                  濡쒓렇??                </Link>
              </p>
            </div>
          </div>

          <p className='text-center mt-8 text-gray-500 text-sm'>
            <Link href='/' className='hover:text-gray-400 transition-colors'>
              ??硫붿씤?쇰줈 ?뚯븘媛湲?            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}