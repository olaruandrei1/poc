import type { ReactNode } from 'react';
import styles from './GlassCard.module.css';

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    noPadding?: boolean;
}

export const GlassCard = ({ children, className = '', noPadding = false }: GlassCardProps) => (
    <div className={`${styles.card} ${noPadding ? styles.noPadding : ''} ${className}`}>
        {children}
    </div>
);