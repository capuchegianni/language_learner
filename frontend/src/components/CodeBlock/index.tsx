import React from 'react';
import { Copy, Check } from 'lucide-react';
import { useClipboard } from '../../hooks/useClipboard';
import './CodeBlock.css';

export interface CodeBlockProps {
  code: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  copyable?: boolean;
  copyButtonLabel?: string;
  copiedButtonLabel?: string;
  buttonVariant?: 'primary' | 'secondary';
  maxHeight?: string | number;
  className?: string;
  preClassName?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  title,
  description,
  copyable = true,
  copyButtonLabel = 'Copy',
  copiedButtonLabel = 'Copied!',
  buttonVariant = 'secondary',
  maxHeight,
  className = '',
  preClassName = '',
}) => {
  const { copied, copy } = useClipboard();

  return (
    <div className={`glass-card app-code-block-card ${className}`}>
      {(title || copyable) && (
        <div className="app-code-block-header">
          {title ? (
            typeof title === 'string' ? (
              <h3 className="app-code-block-title">{title}</h3>
            ) : (
              title
            )
          ) : (
            <div />
          )}

          {copyable && (
            <button
              type="button"
              className={`btn btn-${buttonVariant} app-code-block-btn`}
              onClick={() => copy(code)}
              title={copied ? copiedButtonLabel : copyButtonLabel}
              aria-label={copied ? copiedButtonLabel : copyButtonLabel}
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
              <span>{copied ? copiedButtonLabel : copyButtonLabel}</span>
            </button>
          )}
        </div>
      )}

      {description && (
        typeof description === 'string' ? (
          <p className="app-code-block-desc">{description}</p>
        ) : (
          description
        )
      )}

      <pre
        className={`code-block app-code-block-pre ${preClassName}`}
        style={maxHeight ? { maxHeight, overflowY: 'auto' } : undefined}
      >
        {code}
      </pre>
    </div>
  );
};
