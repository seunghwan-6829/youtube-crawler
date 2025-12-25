import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')
  const maxResults = searchParams.get('maxResults') || '10'

  if (!query) {
    return NextResponse.json({ error: '검색어를 입력해주세요.' }, { status: 400 })
  }

  const apiKey = process.env.YOUTUBE_API_KEY

  if (!apiKey || apiKey === 'placeholder') {
    return NextResponse.json({ error: 'YouTube API 키가 설정되지 않았습니다.' }, { status: 500 })
  }

  try {
    // 채널 검색
    const searchResponse = await fetch(
      'https://www.googleapis.com/youtube/v3/search?' +
      new URLSearchParams({
        part: 'snippet',
        q: query,
        type: 'channel',
        maxResults: maxResults,
        order: 'relevance',
        key: apiKey,
      })
    )
    const searchData = await searchResponse.json()

    if (searchData.error) {
      return NextResponse.json({ error: searchData.error.message }, { status: 400 })
    }

    if (!searchData.items || searchData.items.length === 0) {
      return NextResponse.json({ channels: [] })
    }

    // 채널 ID들 추출
    const channelIds = searchData.items.map((item: any) => item.id.channelId).join(',')

    // 채널 상세 정보 가져오기 (구독자 수 포함)
    const channelsResponse = await fetch(
      'https://www.googleapis.com/youtube/v3/channels?' +
      new URLSearchParams({
        part: 'snippet,statistics',
        id: channelIds,
        key: apiKey,
      })
    )
    const channelsData = await channelsResponse.json()

    const channels = channelsData.items?.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      subscriberCount: parseInt(item.statistics.subscriberCount || '0'),
      videoCount: parseInt(item.statistics.videoCount || '0'),
      viewCount: parseInt(item.statistics.viewCount || '0'),
    })).sort((a: any, b: any) => b.subscriberCount - a.subscriberCount) || []

    return NextResponse.json({ channels })
  } catch (error) {
    console.error('Channel search error:', error)
    return NextResponse.json({ error: 'API 요청 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

