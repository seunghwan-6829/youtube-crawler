# YouTube Crawler

?좏뒠釉??곗씠?곕? ?섏쭛?섍퀬 遺꾩꽍?섎뒗 ???쒕퉬?ㅼ엯?덈떎.

## 湲곗닠 ?ㅽ깮

- **Frontend/Backend**: Next.js 15 (App Router)
- **?몄쬆**: Supabase Auth
- **?곗씠?곕쿋?댁뒪**: Supabase (PostgreSQL)
- **?ㅽ??쇰쭅**: Tailwind CSS
- **諛고룷**: Vercel

## 湲곕뒫

- ?뚯썝媛??/ 濡쒓렇??- YouTube ?곸긽 寃??- ?곸긽 硫뷀??곗씠???섏쭛 (議고쉶?? 醫뗭븘????

## ?쒖옉?섍린

### 1. ?섍꼍 蹂???ㅼ젙

`.env.local.example`??`.env.local`濡?蹂듭궗?섍퀬 媛믪쓣 ?낅젰?섏꽭??

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
YOUTUBE_API_KEY=your_youtube_api_key
```

### 2. Supabase ?ㅼ젙

1. [Supabase](https://supabase.com)?먯꽌 ???꾨줈?앺듃 ?앹꽦
2. Project Settings > API?먯꽌 URL怨?anon key 蹂듭궗
3. Authentication > Settings?먯꽌 Site URL ?ㅼ젙

### 3. YouTube API ?ㅼ젙

1. [Google Cloud Console](https://console.cloud.google.com)?먯꽌 ?꾨줈?앺듃 ?앹꽦
2. YouTube Data API v3 ?쒖꽦??3. API ???앹꽦

### 4. 媛쒕컻 ?쒕쾭 ?ㅽ뻾

```bash
npm install
npm run dev
```

## 諛고룷

### Vercel 諛고룷

1. GitHub???몄떆
2. Vercel?먯꽌 ?꾨줈?앺듃 import
3. ?섍꼍 蹂???ㅼ젙
4. 諛고룷

### Supabase ?곕룞

Vercel ?꾨줈?앺듃 ?ㅼ젙?먯꽌 Supabase ?섍꼍 蹂?섎? ?ㅼ젙?섏꽭??

## ?쇱씠?쇱뒪

MIT
