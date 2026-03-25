// @ts-nocheck
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

/**
 * MarkdownMessage - Renders markdown content with syntax highlighting
 * @param {Object} props
 * @param {string} props.content - Markdown content to render
 * @param {boolean} [props.isUser=false] - Whether message is from user
 */
const MarkdownMessage = ({ content, isUser = false }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        // Code blocks with syntax highlighting
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <SyntaxHighlighter
              style={vscDarkPlus}
              language={match[1]}
              PreTag="div"
              customStyle={{
                borderRadius: '8px',
                fontSize: '0.875rem',
                margin: '8px 0',
              }}
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code
              className={className}
              style={{
                backgroundColor: isUser ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '0.875rem',
                fontFamily: 'monospace',
              }}
              {...props}
            >
              {children}
            </code>
          );
        },
        // Links
        a({ node, children, ...props }) {
          return (
            <a
              {...props}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: isUser ? '#fff' : '#2563eb',
                textDecoration: 'underline',
              }}
            >
              {children}
            </a>
          );
        },
        // Paragraphs
        p({ node, children, ...props }) {
          return (
            <p
              style={{
                margin: '8px 0',
                lineHeight: '1.6',
              }}
              {...props}
            >
              {children}
            </p>
          );
        },
        // Lists
        ul({ node, children, ...props }) {
          return (
            <ul
              style={{
                margin: '8px 0',
                paddingLeft: '20px',
              }}
              {...props}
            >
              {children}
            </ul>
          );
        },
        ol({ node, children, ...props }) {
          return (
            <ol
              style={{
                margin: '8px 0',
                paddingLeft: '20px',
              }}
              {...props}
            >
              {children}
            </ol>
          );
        },
        // Headings
        h1({ node, children, ...props }) {
          return (
            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                margin: '12px 0 8px',
              }}
              {...props}
            >
              {children}
            </h1>
          );
        },
        h2({ node, children, ...props }) {
          return (
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                margin: '12px 0 8px',
              }}
              {...props}
            >
              {children}
            </h2>
          );
        },
        h3({ node, children, ...props }) {
          return (
            <h3
              style={{
                fontSize: '1.125rem',
                fontWeight: 'bold',
                margin: '10px 0 6px',
              }}
              {...props}
            >
              {children}
            </h3>
          );
        },
        // Blockquotes
        blockquote({ node, children, ...props }) {
          return (
            <blockquote
              style={{
                borderLeft: `4px solid ${isUser ? 'rgba(255,255,255,0.3)' : '#e5e7eb'}`,
                paddingLeft: '12px',
                margin: '8px 0',
                fontStyle: 'italic',
                color: isUser ? 'rgba(255,255,255,0.9)' : '#6b7280',
              }}
              {...props}
            >
              {children}
            </blockquote>
          );
        },
        // Tables
        table({ node, children, ...props }) {
          return (
            <div style={{ overflowX: 'auto', margin: '8px 0' }}>
              <table
                style={{
                  borderCollapse: 'collapse',
                  width: '100%',
                  fontSize: '0.875rem',
                }}
                {...props}
              >
                {children}
              </table>
            </div>
          );
        },
        th({ node, children, ...props }) {
          return (
            <th
              style={{
                border: '1px solid #e5e7eb',
                padding: '8px',
                backgroundColor: isUser ? 'rgba(255,255,255,0.1)' : '#f9fafb',
                fontWeight: 'bold',
                textAlign: 'left',
              }}
              {...props}
            >
              {children}
            </th>
          );
        },
        td({ node, children, ...props }) {
          return (
            <td
              style={{
                border: '1px solid #e5e7eb',
                padding: '8px',
              }}
              {...props}
            >
              {children}
            </td>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownMessage;
