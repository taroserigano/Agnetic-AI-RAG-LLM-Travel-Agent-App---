"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const statusStyles = {
  PROCESSING: "badge-warning",
  PROCESSED: "badge-success",
  FAILED: "badge-error",
};

const KnowledgeVault = ({ userId, initialDocuments }) => {
  const router = useRouter();
  const [documents, setDocuments] = useState(initialDocuments);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Chat state
  const [chatQuery, setChatQuery] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [isQuerying, setIsQuerying] = useState(false);

  const refreshDocuments = useCallback(async () => {
    const response = await fetch("/api/vault/documents", { cache: "no-store" });
    const payload = await response.json();
    setDocuments(payload.documents || []);
    router.refresh();
  }, [router]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      toast.error("Please select a file to ingest.");
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      if (title) formData.append("title", title);
      if (notes) formData.append("notes", notes);

      const response = await fetch("/api/vault/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload?.detail || payload?.error || "Upload failed.");
      }

      toast.success("Document ingested successfully.");
      setFile(null);
      setTitle("");
      setNotes("");
      await refreshDocuments();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleChatSubmit = async (event) => {
    event.preventDefault();
    if (!chatQuery.trim()) {
      return;
    }

    const userMessage = { role: "user", content: chatQuery };
    setChatMessages((prev) => [...prev, userMessage]);
    setChatQuery("");
    setIsQuerying(true);

    try {
      const response = await fetch("/api/vault/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: chatQuery, top_k: 3 }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload?.detail || payload?.error || "Query failed.");
      }

      const data = await response.json();

      const assistantMessage = {
        role: "assistant",
        content: data.answer,
        citations: data.citations || [],
        chunks: data.chunks || [],
      };

      setChatMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      toast.error(error.message);
      const errorMessage = {
        role: "assistant",
        content: `Error: ${error.message}`,
      };
      setChatMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsQuerying(false);
    }
  };

  const formatDate = (date) => new Date(date).toLocaleString();
  const obfuscatedUserId = userId ? `${userId.slice(0, 6)}…` : "anonymous";

  return (
    <section className="space-y-8">
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title">Personal Knowledge Vault</h2>
          <p className="text-xs text-base-content/60">
            Securely linked to your Clerk profile (
            <span className="font-mono">{obfuscatedUserId}</span>)
          </p>
          <p className="text-sm text-base-content/70">
            Upload PDFs or text documents to enrich the agentic planner with
            private context. Files are chunked, embedded, and stored in your
            personal FAISS index.
          </p>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Document title</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                placeholder="Quarterly briefing, visa notes, ..."
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Notes (optional)</span>
              </label>
              <textarea
                className="textarea textarea-bordered"
                placeholder="Add quick context for the agent"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Select file</span>
              </label>
              <input
                type="file"
                accept=".pdf,.txt,.md,.docx"
                className="file-input file-input-bordered"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Upload to Vault"}
            </button>
          </form>
        </div>
      </div>

      {/* RAG Chat Interface */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title">Ask Questions About Your Documents</h2>
          <p className="text-sm text-base-content/70">
            Chat with your uploaded files using AI-powered search and retrieval.
          </p>

          {/* Chat messages */}
          <div className="space-y-4 my-4 max-h-96 overflow-y-auto">
            {chatMessages.length === 0 ? (
              <div className="text-center text-base-content/50 py-8">
                <p>💬 Start asking questions about your uploaded documents!</p>
                <p className="text-xs mt-2">
                  Example: "What's the best time to visit Tokyo?"
                </p>
              </div>
            ) : (
              chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`chat ${
                    msg.role === "user" ? "chat-end" : "chat-start"
                  }`}
                >
                  <div className="chat-bubble">
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-base-content/20">
                        <p className="text-xs font-semibold">Sources:</p>
                        <ul className="text-xs space-y-1 mt-1">
                          {msg.citations.map((citation, cidx) => (
                            <li key={cidx}>📄 {citation.title}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            {isQuerying && (
              <div className="chat chat-start">
                <div className="chat-bubble">
                  <span className="loading loading-dots loading-sm"></span>
                </div>
              </div>
            )}
          </div>

          {/* Chat input */}
          <form onSubmit={handleChatSubmit} className="flex gap-2">
            <input
              type="text"
              className="input input-bordered flex-1"
              placeholder="Ask about your documents..."
              value={chatQuery}
              onChange={(e) => setChatQuery(e.target.value)}
              disabled={isQuerying}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isQuerying || !chatQuery.trim()}
            >
              {isQuerying ? "Thinking..." : "Ask"}
            </button>
          </form>
        </div>
      </div>

      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title">Document history</h2>
          {documents.length === 0 ? (
            <p className="text-sm text-base-content/70">
              No documents ingested yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Chunks</th>
                    <th>Token estimate</th>
                    <th>Uploaded</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id}>
                      <td>
                        <div>
                          <p className="font-semibold">{doc.title}</p>
                          <p className="text-xs text-base-content/70">
                            {doc.filename}
                          </p>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            statusStyles[doc.status] || "badge-ghost"
                          }`}
                        >
                          {doc.status.toLowerCase()}
                        </span>
                      </td>
                      <td>{doc.chunkCount}</td>
                      <td>{doc.tokenEstimate}</td>
                      <td className="text-xs">{formatDate(doc.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default KnowledgeVault;
