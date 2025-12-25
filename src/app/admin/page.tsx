'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats] = useState({ totalUsers: 1, newUsersToday: 1, activeUsers: 1 })
  const [announcement, setAnnouncement] = useState('')
  const [announcements, setAnnouncements] = useState<string[]>([])
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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
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