// ============ ENUMS ============

export enum Role {
    CUSTOMER = 'CUSTOMER',
    ADMIN = 'ADMIN',
}

export enum Category {
    CIGARETTE = 'CIGARETTE',
    CONDOM = 'CONDOM',
    COMBO = 'COMBO',
    OTHER = 'OTHER',
}

export enum OrderStatus {
    PENDING = 'PENDING',
    OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
}

// ============ USER ============

export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: Role;
    isAgeVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateUserInput {
    name: string;
    email: string;
    phone: string;
    password: string;
    isAgeVerified: boolean;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}

// ============ ADDRESS ============

export interface Address {
    id: string;
    userId: string;
    label: string;
    fullAddress: string;
    lat: number;
    lng: number;
    isDefault: boolean;
}

export interface CreateAddressInput {
    label: string;
    fullAddress: string;
    lat: number;
    lng: number;
    isDefault?: boolean;
}

// ============ PRODUCT ============

export interface Product {
    id: string;
    name: string;
    brand: string;
    description: string;
    price: number;
    stock: number;
    category: Category;
    imageUrl: string;
    packSize: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateProductInput {
    name: string;
    brand: string;
    description: string;
    price: number;
    stock: number;
    category: Category;
    imageUrl: string;
    packSize: string;
}

export interface ProductFilters {
    category?: Category;
    brand?: string;
    priceMin?: number;
    priceMax?: number;
    search?: string;
    page?: number;
    limit?: number;
}

// ============ ORDER ============

export interface Order {
    id: string;
    userId: string;
    addressId: string;
    status: OrderStatus;
    totalAmount: number;
    deliveryFee: number;
    discount: number;
    deliveryNotes?: string;
    createdAt: Date;
    updatedAt: Date;
    items: OrderItem[];
    address?: Address;
    user?: User;
}

export interface OrderItem {
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    product?: Product;
}

export interface CreateOrderInput {
    addressId: string;
    deliveryNotes?: string;
    items: {
        productId: string;
        quantity: number;
    }[];
}

// ============ CART (Frontend Only) ============

export interface CartItem {
    product: Product;
    quantity: number;
}

// ============ API RESPONSE ============

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
