'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

interface UserStats {
  totalUsers: number
  newUsersToday: number
  activeUsers: number
}

interface UserData {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string
  grade: string
}

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    newUsersToday: 0,
    activeUsers: 0
  })
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
      
      // ?꾩떆 ?듦퀎 ?곗씠??      setStats({
        totalUsers: 1,
        newUsersToday: 1,
        activeUsers: 1
      })
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
        <div className='text-center'>
          <div className='w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-gray-400'>濡쒕뵫 以?..</p>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen' style={{background: '#0f0f0f'}}>
      {/* ?곷떒 ?ㅻ퉬寃뚯씠??*/}
      <nav className='border-b border-gray-800 bg-black/50 backdrop-blur-xl fixed top-0 left-0 right-0 z-50'>
        <div className='max-w-7xl mx-auto px-6 py-4 flex justify-between items-center'>
          <div className='flex items-center gap-6'>
            <Link href='/dashboard' className='flex items-center gap-2'>
              <div className='w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center'>
                <span className='text-white font-bold text-sm'>RC</span>
              </div>
              <span className='text-xl font-bold text-white'>
                <span className='gradient-text'>由щ???/span> ?щ·??              </span>
            </Link>
            <span className='px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm font-medium'>
              愿由ъ옄
            </span>
          </div>
          <div className='flex items-center gap-6'>
            <Link href='/dashboard' className='text-gray-400 hover:text-white transition-colors'>
              ??쒕낫??            </Link>
            <button 
              onClick={handleLogout} 
              className='text-gray-400 hover:text-white transition-colors'
            >
              濡쒓렇?꾩썐
            </button>
          </div>
        </div>
      </nav>

      <div className='flex pt-16'>
        {/* ?ъ씠?쒕컮 */}
        <aside className='w-64 min-h-screen border-r border-gray-800 p-6 fixed'>
          <div className='space-y-2'>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={'w-full text-left px-4 py-3 rounded-xl transition-colors ' + 
                (activeTab === 'dashboard' ? 'bg-orange-500/20 text-orange-400' : 'text-gray-400 hover:bg-gray-800')}
            >
              ?뱤 ??쒕낫??            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={'w-full text-left px-4 py-3 rounded-xl transition-colors ' + 
                (activeTab === 'users' ? 'bg-orange-500/20 text-orange-400' : 'text-gray-400 hover:bg-gray-800')}
            >
              ?뫁 ?ъ슜??愿由?            </button>
            <button
              onClick={() => setActiveTab('announcements')}
              className={'w-full text-left px-4 py-3 rounded-xl transition-colors ' + 
                (activeTab === 'announcements' ? 'bg-orange-500/20 text-orange-400' : 'text-gray-400 hover:bg-gray-800')}
            >
              ?뱼 怨듭??ы빆
            </button>
            <button
              onClick={() => setActiveTab('grades')}
              className={'w-full text-left px-4 py-3 rounded-xl transition-colors ' + 
                (activeTab === 'grades' ? 'bg-orange-500/20 text-orange-400' : 'text-gray-400 hover:bg-gray-800')}
            >
              ?룆 ?깃툒 愿由?            </button>
          </div>
        </aside>

        {/* 硫붿씤 而⑦뀗痢?*/}
        <main className='flex-1 ml-64 p-8'>
          {activeTab === 'dashboard' && (
            <div>
              <h1 className='text-3xl font-bold text-white mb-8'>愿由ъ옄 ??쒕낫??/h1>
              
              {/* ?듦퀎 移대뱶 */}
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
                <div className='p-6 rounded-2xl' style={{background: '#1a1a1a', border: '1px solid #333'}}>
                  <div className='flex items-center justify-between mb-4'>
                    <span className='text-gray-400'>?꾩껜 ?ъ슜??/span>
                    <span className='text-2xl'>?뫁</span>
                  </div>
                  <p className='text-4xl font-bold text-white'>{stats.totalUsers}</p>
                  <p className='text-green-400 text-sm mt-2'>+{stats.newUsersToday} ?ㅻ뒛</p>
                </div>
                
                <div className='p-6 rounded-2xl' style={{background: '#1a1a1a', border: '1px solid #333'}}>
                  <div className='flex items-center justify-between mb-4'>
                    <span className='text-gray-400'>?ㅻ뒛 媛??/span>
                    <span className='text-2xl'>?넅</span>
                  </div>
                  <p className='text-4xl font-bold text-white'>{stats.newUsersToday}</p>
                  <p className='text-gray-400 text-sm mt-2'>?좉퇋 媛?낆옄</p>
                </div>
                
                <div className='p-6 rounded-2xl' style={{background: '#1a1a1a', border: '1px solid #333'}}>
                  <div className='flex items-center justify-between mb-4'>
                    <span className='text-gray-400'>?쒖꽦 ?ъ슜??/span>
                    <span className='text-2xl'>?윟</span>
                  </div>
                  <p className='text-4xl font-bold text-white'>{stats.activeUsers}</p>
                  <p className='text-gray-400 text-sm mt-2'>理쒓렐 7??/p>
                </div>
              </div>

              {/* 理쒓렐 ?쒕룞 */}
              <div className='p-6 rounded-2xl' style={{background: '#1a1a1a', border: '1px solid #333'}}>
                <h2 className='text-xl font-bold text-white mb-4'>理쒓렐 ?쒕룞</h2>
                <div className='space-y-4'>
                  <div className='flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl'>
                    <div className='w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center'>
                      <span className='text-green-400'>?뫀</span>
                    </div>
                    <div>
                      <p className='text-white'>?덈줈???ъ슜??媛??/p>
                      <p className='text-gray-400 text-sm'>諛⑷툑 ??/p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <h1 className='text-3xl font-bold text-white mb-8'>?ъ슜??愿由?/h1>
              <div className='p-6 rounded-2xl' style={{background: '#1a1a1a', border: '1px solid #333'}}>
                <table className='w-full'>
                  <thead>
                    <tr className='text-left text-gray-400 border-b border-gray-700'>
                      <th className='pb-4'>?대찓??/th>
                      <th className='pb-4'>?깃툒</th>
                      <th className='pb-4'>媛?낆씪</th>
                      <th className='pb-4'>愿由?/th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className='text-white border-b border-gray-800'>
                      <td className='py-4'>motiol_6829@naver.com</td>
                      <td className='py-4'>
                        <span className='px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm'>愿由ъ옄</span>
                      </td>
                      <td className='py-4 text-gray-400'>2024.12.25</td>
                      <td className='py-4'>
                        <button className='text-orange-400 hover:text-orange-300'>?섏젙</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'announcements' && (
            <div>
              <h1 className='text-3xl font-bold text-white mb-8'>怨듭??ы빆 愿由?/h1>
              <div className='p-6 rounded-2xl mb-6' style={{background: '#1a1a1a', border: '1px solid #333'}}>
                <h2 className='text-lg font-semibold text-white mb-4'>??怨듭? ?묒꽦</h2>
                <textarea
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  className='w-full p-4 rounded-xl bg-gray-900 border border-gray-700 text-white resize-none'
                  rows={4}
                  placeholder='怨듭? ?댁슜???낅젰?섏꽭??..'
                />
                <button 
                  onClick={handleAddAnnouncement}
                  className='btn-primary mt-4'
                >
                  怨듭? ?깅줉
                </button>
              </div>

              <div className='p-6 rounded-2xl' style={{background: '#1a1a1a', border: '1px solid #333'}}>
                <h2 className='text-lg font-semibold text-white mb-4'>?깅줉??怨듭?</h2>
                {announcements.length === 0 ? (
                  <p className='text-gray-400'>?깅줉??怨듭?媛 ?놁뒿?덈떎.</p>
                ) : (
                  <div className='space-y-4'>
                    {announcements.map((a, i) => (
                      <div key={i} className='p-4 bg-gray-800/50 rounded-xl text-white'>
                        {a}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'grades' && (
            <div>
              <h1 className='text-3xl font-bold text-white mb-8'>?깃툒 愿由?/h1>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <div className='p-6 rounded-2xl text-center' style={{background: '#1a1a1a', border: '1px solid #333'}}>
                  <div className='text-4xl mb-4'>?쪏</div>
                  <h3 className='text-xl font-bold text-white mb-2'>釉뚮줎利?/h3>
                  <p className='text-gray-400 text-sm mb-4'>湲곕낯 ?깃툒</p>
                  <p className='text-2xl font-bold text-orange-400'>0紐?/p>
                </div>
                <div className='p-6 rounded-2xl text-center' style={{background: '#1a1a1a', border: '1px solid #333'}}>
                  <div className='text-4xl mb-4'>?쪎</div>
                  <h3 className='text-xl font-bold text-white mb-2'>?ㅻ쾭</h3>
                  <p className='text-gray-400 text-sm mb-4'>?쒖꽦 ?ъ슜??/p>
                  <p className='text-2xl font-bold text-orange-400'>0紐?/p>
                </div>
                <div className='p-6 rounded-2xl text-center' style={{background: '#1a1a1a', border: '1px solid #333'}}>
                  <div className='text-4xl mb-4'>?쪍</div>
                  <h3 className='text-xl font-bold text-white mb-2'>怨⑤뱶</h3>
                  <p className='text-gray-400 text-sm mb-4'>?꾨━誘몄뾼 ?ъ슜??/p>
                  <p className='text-2xl font-bold text-orange-400'>0紐?/p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}