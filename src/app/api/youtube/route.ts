import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')

  if (!query) {
    return NextResponse.json({ error: '寃?됱뼱瑜??낅젰?댁＜?몄슂.' }, { status: 400 })
  }

  const apiKey = process.env.YOUTUBE_API_KEY

  if (!apiKey || apiKey === 'placeholder') {
    return NextResponse.json({ error: 'YouTube API ?ㅺ? ?ㅼ젙?섏? ?딆븯?듬땲??' }, { status: 500 })
  }

  try {
    const response = await fetch(
      'https://www.googleapis.com/youtube/v3/search?' + 
      new URLSearchParams({
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults: '10',
        key: apiKey,
      })
    )

    const data = await response.json()

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 400 })
    }

    const items = data.items?.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
    })) || []

    return NextResponse.json({ items })
  } catch (error) {
    return NextResponse.json({ error: 'API ?붿껌 以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.' }, { status: 500 })
  }
}