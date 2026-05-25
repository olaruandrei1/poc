import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { firebaseService } from '../services/firebaseService';
import { useAuthStore } from '../store/authStore';
import { ProtectedRoute } from './ProtectedRoute';
import { Navbar } from '../components/organisms/Navbar/Navbar';
import { LoginPage } from '../pages/LoginPage/LoginPage';
import { HomePage } from '../pages/HomePage/HomePage';
import { CartPage } from '../pages/CartPage/CartPage';
import { FavoritesPage } from '../pages/FavoritesPage/FavoritesPage';
import { SearchResultsPage } from '../pages/SearchResultsPage/SearchResultsPage';
import { ProductDetailPage } from '../pages/ProductDetailPage/ProductDetailPage';
import { Footer } from '../components/organisms/Footer/Footer';
import { NotificationToast } from '../components/atoms/NotificationsToast/NotificationsToast';
import { ProfilePage } from '../pages/ProfilePage/ProfilePage';
import AuctionsPage from '../pages/AuctionsPage/AuctionsPage';
import AuctionDetailPage from '../pages/AuctionDetailPage/AuctionDetailPage';

const PublicLayout = () => (
  <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
    <Navbar />
    <div style={{ flex: 1 }}>
      <Outlet />
    </div>
    <Footer />
  </div>
);

export const AppRouter = () => {
  const { setUser, setInitialized } = useAuthStore();

  useEffect(() => {
    const unsub = firebaseService.onAuthChanged((user) => {
      setUser(user);
      setInitialized(true);
    });
    return unsub;
  }, []);

  return (
    <BrowserRouter>
      <Routes>

        <Route path="/login" element={<LoginPage />} />

        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/sneakers" element={<div>Sneakers</div>} />
          <Route path="/brand/:slug" element={<div>Brand</div>} />
          <Route path="/search" element={<div>Search Results</div>} />
          <Route path="/deals/*" element={<div>Deals</div>} />
          <Route path="/new" element={<div>New</div>} />
          <Route path="/auctions" element={<AuctionsPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/terms" element={<div>Terms</div>} />
          <Route path="/about" element={<div>About</div>} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/auctions/:id" element={<AuctionDetailPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/seller" element={<div>Seller Dashboard</div>} />
            <Route path="/profile/seller-action" element={<div>Seller Action</div>} />
            <Route path="/checkout" element={<div>Checkout</div>} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <NotificationToast />

    </BrowserRouter>
  );
};