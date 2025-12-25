'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

interface ChannelInfo {
  id: string
  title: string
  description: string
  thumbnail: string
  subscriberCount: number
  videoCount: number
  viewCount: number
}

interface VideoInfo {
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

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats] = useState({ totalUsers: 1, newUsersToday: 1, activeUsers: 1 })
  const [announcement, setAnnouncement] = useState('')
  const [announcements, setAnnouncements] = useState<string[]>([])
  const [channels, setChannels] = useState<string[]>([])
  const [newChannel, setNewChannel] = useState('')
  const [crawledData, setCrawledData] = useState<{channel: ChannelInfo, videos: VideoInfo[]}[]>([])
  const [crawling, setCrawling] = useState(false)
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set())
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.email !== 'motiol_6829@naver.com') {
        router.push('/dashboard')
        return
      }
      setUser(user)
      setLoading(false)
    }
    checkAdmin()
  }, [])

  const handleAddAnnouncement = () => {
    if (announcement.trim()) {
      setAnnouncements([...announcements, announcement])
      setAnnouncement('')
    }
  }

  const handleAddChannel = () => {
    if (newChannel.trim() && !channels.includes(newChannel.trim())) {
      setChannels([...channels, newChannel.trim()])
      setNewChannel('')
    }
  }

  const handleRemoveChannel = (channel: string) => {
    setChannels(channels.filter(c => c !== channel))
  }

  const handleCrawlChannels = async () => {
    if (channels.length === 0) return
    setCrawling(true)
    setCrawledData([])

    try {
      const results = []
      for (const channel of channels) {
        try {
          const isChannelId = channel.startsWith('UC')
          const param = isChannelId ? `channelId=${channel}` : `handle=${encodeURIComponent(channel)}`
          const res = await fetch(`/api/youtube/channel?${param}&maxResults=10`)
          const data = await res.json()
          if (!data.error) {
            results.push(data)
          }
        } catch (err) {
          console.error(`Failed to crawl channel: ${channel}`, err)
        }
      }
      setCrawledData(results)
    } finally {
      setCrawling(false)
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
    crawledData.forEach(data => {
      data.videos.forEach(video => {
        if (selectedVideos.has(video.id)) {
          handleDownloadThumbnail(video.thumbnailMaxres || video.thumbnailHigh, video.title)
        }
      })
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const formatNumber = (num: number) => {
    if (num >= 100000000) return (num / 100000000).toFixed(1) + '억'
    if (num >= 10000) return (num / 10000).toFixed(1) + '만'
    if (num >= 1000) return (num / 1000).toFixed(1) + '천'
    return num.toString()
  }

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center' style={{background: '#0f0f0f'}}>
        <div className='w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin'></div>
      </div>
    )
  }

  return (
    <div className='min-h-screen' style={{background: '#0f0f0f'}}>
      <nav className='border-b border-gray-800 bg-black/50 backdrop-blur-xl fixed top-0 left-0 right-0 z-50'>
        <div className='max-w-7xl mx-auto px-6 py-4 flex justify-between items-center'>
          <div className='flex items-center gap-6'>
            <Link href='/dashboard' className='flex items-center gap-2'>
              <div className='w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center'>
                <span className='text-white font-bold text-sm'>RC</span>
              </div>
              <span className='text-xl font-bold text-white'><span className='gradient-text'>리부트</span> 크롤러</span>
            </Link>
            <span className='px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm font-medium'>관리자</span>
          </div>
          <div className='flex items-center gap-6'>
            <Link href='/dashboard' className='text-gray-400 hover:text-white'>대시보드</Link>
            <button onClick={handleLogout} className='text-gray-400 hover:text-white'>로그아웃</button>
          </div>
        </div>
      </nav>

      <div className='flex pt-16'>
        <aside className='w-64 min-h-screen border-r border-gray-800 p-6 fixed'>
          <div className='space-y-2'>
            <button onClick={() => setActiveTab('dashboard')} className={'w-full text-left px-4 py-3 rounded-xl ' + (activeTab === 'dashboard' ? 'bg-orange-500/20 text-orange-400' : 'text-gray-400 hover:bg-gray-800')}>대시보드</button>
            <button onClick={() => setActiveTab('channels')} className={'w-full text-left px-4 py-3 rounded-xl ' + (activeTab === 'channels' ? 'bg-orange-500/20 text-orange-400' : 'text-gray-400 hover:bg-gray-800')}>채널 크롤링</button>
            <button onClick={() => setActiveTab('users')} className={'w-full text-left px-4 py-3 rounded-xl ' + (activeTab === 'users' ? 'bg-orange-500/20 text-orange-400' : 'text-gray-400 hover:bg-gray-800')}>사용자 관리</button>
            <button onClick={() => setActiveTab('announcements')} className={'w-full text-left px-4 py-3 rounded-xl ' + (activeTab === 'announcements' ? 'bg-orange-500/20 text-orange-400' : 'text-gray-400 hover:bg-gray-800')}>공지사항</button>
            <button onClick={() => setActiveTab('grades')} className={'w-full text-left px-4 py-3 rounded-xl ' + (activeTab === 'grades' ? 'bg-orange-500/20 text-orange-400' : 'text-gray-400 hover:bg-gray-800')}>등급 관리</button>
          </div>
        </aside>

        <main className='flex-1 ml-64 p-8'>
          {activeTab === 'dashboard' && (
            <div>
              <h1 className='text-3xl font-bold text-white mb-8'>관리자 대시보드</h1>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
                <div className='p-6 rounded-2xl' style={{background: '#1a1a1a', border: '1px solid #333'}}>
                  <p className='text-gray-400 mb-2'>전체 사용자</p>
                  <p className='text-4xl font-bold text-white'>{stats.totalUsers}</p>
                </div>
                <div className='p-6 rounded-2xl' style={{background: '#1a1a1a', border: '1px solid #333'}}>
                  <p className='text-gray-400 mb-2'>오늘 가입</p>
                  <p className='text-4xl font-bold text-white'>{stats.newUsersToday}</p>
                </div>
                <div className='p-6 rounded-2xl' style={{background: '#1a1a1a', border: '1px solid #333'}}>
                  <p className='text-gray-400 mb-2'>활성 사용자</p>
                  <p className='text-4xl font-bold text-white'>{stats.activeUsers}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'channels' && (
            <div>
              <h1 className='text-3xl font-bold text-white mb-8'>채널 크롤링</h1>
              
              <div className='p-6 rounded-2xl mb-6' style={{background: '#1a1a1a', border: '1px solid #333'}}>
                <h2 className='text-xl font-bold text-white mb-4'>채널 추가</h2>
                <p className='text-gray-400 text-sm mb-4'>채널 ID(UC로 시작) 또는 채널 이름(@핸들 또는 검색명)을 입력하세요</p>
                <div className='flex gap-4'>
                  <input 
                    type='text' 
                    value={newChannel} 
                    onChange={(e) => setNewChannel(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddChannel()}
                    className='flex-1 p-4 rounded-xl bg-gray-900 border border-gray-700 text-white' 
                    placeholder='예: @channelname 또는 UCxxxxxxxx' 
                  />
                  <button onClick={handleAddChannel} className='btn-primary px-6'>추가</button>
                </div>
              </div>

              {channels.length > 0 && (
                <div className='p-6 rounded-2xl mb-6' style={{background: '#1a1a1a', border: '1px solid #333'}}>
                  <div className='flex justify-between items-center mb-4'>
                    <h2 className='text-xl font-bold text-white'>등록된 채널 ({channels.length}개)</h2>
                    <button 
                      onClick={handleCrawlChannels} 
                      disabled={crawling}
                      className='btn-primary px-6 flex items-center gap-2'
                    >
                      {crawling ? (
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
                  </div>
                  <div className='flex flex-wrap gap-2'>
                    {channels.map((channel, idx) => (
                      <div key={idx} className='flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-full'>
                        <span className='text-white'>{channel}</span>
                        <button 
                          onClick={() => handleRemoveChannel(channel)}
                          className='text-gray-400 hover:text-red-400'
                        >
                          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {crawledData.length > 0 && (
                <div>
                  <div className='flex justify-between items-center mb-6'>
                    <h2 className='text-2xl font-bold text-white'>크롤링 결과</h2>
                    {selectedVideos.size > 0 && (
                      <button onClick={handleDownloadSelected} className='btn-primary px-6 flex items-center gap-2'>
                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' /></svg>
                        선택 다운로드 ({selectedVideos.size}개)
                      </button>
                    )}
                  </div>

                  {crawledData.map((data, idx) => (
                    <div key={idx} className='mb-8'>
                      <div className='p-6 rounded-2xl mb-4' style={{background: '#1a1a1a', border: '1px solid #333'}}>
                        <div className='flex items-center gap-4 mb-4'>
                          <img src={data.channel.thumbnail} alt={data.channel.title} className='w-16 h-16 rounded-full' />
                          <div>
                            <h3 className='text-xl font-bold text-white'>{data.channel.title}</h3>
                            <p className='text-gray-400'>구독자 {formatNumber(data.channel.subscriberCount)}명 | 영상 {formatNumber(data.channel.videoCount)}개</p>
                          </div>
                        </div>
                      </div>

                      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                        {data.videos.map((video) => (
                          <div 
                            key={video.id} 
                            className={'p-4 rounded-2xl cursor-pointer transition-all ' + (selectedVideos.has(video.id) ? 'ring-2 ring-orange-500' : '')}
                            style={{background: '#1a1a1a', border: '1px solid #333'}}
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
                            <h4 className='text-white font-medium line-clamp-2 mb-2'>{video.title}</h4>
                            <div className='flex justify-between items-center'>
                              <span className='text-gray-400 text-sm'>{new Date(video.publishedAt).toLocaleDateString('ko-KR')}</span>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDownloadThumbnail(video.thumbnailMaxres || video.thumbnailHigh, video.title)
                                }}
                                className='text-orange-400 hover:text-orange-300 text-sm flex items-center gap-1'
                              >
                                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' /></svg>
                                썸네일
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {channels.length === 0 && crawledData.length === 0 && (
                <div className='text-center py-20'>
                  <div className='w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6'>
                    <svg className='w-10 h-10 text-gray-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' /></svg>
                  </div>
                  <h3 className='text-xl font-semibold text-white mb-2'>등록된 채널이 없습니다</h3>
                  <p className='text-gray-400'>채널을 추가하여 영상 정보를 크롤링하세요</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <h1 className='text-3xl font-bold text-white mb-8'>사용자 관리</h1>
              <div className='p-6 rounded-2xl' style={{background: '#1a1a1a', border: '1px solid #333'}}>
                <table className='w-full'>
                  <thead><tr className='text-left text-gray-400 border-b border-gray-700'><th className='pb-4'>이메일</th><th className='pb-4'>등급</th><th className='pb-4'>가입일</th></tr></thead>
                  <tbody><tr className='text-white'><td className='py-4'>motiol_6829@naver.com</td><td className='py-4'><span className='px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm'>관리자</span></td><td className='py-4 text-gray-400'>2024.12.25</td></tr></tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'announcements' && (
            <div>
              <h1 className='text-3xl font-bold text-white mb-8'>공지사항</h1>
              <div className='p-6 rounded-2xl mb-6' style={{background: '#1a1a1a', border: '1px solid #333'}}>
                <textarea value={announcement} onChange={(e) => setAnnouncement(e.target.value)} className='w-full p-4 rounded-xl bg-gray-900 border border-gray-700 text-white resize-none' rows={4} placeholder='공지 내용을 입력하세요...' />
                <button onClick={handleAddAnnouncement} className='btn-primary mt-4'>등록</button>
              </div>
              <div className='space-y-4'>
                {announcements.map((a, i) => <div key={i} className='p-4 rounded-xl text-white' style={{background: '#1a1a1a', border: '1px solid #333'}}>{a}</div>)}
              </div>
            </div>
          )}

          {activeTab === 'grades' && (
            <div>
              <h1 className='text-3xl font-bold text-white mb-8'>등급 관리</h1>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <div className='p-6 rounded-2xl text-center' style={{background: '#1a1a1a', border: '1px solid #333'}}>
                  <div className='w-16 h-16 bg-amber-700/30 rounded-full flex items-center justify-center mx-auto mb-4'><span className='text-amber-600 text-2xl font-bold'>B</span></div>
                  <h3 className='text-xl font-bold text-white mb-2'>브론즈</h3><p className='text-2xl font-bold text-orange-400'>0명</p>
                </div>
                <div className='p-6 rounded-2xl text-center' style={{background: '#1a1a1a', border: '1px solid #333'}}>
                  <div className='w-16 h-16 bg-gray-400/30 rounded-full flex items-center justify-center mx-auto mb-4'><span className='text-gray-300 text-2xl font-bold'>S</span></div>
                  <h3 className='text-xl font-bold text-white mb-2'>실버</h3><p className='text-2xl font-bold text-orange-400'>0명</p>
                </div>
                <div className='p-6 rounded-2xl text-center' style={{background: '#1a1a1a', border: '1px solid #333'}}>
                  <div className='w-16 h-16 bg-yellow-500/30 rounded-full flex items-center justify-center mx-auto mb-4'><span className='text-yellow-400 text-2xl font-bold'>G</span></div>
                  <h3 className='text-xl font-bold text-white mb-2'>골드</h3><p className='text-2xl font-bold text-orange-400'>0명</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
