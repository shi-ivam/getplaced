import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import {
  X,
  BookOpen,
  Code2,
  Copy,
  Check,
  ExternalLink,
  Terminal,
  Play,
  Layers,
  Sparkles,
  ChevronRight,
  Maximize2,
  Minimize2,
  FileText
} from "lucide-react";
import { sheetsService } from "@/services/sheetsService";

// Helper component to render formatted tutorial markdown nicely
function MarkdownRenderer({ content }) {
  if (!content) return null;

  // Split by markdown code blocks
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-4 text-zinc-300 text-sm leading-relaxed font-sans">
      {parts.map((part, index) => {
        if (part.startsWith("```")) {
          // Extract language and code
          const firstLineEnd = part.indexOf("\n");
          const lang = part.slice(3, firstLineEnd).trim() || "code";
          const code = part.slice(firstLineEnd + 1, -3);

          return (
            <div key={index} className="my-4 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950">
              <div className="flex items-center justify-between px-4 py-1.5 bg-zinc-900/90 border-b border-zinc-800 text-xs font-mono text-zinc-400">
                <span className="uppercase text-[11px] font-semibold text-purple-400">{lang}</span>
                <CopyButton text={code} />
              </div>
              <pre className="p-4 overflow-x-auto text-xs font-mono text-emerald-300/90 leading-normal">
                <code>{code}</code>
              </pre>
            </div>
          );
        }

        // Render standard markdown paragraphs, headers, and lists
        const lines = part.split("\n");
        return (
          <div key={index} className="space-y-2">
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return <div key={lIdx} className="h-1" />;

              // Headers
              if (trimmed.startsWith("### ")) {
                return (
                  <h4 key={lIdx} className="text-base font-bold text-white mt-4 mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    {trimmed.replace("### ", "")}
                  </h4>
                );
              }
              if (trimmed.startsWith("## ")) {
                return (
                  <h3 key={lIdx} className="text-lg font-bold text-white mt-5 mb-2.5 pb-1 border-b border-zinc-800/80">
                    {trimmed.replace("## ", "")}
                  </h3>
                );
              }
              if (trimmed.startsWith("# ")) {
                return (
                  <h2 key={lIdx} className="text-xl font-extrabold text-white mt-6 mb-3">
                    {trimmed.replace("# ", "")}
                  </h2>
                );
              }

              // Bullet points
              if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                const bulletText = trimmed.replace(/^[-*]\s+/, "");
                return (
                  <div key={lIdx} className="flex items-start gap-2.5 ml-2 text-zinc-300">
                    <span className="text-purple-400 font-bold shrink-0 mt-0.5">•</span>
                    <span>{formatInlineMarkdown(bulletText)}</span>
                  </div>
                );
              }

              // Numbered points
              if (/^\d+\.\s/.test(trimmed)) {
                return (
                  <div key={lIdx} className="flex items-start gap-2.5 ml-2 text-zinc-300">
                    <span className="text-purple-400 font-mono text-xs font-bold shrink-0 mt-0.5">
                      {trimmed.match(/^\d+\./)[0]}
                    </span>
                    <span>{formatInlineMarkdown(trimmed.replace(/^\d+\.\s+/, ""))}</span>
                  </div>
                );
              }

              return <p key={lIdx} className="text-zinc-300">{formatInlineMarkdown(line)}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
}

function formatInlineMarkdown(text) {
  // Bold **text**
  const boldParts = text.split(/(\*\*.*?\*\*)/g);
  return boldParts.map((bPart, bIdx) => {
    if (bPart.startsWith("**") && bPart.endsWith("**")) {
      return (
        <strong key={bIdx} className="font-semibold text-white">
          {bPart.slice(2, -2)}
        </strong>
      );
    }

    // Inline code `code`
    const codeParts = bPart.split(/(`.*?`)/g);
    return codeParts.map((cPart, cIdx) => {
      if (cPart.startsWith("`") && cPart.endsWith("`")) {
        return (
          <code
            key={`${bIdx}-${cIdx}`}
            className="px-1.5 py-0.5 rounded bg-zinc-800/80 text-purple-300 font-mono text-xs border border-zinc-700/50"
          >
            {cPart.slice(1, -1)}
          </code>
        );
      }
      return cPart;
    });
  });
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer px-2 py-0.5 rounded bg-zinc-800/60"
    >
      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
      <span>{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}

export default function SheetArticleModal({ slugOrId, onClose, onOpenVideo }) {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSnippetLang, setActiveSnippetLang] = useState("cpp");
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (!slugOrId) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    sheetsService
      .getArticle(slugOrId)
      .then((data) => {
        if (isMounted) {
          setArticle(data);
          const snippets = data.code_snippets || {};
          const availableLangs = Object.keys(snippets);
          if (availableLangs.length > 0) {
            if (availableLangs.includes("cpp")) setActiveSnippetLang("cpp");
            else if (availableLangs.includes("python")) setActiveSnippetLang("python");
            else if (availableLangs.includes("java")) setActiveSnippetLang("java");
            else setActiveSnippetLang(availableLangs[0]);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.response?.data?.detail || "Article tutorial not found.");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [slugOrId]);

  if (!slugOrId) return null;

  const snippets = article?.code_snippets || {};
  const snippetLangs = Object.keys(snippets);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 md:p-6 select-text animate-in fade-in duration-200">
      <div
        className={`bg-[#0c0c0e] border border-zinc-800/90 rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isMaximized ? "w-full h-full max-w-none rounded-none" : "w-full max-w-5xl max-h-[92vh]"
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-950/80 shrink-0">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <div className="p-2 rounded-lg bg-zinc-900 text-zinc-300 border border-zinc-800 shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                  {article?.category || "Tutorial"}
                </span>
                <span className="text-xs text-zinc-500 font-mono">Reference Article</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white truncate tracking-tight mt-0.5">
                {article?.title || "Loading Article..."}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-2 text-zinc-400 hover:text-white rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors"
              title={isMaximized ? "Restore size" : "Maximize"}
            >
              {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3 text-center">
              <div className="w-6 h-6 rounded-full border-2 border-zinc-400 border-t-transparent animate-spin" />
              <p className="text-xs text-zinc-400 font-mono">Loading tutorial...</p>
            </div>
          ) : error ? (
            <div className="py-16 text-center space-y-3">
              <div className="p-3 w-10 h-10 mx-auto rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Tutorial Unavailable</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">{error}</p>
            </div>
          ) : (
            <>
              {/* Problem Summary & Fast Action Bar */}
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                    Summary
                  </span>
                  <p className="text-xs text-zinc-200 leading-relaxed font-sans">{article.summary}</p>
                </div>

                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  {article.related_problems?.[0]?.leetcode_slug && (
                    <Link
                      to={`/app/coding/${article.related_problems[0].leetcode_slug}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-xs font-semibold transition-all cursor-pointer"
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Solve in IDE</span>
                    </Link>
                  )}

                  {article.related_problems?.[0]?.youtube_url && onOpenVideo && (
                    <button
                      type="button"
                      onClick={() => onOpenVideo(article.related_problems[0].youtube_url, article.title)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-red-600/15 hover:bg-red-600/25 text-red-300 border border-red-500/30 text-xs font-semibold transition-all cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Video Solution</span>
                    </button>
                  )}

                  {article.original_url && (
                    <a
                      href={article.original_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/50 text-xs font-medium transition-colors"
                    >
                      <span>Web Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Multi-Language Code Snippets Viewer (if available) */}
              {snippetLangs.length > 0 && (
                <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800">
                    <div className="flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-zinc-400" />
                      <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                        Reference Implementations
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {snippetLangs.map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => setActiveSnippetLang(lang)}
                          className={`px-3 py-1 rounded-md text-xs font-mono font-semibold uppercase transition-all cursor-pointer ${
                            activeSnippetLang === lang
                              ? "bg-zinc-100 text-zinc-950"
                              : "text-zinc-400 hover:text-white bg-zinc-800/60 hover:bg-zinc-800"
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-[#09090b]">
                    {snippets[activeSnippetLang] ? (
                      <div className="space-y-3">
                        {(Array.isArray(snippets[activeSnippetLang]) ? snippets[activeSnippetLang] : [snippets[activeSnippetLang]]).map(
                          (snippetText, sIdx) => (
                            <div key={sIdx} className="rounded-lg border border-zinc-800/80 bg-black/60 overflow-hidden">
                              <div className="flex items-center justify-between px-3.5 py-1.5 bg-zinc-900/60 border-b border-zinc-800/60 text-[11px] font-mono text-zinc-400">
                                <span>{activeSnippetLang.toUpperCase()} Solution {sIdx > 0 ? `#${sIdx + 1}` : ""}</span>
                                <CopyButton text={snippetText} />
                              </div>
                              <pre className="p-4 overflow-x-auto text-xs font-mono text-emerald-300 leading-relaxed max-h-[380px] overflow-y-auto">
                                <code>{snippetText}</code>
                              </pre>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-500 italic">No snippet available for {activeSnippetLang}.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Full Formatted Markdown Article Content */}
              <div className="p-6 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-zinc-800/60 text-xs font-mono text-zinc-400">
                  <FileText className="w-4 h-4 text-zinc-400" />
                  <span className="uppercase font-bold text-white tracking-wide">Walkthrough & Analysis</span>
                </div>
                <MarkdownRenderer content={article.content_markdown} />
              </div>

              {/* Related Sheet References */}
              {article.related_problems?.length > 1 && (
                <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/60 space-y-2.5">
                  <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                    Related Problems ({article.related_problems.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {article.related_problems.map((rp, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800/80 text-xs"
                      >
                        <div className="truncate pr-2">
                          <span className="font-semibold text-zinc-200 block truncate">{rp.problem_name}</span>
                          <span className="text-[11px] text-zinc-500 font-mono truncate">{rp.sheet_title}</span>
                        </div>
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded shrink-0 ${
                            rp.difficulty?.toLowerCase() === "easy"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : rp.difficulty?.toLowerCase() === "medium"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          {rp.difficulty}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
