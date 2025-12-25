'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

interface VideoResult {
  id: string
  title: string
  description: string
  thumbnail: string
  channelTitle: string
  publishedAt: string
  viewCount?: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [videos, setVideos] = useState<VideoResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
      } else {
        setUser(user)
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

      if (data.error) {
        setError(data.error)
      } else {
        setVideos(data.items || [])
      }
    } catch (err) {
      setError('An error occurred while searching.')
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
      <main className='min-h-screen flex items-center justify-center'>
        <div className='text-orange-500'>Loading...</div>
      </main>
    )
  }

  return (
    <main className='min-h-screen p-8'>
      <header className='flex justify-between items-center mb-8'>
        <h1 className='text-2xl font-bold'>
          <span className='text-orange-500'>YouTube</span> Crawler
        </h1>
        <div className='flex items-center gap-4'>
          <span className='text-gray-600 text-sm'>{user.email}</span>
          <button onClick={handleLogout} className='text-gray-500 hover:text-gray-700'>
            Logout
          </button>
        </div>
      </header>

      <div className='max-w-4xl mx-auto'>
        <form onSubmit={handleSearch} className='flex gap-4 mb-8'>
          <input
            type='text'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='input-field flex-1'
            placeholder='Enter YouTube search query...'
          />
          <button type='submit' className='btn-primary' disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {error && (
          <div className='text-red-500 mb-4 p-4 bg-red-50 rounded-lg'>{error}</div>
        )}

        <div className='space-y-4'>
          {videos.map((video) => (
            <div key={video.id} className='card flex gap-4'>
              <img
                src={video.thumbnail}
                alt={video.title}
                className='w-40 h-24 object-cover rounded-lg'
              />
              <div className='flex-1'>
                <h3 className='font-semibold mb-1 line-clamp-2'>{video.title}</h3>
                <p className='text-sm text-gray-500 mb-2'>{video.channelTitle}</p>
                <p className='text-xs text-gray-400'>
                  {new Date(video.publishedAt).toLocaleDateString('en-US')}
                </p>
              </div>
              <a
                href={'https://youtube.com/watch?v=' + video.id}
                target='_blank'
                rel='noopener noreferrer'
                className='text-orange-500 hover:text-orange-600 text-sm font-medium self-center'
              >
                Watch
              </a>
            </div>
          ))}
        </div>

        {videos.length === 0 && !loading && !error && (
          <div className='text-center py-16 text-gray-400'>
            <div className='text-5xl mb-4'>?뵇</div>
            <p>Enter a search query to find YouTube videos</p>
          </div>
        )}
      </div>
    </main>
  )
}