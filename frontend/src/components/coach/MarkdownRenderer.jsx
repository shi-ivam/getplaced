import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { useNavigate } from "react-router-dom";
import { Copy, Check, Terminal, ExternalLink, ArrowRight } from "lucide-react";
import { getActionCardMeta } from "./ActionCard";

function stripEmojis(text) {
  if (typeof text !== "string") return text;
  return text
    .replace(/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F900}-\u{1F9FF}]/gu, "")
    .replace(/^[\s🚀📚📊🎯🏢📄🎙️💬💼🎓📈⚔️✨💡🔥⚡]+/, "")
    .trim();
}

function cleanLinkChildren(children) {
  if (typeof children === "string") {
    return stripEmojis(children);
  }
  if (Array.isArray(children)) {
    return children.map((child) => (typeof child === "string" ? stripEmojis(child) : child));
  }
  return children;
}

function CodeBlock({ node, inline, className, children, ...props }) {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1].toLowerCase() : "";
  const codeString = String(children).replace(/\n$/, "");

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(codeString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn("Copy failed:", e);
    }
  };

  if (inline) {
    return (
      <code className="px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-200 font-mono text-[11px] border border-zinc-800 break-words" {...props}>
        {children}
      </code>
    );
  }

  const isExecutableLang = [
    "cpp", "c", "java", "python", "py", "javascript", "js", "typescript", "ts", "jsx", "tsx", "sql", "go", "rust", "csharp", "cs"
  ].includes(language);

  return (
    <div className="my-3 rounded-xl border border-zinc-800 bg-[#09090b] overflow-hidden max-w-full">
      <div className="px-3.5 py-1.5 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-400">
        <span className="uppercase text-[10px] font-bold tracking-wider text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
          {language || "code"}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-850 hover:text-zinc-100 transition-colors text-zinc-400 cursor-pointer font-mono border border-zinc-800"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-zinc-400" />
                <span>Copy</span>
              </>
            )}
          </button>

          {isExecutableLang && (
            <button
              type="button"
              onClick={() => navigate("/app/coding")}
              className="flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors cursor-pointer font-mono"
            >
              <Terminal className="w-3 h-3 text-zinc-400" />
              <span>Sandbox</span>
            </button>
          )}
        </div>
      </div>
      <div className="p-3.5 overflow-x-auto font-mono text-xs text-zinc-200 leading-relaxed scrollbar-thin">
        <pre className="!bg-transparent !p-0 !m-0">
          <code>{codeString}</code>
        </pre>
      </div>
    </div>
  );
}

function CustomLink({ href = "", children, ...props }) {
  const navigate = useNavigate();

  if (!href) return <span>{children}</span>;

  const isInternalApp = href.startsWith("/app") || (href.startsWith("/") && !href.startsWith("//"));
  const meta = isInternalApp ? getActionCardMeta(href) : null;
  const Icon = meta?.icon || ExternalLink;

  const handleClick = (e) => {
    if (isInternalApp) {
      e.preventDefault();
      navigate(href);
    }
  };

  const cleanedChildren = cleanLinkChildren(children);

  return (
    <a
      href={href}
      onClick={handleClick}
      target={isInternalApp ? undefined : "_blank"}
      rel={isInternalApp ? undefined : "noopener noreferrer"}
      className="inline-flex items-center gap-1.5 font-medium text-zinc-200 hover:text-white transition-colors px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-sans align-baseline cursor-pointer my-0.5"
      {...props}
    >
      <Icon className="w-3 h-3 text-zinc-400 shrink-0" />
      <span className="truncate">{cleanedChildren}</span>
      {isInternalApp ? (
        <ArrowRight className="w-3 h-3 text-zinc-500 shrink-0" />
      ) : (
        <ExternalLink className="w-3 h-3 text-zinc-500 shrink-0" />
      )}
    </a>
  );
}

export default function MarkdownRenderer({ content }) {
  if (!content) return null;

  return (
    <div className="prose prose-invert max-w-none text-zinc-200 text-xs sm:text-sm leading-relaxed space-y-2.5 font-sans [&_.katex-display]:overflow-x-auto [&_.katex-display]:py-2 [&_.katex]:text-zinc-200">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code: CodeBlock,
          a: CustomLink,
          h1: ({ node, ...props }) => (
            <h1 className="text-base sm:text-lg font-semibold text-zinc-100 tracking-tight mt-4 mb-2 pb-1.5 border-b border-zinc-800" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-sm sm:text-base font-semibold text-zinc-100 tracking-tight mt-3 mb-1.5" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xs sm:text-sm font-semibold text-zinc-200 tracking-tight mt-2.5 mb-1" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-[11px] font-semibold text-zinc-400 mt-2 mb-1 uppercase tracking-wider font-mono" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="my-1.5 leading-relaxed text-zinc-200 text-xs sm:text-sm" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="my-1.5 space-y-1 text-zinc-200 text-xs sm:text-sm list-disc list-inside marker:text-zinc-500" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="my-1.5 space-y-1 text-zinc-200 list-decimal list-inside text-xs sm:text-sm marker:text-zinc-500 font-mono" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="leading-relaxed" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="my-2.5 pl-3 py-1 border-l-2 border-zinc-700 bg-zinc-900/40 text-zinc-300 rounded-r text-xs sm:text-sm leading-relaxed" {...props} />
          ),
          table: ({ node, ...props }) => (
            <div className="my-3 overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950">
              <table className="w-full text-left text-xs font-sans border-collapse" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-zinc-900 text-zinc-200 font-mono text-[11px] uppercase tracking-wider border-b border-zinc-800" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody className="divide-y divide-zinc-800" {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="hover:bg-zinc-900/50 transition-colors" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-3.5 py-2 font-semibold text-zinc-200" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-3.5 py-2 text-zinc-300 align-top" {...props} />
          ),
          hr: ({ node, ...props }) => (
            <hr className="my-3 border-zinc-800" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

