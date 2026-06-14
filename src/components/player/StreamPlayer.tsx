import Hls from "hls.js";
import { AlertTriangle, CirclePlay, Loader2, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState, type MutableRefObject } from "react";

import { Button } from "@/components/ui/button";
import type { ChannelStream, PublicChannel } from "@/lib/iptv";
import { PlayerOverlay } from "./PlayerOverlay";

type PlayerState = "idle" | "loading" | "ready" | "error";

export function StreamPlayer({
  channel,
  stream,
  videoRef,
}: {
  channel: PublicChannel | null;
  stream: ChannelStream | null;
  videoRef: MutableRefObject<HTMLVideoElement | null>;
}) {
  const [playerState, setPlayerState] = useState<PlayerState>("idle");
  const [retryNonce, setRetryNonce] = useState(0);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) {
      setPlayerState("idle");
      return;
    }

    setPlayerState("loading");
    let hls: Hls | null = null;

    const safeSetState = (state: PlayerState) => {
      if (mountedRef.current) {
        setPlayerState(state);
      }
    };
    const markReady = () => safeSetState("ready");
    const markError = () => safeSetState("error");
    const timeoutId = window.setTimeout(() => safeSetState("error"), 12000);

    video.addEventListener("canplay", markReady);
    video.addEventListener("error", markError);

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        manifestLoadingTimeOut: 10000,
        manifestLoadingMaxRetry: 3,
        levelLoadingTimeOut: 10000,
        levelLoadingMaxRetry: 3,
        fragLoadingTimeOut: 20000,
        fragLoadingMaxRetry: 3,
      });

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log(`[HLS] Manifest loaded for ${channel?.name}`);
        video.play().catch(err => console.warn('[HLS] Autoplay prevented:', err));
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        console.error('[HLS] Error:', data.type, data.details, data.fatal);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log('[HLS] Network error, attempting recovery...');
              hls?.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('[HLS] Media error, attempting recovery...');
              hls?.recoverMediaError();
              break;
            default:
              console.log('[HLS] Fatal error, cannot recover');
              safeSetState("error");
              break;
          }
        }
      });

      hls.loadSource(stream.url);
      hls.attachMedia(video);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      console.log('[Native HLS] Loading stream natively');
      video.src = stream.url;
      video.load();
    } else {
      console.error('[Player] HLS not supported');
      safeSetState("error");
    }

    return () => {
      video.removeEventListener("canplay", markReady);
      video.removeEventListener("error", markError);
      window.clearTimeout(timeoutId);
      hls?.destroy();
    };
  }, [stream?.url, retryNonce, videoRef]);

  return (
    <div className="aspect-video bg-black">
      {channel && stream ? (
        <div className="relative h-full">
          <video
            key={`${stream.url}-${retryNonce}`}
            ref={videoRef}
            className="h-full w-full bg-black"
            controls
            playsInline
            preload="metadata"
          />

          {playerState === "loading" ? (
            <PlayerOverlay
              icon={<Loader2 className="size-6 animate-spin" aria-hidden="true" />}
              title="Memuat stream"
              body={`${channel.name} sedang dibuka.`}
            />
          ) : null}

          {playerState === "error" ? (
            <PlayerOverlay
              icon={<AlertTriangle className="size-6" aria-hidden="true" />}
              title="Stream gagal dimuat"
              body="Coba retry atau pilih stream alternatif jika tersedia."
              action={
                <Button type="button" onClick={() => setRetryNonce(value => value + 1)}>
                  <RotateCcw className="size-4" aria-hidden="true" />
                  Retry
                </Button>
              }
            />
          ) : null}
        </div>
      ) : (
        <div className="relative h-full">
          <PlayerOverlay
            icon={<CirclePlay className="size-6" aria-hidden="true" />}
            title="Pilih channel"
            body="Pilih channel dari daftar untuk mulai menonton."
          />
        </div>
      )}
    </div>
  );
}
