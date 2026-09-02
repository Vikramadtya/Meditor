import { openNoteFromVault } from "../../store/actions/index";
import React, { useState, useEffect } from "react";
import { useStore } from "../../core/store/index";
import { Star, FileText } from "lucide-react";
import { noteService } from "../../application/vault/NoteService";

/**
 * FavoritesDashboard Component
 *
 * Displays a dashboard of all notes marked as favorites, allowing quick access.
 *
 * @returns {JSX.Element} The rendered FavoritesDashboard component.
 */
export default function FavoritesDashboard() {
  const [favorites, setFavorites] = useState([]);
  useEffect(() => {
    setFavorites(noteService.getFavoriteNotes());
  }, []);
  return (
    <div
      style={{
        padding: "40px 60px",
        height: "100%",
        overflowY: "auto",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        <header
          style={{
            marginBottom: "32px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <Star size={32} color="#f59e0b" fill="#f59e0b" />
          <h1
            style={{
              margin: 0,
              fontSize: "28px",
              fontWeight: "700",
              color: "var(--text-primary)",
            }}
          >
            Favorites
          </h1>
        </header>

        {favorites.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 0",
              color: "var(--text-secondary)",
            }}
          >
            <Star
              size={48}
              style={{
                opacity: 0.2,
                marginBottom: "16px",
              }}
            />
            <p>No favorites yet.</p>
            <p
              style={{
                fontSize: "13px",
                opacity: 0.7,
              }}
            >
              Star notes to see them here.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gap: "16px",
            }}
          >
            {favorites.map((note) => (
              <div
                key={note.id}
                onClick={() => openNoteFromVault(note)}
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--glass-border)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = "var(--glass-border)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      padding: "8px",
                      background: "var(--bg-primary)",
                      borderRadius: "8px",
                      color: "var(--accent)",
                    }}
                  >
                    <FileText size={16} />
                  </div>
                  <div>
                    <h3
                      style={{
                        margin: "0 0 4px 0",
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "var(--text-primary)",
                      }}
                    >
                      {note.name}
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "12px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      Bookmarked Note
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
