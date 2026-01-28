import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import Head from "next/head";

function cn(...a) {
  return a.filter(Boolean).join(" ");
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function formatTime(sec) {
  if (!isFinite(sec) || sec < 0) return "0:00";
  const s = Math.floor(sec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
  return `${m}:${String(r).padStart(2, "0")}`;
}

export default function WatchPage() {
  const router = useRouter();
  const { provider, id, episode } = router.query;

  // --- STATE DATA ---
  const [allEpisodes, setAllEpisodes] = useState([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [qualities, setQualities] = useState([]);
  const [currentQuality, setCurrentQuality] = useState("Auto");

  // --- STATE UI ---
  const [showDrawer, setShowDrawer] = useState(false);
  const [showUI, setShowUI] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1.0);
  const [showQualityMenu, setShowQualityMenu] = useState(false);

  // progress
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const videoRef = useRef(null);
  const uiTimer = useRef(null);

  const epNum = useMemo(() => parseInt(episode || "1", 10) || 1, [episode]);
  const epTotal = allEpisodes?.length || 0;

  // 1) Cek login (sementara: localStorage). Nanti kalau kamu sudah pakai cookie vip_session, kita ganti cek-nya.
  useEffect(() => {
    const userStatus = localStorage.getItem("vip_user");
    setIsLoggedIn(userStatus === "active");
  }, []);

  // 2) Fetch daftar episode
  useEffect(() => {
    if (!id || !provider) return;
    fetch(`https://api.sansekai.my.id/api/${provider}/allepisode?bookId=${id}`)
      .then((res) => res.json())
      .then((data) => setAllEpisodes(Array.isArray(data) ? data : data?.data || []))
      .catch(() => setAllEpisodes([]));
  }, [id, provider]);

  // 3) Ganti episode + lock check + set video
  useEffect(() => {
    if (!allEpisodes.length || !episode) return;

    // lock episode 4+
    if (epNum > 3 && !isLoggedIn) {
      setIsLocked(true);
      setVideoUrl("");
      setShowLoginModal(true);
      return;
    }

    setIsLocked(false);
    setShowLoginModal(false);

    const curr = allEpisodes[epNum - 1];
    if (!curr) return;

    if (curr.cdnList?.[0]?.videoPathList?.length) {
      const qList = curr.cdnList[0].videoPathList;
      setQualities(qList);
      setVideoUrl(qList[0].videoPath);
      setCurrentQuality(qList[0].quality || "HD");
    } else {
      setQualities([]);
      setVideoUrl(curr.videoUrl || "");
      setCurrentQuality("SD");
    }

    // reset progress display
    setCurrentTime(0);
    setDuration(0);
    setShowQualityMenu(false);
  }, [episode, allEpisodes, isLoggedIn, epNum]);

  // autoplay next
  const handleVideoEnd = () => {
    const nextEp = epNum + 1;
    if (nextEp <= epTotal) {
      if (nextEp > 3 && !isLoggedIn) {
        setShowLoginModal(true);
        return;
      }
      router.push(`/watch/${provider}/${id}/${nextEp}`);
    }
  };

  // UI auto-hide
  const activateUI = () => {
    setShowUI(true);
    if (uiTimer.current) clearTimeout(uiTimer.current);
    uiTimer.current = setTimeout(() => {
      if (isPlaying && !showDrawer && !showQualityMenu) setShowUI(false);
    }, 2200);
  };

  useEffect(() => {
    const onMove = () => activateUI();
    const onKey = (e) => {
      activateUI();
      if (e.key === "Escape") {
        setShowDrawer(false);
        setShowQualityMenu(false);
      }
      if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      }
      if (e.key === "ArrowLeft") skip(-10);
      if (e.key === "ArrowRight") skip(10);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("click", onMove);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("click", onMove);
      window.removeEventListener("keydown", onKey);
      if (uiTimer.current) clearTimeout(uiTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, showDrawer, showQualityMenu, epNum, episode, isLoggedIn]);

  // Player controls
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      setShowUI(true);
    }
  };

  const skip = (sec) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = clamp(videoRef.current.currentTime + sec, 0, duration || 999999);
    activateUI();
  };

  const setPlaybackRate = (rate) => {
    setSpeed(rate);
    if (videoRef.current) videoRef.current.playbackRate = rate;
    activateUI();
  };

  const seekTo = (val) => {
    const t = Number(val || 0);
    if (videoRef.current) videoRef.current.currentTime = t;
    setCurrentTime(t);
    activateUI();
  };

  const toggleFullscreen = async () => {
    try {
      const el = document.documentElement;
      if (!document.fullscreenElement) await el.requestFullscreen?.();
      else await document.exitFullscreen?.();
    } catch (_) {}
  };

  const canPrev = epNum > 1;
  const canNext = epNum < epTotal;

  return (
    <div className="bg-black h-screen w-screen overflow-hidden relative font-sans select-none">
      <Head>
        <title>Nonton • {String(provider || "").toUpperCase()} • Ep {epNum}</title>
      </Head>

      {/* VIDEO LAYER */}
      <div
        className="absolute inset-0 z-0 flex items-center justify-center bg-black"
        onClick={() => {
          // klik video = toggle play + munculin UI
          if (!isLocked) togglePlay();
        }}
      >
        {isLocked ? (
          <div className="text-center z-10 px-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-gray-200 text-xs font-black">
              🔒 VIP LOCKED
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white mt-4">Episode Terkunci</h2>
            <p className="text-gray-400 mt-2">
              Episode 4+ khusus VIP. Login pakai email untuk membuka akses.
            </p>
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => router.push("/login-email")}
                className="bg-white text-black px-7 py-3 rounded-2xl font-black hover:opacity-90 transition"
              >
                Login Email
              </button>
              <button
                onClick={() => router.back()}
                className="bg-white/5 border border-white/10 text-white px-7 py-3 rounded-2xl font-black hover:bg-white/10 transition"
              >
                Kembali
              </button>
            </div>
          </div>
        ) : videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            autoPlay
            onEnded={handleVideoEnd}
            className="w-full h-full object-contain"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onLoadedMetadata={() => {
              const d = videoRef.current?.duration || 0;
              setDuration(d);
            }}
            onTimeUpdate={() => {
              const t = videoRef.current?.currentTime || 0;
              setCurrentTime(t);
            }}
          />
        ) : (
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {/* OVERLAY UI */}
      {!isLocked && (
        <div
          className={cn(
            "absolute inset-0 z-40 transition-opacity duration-300",
            showUI ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
        >
          {/* top/bottom gradients for readability */}
          <div className="absolute top-0 left-0 w-full h-28 bg-gradient-to-b from-black/85 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-black/90 to-transparent" />

          {/* TOP BAR */}
          <div className="absolute top-0 left-0 w-full p-4 md:p-6 flex items-start justify-between gap-3">
            <button
              onClick={() => router.back()}
              className="w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition flex items-center justify-center text-white font-black"
              aria-label="Back"
              title="Back"
            >
              ✕
            </button>

            <div className="min-w-0 flex-1 px-2">
              <div className="text-white font-black text-sm md:text-base truncate">
                {String(provider || "").toUpperCase()} • Episode {epNum}
              </div>
              <div className="text-[10px] md:text-xs text-gray-400 truncate">
                {currentQuality} • {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Quality */}
              {qualities.length > 0 && (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowQualityMenu((s) => !s);
                      activateUI();
                    }}
                    className="h-11 md:h-12 px-3 rounded-2xl bg-black/50 backdrop-blur border border-white/15 text-white text-[11px] font-black uppercase tracking-wider hover:bg-white/10 transition"
                    title="Quality"
                  >
                    {currentQuality} ▾
                  </button>

                  {showQualityMenu && (
                    <div className="absolute top-full right-0 mt-2 w-28 rounded-2xl overflow-hidden border border-white/10 bg-[#0b0b0b]/95 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
                      {qualities.map((q, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            setVideoUrl(q.videoPath);
                            setCurrentQuality(q.quality || "HD");
                            setShowQualityMenu(false);
                            setTimeout(() => {
                              // keep play after switching quality
                              try {
                                videoRef.current?.play();
                              } catch (_) {}
                            }, 60);
                          }}
                          className="w-full px-4 py-3 text-left text-[11px] font-black text-gray-200 hover:bg-primary/80 hover:text-white transition border-b border-white/5 last:border-0"
                        >
                          {q.quality}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Episodes drawer */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDrawer(true);
                  activateUI();
                }}
                className="h-11 md:h-12 px-4 rounded-2xl bg-primary hover:opacity-95 transition text-white text-[11px] font-black flex items-center gap-2 shadow-[0_0_26px_rgba(229,9,20,0.25)]"
                title="Daftar Episode"
              >
                📚 <span className="hidden sm:inline">Episode</span>
              </button>
            </div>
          </div>

          {/* CENTER PLAY ICON when paused */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {!isPlaying && (
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-black/35 backdrop-blur border border-white/20 flex items-center justify-center">
                <span className="text-3xl md:text-4xl ml-1 text-white font-black">▶</span>
              </div>
            )}
          </div>

          {/* BOTTOM CONTROLS */}
          <div className="absolute bottom-0 left-0 w-full px-4 pb-5 md:px-6 md:pb-8">
            <div className="mx-auto max-w-5xl">
              {/* Seek bar */}
              <div className="mb-3 md:mb-4">
                <input
                  type="range"
                  min={0}
                  max={Math.max(0, duration || 0)}
                  step={0.2}
                  value={Math.min(currentTime, duration || 0)}
                  onChange={(e) => seekTo(e.target.value)}
                  className="w-full accent-primary"
                />
                <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Buttons row */}
              <div className="flex items-center justify-between gap-3">
                {/* Left: prev/next */}
                <div className="flex items-center gap-2">
                  <button
                    disabled={!canPrev}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!canPrev) return;
                      router.push(`/watch/${provider}/${id}/${epNum - 1}`);
                    }}
                    className={cn(
                      "h-12 px-4 rounded-2xl font-black border transition",
                      canPrev
                        ? "bg-white/5 border-white/10 hover:bg-white/10 text-white"
                        : "bg-white/5 border-white/10 text-gray-600 cursor-not-allowed"
                    )}
                  >
                    ← Prev
                  </button>

                  <button
                    disabled={!canNext}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!canNext) return;
                      if (epNum + 1 > 3 && !isLoggedIn) {
                        setShowLoginModal(true);
                        return;
                      }
                      router.push(`/watch/${provider}/${id}/${epNum + 1}`);
                    }}
                    className={cn(
                      "h-12 px-4 rounded-2xl font-black border transition",
                      canNext
                        ? "bg-white/5 border-white/10 hover:bg-white/10 text-white"
                        : "bg-white/5 border-white/10 text-gray-600 cursor-not-allowed"
                    )}
                  >
                    Next →
                  </button>
                </div>

                {/* Center: main controls */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      skip(-10);
                    }}
                    className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition flex items-center justify-center"
                    title="-10s"
                  >
                    <span className="text-lg font-black">↺</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlay();
                    }}
                    className="h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-white text-black hover:opacity-90 transition flex items-center justify-center shadow-[0_0_22px_rgba(255,255,255,0.2)]"
                    title="Play/Pause"
                  >
                    <span className="text-2xl font-black ml-0.5">{isPlaying ? "⏸" : "▶"}</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      skip(10);
                    }}
                    className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition flex items-center justify-center"
                    title="+10s"
                  >
                    <span className="text-lg font-black">↻</span>
                  </button>
                </div>

                {/* Right: speed + fullscreen */}
                <div className="flex items-center gap-2">
                  <div className="hidden md:flex items-center gap-1 bg-black/40 border border-white/10 rounded-2xl p-1">
                    {[0.75, 1.0, 1.25, 1.5, 2.0].map((r) => (
                      <button
                        key={r}
                        onClick={(e) => {
                          e.stopPropagation();
                          setPlaybackRate(r);
                        }}
                        className={cn(
                          "px-3 py-2 rounded-xl text-[11px] font-black transition",
                          speed === r ? "bg-white text-black" : "text-gray-300 hover:bg-white/10"
                        )}
                      >
                        {r}x
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // mobile quick speed cycle
                      const list = [0.75, 1.0, 1.25, 1.5, 2.0];
                      const idx = list.indexOf(speed);
                      const next = list[(idx + 1) % list.length];
                      setPlaybackRate(next);
                    }}
                    className="md:hidden h-12 px-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-[11px] font-black"
                    title="Speed"
                  >
                    {speed}x
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFullscreen();
                    }}
                    className="h-12 px-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-[11px] font-black"
                    title="Fullscreen"
                  >
                    ⛶
                  </button>
                </div>
              </div>

              {/* small hint */}
              <div className="mt-3 text-[10px] text-gray-500 flex items-center justify-between">
                <span>Tap video untuk Play/Pause • Space untuk Play/Pause</span>
                <span className="hidden sm:inline">
                  {epTotal ? `Ep ${epNum} / ${epTotal}` : ""}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER EPISODES */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 w-[86%] max-w-[420px] bg-[#0b0b0b]/92 backdrop-blur-2xl border-l border-white/10 z-[70] transform transition-transform duration-300 ease-out shadow-[-20px_0_60px_rgba(0,0,0,0.6)]",
          showDrawer ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="p-5 border-b border-white/10 flex justify-between items-center">
          <div>
            <div className="text-white font-black text-base">Daftar Episode</div>
            <div className="text-[10px] text-gray-500 mt-1">
              {epTotal} Episode • {isLoggedIn ? "VIP ACCESS" : "FREE MODE"}
            </div>
          </div>
          <button
            onClick={() => setShowDrawer(false)}
            className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition flex items-center justify-center"
            aria-label="Close drawer"
            title="Close"
          >
            ✕
          </button>
        </div>

        <div className="p-4 overflow-y-auto h-full pb-28">
          <div className="grid grid-cols-5 sm:grid-cols-6 gap-3 content-start">
            {allEpisodes.map((_, idx) => {
              const num = idx + 1;
              const active = num === epNum;
              const locked = num > 3 && !isLoggedIn;

              return (
                <button
                  key={num}
                  onClick={() => {
                    if (locked) {
                      setShowLoginModal(true);
                      setShowDrawer(false);
                      return;
                    }
                    router.push(`/watch/${provider}/${id}/${num}`);
                    setShowDrawer(false);
                  }}
                  className={cn(
                    "aspect-square rounded-2xl flex items-center justify-center font-black text-sm border transition relative",
                    active
                      ? "bg-primary border-primary text-white shadow-[0_0_18px_rgba(229,9,20,0.35)] scale-[1.03]"
                      : locked
                      ? "bg-white/5 border-white/10 text-gray-600 cursor-not-allowed"
                      : "bg-white/5 border-white/10 text-gray-200 hover:bg-white/10"
                  )}
                >
                  {locked ? "🔒" : num}
                </button>
              );
            })}
          </div>

          <div className="mt-5 rounded-2xl bg-white/5 border border-white/10 p-4">
            <div className="text-[11px] text-gray-300 font-black">Tips</div>
            <div className="text-[11px] text-gray-500 mt-1">
              Episode 1–3 gratis. Login email untuk membuka episode berikutnya.
            </div>
          </div>
        </div>
      </div>

      {/* LOGIN MODAL (redirect to /login-email) */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#111]/95 border border-white/10 p-7 rounded-3xl max-w-sm w-full text-center shadow-2xl">
            <div className="text-5xl mb-4">💎</div>
            <h2 className="text-2xl font-black text-white mb-2">Akses VIP Diperlukan</h2>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              Episode 4 ke atas terkunci. Login via email untuk membuka akses.
            </p>

            <button
              onClick={() => router.push("/login-email")}
              className="w-full bg-white text-black py-4 rounded-2xl font-black hover:opacity-90 transition"
            >
              Login Email
            </button>

            <button
              onClick={() => setShowLoginModal(false)}
              className="mt-3 text-gray-500 text-xs hover:text-white font-black tracking-widest uppercase"
            >
              Nanti Saja
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
