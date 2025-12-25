import Link from 'next/link'

export default function Home() {
  return (
    <div className='min-h-screen hero-gradient'>
      <nav className='navbar fixed top-0 left-0 right-0 z-50'>
        <div className='max-w-6xl mx-auto px-6 py-4 flex justify-between items-center'>
          <Link href='/' className='flex items-center gap-2'>
            <div className='w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center'>
              <span className='text-white font-bold text-sm'>RC</span>
            </div>
            <span className='text-xl font-bold'>
              <span className='gradient-text'>리부트</span> 크롤러
            </span>
          </Link>
          <div className='flex items-center gap-4'>
            <Link href='/auth/login' className='text-gray-600 hover:text-gray-900 font-medium'>로그인</Link>
            <Link href='/auth/signup' className='btn-primary text-sm py-2 px-4'>무료로 시작하기</Link>
          </div>
        </div>
      </nav>

      <main className='pt-24 pb-16'>
        <div className='max-w-6xl mx-auto px-6'>
          <div className='text-center py-20'>
            <div className='inline-block mb-6 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium'>
              유튜브 데이터 수집의 새로운 기준
            </div>
            <h1 className='text-5xl md:text-6xl font-bold mb-6 leading-tight'>
              유튜브 데이터를<br/><span className='gradient-text'>쉽고 빠르게</span> 수집하세요
            </h1>
            <p className='text-xl text-gray-600 mb-10 max-w-2xl mx-auto'>
              리부트 크롤러로 유튜브 영상 메타데이터를<br/>손쉽게 검색하고 분석하세요.
            </p>
            <div className='flex gap-4 justify-center'>
              <Link href='/auth/signup' className='btn-primary text-lg py-3 px-8'>무료로 시작하기</Link>
              <Link href='/auth/login' className='btn-secondary text-lg py-3 px-8'>로그인</Link>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mt-16'>
            <div className='card hover:shadow-xl transition-shadow'>
              <div className='w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-4'>
                <span className='text-3xl'>?뵇</span>
              </div>
              <h3 className='font-bold text-xl mb-3'>영상 검색</h3>
              <p className='text-gray-500'>키워드로 유튜브 영상을 실시간으로 검색하세요.</p>
            </div>
            <div className='card hover:shadow-xl transition-shadow'>
              <div className='w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4'>
                <span className='text-3xl'>?뱤</span>
              </div>
              <h3 className='font-bold text-xl mb-3'>데이터 수집</h3>
              <p className='text-gray-500'>조회수, 좋아요, 댓글 수 등 메타데이터를 수집하세요.</p>
            </div>
            <div className='card hover:shadow-xl transition-shadow'>
              <div className='w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4'>
                <span className='text-3xl'>?뱢</span>
              </div>
              <h3 className='font-bold text-xl mb-3'>트렌드 분석</h3>
              <p className='text-gray-500'>수집된 데이터로 트렌드를 분석하고 인사이트를 얻으세요.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className='border-t border-gray-200 py-8'>
        <div className='max-w-6xl mx-auto px-6 text-center text-gray-500 text-sm'>
          <p>2024 리부트 크롤러. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}