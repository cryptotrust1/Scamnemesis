'use client';

import React from 'react';
import styles from './Badge.module.css';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'outline' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

// Map additional variants to existing styles
const variantMap: Record<string, string> = {
  secondary: 'default',
  outline: 'default',
  destructive: 'danger',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
  ...props
}) => {
  const mappedVariant = variantMap[variant] || variant;
  const classNames = [
    styles.badge,
    styles[mappedVariant] || styles.default,
    styles[size],
    dot ? styles.dot : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <span className={classNames} {...props}>
      {dot && <span className={styles.dotIndicator} />}
      {children}
    </span>
  );
};

export default Badge;
