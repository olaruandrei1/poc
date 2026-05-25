export interface Address {
    id: string;
    label: string;
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    county: string;
    zip: string;
    country: string;
    phone: string;
    isDefault: boolean;
}

export interface SizePreferences {
    footwearEU: string;
    footwearUS: string;
    footwearUK: string;
    tops: string;
    bottoms: string;
    preferredSystem: string;
}

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL: string;
    isSeller: boolean;
    joinedAt: string;
    totalSpent: number;
    totalOrders: number;
    addresses: Address[];
    contact: {
        phone: string;
        alternateEmail: string;
    };
    sizePreferences: SizePreferences;
    seller?: {
        storeName: string;
        joinedAt: string;
        totalSales: number;
        rating: number;
        verified: boolean;
    };
}

export interface Order {
    id: string;
    date: string;
    status: 'pending' | 'shipped' | 'delivered' | 'returned' | 'cancelled';
    total: number;
    items: {
        name: string;
        brand: string;
        size: string;
        price: number;
        image: string;
    }[];
    tracking: string;
    address: string;
}

export type ProfileSection =
    | 'overview'
    | 'orders'
    | 'addresses'
    | 'sizes'
    | 'returns'
    | 'chat'
    | 'settings'
    | 'seller-listings'
    | 'seller-sales'
    | 'seller-returns'
    | 'seller-chat';