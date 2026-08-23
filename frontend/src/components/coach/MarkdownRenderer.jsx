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

function CodeBlock({ node, inline, className, children, onNavigate, ...props }) {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1].toLowerCase() : "";
  const codeString = String(children).replace(/\n$/, "");

  // In react-markdown v9+, inline is undefined on code elements. Check for language or newlines.
  const isInline = inline !== undefined ? inline : (!match && !String(children).includes("\n"));

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(codeString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn("Copy failed:", e);
    }
  };

  if (isInline) {
    return (
      <code className="px-1.5 py-0.5 rounded-md bg-[#FEF9CF] text-[#0D0431] font-mono text-[11px] font-bold border border-[#0D0431]/40 break-words" {...props}>
        {children}
      </code>
    );
  }

  const isExecutableLang = [
    "cpp", "c", "java", "python", "py", "javascript", "js", "typescript", "ts", "jsx", "tsx", "sql", "go", "rust", "csharp", "cs"
  ].includes(language);

  return (
    <div className="my-2.5 rounded-xl border border-[#17103D] bg-[#17103D] text-white overflow-hidden max-w-full shadow-sm">
      <div className="px-3 py-1.5 bg-[#24195A] border-b border-white/10 flex items-center justify-between text-xs font-mono text-white/80">
        <span className="uppercase text-[10px] font-bold tracking-wider text-[#FFD84D] bg-white/10 px-2 py-0.5 rounded">
          {language || "code"}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer font-mono"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-[#FFD84D]" />
                <span className="text-[#FFD84D]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-white/70" />
                <span>Copy</span>
              </>
            )}
          </button>

          {isExecutableLang && (
            <button
              type="button"
              onClick={() => {
                onNavigate?.();
                navigate("/app/coding");
              }}
              className="flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer font-mono"
            >
              <Terminal className="w-3 h-3 text-[#FFD84D]" />
              <span>IDE</span>
            </button>
          )}
        </div>
      </div>
      <div className="p-3 overflow-x-auto font-mono text-xs text-white leading-relaxed">
        <pre className="!bg-transparent !p-0 !m-0">
          <code>{codeString}</code>
        </pre>
      </div>
    </div>
  );
}

function CustomLink({ href = "", children, onNavigate, ...props }) {
  const navigate = useNavigate();

  if (!href) return <span>{children}</span>;

  const isInternalApp = href.startsWith("/app") || (href.startsWith("/") && !href.startsWith("//"));
  const meta = isInternalApp ? getActionCardMeta(href) : null;
  const Icon = meta?.icon || ExternalLink;

  const handleClick = (e) => {
    if (isInternalApp) {
      e.preventDefault();
      onNavigate?.();
      navigate(href);
    } else {
      onNavigate?.();
    }
  };

  const cleanedChildren = cleanLinkChildren(children);

  return (
    <a
      href={href}
      onClick={handleClick}
      target={isInternalApp ? undefined : "_blank"}
      rel={isInternalApp ? undefined : "noopener noreferrer"}
      className="inline-flex items-center gap-1.5 font-semibold text-[#6E44FF] hover:underline px-2 py-0.5 rounded bg-[#EFEAFF] border border-[#E2DEEC] text-xs font-sans align-baseline cursor-pointer my-0.5"
      {...props}
    >
      <Icon className="w-3 h-3 text-[#6E44FF] shrink-0" />
      <span className="truncate">{cleanedChildren}</span>
      {isInternalApp ? (
        <ArrowRight className="w-3 h-3 text-[#6E44FF] shrink-0" />
      ) : (
        <ExternalLink className="w-3 h-3 text-[#6E44FF] shrink-0" />
      )}
    </a>
  );
}

export default function MarkdownRenderer({ content, onNavigate }) {
  if (!content) return null;

  return (
    <div className="max-w-none text-[#17103D] text-xs leading-relaxed space-y-2 font-sans [&_.katex-display]:overflow-x-auto [&_.katex-display]:py-1.5 [&_.katex]:text-[#17103D]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code: (props) => <CodeBlock {...props} onNavigate={onNavigate} />,
          a: (props) => <CustomLink {...props} onNavigate={onNavigate} />,
          h1: ({ node, ...props }) => (
            <h1 className="text-sm font-bold text-[#17103D] tracking-tight mt-3 mb-1.5 pb-1 border-b border-[#E2DEEC]" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-xs font-bold text-[#17103D] tracking-tight mt-2.5 mb-1" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xs font-bold text-[#17103D] tracking-tight mt-2 mb-0.5" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="my-1 leading-relaxed text-[#17103D] text-xs font-medium" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="my-1 space-y-1 text-[#17103D] text-xs list-disc list-inside marker:text-[#6E44FF]" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="my-1 space-y-1 text-[#17103D] list-decimal list-inside text-xs marker:text-[#6E44FF] font-mono" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="leading-relaxed font-medium" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="my-2 pl-3 py-1 border-l-2 border-[#6E44FF] bg-[#F2F0FA] text-[#17103D] rounded-r text-xs leading-relaxed font-medium" {...props} />
          ),
          table: ({ node, ...props }) => (
            <div className="my-2 overflow-x-auto rounded-xl border border-[#E2DEEC] bg-white">
              <table className="w-full text-left text-xs font-sans border-collapse" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-[#F8F8F5] text-[#17103D] font-bold text-[11px] uppercase tracking-wider border-b border-[#E2DEEC]" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody className="divide-y divide-[#E2DEEC]" {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="hover:bg-[#F8F8F5] transition-colors" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-3 py-1.5 font-bold text-[#17103D]" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-3 py-1.5 text-[#17103D] font-medium align-top" {...props} />
          ),
          hr: ({ node, ...props }) => (
            <hr className="my-2 border-[#E2DEEC]" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
