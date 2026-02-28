/**
 * Format price in BDT (Bangladeshi Taka)
 */
export function formatPrice(amount: number): string {
    return `৳${amount.toFixed(2)}`;
}

/**
 * Calculate delivery fee (flat rate for MVP)
 */
export function getDeliveryFee(): number {
    return 50;
}

/**
 * Calculate order total
 */
export function calculateOrderTotal(
    items: { unitPrice: number; quantity: number }[],
    deliveryFee: number = 50,
    discount: number = 0
): number {
    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    return subtotal + deliveryFee - discount;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
}

/**
 * Generate a slug from text
 */
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
    return new Intl.DateTimeFormat('en-BD', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(date));
}

/**
 * Validate Bangladesh phone number
 */
export function isValidBDPhone(phone: string): boolean {
    return /^(\+?880|0)?1[3-9]\d{8}$/.test(phone.replace(/\s/g, ''));
}

/**
 * Get status color for order status badges
 */
export function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        PENDING: '#f59e0b',
        OUT_FOR_DELIVERY: '#3b82f6',
        DELIVERED: '#10b981',
        CANCELLED: '#ef4444',
    };
    return colors[status] || '#6b7280';
}
