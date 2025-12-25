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

interface ChannelResult {
  id: string
  title: string
  description: string
  thumbnail: string
  subscriberCount: number
  videoCount: number
  viewCount: number
}

interface CrawledVideo {
  id: string
  title: string
  thumbnailMedium: string
  thumbnailMaxres: string
  viewCount: number
  likeCount: number
  commentCount: number
  publishedAt: string
  crawledAt: string
  viewUpdatedAt: string
  isNew: boolean
}

interface SyncResult {
  channel: {
    id: string
    title: string
    thumbnail: string
    subscriberCount: number
    videoCount: number
  }
  summary: {
    totalVideos: number
    newVideos: number
    updatedVideos: number
  }
  videos: CrawledVideo[]
  newVideoIds: string[]
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [activeTab, setActiveTab] = useState<'search' | 'channel'>('channel')
  
  // 영상 검색
  const [searchQuery, setSearchQuery] = useState('')
  const [videos, setVideos] = useState<VideoResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 채널 검색
  const [channelSearchQuery, setChannelSearchQuery] = useState('')
  const [channelResults, setChannelResults] = useState<ChannelResult[]>([])
  const [channelSearching, setChannelSearching] = useState(false)
  
  // 선택된 채널 및 크롤링 결과
  const [selectedChannel, setSelectedChannel] = useState<ChannelResult | null>(null)
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [maxResults, setMaxResults] = useState('50')
  
  // 썸네일 선택
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

  // 영상 검색
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

  // 채널 검색
  const handleChannelSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!channelSearchQuery.trim()) return
    setChannelSearching(true)
    setError('')
    setChannelResults([])
    setSelectedChannel(null)
    setSyncResult(null)

    try {
      const res = await fetch('/api/youtube/search-channel?q=' + encodeURIComponent(channelSearchQuery))
      const data = await res.json()
      if (data.error) setError(data.error)
      else setChannelResults(data.channels || [])
    } catch (err) {
      setError('채널 검색 중 오류가 발생했습니다.')
    } finally {
      setChannelSearching(false)
    }
  }

  // 채널 선택
  const handleSelectChannel = (channel: ChannelResult) => {
    setSelectedChannel(channel)
    setChannelResults([])
    setSyncResult(null)
    setSelectedVideos(new Set())
  }

  // 크롤링 (동기화) 시작
  const handleSync = async () => {
    if (!selectedChannel) return
    setSyncing(true)
    setError('')

    try {
      const res = await fetch('/api/youtube/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          channelId: selectedChannel.id,
          maxResults: parseInt(maxResults)
        }),
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setSyncResult(data)
        // 새 영상 자동 선택
        if (data.newVideoIds && data.newVideoIds.length > 0) {
          setSelectedVideos(new Set(data.newVideoIds))
        }
      }
    } catch (err) {
      setError('크롤링 중 오류가 발생했습니다.')
    } finally {
      setSyncing(false)
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
    if (!syncResult) return
    syncResult.videos.forEach(video => {
      if (selectedVideos.has(video.id)) {
        handleDownloadThumbnail(video.thumbnailMaxres || video.thumbnailMedium, video.title)
      }
    })
  }

  const handleSelectAllNew = () => {
    if (!syncResult) return
    const newVideos = syncResult.videos.filter(v => v.isNew).map(v => v.id)
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
        <div className='max-w-6xl mx-auto px-6'>
          <div className='mb-8'>
            <h1 className='text-3xl font-bold mb-2'>유튜브 크롤러</h1>
            <p className='text-gray-500'>채널을 검색하고 영상 썸네일을 수집하세요</p>
          </div>

          <div className='flex gap-4 mb-8'>
            <button 
              onClick={() => setActiveTab('channel')}
              className={'px-6 py-3 rounded-xl font-medium transition-all ' + (activeTab === 'channel' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100')}
            >
              채널 크롤링
            </button>
            <button 
              onClick={() => setActiveTab('search')}
              className={'px-6 py-3 rounded-xl font-medium transition-all ' + (activeTab === 'search' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100')}
            >
              영상 검색
            </button>
          </div>

          {activeTab === 'channel' && (
            <div>
              {/* 채널 검색 */}
              <form onSubmit={handleChannelSearch} className='flex gap-4 mb-6'>
                <input 
                  type='text' 
                  value={channelSearchQuery} 
                  onChange={(e) => setChannelSearchQuery(e.target.value)}
                  className='input-field flex-1' 
                  placeholder='채널명을 입력하세요 (예: 침착맨, 쯔양, 먹방)...' 
                />
                <button type='submit' className='btn-primary' disabled={channelSearching}>
                  {channelSearching ? '검색 중...' : '채널 검색'}
                </button>
              </form>

              {error && <div className='p-4 bg-red-50 border border-red-200 rounded-xl mb-6'><p className='text-red-600'>{error}</p></div>}

              {/* 채널 검색 결과 */}
              {channelResults.length > 0 && (
                <div className='mb-6'>
                  <h2 className='text-lg font-semibold mb-4'>검색 결과 (구독자 순)</h2>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {channelResults.map((channel) => (
                      <div 
                        key={channel.id} 
                        className='card flex items-center gap-4 cursor-pointer hover:ring-2 hover:ring-orange-400 transition-all'
                        onClick={() => handleSelectChannel(channel)}
                      >
                        <img src={channel.thumbnail} alt={channel.title} className='w-16 h-16 rounded-full flex-shrink-0' />
                        <div className='flex-1 min-w-0'>
                          <h3 className='font-semibold truncate'>{channel.title}</h3>
                          <p className='text-sm text-gray-500'>구독자 {formatNumber(channel.subscriberCount)}명</p>
                          <p className='text-xs text-gray-400'>영상 {formatNumber(channel.videoCount)}개</p>
                        </div>
                        <button className='btn-primary text-sm py-2 px-4'>선택</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 선택된 채널 */}
              {selectedChannel && !syncResult && (
                <div className='card mb-6'>
                  <div className='flex items-center gap-4'>
                    <img src={selectedChannel.thumbnail} alt={selectedChannel.title} className='w-20 h-20 rounded-full' />
                    <div className='flex-1'>
                      <h2 className='text-2xl font-bold mb-1'>{selectedChannel.title}</h2>
                      <p className='text-gray-500'>구독자 {formatNumber(selectedChannel.subscriberCount)}명 | 영상 {formatNumber(selectedChannel.videoCount)}개</p>
                    </div>
                    <div className='flex items-center gap-4'>
                      <select 
                        value={maxResults} 
                        onChange={(e) => setMaxResults(e.target.value)}
                        className='input-field w-32'
                      >
                        <option value='10'>10개</option>
                        <option value='20'>20개</option>
                        <option value='30'>30개</option>
                        <option value='50'>50개</option>
                      </select>
                      <button 
                        onClick={handleSync} 
                        disabled={syncing}
                        className='btn-primary flex items-center gap-2'
                      >
                        {syncing ? (
                          <>
                            <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                            크롤링 중...
                          </>
                        ) : (
                          <>
                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' /></svg>
                            크롤링 시작
                          </>
                        )}
                      </button>
                      <button 
                        onClick={() => { setSelectedChannel(null); setSyncResult(null); }}
                        className='text-gray-400 hover:text-gray-600'
                      >
                        <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 크롤링 결과 */}
              {syncResult && (
                <div>
                  {/* 채널 정보 및 요약 */}
                  <div className='card mb-6'>
                    <div className='flex items-center gap-4 mb-4'>
                      <img src={syncResult.channel.thumbnail} alt={syncResult.channel.title} className='w-16 h-16 rounded-full' />
                      <div className='flex-1'>
                        <h2 className='text-xl font-bold'>{syncResult.channel.title}</h2>
                        <p className='text-gray-500'>구독자 {formatNumber(syncResult.channel.subscriberCount)}명</p>
                      </div>
                      <button 
                        onClick={() => { setSelectedChannel(null); setSyncResult(null); setSelectedVideos(new Set()); }}
                        className='text-gray-400 hover:text-gray-600'
                      >
                        <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' /></svg>
                      </button>
                    </div>
                    <div className='grid grid-cols-3 gap-4'>
                      <div className='p-4 bg-gray-50 rounded-xl text-center'>
                        <p className='text-2xl font-bold text-gray-800'>{syncResult.summary.totalVideos}</p>
                        <p className='text-sm text-gray-500'>전체 영상</p>
                      </div>
                      <div className='p-4 bg-green-50 rounded-xl text-center'>
                        <p className='text-2xl font-bold text-green-600'>{syncResult.summary.newVideos}</p>
                        <p className='text-sm text-gray-500'>새 영상</p>
                      </div>
                      <div className='p-4 bg-blue-50 rounded-xl text-center'>
                        <p className='text-2xl font-bold text-blue-600'>{syncResult.summary.updatedVideos}</p>
                        <p className='text-sm text-gray-500'>조회수 업데이트</p>
                      </div>
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className='flex justify-between items-center mb-6'>
                    <div className='flex gap-4'>
                      <button onClick={handleSelectAllNew} className='text-orange-500 hover:text-orange-600 font-medium'>
                        새 영상만 선택
                      </button>
                      <button onClick={() => setSelectedVideos(new Set())} className='text-gray-500 hover:text-gray-600'>
                        선택 해제
                      </button>
                    </div>
                    {selectedVideos.size > 0 && (
                      <button onClick={handleDownloadSelected} className='btn-primary flex items-center gap-2'>
                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' /></svg>
                        선택한 썸네일 다운로드 ({selectedVideos.size}개)
                      </button>
                    )}
                  </div>

                  {/* 영상 목록 */}
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {syncResult.videos.map((video) => (
                      <div 
                        key={video.id} 
                        className={'card cursor-pointer transition-all relative ' + (selectedVideos.has(video.id) ? 'ring-2 ring-orange-500' : '')}
                        onClick={() => handleSelectVideo(video.id)}
                      >
                        {video.isNew && (
                          <div className='absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full z-10'>
                            NEW
                          </div>
                        )}
                        <div className='relative mb-3'>
                          <img 
                            src={video.thumbnailMedium || video.thumbnailMaxres} 
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
                              handleDownloadThumbnail(video.thumbnailMaxres || video.thumbnailMedium, video.title)
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

              {/* 빈 상태 */}
              {!channelSearching && channelResults.length === 0 && !selectedChannel && !syncResult && (
                <div className='text-center py-20'>
                  <div className='w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                    <svg className='w-10 h-10 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' /></svg>
                  </div>
                  <h3 className='text-xl font-semibold text-gray-700 mb-2'>채널을 검색하세요</h3>
                  <p className='text-gray-500'>채널명을 검색하면 구독자 순으로 결과가 표시됩니다</p>
                  <p className='text-gray-400 text-sm mt-2'>새 영상이 올라오면 자동으로 감지하고, 조회수는 10일마다 업데이트됩니다</p>
                </div>
              )}
            </div>
          )}

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
        </div>
      </main>
    </div>
  )
}
