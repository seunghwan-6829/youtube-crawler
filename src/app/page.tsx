import Link from 'next/link'

export default function Home() {
  return (
    <main className='min-h-screen flex flex-col items-center justify-center p-8'>
      <div className='text-center max-w-2xl'>
        <div className='mb-8'>
          <h1 className='text-5xl font-bold mb-4'>
            <span className='text-orange-500'>YouTube</span> Crawler
          </h1>
          <p className='text-gray-600 text-lg'>
            Easily collect and analyze YouTube data
          </p>
        </div>
        
        <div className='flex gap-4 justify-center'>
          <Link href='/auth/login' className='btn-primary'>
            Login
          </Link>
          <Link href='/auth/signup' className='px-6 py-3 border-2 border-orange-500 text-orange-500 rounded-lg font-semibold hover:bg-orange-50 transition-all'>
            Sign Up
          </Link>
        </div>

        <div className='mt-16 grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='card'>
            <div className='text-3xl mb-3'>?뵇</div>
            <h3 className='font-bold text-lg mb-2'>Search Videos</h3>
            <p className='text-gray-500 text-sm'>Search YouTube videos by keyword</p>
          </div>
          <div className='card'>
            <div className='text-3xl mb-3'>?뱤</div>
            <h3 className='font-bold text-lg mb-2'>Collect Data</h3>
            <p className='text-gray-500 text-sm'>Collect and save video metadata</p>
          </div>
          <div className='card'>
            <div className='text-3xl mb-3'>?뱢</div>
            <h3 className='font-bold text-lg mb-2'>Analyze</h3>
            <p className='text-gray-500 text-sm'>Analyze collected data</p>
          </div>
        </div>
      </div>
    </main>
  )
}