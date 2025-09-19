'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { cn } from '@/lib/utils';

interface MarkdownMessageProps {
  content: string;
  isUser?: boolean;
  className?: string;
}

export function MarkdownMessage({ content, isUser = false, className }: MarkdownMessageProps) {
  return (
    <div className={cn("markdown-content", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // Headings
          h1: ({ children }) => (
            <h1 className={cn(
              "text-2xl font-bold mb-3 mt-2",
              isUser ? "text-primary-foreground" : "text-foreground"
            )}>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className={cn(
              "text-xl font-semibold mb-2 mt-2",
              isUser ? "text-primary-foreground" : "text-foreground"
            )}>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className={cn(
              "text-lg font-medium mb-2 mt-1",
              isUser ? "text-primary-foreground" : "text-foreground"
            )}>
              {children}
            </h3>
          ),

          // Paragraphs
          p: ({ children }) => (
            <p className={cn(
              "mb-2 last:mb-0 leading-relaxed",
              isUser ? "text-primary-foreground" : "text-foreground"
            )}>
              {children}
            </p>
          ),

          // Lists
          ul: ({ children }) => (
            <ul className={cn(
              "list-disc list-inside mb-2 space-y-1",
              isUser ? "text-primary-foreground" : "text-foreground"
            )}>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className={cn(
              "list-decimal list-inside mb-2 space-y-1",
              isUser ? "text-primary-foreground" : "text-foreground"
            )}>
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className={cn(
              "mb-1",
              isUser ? "text-primary-foreground" : "text-foreground"
            )}>
              {children}
            </li>
          ),

          // Text formatting
          strong: ({ children }) => (
            <strong className={cn(
              "font-semibold",
              isUser ? "text-primary-foreground" : "text-foreground"
            )}>
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className={cn(
              "italic",
              isUser ? "text-primary-foreground" : "text-foreground"
            )}>
              {children}
            </em>
          ),

          // Code
          code: ({ children, className: codeClassName }) => {
            const isInline = !codeClassName;
            return isInline ? (
              <code className={cn(
                "px-1.5 py-0.5 rounded text-sm font-mono",
                isUser
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}>
                {children}
              </code>
            ) : (
              <code className={cn(
                "block p-3 rounded-md text-sm font-mono overflow-x-auto",
                isUser
                  ? "bg-primary-foreground/10 text-primary-foreground"
                  : "bg-muted text-muted-foreground",
                codeClassName
              )}>
                {children}
              </code>
            );
          },

          // Code blocks
          pre: ({ children }) => (
            <pre className={cn(
              "mb-3 rounded-md overflow-x-auto",
              isUser
                ? "bg-primary-foreground/10"
                : "bg-muted"
            )}>
              {children}
            </pre>
          ),

          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className={cn(
              "border-l-4 pl-4 my-3 italic",
              isUser
                ? "border-primary-foreground/30 text-primary-foreground/90"
                : "border-border text-muted-foreground"
            )}>
              {children}
            </blockquote>
          ),

          // Links
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "underline underline-offset-2 hover:underline-offset-4 transition-all",
                isUser
                  ? "text-primary-foreground hover:text-primary-foreground/80"
                  : "text-primary hover:text-primary/80"
              )}
            >
              {children}
            </a>
          ),

          // Tables (GitHub Flavored Markdown)
          table: ({ children }) => (
            <div className="overflow-x-auto mb-3">
              <table className={cn(
                "min-w-full border-collapse",
                isUser ? "border-primary-foreground/20" : "border-border"
              )}>
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className={cn(
              "border px-3 py-2 text-left font-medium",
              isUser
                ? "border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground"
                : "border-border bg-muted text-foreground"
            )}>
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className={cn(
              "border px-3 py-2",
              isUser
                ? "border-primary-foreground/20 text-primary-foreground"
                : "border-border text-foreground"
            )}>
              {children}
            </td>
          ),

          // Horizontal rule
          hr: () => (
            <hr className={cn(
              "my-4 border-t",
              isUser ? "border-primary-foreground/20" : "border-border"
            )} />
          ),

          // Task lists (GitHub Flavored Markdown)
          input: ({ type, checked, disabled }) => {
            if (type === 'checkbox') {
              return (
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  readOnly
                  className={cn(
                    "mr-2 accent-primary",
                    isUser ? "accent-primary-foreground" : "accent-primary"
                  )}
                />
              );
            }
            return null;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}