const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const MOCK_BASE = '/mocks';
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

const base = USE_MOCKS ? MOCK_BASE : API_BASE;

export const ApiRoutes = {
  profile: `${base}/profile.json`,

  navbarCategories: `${base}/navbar-categories.json`,
  footerData: `${base}/footer.json`,

  productsNew: `${base}/products-new.json`,
  productsTrending: `${base}/products-trending.json`,
  productsRecommended: `${base}/products-recommended.json`,
  productsRecentlyViewed: `${base}/products-recently-viewed.json`,
  searchResultsPaged: `${base}/search-results-paged.json`,

  searchProducts: (query: string) =>
    USE_MOCKS
      ? `${MOCK_BASE}/search-results.json`
      : `${API_BASE}/products/search?q=${encodeURIComponent(query)}`,

  productDetail: (id: string) =>
    USE_MOCKS
      ? `${MOCK_BASE}/product-detail.json`
      : `${API_BASE}/products/${id}`,

  policies: `${base}/policies.json`,
  favorites: `${base}/favorites.json`,
  cart: `${base}/cart.json`,
  notifications: `${base}/notifications.json`,
  orders: `${base}/orders.json`,
  sellerListings: `${base}/seller-listings.json`,
  sellerSales: `${base}/seller-sales.json`,

  auctionsList: `${base}/auctions-list.json`,

  auctionDetail: (id: string) =>
    USE_MOCKS
      ? `${MOCK_BASE}/auction-detail.json`
      : `${API_BASE}/auctions/${id}`,

  auctionBids: (id: string) =>
    USE_MOCKS
      ? `${MOCK_BASE}/auction-bids.json`
      : `${API_BASE}/auctions/${id}/bids`,

  placeBid: (id: string) =>
    USE_MOCKS
      ? `${MOCK_BASE}/auction-bids.json` 
      : `${API_BASE}/auctions/${id}/bids`,

  auctionMyBids: `${base}/auction-my-bids.json`,
  auctionMyWon: `${base}/auction-my-won.json`,

  setAutoBid: (id: string) =>
    USE_MOCKS
      ? `${MOCK_BASE}/auction-auto-bid.json`
      : `${API_BASE}/auctions/${id}/auto-bid`,

  cancelAutoBid: (id: string) =>
    USE_MOCKS
      ? `${MOCK_BASE}/auction-auto-bid.json`
      : `${API_BASE}/auctions/${id}/auto-bid/cancel`,

  watchAuction: (id: string) =>
    USE_MOCKS
      ? `${MOCK_BASE}/auction-watch.json`
      : `${API_BASE}/auctions/${id}/watch`,

  unwatchAuction: (id: string) =>
    USE_MOCKS
      ? `${MOCK_BASE}/auction-watch.json`
      : `${API_BASE}/auctions/${id}/unwatch`,

  auctionNotificationSettings: `${base}/auction-notification-settings.json`,

  sellerAuctions: `${base}/seller-auctions.json`,

  createAuction: USE_MOCKS
    ? `${MOCK_BASE}/auction-create-response.json`
    : `${API_BASE}/auctions/seller/create`,

  cancelAuction: (id: string) =>
    USE_MOCKS
      ? `${MOCK_BASE}/auction-cancel-response.json`
      : `${API_BASE}/auctions/seller/${id}/cancel`,

  checkoutSession: USE_MOCKS
    ? `${MOCK_BASE}/checkout-session.json`
    : `${API_BASE}/checkout/session`,

  checkoutAddresses: `${base}/checkout-addresses.json`,

  stripePaymentIntent: USE_MOCKS
    ? `${MOCK_BASE}/stripe-payment-intent.json`
    : `${API_BASE}/checkout/stripe/payment-intent`,

  orderConfirmation: (orderId: string) =>
    USE_MOCKS
      ? `${MOCK_BASE}/order-confirmation.json`
      : `${API_BASE}/orders/${orderId}/confirmation`,
} as const;