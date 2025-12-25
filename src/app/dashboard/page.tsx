'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

interface ChannelResult {
  id: string
  title: string
  description: string
  thumbnail: string
  subscriberCount: number
  videoCount: number
  viewCount: number
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [error, setError] = useState('')

  // 채널 검색
  const [channelSearchQuery, setChannelSearchQuery] = useState('')
  const [channelResults, setChannelResults] = useState<ChannelResult[]>([])
  const [channelSearching, setChannelSearching] = useState(false)
  
  // 채널 추가 모달
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedChannel, setSelectedChannel] = useState<ChannelResult | null>(null)
  const [category, setCategory] = useState('')
  const [existingCategories, setExistingCategories] = useState<string[]>([])
  const [adding, setAdding] = useState(false)

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
        await loadCategories(user.id)
      }
    }
    checkUser()
  }, [])

  const loadCategories = async (userId: string) => {
    const { data } = await supabase
      .from('tracked_channels')
      .select('category')
      .eq('user_id', userId)

    if (data) {
      const cats = [...new Set(data.map(c => c.category).filter(Boolean))]
      setExistingCategories(cats)
    }
  }

  // 채널 검색
  const handleChannelSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!channelSearchQuery.trim()) return
    setChannelSearching(true)
    setError('')
    setChannelResults([])

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

  // 채널 추가 모달 열기
  const openAddModal = (channel: ChannelResult) => {
    setSelectedChannel(channel)
    setCategory('')
    setShowAddModal(true)
  }

  // 채널 추가
  const handleAddChannel = async () => {
    if (!selectedChannel || !user) return
    setAdding(true)

    try {
      // 이미 추가된 채널인지 확인
      const { data: existing } = await supabase
        .from('tracked_channels')
        .select('id')
        .eq('user_id', user.id)
        .eq('channel_id', selectedChannel.id)
        .single()

      if (existing) {
        setError('이미 추가된 채널입니다.')
        setShowAddModal(false)
        setAdding(false)
        return
      }

      // 채널 추가
      const { error: insertError } = await supabase
        .from('tracked_channels')
        .insert({
          user_id: user.id,
          channel_id: selectedChannel.id,
          title: selectedChannel.title,
          thumbnail: selectedChannel.thumbnail,
          subscriber_count: selectedChannel.subscriberCount,
          video_count: selectedChannel.videoCount,
          category: category.trim() || null,
        })

      if (insertError) {
        setError('채널 추가 중 오류가 발생했습니다: ' + insertError.message)
      } else {
        // 첫 크롤링 실행
        await fetch('/api/youtube/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            channelId: selectedChannel.id,
            maxResults: 50,
            fetchAll: true
          }),
        })

        setShowAddModal(false)
        router.push('/my-channels')
      }
    } catch (err) {
      setError('채널 추가 중 오류가 발생했습니다.')
    } finally {
      setAdding(false)
    }
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
          <Link href='/' className='flex items-center gap-2'>
            <div className='w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center'>
              <span className='text-white font-bold text-sm'>RC</span>
            </div>
            <span className='text-xl font-bold'><span className='gradient-text'>리부트</span> 크롤러</span>
          </Link>
          <div className='flex items-center gap-6'>
            <Link href='/dashboard' className='text-orange-500 font-medium'>채널 검색</Link>
            <Link href='/my-channels' className='text-gray-500 hover:text-gray-700 font-medium'>내 채널</Link>
            {isAdmin && <Link href='/admin' className='text-orange-500 hover:text-orange-600 font-medium'>관리자</Link>}
            <span className='text-gray-500 text-sm'>{user.email}</span>
            <button onClick={handleLogout} className='text-gray-500 hover:text-gray-700 text-sm font-medium'>로그아웃</button>
          </div>
        </div>
      </nav>

      <main className='pt-24 pb-16'>
        <div className='max-w-4xl mx-auto px-6'>
          <div className='mb-8'>
            <h1 className='text-3xl font-bold mb-2'>채널 검색</h1>
            <p className='text-gray-500'>채널을 검색하고 내 대시보드에 추가하세요</p>
          </div>

          {/* 채널 검색 */}
          <form onSubmit={handleChannelSearch} className='flex gap-4 mb-8'>
            <input 
              type='text' 
              value={channelSearchQuery} 
              onChange={(e) => setChannelSearchQuery(e.target.value)}
              className='input-field flex-1' 
              placeholder='채널명을 입력하세요 (예: 침착맨, 쯔양, 먹방)...' 
            />
            <button type='submit' className='btn-primary px-8' disabled={channelSearching}>
              {channelSearching ? '검색 중...' : '검색'}
            </button>
          </form>

          {error && (
            <div className='p-4 bg-red-50 border border-red-200 rounded-xl mb-6'>
              <p className='text-red-600'>{error}</p>
            </div>
          )}

          {/* 채널 검색 결과 */}
          {channelResults.length > 0 && (
            <div>
              <h2 className='text-lg font-semibold mb-4'>검색 결과 (구독자 순)</h2>
              <div className='space-y-4'>
                {channelResults.map((channel) => (
                  <div 
                    key={channel.id} 
                    className='card flex items-center gap-4'
                  >
                    <img src={channel.thumbnail} alt={channel.title} className='w-16 h-16 rounded-full flex-shrink-0' />
                    <div className='flex-1 min-w-0'>
                      <h3 className='font-semibold text-lg'>{channel.title}</h3>
                      <p className='text-sm text-gray-500'>
                        구독자 {formatNumber(channel.subscriberCount)}명 | 영상 {formatNumber(channel.videoCount)}개
                      </p>
                      <p className='text-xs text-gray-400 line-clamp-1'>{channel.description}</p>
                    </div>
                    <button 
                      onClick={() => openAddModal(channel)}
                      className='btn-primary flex items-center gap-2 flex-shrink-0'
                    >
                      <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' /></svg>
                      추가
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 빈 상태 */}
          {!channelSearching && channelResults.length === 0 && (
            <div className='text-center py-20'>
              <div className='w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                <svg className='w-10 h-10 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' /></svg>
              </div>
              <h3 className='text-xl font-semibold text-gray-700 mb-2'>채널을 검색하세요</h3>
              <p className='text-gray-500'>채널명을 검색하면 구독자 순으로 결과가 표시됩니다</p>
              <p className='text-gray-400 text-sm mt-4'>
                채널을 추가하면 자동으로 영상이 크롤링되고,<br/>
                새 영상이 올라올 때마다 알림을 받을 수 있습니다
              </p>
            </div>
          )}
        </div>
      </main>

      {/* 채널 추가 모달 */}
      {showAddModal && selectedChannel && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-2xl p-6 max-w-md w-full'>
            <h2 className='text-xl font-bold mb-4'>채널 추가</h2>
            
            <div className='flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl'>
              <img src={selectedChannel.thumbnail} alt={selectedChannel.title} className='w-14 h-14 rounded-full' />
              <div>
                <h3 className='font-semibold'>{selectedChannel.title}</h3>
                <p className='text-sm text-gray-500'>구독자 {formatNumber(selectedChannel.subscriberCount)}명</p>
              </div>
            </div>

            <div className='mb-6'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>카테고리 (선택)</label>
              <input 
                type='text' 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className='input-field w-full' 
                placeholder='예: 먹방, 게임, 뷰티...' 
              />
              {existingCategories.length > 0 && (
                <div className='flex flex-wrap gap-2 mt-2'>
                  {existingCategories.map(cat => (
                    <button
                      key={cat}
                      type='button'
                      onClick={() => setCategory(cat)}
                      className='px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm rounded-full'
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className='flex gap-3'>
              <button 
                onClick={() => setShowAddModal(false)}
                className='flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50'
              >
                취소
              </button>
              <button 
                onClick={handleAddChannel}
                disabled={adding}
                className='flex-1 btn-primary'
              >
                {adding ? '추가 중...' : '추가하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
