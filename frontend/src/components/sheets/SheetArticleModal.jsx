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

// Helper component to render formatted tutorial markdown nicely in GetPlaced design
function MarkdownRenderer({ content }) {
  if (!content) return null;

  // Split by markdown code blocks
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-4 text-[#0D0431] text-sm leading-relaxed font-sans font-medium">
      {parts.map((part, index) => {
        if (part.startsWith("```")) {
          // Extract language and code
          const firstLineEnd = part.indexOf("\n");
          const lang = part.slice(3, firstLineEnd).trim() || "code";
          const code = part.slice(firstLineEnd + 1, -3);

          return (
            <div key={index} className="my-4 rounded-2xl overflow-hidden border-2 border-[#0D0431] bg-[#0D0431] shadow-[4px_4px_0_0_#0D0431]">
              <div className="flex items-center justify-between px-4 py-2 bg-[#FEF9CF] border-b-2 border-[#0D0431] text-xs font-mono text-[#0D0431]">
                <span className="uppercase text-[11px] font-black">{lang}</span>
                <CopyButton text={code} />
              </div>
              <pre className="p-4 overflow-x-auto text-xs font-mono text-emerald-300 leading-normal">
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
                  <h4 key={lIdx} className="text-base font-heading font-black text-[#0D0431] mt-5 mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#896EE2] border border-[#0D0431]" />
                    {trimmed.replace("### ", "")}
                  </h4>
                );
              }
              if (trimmed.startsWith("## ")) {
                return (
                  <h3 key={lIdx} className="text-lg font-heading font-black text-[#0D0431] mt-6 mb-3 pb-1 border-b-2 border-[#0D0431]/15">
                    {trimmed.replace("## ", "")}
                  </h3>
                );
              }
              if (trimmed.startsWith("# ")) {
                return (
                  <h2 key={lIdx} className="text-xl font-heading font-black text-[#0D0431] mt-7 mb-4">
                    {trimmed.replace("# ", "")}
                  </h2>
                );
              }

              // Bullet points
              if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                const bulletText = trimmed.replace(/^[-*]\s+/, "");
                return (
                  <div key={lIdx} className="flex items-start gap-2.5 ml-2 text-[#0D0431]">
                    <span className="text-[#896EE2] font-mono font-bold shrink-0 mt-0.5">•</span>
                    <span>{formatInlineMarkdown(bulletText)}</span>
                  </div>
                );
              }

              // Numbered points
              if (/^\d+\.\s/.test(trimmed)) {
                return (
                  <div key={lIdx} className="flex items-start gap-2.5 ml-2 text-[#0D0431]">
                    <span className="text-[#896EE2] font-mono text-xs font-black shrink-0 mt-0.5">
                      {trimmed.match(/^\d+\./)[0]}
                    </span>
                    <span>{formatInlineMarkdown(trimmed.replace(/^\d+\.\s+/, ""))}</span>
                  </div>
                );
              }

              return <p key={lIdx} className="text-[#0D0431]">{formatInlineMarkdown(line)}</p>;
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
        <strong key={bIdx} className="font-heading font-black text-[#0D0431]">
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
            className="px-1.5 py-0.5 rounded-lg bg-[#FEF9CF] text-[#0D0431] font-mono font-bold text-xs border border-[#0D0431]"
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
      className="flex items-center gap-1 hover:bg-[#FEDF6A] text-[#0D0431] transition-colors cursor-pointer px-2.5 py-1 rounded-lg bg-white border-2 border-[#0D0431] shadow-[1px_1px_0_0_#0D0431] font-mono font-bold text-xs"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-[#0D0431]" /> : <Copy className="w-3.5 h-3.5 text-[#0D0431]" />}
      <span>{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}

export default function SheetArticleModal({ slugOrId, onClose, onOpenVideo, ...props }) {
  const identifier = slugOrId || props.articleSlug || props.slug;
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSnippetLang, setActiveSnippetLang] = useState("cpp");
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (!identifier) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    sheetsService
      .getArticle(identifier)
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
  }, [identifier]);

  if (!identifier) return null;

  const snippets = article?.code_snippets || {};
  const snippetLangs = Object.keys(snippets);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0D0431]/80 backdrop-blur-sm p-3 md:p-6 select-text animate-in fade-in duration-200">
      <div
        className={`bg-white border-2 border-[#0D0431] rounded-3xl shadow-[8px_8px_0_0_#0D0431] flex flex-col overflow-hidden transition-all duration-300 ${
          isMaximized ? "w-full h-full max-w-none rounded-none" : "w-full max-w-5xl max-h-[92vh]"
        }`}
      >
        {/* Modal Header (GetPlaced Bento Style with #FEF9CF titlebar) */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#FEF9CF] border-b-2 border-[#0D0431] shrink-0">
          <div className="flex items-center gap-3.5 min-w-0 pr-4">
            <div className="p-2 rounded-xl bg-[#E4CDFB] text-[#0D0431] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono uppercase font-bold px-2.5 py-0.5 rounded-full bg-white text-[#0D0431] border-2 border-[#0D0431] shadow-[1px_1px_0_0_#0D0431]">
                  {article?.category || "Tutorial"}
                </span>
                <span className="text-xs text-[#0D0431]/70 font-mono font-bold">Reference Article</span>
              </div>
              <h2 className="text-base sm:text-lg font-heading font-black text-[#0D0431] truncate tracking-tight mt-0.5">
                {article?.title || "Loading Article..."}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-2 text-[#0D0431] hover:bg-[#FEDF6A] rounded-full bg-white border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] transition-all cursor-pointer"
              title={isMaximized ? "Restore size" : "Maximize"}
            >
              {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-[#0D0431] hover:bg-[#F85B52] hover:text-white rounded-full bg-white border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white text-[#0D0431]">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="w-8 h-8 rounded-full border-3 border-[#0D0431] border-t-transparent animate-spin" />
              <p className="text-xs font-mono font-bold text-[#0D0431]">Loading tutorial...</p>
            </div>
          ) : error ? (
            <div className="py-16 text-center space-y-3 bg-[#FFC5B7] border-2 border-[#0D0431] rounded-3xl p-6 shadow-[4px_4px_0_0_#0D0431]">
              <div className="p-3 w-12 h-12 mx-auto rounded-2xl bg-white border-2 border-[#0D0431] text-[#0D0431] shadow-[2px_2px_0_0_#0D0431] flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-heading font-black text-[#0D0431]">Tutorial Unavailable</h3>
              <p className="text-xs text-[#0D0431]/80 max-w-sm mx-auto font-medium">{error}</p>
            </div>
          ) : (
            <>
              {/* Problem Summary & Fast Action Bar */}
              <div className="p-5 rounded-3xl bg-[#D4FDF7] border-2 border-[#0D0431] shadow-[4px_4px_0_0_#0D0431] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-mono text-[#0D0431] uppercase tracking-wider font-bold">
                    Summary
                  </span>
                  <p className="text-xs text-[#0D0431] leading-relaxed font-sans font-medium">{article.summary}</p>
                </div>

                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  {article.related_problems?.[0]?.leetcode_slug && (
                    <Link
                      to={`/app/coding/${article.related_problems[0].leetcode_slug}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FEDF6A] hover:bg-[#FFE995] text-[#0D0431] text-xs font-mono font-bold border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Solve in IDE</span>
                    </Link>
                  )}

                  {article.related_problems?.[0]?.youtube_url && onOpenVideo && (
                    <button
                      type="button"
                      onClick={() => onOpenVideo(article.related_problems[0].youtube_url, article.title)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FFC5B7] hover:bg-[#FFB09F] text-[#0D0431] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] text-xs font-mono font-bold hover:scale-105 active:scale-95 transition-all cursor-pointer"
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
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-[#FEF9CF] text-[#0D0431] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] text-xs font-mono font-bold transition-colors"
                    >
                      <span>Web Link</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Multi-Language Code Snippets Viewer (if available) */}
              {snippetLangs.length > 0 && (
                <div className="rounded-3xl border-2 border-[#0D0431] bg-[#0D0431] overflow-hidden shadow-[4px_4px_0_0_#0D0431]">
                  <div className="flex items-center justify-between px-5 py-3 bg-[#FEF9CF] border-b-2 border-[#0D0431]">
                    <div className="flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-[#0D0431]" />
                      <span className="text-xs font-heading font-black text-[#0D0431] uppercase tracking-wider">
                        Reference Implementations
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {snippetLangs.map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => setActiveSnippetLang(lang)}
                          className={`px-3 py-1 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer border-2 border-[#0D0431] ${
                            activeSnippetLang === lang
                              ? "bg-[#0D0431] text-white shadow-[1px_1px_0_0_#896EE2]"
                              : "text-[#0D0431] bg-white hover:bg-[#FEDF6A] shadow-[1px_1px_0_0_#0D0431]"
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-[#0D0431]">
                    {snippets[activeSnippetLang] ? (
                      <div className="space-y-3">
                        {(Array.isArray(snippets[activeSnippetLang]) ? snippets[activeSnippetLang] : [snippets[activeSnippetLang]]).map(
                          (snippetText, sIdx) => (
                            <div key={sIdx} className="rounded-2xl border-2 border-[#896EE2]/40 bg-black/80 overflow-hidden">
                              <div className="flex items-center justify-between px-4 py-2 bg-[#140742] border-b-2 border-[#896EE2]/40 text-xs font-mono text-purple-300">
                                <span className="font-bold">{activeSnippetLang.toUpperCase()} Solution {sIdx > 0 ? `#${sIdx + 1}` : ""}</span>
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
                      <p className="text-xs text-white/60 italic font-mono p-4">No snippet available for {activeSnippetLang}.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Full Formatted Markdown Article Content */}
              <div className="p-6 md:p-8 rounded-3xl bg-[#FEF9CF]/30 border-2 border-[#0D0431] shadow-[4px_4px_0_0_#0D0431] space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b-2 border-[#0D0431]/15 text-xs font-mono text-[#0D0431]">
                  <FileText className="w-4 h-4 text-[#0D0431]" />
                  <span className="uppercase font-heading font-black text-[#0D0431] tracking-wide">Walkthrough & Analysis</span>
                </div>
                <MarkdownRenderer content={article.content_markdown} />
              </div>

              {/* Related Sheet References */}
              {article.related_problems?.length > 1 && (
                <div className="p-5 rounded-3xl bg-[#E4CDFB]/40 border-2 border-[#0D0431] shadow-[4px_4px_0_0_#0D0431] space-y-3">
                  <h4 className="text-xs font-heading font-black text-[#0D0431] uppercase tracking-wider">
                    Related Problems ({article.related_problems.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {article.related_problems.map((rp, idx) => {
                      const diffLower = (rp.difficulty || "").toLowerCase();
                      const diffBadgeStyle =
                        diffLower === "easy"
                          ? "bg-[#D3F8C6] text-[#0D0431] border-2 border-[#0D0431]"
                          : diffLower === "medium"
                          ? "bg-[#FEDF6A] text-[#0D0431] border-2 border-[#0D0431]"
                          : "bg-[#FFC5B7] text-[#0D0431] border-2 border-[#0D0431]";

                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] text-xs"
                        >
                          <div className="truncate pr-2">
                            <span className="font-heading font-black text-[#0D0431] block truncate">{rp.problem_name}</span>
                            <span className="text-[11px] text-[#0D0431]/70 font-mono font-semibold truncate">{rp.sheet_title}</span>
                          </div>
                          <span
                            className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full shadow-[1px_1px_0_0_#0D0431] shrink-0 ${diffBadgeStyle}`}
                          >
                            {rp.difficulty}
                          </span>
                        </div>
                      );
                    })}
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
