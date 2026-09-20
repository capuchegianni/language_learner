import React from 'react';
import './Footer.css';

export interface FooterProps extends React.HTMLAttributes<HTMLElement> {
  author?: string;
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({
  author = 'Gianni H',
  className = '',
  ...props
}) => {
  return (
    <footer className={`app-footer ${className}`.trim()} {...props}>
      Created by {author} using Vite and React.
    </footer>
  );
};

export default Footer;
