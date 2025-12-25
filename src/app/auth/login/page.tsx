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

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.')
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className='min-h-screen flex' style={{background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)'}}>
      <div className='hidden lg:flex lg:w-1/2 items-center justify-center p-12'>
        <div className='max-w-md'>
          <Link href='/' className='flex items-center gap-3 mb-8'>
            <div className='w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center'>
              <span className='text-white font-bold text-xl'>RC</span>
            </div>
            <span className='text-3xl font-bold text-white'>
              <span className='gradient-text'>리부트</span> 크롤러
            </span>
          </Link>
          <h1 className='text-4xl font-bold text-white mb-4 leading-tight'>
            유튜브 데이터의<br/>모든 것을 한 곳에서
          </h1>
          <p className='text-gray-400 text-lg'>로그인하여 강력한 유튜브 데이터 수집 도구를 경험하세요.</p>
        </div>
      </div>

      <div className='w-full lg:w-1/2 flex items-center justify-center p-8'>
        <div className='w-full max-w-md'>
          <div className='lg:hidden mb-8'>
            <Link href='/' className='flex items-center gap-2 justify-center'>
              <div className='w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center'>
                <span className='text-white font-bold'>RC</span>
              </div>
              <span className='text-2xl font-bold text-white'>
                <span className='gradient-text'>리부트</span> 크롤러
              </span>
            </Link>
          </div>

          <div className='card' style={{background: '#1a1a1a', border: '1px solid #333'}}>
            <h2 className='text-2xl font-bold text-white text-center mb-2'>로그인</h2>
            <p className='text-gray-400 text-center mb-8'>계정에 로그인하세요</p>
            
            <form onSubmit={handleLogin} className='space-y-5'>
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>이메일</label>
                <input type='email' value={email} onChange={(e) => setEmail(e.target.value)}
                  className='input-field' style={{background: '#0f0f0f', borderColor: '#333', color: 'white'}}
                  placeholder='your@email.com' required />
              </div>
              
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>비밀번호</label>
                <input type='password' value={password} onChange={(e) => setPassword(e.target.value)}
                  className='input-field' style={{background: '#0f0f0f', borderColor: '#333', color: 'white'}}
                  placeholder='********' required />
              </div>

              {error && <div className='p-3 bg-red-500/10 border border-red-500/20 rounded-lg'><p className='text-red-400 text-sm'>{error}</p></div>}

              <button type='submit' className='btn-primary w-full py-3' disabled={loading}>
                {loading ? '로그인 중...' : '로그인'}
              </button>
            </form>

            <div className='mt-6 text-center'>
              <p className='text-gray-400'>계정이 없으신가요? <Link href='/auth/signup' className='text-orange-500 font-semibold hover:text-orange-400'>회원가입</Link></p>
            </div>
          </div>

          <p className='text-center mt-8 text-gray-500 text-sm'><Link href='/' className='hover:text-gray-400'>메인으로 돌아가기</Link></p>
        </div>
      </div>
    </div>
  )
}