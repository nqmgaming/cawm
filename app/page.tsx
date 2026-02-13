"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Headphones,
  Play,
  Pause,
  RotateCcw,
  RefreshCw,
} from "lucide-react";

/* ===== Mood Data ===== */
type Mood = "ok" | "tired" | "missing";

const MOOD_CONFIG: Record<Mood, { label: string; intro: string[] }> = {
  ok: {
    label: "mình ổn",
    intro: [
      "vui quá, vậy thì nghe cùng mình nha",
      "chỉ là một bài thôi, hiền lắm 🌿",
    ],
  },
  tired: {
    label: "mình hơi mệt",
    intro: [
      "vậy thì cứ nghỉ chút đi nha",
      "để mình bật nhạc, bạn chỉ cần nghe thôi 🌙",
    ],
  },
  missing: {
    label: "mình nhớ ai đó",
    intro: [
      "mình hiểu mà",
      "nhớ ai thì cứ nhớ, không sao đâu 💛",
    ],
  },
};

/* ===== Timeline Data ===== */
const LYRICS_TIMELINE = [
  { time: 0, text: "Hôm nay là Valentine đó 🌷" },
  { time: 10, text: "Nhưng mình nghĩ, không chỉ dành cho tình yêu đâu." },
  { time: 20, text: "Có những người mình quý theo cách rất hiền." },
  { time: 30, text: "Và bạn là một trong số đó." },
  { time: 40, text: "Nếu hôm nay mệt, cứ nghe bài này nha." },
  { time: 50, text: "Không cần trả lời, không cần suy nghĩ." },
  { time: 60, text: "Chỉ là… nghe cùng nhau một chút thôi." },
  { time: 70, text: "Come along with me 💛" },
];

/* ===== Grain Texture Overlay ===== */
function GrainOverlay() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 2,
        opacity: 0.03,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: "128px 128px",
      }}
    />
  );
}

/* ===== Sparkle Particles (fewer, softer) ===== */
function Sparkles() {
  const sparkles = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 5}s`,
    duration: `${3 + Math.random() * 4}s`,
    size: `${8 + Math.random() * 6}px`,
  }));

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden",
      }}
    >
      {sparkles.map((s) => (
        <span
          key={s.id}
          style={{
            position: "absolute",
            left: s.left,
            top: s.top,
            fontSize: s.size,
            animation: `sparkle ${s.duration} ease-in-out ${s.delay} infinite`,
            opacity: 0,
          }}
        >
          ✨
        </span>
      ))}
    </div>
  );
}

/* ===== Floating Hearts (fewer, softer) ===== */
function FloatingHearts() {
  const hearts = Array.from({ length: 4 }, (_, i) => ({
    id: i,
    left: `${15 + Math.random() * 70}%`,
    bottom: `${-5 - Math.random() * 10}%`,
    delay: `${Math.random() * 8}s`,
    duration: `${7 + Math.random() * 5}s`,
    size: `${10 + Math.random() * 6}px`,
  }));

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden",
      }}
    >
      {hearts.map((h) => (
        <span
          key={h.id}
          style={{
            position: "absolute",
            left: h.left,
            bottom: h.bottom,
            fontSize: h.size,
            animation: `float-heart ${h.duration} ease-in-out ${h.delay} infinite`,
            opacity: 0,
          }}
        >
          💗
        </span>
      ))}
    </div>
  );
}

/* ===== Cloud Blobs ===== */
function Clouds() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden",
      }}
    >
      {[
        { top: "8%", right: "5%", w: 120, h: 50, delay: "0s" },
        { top: "15%", left: "3%", w: 100, h: 40, delay: "2s" },
        { bottom: "20%", right: "8%", w: 90, h: 38, delay: "4s" },
      ].map((c, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: c.top,
            right: c.right,
            left: c.left,
            bottom: c.bottom,
            width: c.w,
            height: c.h,
            background:
              "linear-gradient(135deg, rgba(184, 228, 240, 0.2), rgba(232, 213, 245, 0.15))",
            borderRadius: "50%",
            filter: "blur(10px)",
            animation: `cloud-drift 10s ease-in-out ${c.delay} infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ===== Toast ===== */
function Toast({
  message,
  visible,
}: {
  message: string;
  visible: boolean;
}) {
  if (!message) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: 32,
        left: "50%",
        transform: "translateX(-50%)",
        background: "var(--text-primary)",
        color: "var(--cream)",
        fontFamily: "var(--font-body)",
        padding: "10px 24px",
        borderRadius: 99,
        fontSize: 14,
        fontWeight: 500,
        zIndex: 100,
        animation: visible
          ? "toast-in 0.3s ease-out forwards"
          : "toast-out 0.3s ease-in forwards",
        pointerEvents: "none",
      }}
    >
      {message}
    </div>
  );
}

/* ===== Micro-interaction: small text hint ===== */
function MicroHint({ text }: { text: string }) {
  return (
    <p
      style={{
        fontFamily: "var(--font-accent)",
        fontSize: 15,
        color: "var(--text-light)",
        marginTop: 12,
        animation: "fade-in-up 0.5s ease-out forwards",
        opacity: 0,
      }}
    >
      {text}
    </p>
  );
}

/* ===== Main App Content ===== */
function AppContent() {
  const searchParams = useSearchParams();
  const toName = searchParams.get("to");
  const displayName = toName || "một người bạn";

  const audioRef = useRef<HTMLAudioElement>(null);
  const [section, setSection] = useState<
    "intro" | "mood" | "player" | "ending"
  >("intro");
  const [mood, setMood] = useState<Mood | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLyric, setCurrentLyric] = useState(-1);
  const [showLyric, setShowLyric] = useState(false);
  const [toast, setToast] = useState({ message: "", visible: false });
  const [introVisible, setIntroVisible] = useState(false);
  const [moodVisible, setMoodVisible] = useState(false);
  const [playerVisible, setPlayerVisible] = useState(false);
  const [endingVisible, setEndingVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playHint, setPlayHint] = useState("");
  const [showMoodIntro, setShowMoodIntro] = useState(false);

  // Intro entrance animation
  useEffect(() => {
    const t = setTimeout(() => setIntroVisible(true), 200);
    return () => clearTimeout(t);
  }, []);

  // Audio time update → lyrics sync
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      const t = audio.currentTime;
      const total = audio.duration || 1;
      setProgress((t / total) * 100);

      // Find matching lyric
      let matchedIndex = -1;
      for (let i = LYRICS_TIMELINE.length - 1; i >= 0; i--) {
        if (t >= LYRICS_TIMELINE[i].time) {
          matchedIndex = i;
          break;
        }
      }

      if (matchedIndex !== currentLyric && matchedIndex >= 0) {
        setShowLyric(false);
        setTimeout(() => {
          setCurrentLyric(matchedIndex);
          setShowLyric(true);
        }, 400);
      }

      // Show ending after last lyric plays for 8 seconds
      const lastLyric = LYRICS_TIMELINE[LYRICS_TIMELINE.length - 1];
      if (t >= lastLyric.time + 8 && section === "player") {
        setSection("ending");
        setTimeout(() => setEndingVisible(true), 100);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setSection("ending");
      setTimeout(() => setEndingVisible(true), 100);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentLyric, section]);

  const showToast = useCallback((msg: string) => {
    setToast({ message: msg, visible: true });
    setTimeout(() => setToast((p) => ({ ...p, visible: false })), 2500);
    setTimeout(() => setToast({ message: "", visible: false }), 3000);
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
      setPlayHint("ok, mình nghe nha 🎧");
      setTimeout(() => setPlayHint(""), 3000);
    }
  }, [isPlaying]);

  const handleGoToMood = useCallback(() => {
    setSection("mood");
    setTimeout(() => setMoodVisible(true), 100);
  }, []);

  const handleMoodSelect = useCallback((selectedMood: Mood) => {
    setMood(selectedMood);
    setShowMoodIntro(true);
    setSection("player");
    setTimeout(() => {
      setPlayerVisible(true);
      const audio = audioRef.current;
      if (audio) {
        audio.play();
        setIsPlaying(true);
        setPlayHint("ok, mình nghe nha 🎧");
        setTimeout(() => setPlayHint(""), 3000);
      }
    }, 100);
    // Keep mood intro visible for 8 seconds, then fade out
    setTimeout(() => setShowMoodIntro(false), 8000);
  }, []);

  const handleReplay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play();
    setIsPlaying(true);
    setCurrentLyric(-1);
    setShowLyric(false);
    setProgress(0);
    setPlayHint("");
    setEndingVisible(false);
    setSection("player");
    setTimeout(() => setPlayerVisible(true), 100);
  }, []);

  return (
    <>
      <Sparkles />
      <FloatingHearts />
      <Clouds />
      <GrainOverlay />
      <audio ref={audioRef} src="/song.mp3" preload="auto" />

      <main
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100dvh",
          padding: "24px 20px",
          fontFamily: "var(--font-body)",
        }}
      >
        {/* ===== SECTION 1: INTRO ===== */}
        {section === "intro" && (
          <div
            style={{
              textAlign: "center",
              maxWidth: 400,
              animation: introVisible
                ? "bounce-in 0.6s ease-out forwards"
                : "none",
              opacity: introVisible ? 1 : 0,
            }}
          >
            {/* Greeting card */}
            <div
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.7), rgba(255,228,225,0.4))",
                backdropFilter: "blur(12px)",
                borderRadius: 24,
                padding: "36px 28px",
                boxShadow: "0 8px 40px rgba(255, 181, 181, 0.12)",
                border: "1px solid rgba(255, 181, 181, 0.15)",
              }}
            >
              {/* BMO sticker */}
              <Image
                src="/bmo_music.jpeg"
                alt="BMO playing music"
                width={90}
                height={90}
                style={{
                  borderRadius: 18,
                  margin: "0 auto 14px",
                  display: "block",
                  boxShadow: "0 4px 16px rgba(255, 181, 181, 0.15)",
                }}
              />

              <p
                style={{
                  fontFamily: "var(--font-accent)",
                  fontSize: 20,
                  color: "var(--blush)",
                  marginBottom: 12,
                }}
              >
                Gửi cho <strong>{displayName}</strong> 💛
              </p>

              <p
                style={{
                  fontSize: 26,
                  fontFamily: "var(--font-heading)",
                  fontWeight: 600,
                  lineHeight: 1.5,
                  marginBottom: 6,
                  color: "var(--text-primary)",
                }}
              >
                Ê bạn ơi 👋
              </p>

              <p
                style={{
                  fontSize: 17,
                  lineHeight: 1.8,
                  color: "var(--text-secondary)",
                  fontWeight: 500,
                  marginBottom: 28,
                }}
              >
                mình gửi bạn một vòng nhạc nè
              </p>

              <button
                onClick={handleGoToMood}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  margin: "0 auto",
                  background:
                    "linear-gradient(135deg, var(--blush), var(--soft-pink))",
                  border: "none",
                  borderRadius: 99,
                  padding: "14px 36px",
                  fontSize: 16,
                  fontWeight: 600,
                  fontFamily: "var(--font-heading)",
                  color: "white",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 24px rgba(255, 181, 181, 0.25)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.animation =
                    "wiggle 0.4s ease-in-out";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 28px rgba(255, 181, 181, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.animation = "none";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 24px rgba(255, 181, 181, 0.25)";
                }}
              >
                <Headphones size={18} /> <span>Nghe cùng mình</span>
              </button>
            </div>

            {/* Decorative note */}
            <p
              style={{
                marginTop: 20,
                fontFamily: "var(--font-accent)",
                fontSize: 15,
                color: "var(--text-light)",
                animation: "gentle-float 3s ease-in-out infinite",
              }}
            >
              ♪ come along with me ♪
            </p>
          </div>
        )}

        {/* ===== SECTION 1.5: MOOD SELECT ===== */}
        {section === "mood" && (
          <div
            style={{
              textAlign: "center",
              maxWidth: 400,
              animation: moodVisible
                ? "fade-in-up 0.5s ease-out forwards"
                : "none",
              opacity: moodVisible ? 1 : 0,
            }}
          >
            <div
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.7), rgba(255,228,225,0.4))",
                backdropFilter: "blur(12px)",
                borderRadius: 24,
                padding: "36px 28px",
                boxShadow: "0 8px 40px rgba(255, 181, 181, 0.12)",
                border: "1px solid rgba(255, 181, 181, 0.15)",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: 20,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  marginBottom: 6,
                }}
              >
                trước khi nghe nha…
              </p>
              <p
                style={{
                  fontFamily: "var(--font-accent)",
                  fontSize: 17,
                  color: "var(--text-secondary)",
                  marginBottom: 28,
                }}
              >
                hôm nay bạn thế nào?
              </p>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {(Object.keys(MOOD_CONFIG) as Mood[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => handleMoodSelect(m)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background:
                        m === "ok"
                          ? "linear-gradient(135deg, var(--mint), #E8F5E8)"
                          : m === "tired"
                            ? "linear-gradient(135deg, var(--lavender), #F0E8F5)"
                            : "linear-gradient(135deg, var(--warm-yellow), #FFF5D6)",
                      border: "none",
                      borderRadius: 16,
                      padding: "14px 24px",
                      fontSize: 16,
                      fontWeight: 600,
                      fontFamily: "var(--font-heading)",
                      color: "var(--text-primary)",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform =
                        "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 20px rgba(0,0,0,0.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform =
                        "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 2px 12px rgba(0,0,0,0.04)";
                    }}
                  >
                    {m === "ok" ? "🌿" : m === "tired" ? "🌙" : "💛"}{" "}
                    &nbsp;{MOOD_CONFIG[m].label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== SECTION 2 & 3: PLAYER + LYRICS ===== */}
        {section === "player" && (
          <div
            style={{
              textAlign: "center",
              maxWidth: 400,
              width: "100%",
              animation: playerVisible
                ? "fade-in-up 0.5s ease-out forwards"
                : "none",
              opacity: playerVisible ? 1 : 0,
            }}
          >
            {/* Mood intro text */}
            {mood && (
              <div
                style={{
                  marginBottom: 20,
                  opacity: showMoodIntro ? 1 : 0,
                  transform: showMoodIntro ? "translateY(0)" : "translateY(-6px)",
                  transition: "opacity 1.2s ease, transform 1.2s ease",
                  pointerEvents: "none",
                }}
              >
                {MOOD_CONFIG[mood].intro.map((line, i) => (
                  <p
                    key={i}
                    style={{
                      fontFamily: "var(--font-accent)",
                      fontSize: 18,
                      color: "var(--text-secondary)",
                      lineHeight: 1.8,
                      animation: `fade-in-up 0.6s ease-out ${i * 0.4}s forwards`,
                      opacity: 0,
                    }}
                  >
                    {line}
                  </p>
                ))}
              </div>
            )}

            {/* Vinyl Disc */}
            <div
              style={{
                position: "relative",
                width: 240,
                height: 240,
                margin: "0 auto 20px",
              }}
            >
              {/* Outer glow ring */}
              <div
                style={{
                  position: "absolute",
                  inset: -8,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, var(--soft-pink), var(--sky-blue), var(--lavender))",
                  opacity: 0.25,
                  filter: "blur(14px)",
                  animation: isPlaying
                    ? "pulse-glow 4s ease-in-out infinite"
                    : "none",
                }}
              />

              {/* Disc */}
              <div
                style={{
                  width: 240,
                  height: 240,
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "3px solid rgba(255,255,255,0.5)",
                  boxShadow: "0 6px 32px rgba(93, 78, 55, 0.08)",
                  animation: `spin 14s linear infinite`,
                  animationPlayState: isPlaying ? "running" : "paused",
                  transition: "box-shadow 0.3s ease",
                  position: "relative",
                }}
              >
                <Image
                  src="/music_background.jpeg"
                  alt="Vinyl disc"
                  width={240}
                  height={240}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  priority
                />
                {/* Center hole */}
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background:
                      "radial-gradient(circle, var(--cream) 40%, var(--soft-pink) 100%)",
                    border: "2px solid rgba(255,255,255,0.7)",
                    boxShadow: "0 0 6px rgba(255,181,181,0.2)",
                  }}
                />
              </div>
            </div>

            {/* Progress bar */}
            <div
              style={{
                width: "75%",
                height: 3,
                background: "rgba(93, 78, 55, 0.08)",
                borderRadius: 99,
                margin: "0 auto 16px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  background:
                    "linear-gradient(90deg, var(--blush), var(--warm-yellow))",
                  borderRadius: 99,
                  transition: "width 0.3s linear",
                }}
              />
            </div>

            {/* Controls */}
            <div
              style={{
                display: "flex",
                gap: 14,
                justifyContent: "center",
                marginBottom: 32,
              }}
            >
              <button
                onClick={togglePlay}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  border: "none",
                  background:
                    "linear-gradient(135deg, var(--blush), var(--soft-pink))",
                  color: "white",
                  fontSize: 20,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 3px 14px rgba(255, 181, 181, 0.25)",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.06)";
                  e.currentTarget.style.boxShadow =
                    "0 5px 20px rgba(255, 181, 181, 0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow =
                    "0 3px 14px rgba(255, 181, 181, 0.25)";
                }}
                aria-label={isPlaying ? "Tạm dừng" : "Phát nhạc"}
              >
                {isPlaying ? (
                  <Pause size={20} />
                ) : (
                  <Play size={20} style={{ marginLeft: 2 }} />
                )}
              </button>

              <button
                onClick={handleReplay}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  border: "2px solid var(--blush)",
                  background: "rgba(255, 255, 255, 0.6)",
                  backdropFilter: "blur(6px)",
                  color: "var(--text-primary)",
                  fontSize: 16,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.06)";
                  e.currentTarget.style.background = "var(--soft-pink)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.background =
                    "rgba(255, 255, 255, 0.6)";
                }}
                aria-label="Nghe lại"
              >
                <RotateCcw size={16} />
              </button>
            </div>

            {/* Play micro-hint */}
            {playHint && <MicroHint text={playHint} />}

            {/* Lyrics display */}
            <div
              style={{
                minHeight: 80,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 12px",
              }}
            >
              {currentLyric >= 0 && (
                <p
                  key={currentLyric}
                  style={{
                    fontFamily: "var(--font-accent)",
                    fontSize: 24,
                    lineHeight: 1.7,
                    color: "var(--text-primary)",
                    fontWeight: 500,
                    opacity: showLyric ? 1 : 0,
                    transform: showLyric
                      ? "translateY(0)"
                      : "translateY(4px)",
                    transition:
                      "opacity 0.6s ease, transform 0.6s ease",
                  }}
                >
                  {LYRICS_TIMELINE[currentLyric].text}
                </p>
              )}
              {currentLyric < 0 && isPlaying && (
                <p
                  style={{
                    fontFamily: "var(--font-accent)",
                    fontSize: 18,
                    color: "var(--text-light)",
                    animation: "gentle-float 2.5s ease-in-out infinite",
                  }}
                >
                  ♪ ♪ ♪
                </p>
              )}
            </div>
          </div>
        )}

        {/* ===== SECTION 4: ENDING ===== */}
        {section === "ending" && (
          <div
            style={{
              textAlign: "center",
              maxWidth: 400,
              animation: endingVisible
                ? "bounce-in 0.6s ease-out forwards"
                : "none",
              opacity: endingVisible ? 1 : 0,
            }}
          >
            <div
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.7), rgba(200,240,224,0.3))",
                backdropFilter: "blur(12px)",
                borderRadius: 24,
                padding: "36px 28px",
                boxShadow: "0 8px 40px rgba(200, 240, 224, 0.15)",
                border: "1px solid rgba(200, 240, 224, 0.2)",
              }}
            >
              <p
                style={{
                  fontSize: 36,
                  marginBottom: 14,
                  animation: "gentle-float 3s ease-in-out infinite",
                }}
              >
                🌷
              </p>

              <p
                style={{
                  fontFamily: "var(--font-accent)",
                  fontSize: 19,
                  fontWeight: 500,
                  color: "var(--text-primary)",
                  lineHeight: 1.7,
                  marginBottom: 8,
                }}
              >
                cảm ơn vì đã nghe tới đây 🌷
              </p>

              <p
                style={{
                  fontSize: 15,
                  color: "var(--text-secondary)",
                  lineHeight: 1.8,
                  marginBottom: 28,
                  fontWeight: 500,
                  padding: "0 8px",
                }}
              >
                hôm qua tự nhiên mình nghĩ mai
                Valentine, cơ mà mình không có ai để đi cùng, và nghĩ ra Who with me,
                rồi nhớ ra câu along with me, và ngạc nhiên chưa, Come along
                with me? Một bài hát trong Adventure Time, bộ phim hoạt hình mình yêu thích, lâu lâu nghe nó mình cứ thấy muốn khóc á.
                "All of my collection, I share them all with you". Cảm ơn bạn đã vẫn còn ở đây lắng nghe mình và
                chia sẻ câu chuyện của bạn.
                <br />
                <br />
                49 2019 6D 20 6E 6F 74 20 73 75 72 65 20 68 6F 77 20 49 20 66 65 65 6C 2026 20 6D 61 79 62 65 20 49 20 6C 69 6B 65 20 79 6F 75 2E
              </p>

              <button
                onClick={handleReplay}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  margin: "0 auto",
                  background: "rgba(255, 255, 255, 0.6)",
                  backdropFilter: "blur(6px)",
                  border: "2px solid var(--mint)",
                  borderRadius: 99,
                  padding: "12px 28px",
                  fontSize: 15,
                  fontWeight: 600,
                  fontFamily: "var(--font-heading)",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--mint)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    "rgba(255, 255, 255, 0.6)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <RefreshCw size={16} /> <span>Nghe lại ko</span>
              </button>
            </div>

            {/* Footer note */}
            <p
              style={{
                marginTop: 20,
                fontFamily: "var(--font-accent)",
                fontSize: 14,
                color: "var(--text-light)",
              }}
            >
              made with gentle love 🌼
            </p>
          </div>
        )}
      </main>

      <Toast message={toast.message} visible={toast.visible} />
    </>
  );
}

/* ===== Page Export with Suspense ===== */
export default function Home() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100dvh",
            fontFamily: "var(--font-heading)",
            color: "var(--text-light, #9B8E8E)",
            fontSize: 18,
          }}
        >
          ♪ loading... ♪
        </div>
      }
    >
      <AppContent />
    </Suspense>
  );
}
