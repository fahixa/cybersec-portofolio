import { useState, useRef } from 'react';
import { Bold, Italic, Code, Link, Image, List, ListOrdered, Quote, Eye, EyeOff } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = "Write your content here...",
  className = ""
}) => {
  const [isPreview, setIsPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const insertText = (before: string, after: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const textToInsert = selectedText || placeholder;
    
    const newText = value.substring(0, start) + before + textToInsert + after + value.substring(end);
    onChange(newText);

    // Set cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + textToInsert.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create a URL for the image (in a real app, you'd upload to a server)
    const imageUrl = URL.createObjectURL(file);
    const altText = file.name.split('.')[0];
    insertText(`![${altText}](${imageUrl})`);
    
    // Reset file input
    event.target.value = '';
  };

  const toolbarButtons = [
    {
      icon: Bold,
      title: 'Bold',
      action: () => insertText('**', '**', 'bold text')
    },
    {
      icon: Italic,
      title: 'Italic',
      action: () => insertText('*', '*', 'italic text')
    },
    {
      icon: Code,
      title: 'Inline Code',
      action: () => insertText('`', '`', 'code')
    },
    {
      icon: Link,
      title: 'Link',
      action: () => insertText('[', '](url)', 'link text')
    },
    {
      icon: Image,
      title: 'Image',
      action: () => fileInputRef.current?.click()
    },
    {
      icon: List,
      title: 'Bullet List',
      action: () => insertText('- ', '', 'list item')
    },
    {
      icon: ListOrdered,
      title: 'Numbered List',
      action: () => insertText('1. ', '', 'list item')
    },
    {
      icon: Quote,
      title: 'Quote',
      action: () => insertText('> ', '', 'quote')
    }
  ];

  const addCodeBlock = () => {
    insertText('```javascript\n', '\n```', 'your code here');
  };

  const addHeading = (level: number) => {
    const hashes = '#'.repeat(level);
    insertText(`${hashes} `, '', `Heading ${level}`);
  };

  return (
    <div className={`border border-gray-600/30 rounded-lg overflow-hidden bg-gray-900/50 ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-gray-600/30 bg-gray-800/50">
        <div className="flex items-center space-x-2">
          {/* Text formatting */}
          <div className="flex items-center space-x-1 border-r border-gray-600/30 pr-2">
            {toolbarButtons.map((button, index) => (
              <button
                key={index}
                onClick={button.action}
                title={button.title}
                className="p-2 text-gray-400 hover:text-green-400 hover:bg-gray-700/50 rounded transition-colors"
              >
                <button.icon className="h-4 w-4" />
              </button>
            ))}
          </div>

          {/* Headings */}
          <div className="flex items-center space-x-1 border-r border-gray-600/30 pr-2">
            {[1, 2, 3].map((level) => (
              <button
                key={level}
                onClick={() => addHeading(level)}
                title={`Heading ${level}`}
                className="px-2 py-1 text-xs font-bold text-gray-400 hover:text-green-400 hover:bg-gray-700/50 rounded transition-colors"
              >
                H{level}
              </button>
            ))}
          </div>

          {/* Code block */}
          <button
            onClick={addCodeBlock}
            title="Code Block"
            className="px-3 py-1 text-xs font-mono text-gray-400 hover:text-green-400 hover:bg-gray-700/50 rounded transition-colors"
          >
            {'</>'}
          </button>
        </div>

        {/* Preview toggle */}
        <button
          onClick={() => setIsPreview(!isPreview)}
          className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-400 hover:text-green-400 hover:bg-gray-700/50 rounded transition-colors"
        >
          {isPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          <span>{isPreview ? 'Edit' : 'Preview'}</span>
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Editor/Preview */}
      <div className="min-h-[400px]">
        {isPreview ? (
          <div className="p-4 prose prose-invert prose-green max-w-none">
            <ReactMarkdown
              components={{
                code({className, children, node, inline, ...props}: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  const isInlineCode = inline;
                  
                  return isInlineCode ? (
                    <code className="bg-gray-100 dark:bg-gray-800/80 px-2 py-1 rounded text-blue-600 dark:text-green-400 border border-gray-300 dark:border-gray-600/30 font-mono text-sm" {...props}>
                      {children}
                    </code>
                  ) : (
                    <SyntaxHighlighter
                      style={tomorrow as any}
                      language={match?.[1] || 'text'}
                      PreTag="div"
                      className="rounded-lg border border-gray-300 dark:border-gray-600/30 my-4 overflow-x-auto"
                      customStyle={{
                        backgroundColor: 'var(--code-bg)',
                        padding: '1rem',
                        fontSize: '0.875rem',
                        lineHeight: '1.5',
                        fontFamily: 'JetBrains Mono, Fira Code, Consolas, Monaco, monospace'
                      }}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  );
                },
                h1: ({children}) => (
                  <h1 className="text-2xl font-bold text-white mb-4 border-b border-green-500/30 pb-2">
                    {children}
                  </h1>
                ),
                h2: ({children}) => (
                  <h2 className="text-xl font-bold text-green-400 mb-3">
                    {children}
                  </h2>
                ),
                h3: ({children}) => (
                  <h3 className="text-lg font-bold text-green-300 mb-2">
                    {children}
                  </h3>
                ),
                p: ({children}) => (
                  <p className="text-gray-300 mb-3 leading-relaxed">
                    {children}
                  </p>
                ),
                ul: ({children}) => (
                  <ul className="list-disc list-inside text-gray-300 mb-3 space-y-1">
                    {children}
                  </ul>
                ),
                ol: ({children}) => (
                  <ol className="list-decimal list-inside text-gray-300 mb-3 space-y-1">
                    {children}
                  </ol>
                ),
                blockquote: ({children}) => (
                  <blockquote className="border-l-4 border-green-500/50 pl-4 italic text-gray-400 my-3 bg-gray-800/30 py-2">
                    {children}
                  </blockquote>
                ),
                a: ({href, children}) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-300 underline"
                  >
                    {children}
                  </a>
                ),
                img: ({src, alt}) => (
                  <img
                    src={src}
                    alt={alt}
                    className="max-w-full h-auto rounded-lg border border-gray-600/30 my-4"
                  />
                )
              }}
            >
              {value || '*Nothing to preview*'}
            </ReactMarkdown>
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-full min-h-[400px] p-4 bg-transparent text-gray-300 placeholder-gray-500 resize-none focus:outline-none font-mono text-sm leading-relaxed"
          />
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-gray-600/30 bg-gray-800/30 text-xs text-gray-500">
        <div>
          {value.length} characters, {value.split(/\s+/).filter(word => word.length > 0).length} words
        </div>
        <div>
          Markdown supported
        </div>
      </div>
    </div>
  );
};