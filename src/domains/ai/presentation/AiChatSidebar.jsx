import React, { useState, useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "../../../core/store";
import { X, Send, Sparkles, Database, FileText } from "lucide-react";
import { ragService } from "../application/RagService";
import { vectorStore } from "../infrastructure/VectorStore";
import toast from "react-hot-toast";

export default function AiChatSidebar() {
  const {
    isAiPanelOpen,
    setAiPanelOpen,
    aiMessages,
    appendAiMessage,
    updateLastAiMessage,
    isAiGenerating,
    setAiGenerating,
    openTab,
  } = useStore(
    useShallow((s) => ({
      isAiPanelOpen: s.isAiPanelOpen,
      setAiPanelOpen: s.setAiPanelOpen,
      aiMessages: s.aiMessages,
      appendAiMessage: s.appendAiMessage,
      updateLastAiMessage: s.updateLastAiMessage,
      isAiGenerating: s.isAiGenerating,
      setAiGenerating: s.setAiGenerating,
      openTab: s.openTab,
    })),
  );

  const [input, setInput] = useState("");
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    if (isAiPanelOpen && vectorStore.vectors.length === 0) {
      vectorStore.loadVectors();
    }
  }, [isAiPanelOpen]);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiMessages]);

  if (!isAiPanelOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isAiGenerating) return;

    const userQuery = input.trim();
    setInput("");
    appendAiMessage({ role: "user", content: userQuery });
    appendAiMessage({ role: "assistant", content: "", citations: [] });
    setAiGenerating(true);

    try {
      const history = aiMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const stream = ragService.ask(userQuery, history);

      for await (const update of stream) {
        updateLastAiMessage(update.fullResponse, update.citations);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to generate AI response");
      updateLastAiMessage(`**Error:** ${err.message}`, []);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleCitationClick = (note) => {
    openTab({
      id: note.path,
      type: "note",
      name: note.name,
      vaultItem: note,
    });
  };

  return (
    <div
      style={{
        width: "350px",
        height: "100%",
        borderLeft: "1px solid var(--glass-border)",
        background: "var(--bg-secondary)",
        display: "flex",
        flexDirection: "column",
        boxShadow: "-5px 0 20px rgba(0,0,0,0.1)",
        zIndex: 50,
      }}
    >
      <div
        style={{
          padding: "16px",
          borderBottom: "1px solid var(--glass-border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Sparkles size={18} color="var(--accent)" />
          <h2 style={{ fontSize: "16px", fontWeight: "600", margin: 0 }}>
            Meditor AI
          </h2>
        </div>
        <button
          onClick={() => setAiPanelOpen(false)}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-secondary)",
            cursor: "pointer",
          }}
        >
          <X size={18} />
        </button>
      </div>

      <div
        style={{
          padding: "8px 16px",
          background: "var(--bg-primary)",
          borderBottom: "1px solid var(--glass-border)",
          fontSize: "12px",
          color: "var(--text-secondary)",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <Database size={12} />
        {vectorStore.vectors.length > 0
          ? `${vectorStore.vectors.length} chunks indexed locally`
          : "No vectors indexed yet."}
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {aiMessages.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: "var(--text-secondary)",
              marginTop: "40px",
            }}
          >
            <Sparkles
              size={32}
              style={{ opacity: 0.3, margin: "0 auto 12px" }}
            />
            <p>Ask a question about your vault.</p>
          </div>
        ) : (
          aiMessages.map((msg, i) => (
            <div
              key={i}
              style={{
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "90%",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div
                style={{
                  background:
                    msg.role === "user" ? "var(--accent)" : "var(--bg-primary)",
                  color: msg.role === "user" ? "white" : "var(--text-primary)",
                  padding: "12px",
                  borderRadius: "12px",
                  border:
                    msg.role === "assistant"
                      ? "1px solid var(--glass-border)"
                      : "none",
                  fontSize: "13px",
                  lineHeight: "1.5",
                  whiteSpace: "pre-wrap",
                }}
              >
                {msg.content ||
                  (isAiGenerating && i === aiMessages.length - 1 ? "..." : "")}
              </div>

              {msg.citations && msg.citations.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {msg.citations.map((cite, j) => (
                    <button
                      key={j}
                      onClick={() => handleCitationClick(cite)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        background: "var(--bg-primary)",
                        border: "1px solid var(--glass-border)",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "11px",
                        color: "var(--text-secondary)",
                        cursor: "pointer",
                      }}
                    >
                      <FileText size={10} />
                      {cite.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
        <div ref={endOfMessagesRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          padding: "16px",
          borderTop: "1px solid var(--glass-border)",
          background: "var(--bg-primary)",
        }}
      >
        <div style={{ position: "relative" }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your notes..."
            disabled={isAiGenerating}
            style={{
              width: "100%",
              background: "var(--bg-secondary)",
              border: "1px solid var(--glass-border)",
              borderRadius: "8px",
              padding: "10px 40px 10px 12px",
              color: "var(--text-primary)",
              resize: "none",
              height: "60px",
              fontFamily: "inherit",
              fontSize: "13px",
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isAiGenerating}
            style={{
              position: "absolute",
              right: "8px",
              bottom: "12px",
              background: "none",
              border: "none",
              color:
                input.trim() && !isAiGenerating
                  ? "var(--accent)"
                  : "var(--text-secondary)",
              cursor:
                input.trim() && !isAiGenerating ? "pointer" : "not-allowed",
              padding: "4px",
            }}
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
