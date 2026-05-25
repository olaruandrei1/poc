import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, MenuItem, Stepper, Step, StepLabel } from '@mui/material';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { GlassCard } from '../ProfilePage/components/sections/GlassCard';
import styles from './CheckoutPage.module.css';

const STEPS = ['Shipping', 'Payment', 'Review'];

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { items, clearCart } = useCartStore();
    const [step, setStep] = useState(0);
    const [orderPlaced, setOrderPlaced] = useState(false);

    const [shipping, setShipping] = useState({
        firstName: '', lastName: '', street: '',
        city: '', county: '', zip: '', country: 'Romania', phone: '',
    });

    const [payment, setPayment] = useState({
        cardNumber: '', expiry: '', cvv: '', cardName: '',
    });

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

                {/* Left — steps */}
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
                                    placeholder="12/28"
                                    size="small" fullWidth sx={sxField}
                                />
                                <TextField
                                    label="CVV" value={payment.cvv}
                                    onChange={(e) => setPayment((p) => ({ ...p, cvv: e.target.value.slice(0, 4) }))}
                                    placeholder="123"
                                    size="small" fullWidth sx={sxField}
                                    type="password"
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

                {/* Right — order summary */}
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
                                <span>Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className={styles.totalRow}>
                                <span>Shipping</span>
                                <span>{shipping_fee === 0 ? 'Free' : `$${shipping_fee}`}</span>
                            </div>
                            <div className={`${styles.totalRow} ${styles.totalRowFinal}`}>
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
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