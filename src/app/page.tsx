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
              <span className='gradient-text'>由щ???/span> ?щ·??            </span>
          </Link>
          <div className='flex items-center gap-4'>
            <Link href='/auth/login' className='text-gray-600 hover:text-gray-900 font-medium'>濡쒓렇??/Link>
            <Link href='/auth/signup' className='btn-primary text-sm py-2 px-4'>臾대즺濡??쒖옉?섍린</Link>
          </div>
        </div>
      </nav>

      <main className='pt-24 pb-16'>
        <div className='max-w-6xl mx-auto px-6'>
          <div className='text-center py-20'>
            <div className='inline-block mb-6 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium'>
              ?좏뒠釉??곗씠???섏쭛???덈줈??湲곗?
            </div>
            <h1 className='text-5xl md:text-6xl font-bold mb-6 leading-tight'>
              ?좏뒠釉??곗씠?곕?<br/><span className='gradient-text'>?쎄퀬 鍮좊Ⅴ寃?/span> ?섏쭛?섏꽭??            </h1>
            <p className='text-xl text-gray-600 mb-10 max-w-2xl mx-auto'>
              由щ????щ·?щ줈 ?좏뒠釉??곸긽 硫뷀??곗씠?곕? ?먯돺寃?寃?됲븯怨?遺꾩꽍?섏꽭??
            </p>
            <div className='flex gap-4 justify-center'>
              <Link href='/auth/signup' className='btn-primary text-lg py-3 px-8'>臾대즺濡??쒖옉?섍린</Link>
              <Link href='/auth/login' className='btn-secondary text-lg py-3 px-8'>濡쒓렇??/Link>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mt-16'>
            <div className='card hover:shadow-xl transition-shadow'>
              <div className='w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-4'>
                <span className='text-3xl'>?뵇</span>
              </div>
              <h3 className='font-bold text-xl mb-3'>?곸긽 寃??/h3>
              <p className='text-gray-500'>?ㅼ썙?쒕줈 ?좏뒠釉??곸긽???ㅼ떆媛꾩쑝濡?寃?됲븯?몄슂.</p>
            </div>
            <div className='card hover:shadow-xl transition-shadow'>
              <div className='w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4'>
                <span className='text-3xl'>?뱤</span>
              </div>
              <h3 className='font-bold text-xl mb-3'>?곗씠???섏쭛</h3>
              <p className='text-gray-500'>議고쉶?? 醫뗭븘????硫뷀??곗씠?곕? ?섏쭛?섏꽭??</p>
            </div>
            <div className='card hover:shadow-xl transition-shadow'>
              <div className='w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4'>
                <span className='text-3xl'>?뱢</span>
              </div>
              <h3 className='font-bold text-xl mb-3'>?몃젋??遺꾩꽍</h3>
              <p className='text-gray-500'>?섏쭛???곗씠?곕줈 ?몃젋?쒕? 遺꾩꽍?섏꽭??</p>
            </div>
          </div>
        </div>
      </main>

      <footer className='border-t border-gray-200 py-8'>
        <div className='max-w-6xl mx-auto px-6 text-center text-gray-500 text-sm'>
          <p>2024 由щ????щ·?? All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}