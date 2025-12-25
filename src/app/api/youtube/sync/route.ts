import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: NextRequest) {
  const apiKey = process.env.YOUTUBE_API_KEY

  if (!apiKey || apiKey === 'placeholder') {
    return NextResponse.json({ error: 'YouTube API 키가 설정되지 않았습니다.' }, { status: 500 })
  }

  try {
    const body = await request.json()
    const { channelId, maxResults = 50 } = body

    if (!channelId) {
      return NextResponse.json({ error: '채널 ID가 필요합니다.' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 채널 정보 가져오기
    const channelResponse = await fetch(
      'https://www.googleapis.com/youtube/v3/channels?' +
      new URLSearchParams({
        part: 'snippet,statistics,contentDetails',
        id: channelId,
        key: apiKey,
      })
    )
    const channelData = await channelResponse.json()

    if (!channelData.items || channelData.items.length === 0) {
      return NextResponse.json({ error: '채널을 찾을 수 없습니다.' }, { status: 404 })
    }

    const channel = channelData.items[0]
    const uploadsPlaylistId = channel.contentDetails.relatedPlaylists.uploads

    // 업로드된 영상 목록 가져오기
    const videosResponse = await fetch(
      'https://www.googleapis.com/youtube/v3/playlistItems?' +
      new URLSearchParams({
        part: 'snippet',
        playlistId: uploadsPlaylistId,
        maxResults: String(maxResults),
        key: apiKey,
      })
    )
    const videosData = await videosResponse.json()

    if (videosData.error) {
      return NextResponse.json({ error: videosData.error.message }, { status: 400 })
    }

    const videoIds = videosData.items?.map((item: any) => item.snippet.resourceId.videoId) || []

    // 기존에 저장된 영상 ID들 조회
    const { data: existingVideos } = await supabase
      .from('crawled_videos')
      .select('video_id, view_updated_at')
      .eq('channel_id', channelId)

    const existingVideoIds = new Set(existingVideos?.map(v => v.video_id) || [])
    const existingVideoMap = new Map(existingVideos?.map(v => [v.video_id, v.view_updated_at]) || [])

    // 새로운 영상 ID들
    const newVideoIds = videoIds.filter((id: string) => !existingVideoIds.has(id))
    
    // 10일이 지난 영상들 (조회수 업데이트 필요)
    const tenDaysAgo = new Date()
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10)
    const videosNeedingUpdate = videoIds.filter((id: string) => {
      const updatedAt = existingVideoMap.get(id)
      if (!updatedAt) return false
      return new Date(updatedAt) < tenDaysAgo
    })

    // 업데이트가 필요한 영상들 (새 영상 + 조회수 업데이트 필요한 영상)
    const videosToFetch = [...new Set([...newVideoIds, ...videosNeedingUpdate])]

    let newVideos: any[] = []
    let updatedVideos: any[] = []

    if (videosToFetch.length > 0) {
      // 영상 상세 정보 가져오기
      const statsResponse = await fetch(
        'https://www.googleapis.com/youtube/v3/videos?' +
        new URLSearchParams({
          part: 'statistics,snippet',
          id: videosToFetch.join(','),
          key: apiKey,
        })
      )
      const statsData = await statsResponse.json()

      for (const item of statsData.items || []) {
        const videoData = {
          channel_id: channelId,
          video_id: item.id,
          title: item.snippet.title,
          thumbnail_url: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
          thumbnail_maxres: item.snippet.thumbnails.maxres?.url || item.snippet.thumbnails.high?.url,
          view_count: parseInt(item.statistics.viewCount || '0'),
          like_count: parseInt(item.statistics.likeCount || '0'),
          comment_count: parseInt(item.statistics.commentCount || '0'),
          published_at: item.snippet.publishedAt,
          view_updated_at: new Date().toISOString(),
        }

        if (newVideoIds.includes(item.id)) {
          // 새 영상 삽입
          const { error } = await supabase
            .from('crawled_videos')
            .insert({ ...videoData, is_new: true, crawled_at: new Date().toISOString() })

          if (!error) {
            newVideos.push({
              ...videoData,
              isNew: true,
            })
          }
        } else {
          // 기존 영상 조회수 업데이트
          const { error } = await supabase
            .from('crawled_videos')
            .update({
              view_count: videoData.view_count,
              like_count: videoData.like_count,
              comment_count: videoData.comment_count,
              view_updated_at: new Date().toISOString(),
              is_new: false,
            })
            .eq('video_id', item.id)

          if (!error) {
            updatedVideos.push({
              ...videoData,
              isNew: false,
            })
          }
        }
      }
    }

    // 모든 영상 정보 반환 (새 영상 우선)
    const { data: allVideos } = await supabase
      .from('crawled_videos')
      .select('*')
      .eq('channel_id', channelId)
      .order('published_at', { ascending: false })

    return NextResponse.json({
      channel: {
        id: channel.id,
        title: channel.snippet.title,
        thumbnail: channel.snippet.thumbnails.medium?.url,
        subscriberCount: parseInt(channel.statistics.subscriberCount || '0'),
        videoCount: parseInt(channel.statistics.videoCount || '0'),
      },
      summary: {
        totalVideos: allVideos?.length || 0,
        newVideos: newVideos.length,
        updatedVideos: updatedVideos.length,
      },
      videos: allVideos?.map(v => ({
        id: v.video_id,
        title: v.title,
        thumbnailMedium: v.thumbnail_url,
        thumbnailMaxres: v.thumbnail_maxres,
        viewCount: v.view_count,
        likeCount: v.like_count,
        commentCount: v.comment_count,
        publishedAt: v.published_at,
        crawledAt: v.crawled_at,
        viewUpdatedAt: v.view_updated_at,
        isNew: v.is_new,
      })) || [],
      newVideoIds: newVideos.map(v => v.video_id),
    })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json({ error: '동기화 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

