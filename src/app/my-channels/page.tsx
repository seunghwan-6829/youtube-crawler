'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

interface TrackedChannel {
  id: string
  channel_id: string
  title: string
  thumbnail: string
  subscriber_count: number
  video_count: number
  category: string
  created_at: string
}

interface CrawledVideo {
  id: string
  video_id: string
  title: string
  thumbnail_url: string
  thumbnail_maxres: string
  view_count: number
  published_at: string
  is_new: boolean
}

export default function MyChannelsPage() {
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [channels, setChannels] = useState<TrackedChannel[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [categories, setCategories] = useState<string[]>([])
  const [selectedChannel, setSelectedChannel] = useState<TrackedChannel | null>(null)
  const [videos, setVideos] = useState<CrawledVideo[]>([])
  const [videosLoading, setVideosLoading] = useState(false)
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set())
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState('')

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUser(user)
      setIsAdmin(user.email === 'motiol_6829@naver.com')
      await loadChannels(user.id)
      setLoading(false)
    }
    checkUser()
  }, [])

  const loadChannels = async (userId: string) => {
    const { data } = await supabase
      .from('tracked_channels')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (data) {
      setChannels(data)
      const cats = [...new Set(data.map(c => c.category).filter(Boolean))]
      setCategories(cats)
    }
  }

  const loadVideos = async (channel: TrackedChannel) => {
    setSelectedChannel(channel)
    setVideosLoading(true)
    setVideos([])
    setSelectedVideos(new Set())

    const { data } = await supabase
      .from('crawled_videos')
      .select('*')
      .eq('channel_id', channel.channel_id)
      .order('published_at', { ascending: false })

    if (data) {
      setVideos(data)
      // 새 영상 자동 선택
      const newVideos = data.filter(v => v.is_new).map(v => v.video_id)
      if (newVideos.length > 0) {
        setSelectedVideos(new Set(newVideos))
      }
    }
    setVideosLoading(false)
  }

  const handleSync = async (channel: TrackedChannel) => {
    setSyncing(true)
    setSyncMessage('')

    try {
      const res = await fetch('/api/youtube/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          channelId: channel.channel_id,
          maxResults: 50, // 우선 50개씩 가져옴
          fetchAll: true // 전체 가져오기 플래그
        }),
      })
      const data = await res.json()
      
      if (data.error) {
        setSyncMessage('오류: ' + data.error)
      } else {
        setSyncMessage(`새 영상 ${data.summary.newVideos}개, 조회수 업데이트 ${data.summary.updatedVideos}개`)
        await loadVideos(channel)
      }
    } catch (err) {
      setSyncMessage('동기화 중 오류가 발생했습니다.')
    } finally {
      setSyncing(false)
    }
  }

  const handleRemoveChannel = async (channelId: string) => {
    if (!confirm('이 채널을 삭제하시겠습니까?')) return

    await supabase
      .from('tracked_channels')
      .delete()
      .eq('id', channelId)

    if (user) {
      await loadChannels(user.id)
    }
    if (selectedChannel?.id === channelId) {
      setSelectedChannel(null)
      setVideos([])
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
    videos.forEach(video => {
      if (selectedVideos.has(video.video_id)) {
        handleDownloadThumbnail(video.thumbnail_maxres || video.thumbnail_url, video.title)
      }
    })
  }

  const handleSelectAllNew = () => {
    const newVideos = videos.filter(v => v.is_new).map(v => v.video_id)
    setSelectedVideos(new Set(newVideos))
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

  const filteredChannels = selectedCategory === 'all' 
    ? channels 
    : channels.filter(c => c.category === selectedCategory)

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center' style={{background: '#fafafa'}}>
        <div className='w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin'></div>
      </div>
    )
  }

  return (
    <div className='min-h-screen' style={{background: '#fafafa'}}>
      <nav className='navbar fixed top-0 left-0 right-0 z-50'>
        <div className='max-w-7xl mx-auto px-6 py-4 flex justify-between items-center'>
          <Link href='/' className='flex items-center gap-2'>
            <div className='w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center'>
              <span className='text-white font-bold text-sm'>RC</span>
            </div>
            <span className='text-xl font-bold'><span className='gradient-text'>리부트</span> 크롤러</span>
          </Link>
          <div className='flex items-center gap-6'>
            <Link href='/dashboard' className='text-gray-500 hover:text-gray-700 font-medium'>채널 검색</Link>
            <Link href='/my-channels' className='text-orange-500 font-medium'>내 채널</Link>
            {isAdmin && <Link href='/admin' className='text-orange-500 hover:text-orange-600 font-medium'>관리자</Link>}
            <span className='text-gray-500 text-sm'>{user?.email}</span>
            <button onClick={handleLogout} className='text-gray-500 hover:text-gray-700 text-sm font-medium'>로그아웃</button>
          </div>
        </div>
      </nav>

      <main className='pt-24 pb-16'>
        <div className='max-w-7xl mx-auto px-6'>
          <div className='flex gap-8'>
            {/* 왼쪽: 채널 목록 */}
            <div className='w-80 flex-shrink-0'>
              <div className='mb-6'>
                <h1 className='text-2xl font-bold mb-2'>내 채널</h1>
                <p className='text-gray-500 text-sm'>추가한 채널: {channels.length}개</p>
              </div>

              {/* 카테고리 필터 */}
              {categories.length > 0 && (
                <div className='mb-4'>
                  <div className='flex flex-wrap gap-2'>
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={'px-3 py-1 rounded-full text-sm font-medium transition-all ' + (selectedCategory === 'all' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}
                    >
                      전체
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={'px-3 py-1 rounded-full text-sm font-medium transition-all ' + (selectedCategory === cat ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 채널 목록 */}
              <div className='space-y-3'>
                {filteredChannels.map(channel => (
                  <div 
                    key={channel.id}
                    className={'p-4 rounded-xl cursor-pointer transition-all ' + (selectedChannel?.id === channel.id ? 'bg-orange-50 border-2 border-orange-400' : 'bg-white border border-gray-200 hover:border-orange-300')}
                    onClick={() => loadVideos(channel)}
                  >
                    <div className='flex items-center gap-3'>
                      <img src={channel.thumbnail} alt={channel.title} className='w-12 h-12 rounded-full' />
                      <div className='flex-1 min-w-0'>
                        <h3 className='font-medium truncate'>{channel.title}</h3>
                        <p className='text-xs text-gray-500'>구독자 {formatNumber(channel.subscriber_count)}명</p>
                        {channel.category && (
                          <span className='inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full'>{channel.category}</span>
                        )}
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleRemoveChannel(channel.id); }}
                        className='text-gray-400 hover:text-red-500'
                      >
                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' /></svg>
                      </button>
                    </div>
                  </div>
                ))}

                {filteredChannels.length === 0 && (
                  <div className='text-center py-10'>
                    <p className='text-gray-500'>등록된 채널이 없습니다</p>
                    <Link href='/dashboard' className='text-orange-500 hover:text-orange-600 text-sm mt-2 inline-block'>
                      채널 검색하러 가기
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* 오른쪽: 영상 목록 */}
            <div className='flex-1'>
              {selectedChannel ? (
                <div>
                  {/* 채널 정보 헤더 */}
                  <div className='bg-white rounded-xl p-6 border border-gray-200 mb-6'>
                    <div className='flex items-center gap-4'>
                      <img src={selectedChannel.thumbnail} alt={selectedChannel.title} className='w-16 h-16 rounded-full' />
                      <div className='flex-1'>
                        <h2 className='text-xl font-bold'>{selectedChannel.title}</h2>
                        <p className='text-gray-500'>구독자 {formatNumber(selectedChannel.subscriber_count)}명 | 영상 {videos.length}개</p>
                      </div>
                      <button 
                        onClick={() => handleSync(selectedChannel)}
                        disabled={syncing}
                        className='btn-primary flex items-center gap-2'
                      >
                        {syncing ? (
                          <>
                            <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                            동기화 중...
                          </>
                        ) : (
                          <>
                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' /></svg>
                            새 영상 확인
                          </>
                        )}
                      </button>
                    </div>
                    {syncMessage && (
                      <p className='mt-3 text-sm text-green-600'>{syncMessage}</p>
                    )}
                  </div>

                  {/* 액션 버튼 */}
                  {videos.length > 0 && (
                    <div className='flex justify-between items-center mb-4'>
                      <div className='flex gap-4'>
                        <button onClick={handleSelectAllNew} className='text-orange-500 hover:text-orange-600 font-medium text-sm'>
                          새 영상만 선택
                        </button>
                        <button onClick={() => setSelectedVideos(new Set(videos.map(v => v.video_id)))} className='text-gray-500 hover:text-gray-600 text-sm'>
                          전체 선택
                        </button>
                        <button onClick={() => setSelectedVideos(new Set())} className='text-gray-500 hover:text-gray-600 text-sm'>
                          선택 해제
                        </button>
                      </div>
                      {selectedVideos.size > 0 && (
                        <button onClick={handleDownloadSelected} className='btn-primary flex items-center gap-2 text-sm'>
                          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' /></svg>
                          선택 다운로드 ({selectedVideos.size}개)
                        </button>
                      )}
                    </div>
                  )}

                  {/* 영상 목록 */}
                  {videosLoading ? (
                    <div className='text-center py-20'>
                      <div className='w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto'></div>
                    </div>
                  ) : (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                      {videos.map(video => (
                        <div 
                          key={video.video_id}
                          className={'bg-white rounded-xl p-3 border cursor-pointer transition-all relative ' + (selectedVideos.has(video.video_id) ? 'border-orange-500 ring-2 ring-orange-200' : 'border-gray-200 hover:border-orange-300')}
                          onClick={() => handleSelectVideo(video.video_id)}
                        >
                          {video.is_new && (
                            <div className='absolute top-4 left-4 px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full z-10'>
                              NEW
                            </div>
                          )}
                          <div className='relative mb-2'>
                            <img 
                              src={video.thumbnail_url || video.thumbnail_maxres} 
                              alt={video.title} 
                              className='w-full aspect-video object-cover rounded-lg' 
                            />
                            {selectedVideos.has(video.video_id) && (
                              <div className='absolute top-2 right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center'>
                                <svg className='w-4 h-4 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' /></svg>
                              </div>
                            )}
                            <div className='absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 rounded text-white text-xs'>
                              {formatNumber(video.view_count)}회
                            </div>
                          </div>
                          <h4 className='font-medium text-sm line-clamp-2 mb-1'>{video.title}</h4>
                          <div className='flex justify-between items-center text-xs'>
                            <span className='text-gray-400'>{new Date(video.published_at).toLocaleDateString('ko-KR')}</span>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDownloadThumbnail(video.thumbnail_maxres || video.thumbnail_url, video.title)
                              }}
                              className='text-orange-500 hover:text-orange-600'
                            >
                              다운로드
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {!videosLoading && videos.length === 0 && (
                    <div className='text-center py-20 bg-white rounded-xl border border-gray-200'>
                      <p className='text-gray-500 mb-4'>아직 크롤링된 영상이 없습니다</p>
                      <button 
                        onClick={() => handleSync(selectedChannel)}
                        className='btn-primary'
                      >
                        지금 크롤링하기
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className='text-center py-32'>
                  <div className='w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                    <svg className='w-10 h-10 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' /></svg>
                  </div>
                  <h3 className='text-xl font-semibold text-gray-700 mb-2'>채널을 선택하세요</h3>
                  <p className='text-gray-500'>왼쪽에서 채널을 선택하면 영상 목록이 표시됩니다</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

