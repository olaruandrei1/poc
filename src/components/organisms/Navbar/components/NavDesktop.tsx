import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNavStore } from '../../../../store/navStore';
import { useCartStore } from '../../../../store/cartStore';
import { useFavoritesStore } from '../../../../store/favoritesStore';
import { useAuthStore } from '../../../../store/authStore';
import { SearchBox } from '../../../molecules/SearchBox/SearchBox';
import { MegaMenu } from './MegaMenu';
import { NavDropdownPanel } from './NavDropdownPanel';
import { ProductChip } from '../../../atoms/ProductChip/ProductChip';
import { NotificationPanel } from '../../../molecules/NotificationPanel/NotificationPanel';
import { useNotificationStore } from '../../../../store/notificationStore';
import type { NavbarCategory } from '../../../../types/product';
import styles from './NavDesktop.module.css';

interface NavDesktopProps {
    categories: NavbarCategory[];
}

export const NavDesktop = ({ categories }: NavDesktopProps) => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const {
        favoritesOpen, setFavoritesOpen,
        cartOpen, setCartOpen,
        activeMegaMenu, setActiveMegaMenu,
    } = useNavStore();

    const { items: cartItems, fetchCart } = useCartStore();
    const { items: favItems, fetchFavorites } = useFavoritesStore();

    const { notificationsOpen, setNotificationsOpen } = useNavStore();
    const { unreadCount, fetchNotifications } = useNotificationStore();


    useEffect(() => { fetchCart(); fetchFavorites(); }, []);
    useEffect(() => { fetchCart(); fetchFavorites(); fetchNotifications(); }, []);

    const cartTotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);

    return (
        <nav className={styles.nav}>
            <div className={styles.inner}>

                <button className={styles.logo} onClick={() => navigate('/')}>
                    KickSneak
                </button>

                <div className={styles.searchWrap}>
                    <SearchBox
                        variant="desktop"
                        onProductClick={(p) => navigate(`/product/${p.id}`)}
                    />
                </div>

                <div className={styles.actions}>

                    <button
                        className={styles.sellerBtn}
                        onClick={() => navigate(user ? '/profile/seller' : '/become-seller')}
                    >
                        {user ? 'Seller Dashboard' : 'Become a Seller'}
                    </button>

                    <div
                        className={styles.iconWrap}
                        onMouseEnter={() => setFavoritesOpen(true)}
                        onMouseLeave={() => setFavoritesOpen(false)}
                    >
                        <button
                            className={`${styles.iconBtn} ${favoritesOpen ? styles.active : ''}`}
                            aria-label="Favorites"
                        >
                            <svg viewBox="0 0 24 24" fill={favoritesOpen ? 'currentColor' : 'none'}>
                                <path
                                    d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                                    stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                />
                            </svg>
                            {favItems.length > 0 && (
                                <span className={styles.badge}>{favItems.length}</span>
                            )}
                        </button>

                        {favoritesOpen && (
                            <NavDropdownPanel
                                title={`Favorites (${favItems.length})`}
                                onClose={() => setFavoritesOpen(false)}
                            >
                                {favItems.length === 0
                                    ? <p className={styles.emptyMsg}>No favorites yet</p>
                                    : favItems.map((item, i) => (
                                        <ProductChip
                                            key={item.id}
                                            item={item}
                                            index={i}
                                            onClick={(p) => {
                                                navigate(`/product/${p.id}`);
                                                setFavoritesOpen(false);
                                            }}
                                        />
                                    ))
                                }
                            </NavDropdownPanel>
                        )}
                    </div>

                    <div
                        className={styles.iconWrap}
                        onMouseEnter={() => setCartOpen(true)}
                        onMouseLeave={() => setCartOpen(false)}
                    >
                        <button
                            className={`${styles.iconBtn} ${cartOpen ? styles.active : ''}`}
                            aria-label="Cart"
                        >
                            <svg viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"
                                    stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                />
                                <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" />
                                <path d="M16 10a4 4 0 0 1-8 0" stroke="currentColor" strokeWidth="2" />
                            </svg>
                            {cartItems.length > 0 && (
                                <span className={styles.badge}>{cartItems.length}</span>
                            )}
                        </button>

                        {cartOpen && (
                            <NavDropdownPanel
                                title={`Cart (${cartItems.length})`}
                                onClose={() => setCartOpen(false)}
                            >
                                {cartItems.length === 0
                                    ? <p className={styles.emptyMsg}>Your cart is empty</p>
                                    : <>
                                        {cartItems.map((item, i) => (
                                            <ProductChip
                                                key={item.id}
                                                item={item}
                                                index={i}
                                                onClick={(p) => {
                                                    navigate(`/product/${p.id}`);
                                                    setCartOpen(false);
                                                }}
                                            />
                                        ))}
                                        <div className={styles.cartFooter}>
                                            <span className={styles.cartTotal}>
                                                Total: <strong>${cartTotal}</strong>
                                            </span>
                                            <button
                                                className={styles.checkoutBtn}
                                                onClick={() => { setCartOpen(false); navigate('/checkout'); }}
                                            >
                                                Checkout
                                            </button>
                                        </div>
                                    </>
                                }
                            </NavDropdownPanel>
                        )}
                    </div>

                    <div
                        className={styles.iconWrap}
                        onMouseEnter={() => setNotificationsOpen(true)}
                        onMouseLeave={() => setNotificationsOpen(false)}
                    >
                        <button
                            className={`${styles.iconBtn} ${notificationsOpen ? styles.active : ''}`}
                            aria-label="Notifications"
                        >
                            <svg viewBox="0 0 24 24" fill="none">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
                                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                <path d="M13.73 21a2 2 0 0 1-3.46 0"
                                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            {unreadCount > 0 && (
                                <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                            )}
                        </button>
                        {notificationsOpen && (
                            <NotificationPanel
                                variant="dropdown"
                                onClose={() => setNotificationsOpen(false)}
                            />
                        )}
                    </div>

                    <button
                        className={styles.profileBtn}
                        onClick={() => navigate(user ? '/profile' : '/login')}
                        aria-label="Profile"
                    >
                        {user?.photoURL
                            ? <img src={user.photoURL} alt="avatar" className={styles.avatar} />
                            : <svg viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                                    stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                />
                                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                            </svg>
                        }
                    </button>

                </div>
            </div>

            <div className={styles.subNav}>
                <div className={styles.subNavInner}>
                    {categories.map((cat) => (
                        <div
                            key={cat.id}
                            className={styles.catWrap}
                            onMouseEnter={() => setActiveMegaMenu(cat.id)}
                            onMouseLeave={() => setActiveMegaMenu(null)}
                        >
                            <button
                                className={`
                  ${styles.catBtn}
                  ${cat.highlight ? styles.highlight : ''}
                  ${activeMegaMenu === cat.id ? styles.catActive : ''}
                `}
                            >
                                {cat.label}
                                {activeMegaMenu === cat.id && (
                                    <span className={styles.catUnderline} />
                                )}
                            </button>
                            {activeMegaMenu === cat.id && (
                                <MegaMenu
                                    category={cat}
                                    onClose={() => setActiveMegaMenu(null)}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </nav>
    );
};