const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface ApiOptions extends RequestInit {
    token?: string;
    headers?: Record<string, string>;
}

export async function adminApi<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { token, headers: customHeaders, ...rest } = options;
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...customHeaders,
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_URL}${endpoint}`, { headers, ...rest });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Request failed');
    return data;
}
