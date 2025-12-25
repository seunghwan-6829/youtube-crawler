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

interface ChannelInfo {
  id: string
  title: string
  description: string
  thumbnail: string
  subscriberCount: number
  videoCount: number
  viewCount: number
}

interface ChannelVideo {
  id: string
  title: string
  thumbnailDefault: string
  thumbnailMedium: string
  thumbnailHigh: string
  thumbnailMaxres: string
  viewCount: number
  likeCount: number
  commentCount: number
  publishedAt: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [videos, setVideos] = useState<VideoResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [activeTab, setActiveTab] = useState<'search' | 'channel'>('search')
  const [channelQuery, setChannelQuery] = useState('')
  const [channelData, setChannelData] = useState<{channel: ChannelInfo, videos: ChannelVideo[]} | null>(null)
  const [channelLoading, setChannelLoading] = useState(false)
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set())
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
      setError('검색 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleChannelSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!channelQuery.trim()) return
    setChannelLoading(true)
    setError('')
    setChannelData(null)

    try {
      const isChannelId = channelQuery.trim().startsWith('UC')
      const param = isChannelId ? `channelId=${channelQuery.trim()}` : `handle=${encodeURIComponent(channelQuery.trim())}`
      const res = await fetch(`/api/youtube/channel?${param}&maxResults=12`)
      const data = await res.json()
      if (data.error) setError(data.error)
      else setChannelData(data)
    } catch (err) {
      setError('채널 검색 중 오류가 발생했습니다.')
    } finally {
      setChannelLoading(false)
    }
  }

  const handleDownloadThumbnail = (url: string, title: string) => {
    const filename = `${title.replace(/[^a-zA-Z0-9가-힣]/g, '_')}.jpg`
    window.open(`/api/youtube/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`, '_blank')
  }

  const handleSelectVideo = (videoId: string) => {
    const newSelected = new Set(selectedVideos)
    if (newSelected.has(videoId)) {
      newSelected.delete(videoId)
    } else {
      newSelected.add(videoId)
    }
    setSelectedVideos(newSelected)
  }

  const handleDownloadSelected = () => {
    if (!channelData) return
    channelData.videos.forEach(video => {
      if (selectedVideos.has(video.id)) {
        handleDownloadThumbnail(video.thumbnailMaxres || video.thumbnailHigh, video.title)
      }
    })
  }

  const formatNumber = (num: number) => {
    if (num >= 100000000) return (num / 100000000).toFixed(1) + '억'
    if (num >= 10000) return (num / 10000).toFixed(1) + '만'
    if (num >= 1000) return (num / 1000).toFixed(1) + '천'
    return num.toString()
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
          <p className='text-gray-500'>로딩 중...</p>
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
            <span className='text-xl font-bold'><span className='gradient-text'>리부트</span> 크롤러</span>
          </Link>
          <div className='flex items-center gap-6'>
            {isAdmin && <Link href='/admin' className='text-orange-500 hover:text-orange-600 font-medium'>관리자</Link>}
            <span className='text-gray-500 text-sm'>{user.email}</span>
            <button onClick={handleLogout} className='text-gray-500 hover:text-gray-700 text-sm font-medium'>로그아웃</button>
          </div>
        </div>
      </nav>

      <main className='pt-24 pb-16'>
        <div className='max-w-5xl mx-auto px-6'>
          <div className='mb-8'>
            <h1 className='text-3xl font-bold mb-2'>유튜브 크롤러</h1>
            <p className='text-gray-500'>영상을 검색하거나 채널의 최신 영상을 크롤링하세요</p>
          </div>

          <div className='flex gap-4 mb-8'>
            <button 
              onClick={() => setActiveTab('search')}
              className={'px-6 py-3 rounded-xl font-medium transition-all ' + (activeTab === 'search' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100')}
            >
              영상 검색
            </button>
            <button 
              onClick={() => setActiveTab('channel')}
              className={'px-6 py-3 rounded-xl font-medium transition-all ' + (activeTab === 'channel' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100')}
            >
              채널 크롤링
            </button>
          </div>

          {activeTab === 'search' && (
            <>
              <form onSubmit={handleSearch} className='flex gap-4 mb-8'>
                <input type='text' value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className='input-field flex-1' placeholder='검색어를 입력하세요...' />
                <button type='submit' className='btn-primary' disabled={loading}>
                  {loading ? '검색 중...' : '검색'}
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
                    <div className='flex flex-col gap-2 self-center flex-shrink-0'>
                      <a href={'https://youtube.com/watch?v=' + video.id} target='_blank' rel='noopener noreferrer'
                        className='btn-primary text-sm py-2 px-4'>보기</a>
                      <button 
                        onClick={() => handleDownloadThumbnail(video.thumbnail, video.title)}
                        className='text-orange-500 hover:text-orange-600 text-sm py-2 px-4 border border-orange-200 rounded-xl hover:bg-orange-50 transition-colors flex items-center gap-1'
                      >
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' /></svg>
                        썸네일
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {videos.length === 0 && !loading && !error && (
                <div className='text-center py-20'>
                  <div className='w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                    <svg className='w-10 h-10 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' /></svg>
                  </div>
                  <h3 className='text-xl font-semibold text-gray-700 mb-2'>검색 결과가 없습니다</h3>
                  <p className='text-gray-500'>검색어를 입력하여 유튜브 영상을 찾아보세요</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'channel' && (
            <>
              <form onSubmit={handleChannelSearch} className='flex gap-4 mb-8'>
                <input type='text' value={channelQuery} onChange={(e) => setChannelQuery(e.target.value)}
                  className='input-field flex-1' placeholder='채널 ID(UC...) 또는 채널명(@핸들)을 입력하세요...' />
                <button type='submit' className='btn-primary' disabled={channelLoading}>
                  {channelLoading ? '크롤링 중...' : '크롤링'}
                </button>
              </form>

              {error && <div className='p-4 bg-red-50 border border-red-200 rounded-xl mb-6'><p className='text-red-600'>{error}</p></div>}

              {channelData && (
                <div>
                  <div className='card mb-6'>
                    <div className='flex items-center gap-4'>
                      <img src={channelData.channel.thumbnail} alt={channelData.channel.title} className='w-20 h-20 rounded-full' />
                      <div className='flex-1'>
                        <h2 className='text-2xl font-bold mb-1'>{channelData.channel.title}</h2>
                        <p className='text-gray-500'>구독자 {formatNumber(channelData.channel.subscriberCount)}명 | 영상 {formatNumber(channelData.channel.videoCount)}개 | 조회수 {formatNumber(channelData.channel.viewCount)}회</p>
                      </div>
                      {selectedVideos.size > 0 && (
                        <button onClick={handleDownloadSelected} className='btn-primary flex items-center gap-2'>
                          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' /></svg>
                          선택 다운로드 ({selectedVideos.size}개)
                        </button>
                      )}
                    </div>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {channelData.videos.map((video) => (
                      <div 
                        key={video.id} 
                        className={'card cursor-pointer transition-all ' + (selectedVideos.has(video.id) ? 'ring-2 ring-orange-500' : '')}
                        onClick={() => handleSelectVideo(video.id)}
                      >
                        <div className='relative mb-3'>
                          <img 
                            src={video.thumbnailMedium || video.thumbnailHigh} 
                            alt={video.title} 
                            className='w-full aspect-video object-cover rounded-lg' 
                          />
                          {selectedVideos.has(video.id) && (
                            <div className='absolute top-2 right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center'>
                              <svg className='w-4 h-4 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' /></svg>
                            </div>
                          )}
                          <div className='absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded text-white text-xs'>
                            조회수 {formatNumber(video.viewCount)}
                          </div>
                        </div>
                        <h4 className='font-medium line-clamp-2 mb-2'>{video.title}</h4>
                        <div className='flex justify-between items-center text-sm'>
                          <span className='text-gray-400'>{new Date(video.publishedAt).toLocaleDateString('ko-KR')}</span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDownloadThumbnail(video.thumbnailMaxres || video.thumbnailHigh, video.title)
                            }}
                            className='text-orange-500 hover:text-orange-600 flex items-center gap-1'
                          >
                            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' /></svg>
                            썸네일
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!channelData && !channelLoading && !error && (
                <div className='text-center py-20'>
                  <div className='w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                    <svg className='w-10 h-10 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' /></svg>
                  </div>
                  <h3 className='text-xl font-semibold text-gray-700 mb-2'>채널 정보가 없습니다</h3>
                  <p className='text-gray-500'>채널 ID 또는 핸들을 입력하여 최신 영상을 크롤링하세요</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
