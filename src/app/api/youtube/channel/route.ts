import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const channelId = searchParams.get('channelId')
  const channelHandle = searchParams.get('handle')
  const maxResults = searchParams.get('maxResults') || '10'

  const apiKey = process.env.YOUTUBE_API_KEY

  if (!apiKey || apiKey === 'placeholder') {
    return NextResponse.json({ error: 'YouTube API 키가 설정되지 않았습니다.' }, { status: 500 })
  }

  try {
    let resolvedChannelId = channelId

    // 채널 핸들(@username)로 검색하는 경우 채널 ID를 먼저 가져옴
    if (channelHandle && !channelId) {
      const handleResponse = await fetch(
        'https://www.googleapis.com/youtube/v3/search?' +
        new URLSearchParams({
          part: 'snippet',
          q: channelHandle,
          type: 'channel',
          maxResults: '1',
          key: apiKey,
        })
      )
      const handleData = await handleResponse.json()
      if (handleData.items && handleData.items.length > 0) {
        resolvedChannelId = handleData.items[0].id.channelId
      } else {
        return NextResponse.json({ error: '채널을 찾을 수 없습니다.' }, { status: 404 })
      }
    }

    if (!resolvedChannelId) {
      return NextResponse.json({ error: '채널 ID 또는 핸들을 입력해주세요.' }, { status: 400 })
    }

    // 채널 정보 가져오기
    const channelResponse = await fetch(
      'https://www.googleapis.com/youtube/v3/channels?' +
      new URLSearchParams({
        part: 'snippet,statistics,contentDetails',
        id: resolvedChannelId,
        key: apiKey,
      })
    )
    const channelData = await channelResponse.json()
    
    if (!channelData.items || channelData.items.length === 0) {
      return NextResponse.json({ error: '채널 정보를 찾을 수 없습니다.' }, { status: 404 })
    }

    const channel = channelData.items[0]
    const uploadsPlaylistId = channel.contentDetails.relatedPlaylists.uploads

    // 업로드된 영상 목록 가져오기
    const videosResponse = await fetch(
      'https://www.googleapis.com/youtube/v3/playlistItems?' +
      new URLSearchParams({
        part: 'snippet',
        playlistId: uploadsPlaylistId,
        maxResults: maxResults,
        key: apiKey,
      })
    )
    const videosData = await videosResponse.json()

    if (videosData.error) {
      return NextResponse.json({ error: videosData.error.message }, { status: 400 })
    }

    // 영상 ID들 추출
    const videoIds = videosData.items?.map((item: any) => item.snippet.resourceId.videoId).join(',')

    // 영상 상세 정보 (조회수 포함) 가져오기
    const statsResponse = await fetch(
      'https://www.googleapis.com/youtube/v3/videos?' +
      new URLSearchParams({
        part: 'statistics,snippet',
        id: videoIds,
        key: apiKey,
      })
    )
    const statsData = await statsResponse.json()

    const videos = statsData.items?.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnailDefault: item.snippet.thumbnails.default?.url,
      thumbnailMedium: item.snippet.thumbnails.medium?.url,
      thumbnailHigh: item.snippet.thumbnails.high?.url,
      thumbnailMaxres: item.snippet.thumbnails.maxres?.url || item.snippet.thumbnails.high?.url,
      viewCount: parseInt(item.statistics.viewCount || '0'),
      likeCount: parseInt(item.statistics.likeCount || '0'),
      commentCount: parseInt(item.statistics.commentCount || '0'),
      publishedAt: item.snippet.publishedAt,
    })) || []

    return NextResponse.json({
      channel: {
        id: channel.id,
        title: channel.snippet.title,
        description: channel.snippet.description,
        thumbnail: channel.snippet.thumbnails.medium?.url,
        subscriberCount: parseInt(channel.statistics.subscriberCount || '0'),
        videoCount: parseInt(channel.statistics.videoCount || '0'),
        viewCount: parseInt(channel.statistics.viewCount || '0'),
      },
      videos,
    })
  } catch (error) {
    console.error('Channel API error:', error)
    return NextResponse.json({ error: 'API 요청 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

