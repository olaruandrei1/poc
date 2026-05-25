import { useState, useRef, useEffect } from 'react';
import { Button, Chip } from '@mui/material';
import { SmartToy, SupportAgent, Send } from '@mui/icons-material';
import { GlassCard } from './GlassCard';
import type { UserProfile } from '../../../../types/profile';
import styles from './ChatSection.module.css';

interface Props {
    profile: UserProfile;
    onProfileUpdate: (p: UserProfile) => void;
}

type ChatMode = 'ai' | 'support';

interface Message {
    id: string;
    role: 'user' | 'assistant' | 'support';
    content: string;
    timestamp: Date;
}

const WELCOME_MESSAGES: Record<ChatMode, string> = {
    ai: "Hi! I'm KickSneak AI. Ask me anything about products, sizing, orders, or how the platform works.",
    support: "Hi! You're connected to KickSneak Support. A representative will join shortly. How can we help you?",
};

export const ChatSection = ({ profile }: Props) => {
    const [mode, setMode] = useState<ChatMode>('ai');
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'assistant', content: WELCOME_MESSAGES['ai'], timestamp: new Date() },
    ]);
    const [input, setInput] = useState('');
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleModeSwitch = (newMode: ChatMode) => {
        setMode(newMode);
        setMessages([
            {
                id: Date.now().toString(), role: newMode === 'ai' ? 'assistant' : 'support',
                content: WELCOME_MESSAGES[newMode], timestamp: new Date()
            },
        ]);
    };

    const handleSend = () => {
        if (!input.trim()) return;
        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input, timestamp: new Date() };
        setMessages((m) => [...m, userMsg]);
        setInput('');

        // Placeholder response — înlocuit cu Ollama/SignalR
        setTimeout(() => {
            const reply: Message = {
                id: (Date.now() + 1).toString(),
                role: mode === 'ai' ? 'assistant' : 'support',
                content: mode === 'ai'
                    ? "I'm processing your request. This will be connected to Ollama LLM."
                    : "Thank you for your message. A support agent will respond shortly.",
                timestamp: new Date(),
            };
            setMessages((m) => [...m, reply]);
        }, 1000);
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.header}>
                <h2 className={styles.title}>Support Chat</h2>
                <div className={styles.modeSwitcher}>
                    <button
                        className={`${styles.modeBtn} ${mode === 'ai' ? styles.modeBtnActive : ''}`}
                        onClick={() => handleModeSwitch('ai')}
                    >
                        <SmartToy sx={{ fontSize: 16 }} />
                        AI Assistant
                    </button>
                    <button
                        className={`${styles.modeBtn} ${mode === 'support' ? styles.modeBtnActive : ''}`}
                        onClick={() => handleModeSwitch('support')}
                    >
                        <SupportAgent sx={{ fontSize: 16 }} />
                        Live Support
                    </button>
                </div>
            </div>

            <GlassCard noPadding className={styles.chatCard}>
                {/* Status bar */}
                <div className={styles.statusBar}>
                    <span className={`${styles.statusDot} ${mode === 'support' ? styles.statusDotLive : styles.statusDotAi}`} />
                    <span className={styles.statusText}>
                        {mode === 'ai' ? 'KickSneak AI — Powered by Ollama' : 'Live Support — Avg. response: 2 min'}
                    </span>
                    {mode === 'support' && (
                        <Chip label="LIVE" size="small" sx={{
                            height: 16, fontSize: '0.55rem', fontWeight: 700,
                            background: 'rgba(34,197,94,0.15)', color: '#22c55e',
                            fontFamily: 'var(--font-display)',
                        }} />
                    )}
                </div>

                {/* Messages */}
                <div className={styles.messages}>
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`${styles.message} ${msg.role === 'user' ? styles.messageUser : styles.messageAssistant}`}
                        >
                            <div className={styles.bubble}>
                                {msg.content}
                            </div>
                            <span className={styles.time}>
                                {msg.timestamp.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    ))}
                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className={styles.inputRow}>
                    <input
                        className={styles.input}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={mode === 'ai' ? 'Ask anything...' : 'Type your message...'}
                    />
                    <button className={styles.sendBtn} onClick={handleSend} disabled={!input.trim()}>
                        <Send sx={{ fontSize: 18 }} />
                    </button>
                </div>
            </GlassCard>
        </div>
    );
};