export type YouTubePlayer = {
  playVideo: () => void
  stopVideo: () => void
  destroy: () => void
}

type PlayerEvent = { target: YouTubePlayer }
type PlayerOptions = {
  events: {
    onReady: (event: PlayerEvent) => void
    onStateChange: (event: PlayerEvent & { data: number }) => void
    onError: () => void
    onAutoplayBlocked: () => void
  }
}

type YouTubeAPI = { Player: new (iframe: HTMLIFrameElement, options: PlayerOptions) => YouTubePlayer }

declare global {
  interface Window {
    YT?: YouTubeAPI
    onYouTubeIframeAPIReady?: () => void
  }
}

let apiPromise: Promise<YouTubeAPI> | undefined

export function loadYouTubeAPI(): Promise<YouTubeAPI> {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (apiPromise) return apiPromise

  apiPromise = new Promise((resolve, reject) => {
    const previousCallback = window.onYouTubeIframeAPIReady
    const script = document.createElement('script')
    const fail = () => {
      clearTimeout(timeout)
      script.remove()
      apiPromise = undefined
      reject(new Error('YouTube player API unavailable'))
    }
    const timeout = window.setTimeout(fail, 20000)
    window.onYouTubeIframeAPIReady = () => {
      clearTimeout(timeout)
      previousCallback?.()
      if (window.YT?.Player) resolve(window.YT)
      else fail()
    }
    script.src = 'https://www.youtube.com/iframe_api'
    script.async = true
    script.onerror = fail
    document.head.append(script)
  })

  return apiPromise
}
