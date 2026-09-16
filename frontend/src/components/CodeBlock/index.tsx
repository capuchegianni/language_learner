import React from 'react';
import { IconApprovalCheck, IconParchmentCopy } from '../icons';
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
    <div className={`card code-block-card ${className}`.trim()}>
      {(title || copyable) && (
        <div className="code-block-header">
          {title ? (
            typeof title === 'string' ? (
              <h3 className="code-block-title">{title}</h3>
            ) : (
              title
            )
          ) : (
            <div />
          )}

          {copyable && (
            <button
              type="button"
              className={`btn btn-${buttonVariant} code-block-btn`}
              onClick={() => copy(code)}
              title={copied ? copiedButtonLabel : copyButtonLabel}
              aria-label={copied ? copiedButtonLabel : copyButtonLabel}
            >
              {copied ? <IconApprovalCheck size={16} /> : <IconParchmentCopy size={16} />}
              <span>{copied ? copiedButtonLabel : copyButtonLabel}</span>
            </button>
          )}
        </div>
      )}

      {description && (
        typeof description === 'string' ? (
          <p className="code-block-desc">{description}</p>
        ) : (
          description
        )
      )}

      <pre
        className={`code-block-pre ${preClassName}`.trim()}
        style={maxHeight ? { maxHeight, overflowY: 'auto' } : undefined}
      >
        {code}
      </pre>
    </div>
  );
};

export default CodeBlock;
