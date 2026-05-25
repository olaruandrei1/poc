import { useState } from 'react';
import { Button, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { Save } from '@mui/icons-material';
import type { UserProfile } from '../../../../types/profile';
import { GlassCard } from './GlassCard';
import styles from './SizesSection.module.css';

interface Props {
    profile: UserProfile;
    onProfileUpdate: (p: UserProfile) => void;
}

const FOOTWEAR_EU = ['38', '38.5', '39', '40', '40.5', '41', '42', '42.5', '43', '44', '44.5', '45', '45.5', '46', '47'];
const FOOTWEAR_US = ['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '13'];
const FOOTWEAR_UK = ['5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '12'];
const TOPS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const BOTTOMS = ['28', '29', '30', '31', '32', '33', '34', '36', '38'];

export const SizesSection = ({ profile, onProfileUpdate }: Props) => {
    const [sizes, setSizes] = useState({ ...profile.sizePreferences });
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        onProfileUpdate({ ...profile, sizePreferences: sizes });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const SizeGrid = ({
        label, options, value, onChange,
    }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) => (
        <div className={styles.sizeGroup}>
            <span className={styles.sizeGroupLabel}>{label}</span>
            <div className={styles.sizeOptions}>
                {options.map((o) => (
                    <button
                        key={o}
                        className={`${styles.sizeBtn} ${value === o ? styles.sizeBtnActive : ''}`}
                        onClick={() => onChange(o)}
                    >
                        {o}
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className={styles.wrapper}>
            <div className={styles.header}>
                <h2 className={styles.title}>Size Preferences</h2>
                <Button
                    startIcon={<Save sx={{ fontSize: 16 }} />}
                    variant="contained"
                    size="small"
                    onClick={handleSave}
                    sx={{
                        background: saved ? '#22c55e' : 'var(--color-secondary)',
                        fontFamily: 'var(--font-display)',
                        fontSize: '0.78rem',
                        borderRadius: '100px',
                        transition: 'background 0.3s ease',
                        '&:hover': { background: 'var(--color-primary)' },
                    }}
                >
                    {saved ? 'Saved!' : 'Save'}
                </Button>
            </div>

            <GlassCard>
                <div className={styles.systemToggle}>
                    <span className={styles.systemLabel}>Preferred size system</span>
                    <ToggleButtonGroup
                        value={sizes.preferredSystem}
                        exclusive
                        onChange={(_, v) => v && setSizes((s) => ({ ...s, preferredSystem: v }))}
                        size="small"
                    >
                        {['EU', 'US', 'UK'].map((sys) => (
                            <ToggleButton key={sys} value={sys} sx={{
                                fontFamily: 'var(--font-display)',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                color: 'var(--color-text-muted)',
                                border: '1px solid var(--color-border) !important',
                                '&.Mui-selected': {
                                    background: 'var(--color-primary) !important',
                                    color: 'var(--color-accent) !important',
                                },
                            }}>
                                {sys}
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                </div>
            </GlassCard>

            <GlassCard>
                <h3 className={styles.sectionSubtitle}>👟 Footwear</h3>
                <SizeGrid label="EU" options={FOOTWEAR_EU} value={sizes.footwearEU}
                    onChange={(v) => setSizes((s) => ({ ...s, footwearEU: v }))} />
                <SizeGrid label="US" options={FOOTWEAR_US} value={sizes.footwearUS}
                    onChange={(v) => setSizes((s) => ({ ...s, footwearUS: v }))} />
                <SizeGrid label="UK" options={FOOTWEAR_UK} value={sizes.footwearUK}
                    onChange={(v) => setSizes((s) => ({ ...s, footwearUK: v }))} />
            </GlassCard>

            <GlassCard>
                <h3 className={styles.sectionSubtitle}>👕 Apparel</h3>
                <SizeGrid label="Tops" options={TOPS} value={sizes.tops}
                    onChange={(v) => setSizes((s) => ({ ...s, tops: v }))} />
                <SizeGrid label="Bottoms" options={BOTTOMS} value={sizes.bottoms}
                    onChange={(v) => setSizes((s) => ({ ...s, bottoms: v }))} />
            </GlassCard>
        </div>
    );
};