'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

interface VideoResult {
  id: string
  title: string
  description: string
  thumbnail: string
  channelTitle: string
  publishedAt: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [videos, setVideos] = useState<VideoResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
      } else {
        setUser(user)
        setIsAdmin(user.email === 'motiol_6829@naver.com')
      }
    }
    checkUser()
  }, [])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/youtube?q=' + encodeURIComponent(searchQuery))
      const data = await res.json()
      if (data.error) setError(data.error)
      else setVideos(data.items || [])
    } catch (err) {
      setError('寃??以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (!user) {
    return (
      <div className='min-h-screen flex items-center justify-center' style={{background: '#fafafa'}}>
        <div className='text-center'>
          <div className='w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-gray-500'>濡쒕뵫 以?..</p>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen' style={{background: '#fafafa'}}>
      <nav className='navbar fixed top-0 left-0 right-0 z-50'>
        <div className='max-w-6xl mx-auto px-6 py-4 flex justify-between items-center'>
          <Link href='/dashboard' className='flex items-center gap-2'>
            <div className='w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center'>
              <span className='text-white font-bold text-sm'>RC</span>
            </div>
            <span className='text-xl font-bold'><span className='gradient-text'>由щ???/span> ?щ·??/span>
          </Link>
          <div className='flex items-center gap-6'>
            {isAdmin && <Link href='/admin' className='text-orange-500 hover:text-orange-600 font-medium'>愿由ъ옄</Link>}
            <span className='text-gray-500 text-sm'>{user.email}</span>
            <button onClick={handleLogout} className='text-gray-500 hover:text-gray-700 text-sm font-medium'>濡쒓렇?꾩썐</button>
          </div>
        </div>
      </nav>

      <main className='pt-24 pb-16'>
        <div className='max-w-4xl mx-auto px-6'>
          <div className='mb-8'>
            <h1 className='text-3xl font-bold mb-2'>?좏뒠釉?寃??/h1>
            <p className='text-gray-500'>?ㅼ썙?쒕? ?낅젰?섏뿬 ?좏뒠釉??곸긽??寃?됲븯?몄슂</p>
          </div>

          <form onSubmit={handleSearch} className='flex gap-4 mb-8'>
            <input type='text' value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className='input-field flex-1' placeholder='寃?됱뼱瑜??낅젰?섏꽭??..' />
            <button type='submit' className='btn-primary' disabled={loading}>
              {loading ? '寃??以?..' : '寃??}
            </button>
          </form>

          {error && <div className='p-4 bg-red-50 border border-red-200 rounded-xl mb-6'><p className='text-red-600'>{error}</p></div>}

          <div className='space-y-4'>
            {videos.map((video) => (
              <div key={video.id} className='card flex gap-4 hover:shadow-lg transition-shadow'>
                <img src={video.thumbnail} alt={video.title} className='w-44 h-28 object-cover rounded-lg flex-shrink-0' />
                <div className='flex-1 min-w-0'>
                  <h3 className='font-semibold mb-1 line-clamp-2'>{video.title}</h3>
                  <p className='text-sm text-gray-500 mb-2'>{video.channelTitle}</p>
                  <p className='text-xs text-gray-400'>{new Date(video.publishedAt).toLocaleDateString('ko-KR')}</p>
                </div>
                <a href={'https://youtube.com/watch?v=' + video.id} target='_blank' rel='noopener noreferrer'
                  className='btn-primary text-sm py-2 px-4 self-center flex-shrink-0'>蹂닿린</a>
              </div>
            ))}
          </div>

          {videos.length === 0 && !loading && !error && (
            <div className='text-center py-20'>
              <div className='w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                <span className='text-4xl'>?뵇</span>
              </div>
              <h3 className='text-xl font-semibold text-gray-700 mb-2'>寃??寃곌낵媛 ?놁뒿?덈떎</h3>
              <p className='text-gray-500'>寃?됱뼱瑜??낅젰?섏뿬 ?좏뒠釉??곸긽??李얠븘蹂댁꽭??/p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}