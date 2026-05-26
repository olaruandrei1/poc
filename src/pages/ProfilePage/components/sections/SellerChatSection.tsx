import { useState, useRef, useEffect } from 'react';
import { Chip } from '@mui/material';
import { Send, Store } from '@mui/icons-material';
import { GlassCard } from './GlassCard';
import type { UserProfile } from '../../../../types/profile';
import styles from './SellerChatSection.module.css';

interface Props {
    profile: UserProfile;
    onProfileUpdate: (p: UserProfile) => void;
}

interface Message {
    id: string; role: 'seller' | 'support'; content: string; timestamp: Date;
}

export const SellerChatSection = ({ profile }: Props) => {
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'support', content: "Welcome to KickSneak Seller Support. How can we assist you today?", timestamp: new Date() },
    ]);
    const [input, setInput] = useState('');
    const messagesRef = useRef<HTMLDivElement>(null);
    const isFirstMount = useRef(true);

    useEffect(() => {
        if (isFirstMount.current) {
            isFirstMount.current = false;
            return;
        }
        if (messagesRef.current) {
            messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;
        setMessages((m) => [...m, { id: Date.now().toString(), role: 'seller', content: input, timestamp: new Date() }]);
        setInput('');
        setTimeout(() => {
            setMessages((m) => [...m, {
                id: (Date.now() + 1).toString(), role: 'support',
                content: "Thank you for reaching out. A seller specialist will review your query shortly.",
                timestamp: new Date(),
            }]);
        }, 1200);
    };

     return (
        <div className={styles.wrapper}>
            <div className={styles.header}>
                <h2 className={styles.title}>Seller Support</h2>
                <Chip
                    icon={<Store sx={{ fontSize: 14 }} />}
                    label={profile.seller?.storeName ?? 'Seller'}
                    size="small"
                    sx={{
                        background: 'rgba(64,138,113,0.12)',
                        color: 'var(--color-accent)',
                        fontFamily: 'var(--font-display)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        border: '1px solid rgba(64,138,113,0.2)',
                    }}
                />
            </div>

            <GlassCard noPadding className={styles.chatCard}>
                <div className={styles.statusBar}>
                    <span className={styles.statusDot} />
                    <span className={styles.statusText}>Seller Support Team — Avg. response: 5 min</span>
                </div>

                <div className={styles.messages} ref={messagesRef}>
                    {messages.map((msg) => (
                        <div key={msg.id} className={`${styles.message} ${msg.role === 'seller' ? styles.messageSeller : styles.messageSupport}`}>
                            <div className={styles.bubble}>{msg.content}</div>
                            <span className={styles.time}>
                                {msg.timestamp.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    ))}
                </div>

                <div className={styles.inputRow}>
                    <input
                        className={styles.input}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Message seller support..."
                    />
                    <button className={styles.sendBtn} onClick={handleSend} disabled={!input.trim()}>
                        <Send sx={{ fontSize: 18 }} />
                    </button>
                </div>
            </GlassCard>
        </div>
    );
};