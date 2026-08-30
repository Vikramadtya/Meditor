import React, { useState, useEffect, useCallback } from "react";
import {
  BrainCircuit,
  CheckCircle,
  RotateCcw,
  ArrowRight,
  Trophy,
} from "lucide-react";
import { useStore } from "../../store/index";
import { vaultRepository } from "../../infrastructure/SqliteVaultRepository";
import { srsService } from "../../services/srsService";
import { vaultService } from "../../application/vault/VaultService";
import "../../styles/FlashcardReview.css";

export default function FlashcardReviewPage() {
  const { openNoteFromVault } = useStore();
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    reviewed: 0,
    hard: 0,
    good: 0,
    easy: 0,
  });
  const [done, setDone] = useState(false);
  const [mode, setMode] = useState("due"); // 'due' or 'all'

  const loadCards = useCallback(() => {
    const loaded =
      mode === "due"
        ? vaultRepository.getAgendaNotes() // SRS-due cards
        : vaultRepository._queryAll(
            "SELECT id, name, flashcard_question, flashcard_answer, srs_ease, srs_interval, srs_next_review FROM notes WHERE is_deleted=0 AND flashcard_question!='' AND flashcard_question IS NOT NULL ORDER BY name ASC",
          );
    setCards(loaded);
    setCurrentIndex(0);
    setIsFlipped(false);
    setDone(false);
    setSessionStats({ reviewed: 0, hard: 0, good: 0, easy: 0 });
  }, [mode]);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        setIsFlipped((f) => !f);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleRate = async (quality) => {
    const card = cards[currentIndex];
    const { ease, interval, nextReview } = srsService.calculateNextReview(
      quality,
      card.srs_ease ?? 2.5,
      card.srs_interval ?? 0,
    );
    vaultRepository.updateNoteSRS(card.id, ease, interval, nextReview);
    await vaultService.save();

    setSessionStats((s) => ({
      reviewed: s.reviewed + 1,
      hard: quality === 3 ? s.hard + 1 : s.hard,
      good: quality === 4 ? s.good + 1 : s.good,
      easy: quality === 5 ? s.easy + 1 : s.easy,
    }));

    if (currentIndex + 1 >= cards.length) {
      setDone(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setIsFlipped(false);
    }
  };

  const card = cards[currentIndex];
  const progress = cards.length > 0 ? (currentIndex / cards.length) * 100 : 0;

  // Empty state
  if (cards.length === 0 && !done) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          gap: "16px",
          color: "var(--text-secondary)",
        }}
      >
        <BrainCircuit size={64} style={{ opacity: 0.15 }} />
        <h2 style={{ fontWeight: 700 }}>No flashcards due!</h2>
        <p>
          You're all caught up. Come back later or switch to "All Cards" mode.
        </p>
        <button
          onClick={() => setMode("all")}
          style={{
            padding: "10px 24px",
            background: "var(--accent)",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Review All Cards
        </button>
      </div>
    );
  }

  // Completion screen
  if (done) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          gap: "24px",
        }}
      >
        <Trophy size={64} color="#f59e0b" />
        <h1 style={{ fontSize: "32px", fontWeight: 800, margin: 0 }}>
          Session Complete!
        </h1>
        <div style={{ display: "flex", gap: "24px" }}>
          <StatBadge
            label="Reviewed"
            value={sessionStats.reviewed}
            color="#6366f1"
          />
          <StatBadge label="Hard" value={sessionStats.hard} color="#ef4444" />
          <StatBadge label="Good" value={sessionStats.good} color="#3b82f6" />
          <StatBadge label="Easy" value={sessionStats.easy} color="#10b981" />
        </div>
        <button
          onClick={loadCards}
          style={{
            padding: "12px 32px",
            background: "var(--accent)",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: "15px",
          }}
        >
          Review Again
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px 24px",
        height: "100%",
        overflowY: "auto",
      }}
      className="page-container"
    >
      {/* Header */}
      <div style={{ width: "100%", maxWidth: "700px", marginBottom: "32px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <BrainCircuit size={22} color="var(--accent)" />
            <span style={{ fontWeight: 700 }}>Flashcard Review</span>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {["due", "all"].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  padding: "4px 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--glass-border)",
                  background: mode === m ? "var(--accent)" : "transparent",
                  color: mode === m ? "#fff" : "var(--text-secondary)",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: 600,
                  textTransform: "capitalize",
                }}
              >
                {m === "due" ? "Due Today" : "All Cards"}
              </button>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div
          style={{
            height: "4px",
            background: "var(--bg-secondary)",
            borderRadius: "2px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: "var(--accent)",
              transition: "width 0.3s ease",
              borderRadius: "2px",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "6px",
            fontSize: "12px",
            color: "var(--text-secondary)",
          }}
        >
          <span>
            {currentIndex + 1} of {cards.length}
          </span>
          <span>{card?.name}</span>
        </div>
      </div>

      {/* Card */}
      <div className="flashcard-scene" onClick={() => setIsFlipped((f) => !f)}>
        <div className={`flashcard-card ${isFlipped ? "flipped" : ""}`}>
          {/* Front */}
          <div className="flashcard-face flashcard-front">
            <div className="flashcard-label">QUESTION</div>
            <p className="flashcard-content">{card?.flashcard_question}</p>
            <div className="flashcard-hint">
              Click or press Space to reveal answer
            </div>
          </div>
          {/* Back */}
          <div className="flashcard-face flashcard-back">
            <div className="flashcard-label" style={{ color: "#10b981" }}>
              ANSWER
            </div>
            <p className="flashcard-content">{card?.flashcard_answer}</p>
          </div>
        </div>
      </div>

      {/* Rating Buttons — only shown when card is flipped */}
      {isFlipped && (
        <div style={{ display: "flex", gap: "12px", marginTop: "32px" }}>
          <RateBtn
            label="Again"
            emoji="❌"
            quality={0}
            onClick={handleRate}
            color="#ef4444"
          />
          <RateBtn
            label="Hard"
            emoji="🔁"
            quality={3}
            onClick={handleRate}
            color="#f59e0b"
          />
          <RateBtn
            label="Good"
            emoji="✅"
            quality={4}
            onClick={handleRate}
            color="#3b82f6"
          />
          <RateBtn
            label="Easy"
            emoji="⭐"
            quality={5}
            onClick={handleRate}
            color="#10b981"
          />
        </div>
      )}
    </div>
  );
}

function RateBtn({ label, emoji, quality, onClick, color }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick(quality);
      }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
        padding: "12px 24px",
        background: `${color}18`,
        border: `1.5px solid ${color}44`,
        borderRadius: "12px",
        cursor: "pointer",
        transition: "all 0.15s",
        color,
        fontWeight: 700,
        fontSize: "14px",
        minWidth: "90px",
      }}
    >
      <span style={{ fontSize: "20px" }}>{emoji}</span>
      {label}
    </button>
  );
}

function StatBadge({ label, value, color }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "20px 28px",
        background: `${color}18`,
        borderRadius: "12px",
        border: `1px solid ${color}33`,
      }}
    >
      <div style={{ fontSize: "32px", fontWeight: 800, color }}>{value}</div>
      <div
        style={{
          fontSize: "13px",
          color: "var(--text-secondary)",
          fontWeight: 600,
        }}
      >
        {label}
      </div>
    </div>
  );
}
