"use client";

import { useEffect, useRef, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DashboardData } from "@/lib/dashboard/data";

const breathingPhases = [
  { label: "Inhale", className: "inhale", duration: 4 },
  { label: "Hold", className: "hold", duration: 4 },
  { label: "Exhale", className: "exhale", duration: 4 },
  { label: "Rest", className: "rest", duration: 4 },
];

const calmAudioUrl = "https://assets.mixkit.co/music/preview/mixkit-snowbird-quiet-ambient-256.mp3";

function getBotResponse(message: string) {
  const normalized = message.trim().toLowerCase();

  if (/sleep|rest|insomnia|tired/.test(normalized)) {
    return (
      "A consistent wind-down routine is a powerful sleep habit. Try a short meditation and calm audio before bed. " +
      "Gentle breathing can help your nervous system shift toward rest."
    );
  }

  if (/stress|anxious|anxiety|panic|overwhelmed/.test(normalized)) {
    return (
      "When stress spikes, the 4-4-4-4 breathing rhythm is a fast reset. " +
      "Follow the box breathing guide and let the music soften the edge."
    );
  }

  if (/sad|down|low|mood/.test(normalized)) {
    return (
      "It can help to name how you feel and then move into a grounding practice. " +
      "Try a short meditation, then jot down one small win in your journal."
    );
  }

  if (/meditation|meditate|calm|focus/.test(normalized)) {
    return (
      "Meditation is a gentle way to bring attention back to the present moment. " +
      "Start with just a few deep breaths and keep your focus on the rise and fall of your chest."
    );
  }

  if (/music|sound|audio|song/.test(normalized)) {
    return (
      "Soft, steady music supports relaxation. " +
      "Play the calm music player and breathe along with the rhythm for a soothing effect."
    );
  }

  if (/chat|help|support/.test(normalized)) {
    return (
      "I’m here to provide supportive suggestions, not therapy. " +
      "Ask me about breathing, meditation, calm music, or how to feel more centered right now."
    );
  }

  return (
    "I’m here to help with quick mental wellness ideas. " +
    "Ask me about breathing, meditation, calm music, journaling, or managing stress."
  );
}

export function SuggestionsInteractive({ data }: { data: DashboardData }) {
  const [chatMessages, setChatMessages] = useState([
    {
      id: "bot-1",
      sender: "bot",
      text: "Hi there — I can help you with breathing, meditation, calm music, and quick coping ideas. What would you like to try?",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [meditationActive, setMeditationActive] = useState(false);
  const [breathingActive, setBreathingActive] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phaseSeconds, setPhaseSeconds] = useState(breathingPhases[0].duration);
  const phaseRef = useRef(0);
  const intervalRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  useEffect(() => {
    if (!breathingActive) {
      setPhaseIndex(0);
      setPhaseSeconds(breathingPhases[0].duration);
      phaseRef.current = 0;
      return;
    }

    intervalRef.current = window.setInterval(() => {
      setPhaseSeconds((prev) => {
        if (prev > 1) {
          return prev - 1;
        }

        phaseRef.current = (phaseRef.current + 1) % breathingPhases.length;
        const nextPhase = breathingPhases[phaseRef.current];
        setPhaseIndex(phaseRef.current);
        return nextPhase.duration;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [breathingActive]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleCanPlay = () => {
      setAudioError(null);
      setCanPlay(true);
    };
    const handleError = () => {
      setAudioError("Unable to load calm music. Please try again later.");
      setCanPlay(false);
      setIsPlaying(false);
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("error", handleError);
    };
  }, []);

  const currentPhase = breathingPhases[phaseIndex];

  const sendChat = () => {
    const text = chatInput.trim();
    if (!text) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setIsTyping(true);

    window.setTimeout(() => {
      const botResponse = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: getBotResponse(text),
      };
      setChatMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 500);
  };

  const toggleMeditation = () => {
    setMeditationActive((prev) => !prev);
  };

  const toggleBreathing = () => {
    setBreathingActive((prev) => !prev);
  };

  const toggleMusic = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    setAudioError(null);

    if (audio.paused) {
      try {
        if (!canPlay) {
          audio.load();
        }
        audio.volume = 0.75;
        await audio.play();
      } catch (error) {
        console.error("Audio playback failed:", error);
        setAudioError("Playback was blocked. Try using the audio controls or interacting with the page first.");
      }
    } else {
      audio.pause();
    }
  };

  return (
    <div className="suggestions-interactive">
      <div className="interactive-grid">
        <Card id="mental-health-chat" className="chat-card">
          <CardHeader>
            <CardTitle>Mental Health Chat</CardTitle>
          </CardHeader>
          <CardContent className="chat-content">
            <div className="chat-window">
              {chatMessages.map((message) => (
                <div key={message.id} className={cn("chat-message", message.sender)}>
                  <p>{message.text}</p>
                </div>
              ))}
              {isTyping ? (
                <div className="chat-message bot">
                  <p>Typing...</p>
                </div>
              ) : null}
            </div>
            <div className="chat-input-row">
              <textarea
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder="Ask about breathing, meditation, or feeling calm..."
                className="chat-input"
              />
              <button className={buttonVariants({ size: "sm", className: "chat-send" })} onClick={sendChat} type="button">
                Send
              </button>
            </div>
          </CardContent>
        </Card>

        <Card id="guided-meditation" className="meditation-card">
          <CardHeader>
            <CardTitle>Guided Meditation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="meditation-visual">
              <div className={cn("meditation-wave", meditationActive && "active")}></div>
              <div className="meditation-status">
                <strong>{meditationActive ? "Relax and follow the soft pulse." : "Tap start to begin your meditation."}</strong>
                <p>
                  {meditationActive
                    ? "Breathe softly and notice your body settling."
                    : "A short meditation can help you feel calmer in minutes."}
                </p>
              </div>
            </div>
            <button
              className={buttonVariants({ variant: meditationActive ? "secondary" : "default", className: "full-width" })}
              onClick={toggleMeditation}
              type="button"
            >
              {meditationActive ? "Stop Meditation" : "Start Meditation"}
            </button>
          </CardContent>
        </Card>

        <Card id="box-breathing" className="breathing-card">
          <CardHeader>
            <CardTitle>Box Breathing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn("breathing-panel")}> 
              <div className={cn("breathing-circle", currentPhase.className)}>
                <div className="breath-inner">
                  <div className="breath-phase">{currentPhase.label}</div>
                  <div className="breath-timer">{phaseSeconds}</div>
                </div>
              </div>
              <p className="page-subtitle">Follow the 4-4-4-4 rhythm: inhale, hold, exhale, rest.</p>
              <button className={buttonVariants({ variant: breathingActive ? "secondary" : "default", className: "full-width" })} onClick={toggleBreathing} type="button">
                {breathingActive ? "Stop Breathing" : "Start Breathing"}
              </button>
            </div>
          </CardContent>
        </Card>

        <Card id="calm-music" className="music-card">
          <CardHeader>
            <CardTitle>Calm Music</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="music-player">
              <p>
                Play a gentle ambient track while you use the breathing and meditation tools.
              </p>
              <audio ref={audioRef} controls preload="metadata" loop src={calmAudioUrl} />
              <button className={buttonVariants({ variant: "secondary", className: "full-width" })} onClick={toggleMusic} type="button">
                {isPlaying ? "Pause Music" : "Play Music"}
              </button>
              {audioError ? <div className="music-error">{audioError}</div> : null}
              <div className="music-meta">Ambient track courtesy of a free relaxation sample.</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
