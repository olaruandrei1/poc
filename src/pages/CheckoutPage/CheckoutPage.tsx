import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, MenuItem, Stepper, Step, StepLabel, Radio } from '@mui/material';
import { Home, Business, Add } from '@mui/icons-material';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { httpClient } from '../../services/axiosService';
import { ApiRoutes } from '../../services/apiRoutes';
import { GlassCard } from '../ProfilePage/components/sections/GlassCard';
import type { UserProfile, Address } from '../../types/profile';
import styles from './CheckoutPage.module.css';

const STEPS = ['Shipping', 'Payment', 'Review'];

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { items, clearCart } = useCartStore();
    const [step, setStep] = useState(0);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [useNewAddress, setUseNewAddress] = useState(false);

    const [shipping, setShipping] = useState({
        firstName: '', lastName: '', street: '',
        city: '', county: '', zip: '', country: 'Romania', phone: '',
    });

    const [payment, setPayment] = useState({
        cardNumber: '', expiry: '', cvv: '', cardName: '',
    });

    useEffect(() => {
        httpClient.get<UserProfile>(ApiRoutes.profile)
            .then((r) => {
                const addresses = r.data.addresses ?? [];
                setSavedAddresses(addresses);
                const def = addresses.find((a) => a.isDefault) ?? addresses[0];
                if (def) {
                    setSelectedAddressId(def.id);
                    setShipping({
                        firstName: def.firstName,
                        lastName: def.lastName,
                        street: def.street,
                        city: def.city,
                        county: def.county,
                        zip: def.zip,
                        country: def.country,
                        phone: def.phone,
                    });
                } else {
                    setUseNewAddress(true);
                }
            })
            .catch(() => setUseNewAddress(true));
    }, []);

    const handleSelectAddress = (addr: Address) => {
        setSelectedAddressId(addr.id);
        setUseNewAddress(false);
        setShipping({
            firstName: addr.firstName,
            lastName: addr.lastName,
            street: addr.street,
            city: addr.city,
            county: addr.county,
            zip: addr.zip,
            country: addr.country,
            phone: addr.phone,
        });
    };

    const subtotal = items.reduce((s, i) => s + i.price * (i.quantity ?? 1), 0);
    const shipping_fee = subtotal > 200 ? 0 : 12;
    const total = subtotal + shipping_fee;

    const handlePlaceOrder = () => {
        setOrderPlaced(true);
        clearCart?.();
    };

    if (orderPlaced) {
        return (
            <div className={styles.successPage}>
                <div className={styles.successCard}>
                    <span className={styles.successIcon}>✓</span>
                    <h2 className={styles.successTitle}>Order Placed!</h2>
                    <p className={styles.successMsg}>
                        Thank you{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}!
                        Your order is being processed. You'll receive a confirmation email shortly.
                    </p>
                    <button className={styles.continueBtn} onClick={() => navigate('/')}>
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.inner}>
                <div className={styles.formCol}>
                    <h1 className={styles.title}>Checkout</h1>

                    <Stepper activeStep={step} sx={{ mb: 3 }}>
                        {STEPS.map((label) => (
                            <Step key={label}>
                                <StepLabel sx={{
                                    '& .MuiStepLabel-label': { fontFamily: 'var(--font-display)', fontSize: '0.8rem', color: 'var(--color-text-muted)' },
                                    '& .MuiStepLabel-label.Mui-active': { color: 'var(--color-accent)' },
                                    '& .MuiStepLabel-label.Mui-completed': { color: 'var(--color-accent)' },
                                    '& .MuiStepIcon-root': { color: 'var(--color-border)' },
                                    '& .MuiStepIcon-root.Mui-active': { color: 'var(--color-secondary)' },
                                    '& .MuiStepIcon-root.Mui-completed': { color: 'var(--color-accent)' },
                                }}>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    {/* Step 0 — Shipping */}
                    {step === 0 && (
                        <GlassCard>
                            <h3 className={styles.stepTitle}>Shipping Address</h3>

                            {/* Adrese salvate */}
                            {savedAddresses.length > 0 && (
                                <div className={styles.savedAddresses}>
                                    {savedAddresses.map((addr) => (
                                        <div
                                            key={addr.id}
                                            className={`${styles.addrOption} ${selectedAddressId === addr.id && !useNewAddress ? styles.addrOptionSelected : ''}`}
                                            onClick={() => handleSelectAddress(addr)}
                                        >
                                            <Radio
                                                checked={selectedAddressId === addr.id && !useNewAddress}
                                                size="small"
                                                sx={{ color: 'var(--color-border)', '&.Mui-checked': { color: 'var(--color-secondary)' }, p: 0, mr: 1 }}
                                            />
                                            {addr.label === 'Home'
                                                ? <Home sx={{ fontSize: 16, color: 'var(--color-accent)', mr: 0.5 }} />
                                                : <Business sx={{ fontSize: 16, color: 'var(--color-accent)', mr: 0.5 }} />
                                            }
                                            <div className={styles.addrOptionInfo}>
                                                <span className={styles.addrOptionLabel}>{addr.label} — {addr.firstName} {addr.lastName}</span>
                                                <span className={styles.addrOptionText}>{addr.street}, {addr.city} {addr.zip}</span>
                                            </div>
                                            {addr.isDefault && (
                                                <span className={styles.defaultBadge}>Default</span>
                                            )}
                                        </div>
                                    ))}

                                    {/* New address option */}
                                    <div
                                        className={`${styles.addrOption} ${useNewAddress ? styles.addrOptionSelected : ''}`}
                                        onClick={() => { setUseNewAddress(true); setSelectedAddressId(null); }}
                                    >
                                        <Radio
                                            checked={useNewAddress}
                                            size="small"
                                            sx={{ color: 'var(--color-border)', '&.Mui-checked': { color: 'var(--color-secondary)' }, p: 0, mr: 1 }}
                                        />
                                        <Add sx={{ fontSize: 16, color: 'var(--color-text-muted)', mr: 0.5 }} />
                                        <span className={styles.addrOptionLabel}>Use a different address</span>
                                    </div>
                                </div>
                            )}

                            {/* Form nou address */}
                            {(useNewAddress || savedAddresses.length === 0) && (
                                <div className={styles.formGrid}>
                                    {[
                                        { key: 'firstName', label: 'First Name' },
                                        { key: 'lastName', label: 'Last Name' },
                                        { key: 'street', label: 'Street Address', full: true },
                                        { key: 'city', label: 'City' },
                                        { key: 'county', label: 'County' },
                                        { key: 'zip', label: 'ZIP Code' },
                                        { key: 'phone', label: 'Phone' },
                                    ].map(({ key, label, full }) => (
                                        <TextField
                                            key={key}
                                            label={label}
                                            value={(shipping as any)[key]}
                                            onChange={(e) => setShipping((s) => ({ ...s, [key]: e.target.value }))}
                                            size="small"
                                            fullWidth
                                            sx={{ ...(full ? { gridColumn: '1 / -1' } : {}), ...sxField }}
                                        />
                                    ))}
                                    <TextField
                                        select label="Country" value={shipping.country}
                                        onChange={(e) => setShipping((s) => ({ ...s, country: e.target.value }))}
                                        size="small" fullWidth sx={sxField}
                                    >
                                        {['Romania', 'Germany', 'France', 'Netherlands', 'Spain', 'Italy', 'UK'].map((c) => (
                                            <MenuItem key={c} value={c}>{c}</MenuItem>
                                        ))}
                                    </TextField>
                                </div>
                            )}

                            <button className={styles.nextBtn} onClick={() => setStep(1)}>
                                Continue to Payment →
                            </button>
                        </GlassCard>
                    )}

                    {/* Step 1 — Payment */}
                    {step === 1 && (
                        <GlassCard>
                            <h3 className={styles.stepTitle}>Payment Details</h3>
                            <div className={styles.stripeNote}>
                                🔒 Payments powered by Stripe
                            </div>
                            <div className={styles.formGrid}>
                                <TextField
                                    label="Card Number" value={payment.cardNumber}
                                    onChange={(e) => setPayment((p) => ({ ...p, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16) }))}
                                    placeholder="4242 4242 4242 4242"
                                    size="small" fullWidth sx={{ gridColumn: '1 / -1', ...sxField }}
                                />
                                <TextField
                                    label="Cardholder Name" value={payment.cardName}
                                    onChange={(e) => setPayment((p) => ({ ...p, cardName: e.target.value }))}
                                    size="small" fullWidth sx={{ gridColumn: '1 / -1', ...sxField }}
                                />
                                <TextField
                                    label="Expiry (MM/YY)" value={payment.expiry}
                                    onChange={(e) => setPayment((p) => ({ ...p, expiry: e.target.value }))}
                                    placeholder="12/28" size="small" fullWidth sx={sxField}
                                />
                                <TextField
                                    label="CVV" value={payment.cvv}
                                    onChange={(e) => setPayment((p) => ({ ...p, cvv: e.target.value.slice(0, 4) }))}
                                    placeholder="123" size="small" fullWidth sx={sxField} type="password"
                                />
                            </div>
                            <div className={styles.btnRow}>
                                <button className={styles.backBtn} onClick={() => setStep(0)}>← Back</button>
                                <button className={styles.nextBtn} onClick={() => setStep(2)}>Review Order →</button>
                            </div>
                        </GlassCard>
                    )}

                    {/* Step 2 — Review */}
                    {step === 2 && (
                        <GlassCard>
                            <h3 className={styles.stepTitle}>Review & Place Order</h3>
                            <div className={styles.reviewSection}>
                                <span className={styles.reviewLabel}>Shipping to</span>
                                <p className={styles.reviewText}>
                                    {shipping.firstName} {shipping.lastName}<br />
                                    {shipping.street}, {shipping.city} {shipping.zip}<br />
                                    {shipping.country} · {shipping.phone}
                                </p>
                            </div>
                            <div className={styles.reviewSection}>
                                <span className={styles.reviewLabel}>Payment</span>
                                <p className={styles.reviewText}>
                                    Card ending in {payment.cardNumber.slice(-4) || '****'}
                                </p>
                            </div>
                            <div className={styles.btnRow}>
                                <button className={styles.backBtn} onClick={() => setStep(1)}>← Back</button>
                                <button className={styles.placeBtn} onClick={handlePlaceOrder}>
                                    Place Order · ${total.toFixed(2)}
                                </button>
                            </div>
                        </GlassCard>
                    )}
                </div>

                {/* Order summary */}
                <div className={styles.summaryCol}>
                    <GlassCard>
                        <h3 className={styles.stepTitle}>Order Summary</h3>
                        <div className={styles.itemsList}>
                            {items.length === 0 ? (
                                <p className={styles.emptyCart}>Your cart is empty.</p>
                            ) : items.map((item, i) => (
                                <div key={i} className={styles.itemRow}>
                                    <img src={item.image} alt={item.name} className={styles.itemImg} />
                                    <div className={styles.itemInfo}>
                                        <span className={styles.itemName}>{item.name}</span>
                                        <span className={styles.itemMeta}>Size: {item.size} · Qty: {item.quantity ?? 1}</span>
                                    </div>
                                    <span className={styles.itemPrice}>${item.price}</span>
                                </div>
                            ))}
                        </div>
                        <div className={styles.totals}>
                            <div className={styles.totalRow}>
                                <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className={styles.totalRow}>
                                <span>Shipping</span><span>{shipping_fee === 0 ? 'Free' : `$${shipping_fee}`}</span>
                            </div>
                            <div className={`${styles.totalRow} ${styles.totalRowFinal}`}>
                                <span>Total</span><span>${total.toFixed(2)}</span>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};

const sxField = {
    '& .MuiOutlinedInput-root': {
        borderRadius: '10px', background: 'var(--color-surface)', color: 'var(--color-text)',
        '& fieldset': { borderColor: 'var(--color-border)' },
        '&:hover fieldset': { borderColor: 'var(--color-secondary)' },
        '&.Mui-focused fieldset': { borderColor: 'var(--color-accent)' },
    },
    '& .MuiInputLabel-root': { color: 'var(--color-text-muted)', fontSize: '0.85rem' },
    '& .MuiInputLabel-root.Mui-focused': { color: 'var(--color-accent)' },
    '& input': { color: 'var(--color-text)', fontSize: '0.85rem' },
};

export default CheckoutPage;