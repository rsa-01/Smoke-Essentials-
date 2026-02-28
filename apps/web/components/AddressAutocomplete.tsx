'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface AddressSuggestion {
    display_name: string;
    lat: string;
    lon: string;
    place_id: number;
}

interface AddressAutocompleteProps {
    value: string;
    onSelect: (address: { fullAddress: string; lat: number; lng: number }) => void;
    placeholder?: string;
}

export default function AddressAutocomplete({ value, onSelect, placeholder }: AddressAutocompleteProps) {
    const [query, setQuery] = useState(value);
    const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Sync external value
    useEffect(() => {
        setQuery(value);
    }, [value]);

    // Close suggestions on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const searchAddress = useCallback(async (text: string) => {
        if (text.length < 3) {
            setSuggestions([]);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&countrycodes=bd&limit=5&addressdetails=1`,
                {
                    headers: {
                        'Accept-Language': 'en',
                    },
                }
            );
            const data = await res.json();
            setSuggestions(data);
            setShowSuggestions(data.length > 0);
        } catch {
            setSuggestions([]);
        }
        setLoading(false);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value;
        setQuery(text);

        // Debounce search by 400ms
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            searchAddress(text);
        }, 400);
    };

    const handleSelect = (suggestion: AddressSuggestion) => {
        const lat = parseFloat(suggestion.lat);
        const lng = parseFloat(suggestion.lon);
        setQuery(suggestion.display_name);
        setSelectedCoords({ lat, lng });
        setShowSuggestions(false);
        onSelect({ fullAddress: suggestion.display_name, lat, lng });
    };

    return (
        <div ref={containerRef} style={{ position: 'relative' }}>
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    placeholder={placeholder || 'Start typing your address...'}
                    style={{
                        width: '100%',
                        padding: '14px 44px 14px 16px',
                        borderRadius: 12,
                        border: '1px solid var(--color-border)',
                        background: 'var(--color-bg)',
                        color: 'var(--color-text)',
                        fontSize: 14,
                        outline: 'none',
                        transition: 'border-color 0.2s',
                    }}
                    id="address-autocomplete-input"
                />
                {/* Search / Loading icon */}
                <div style={{
                    position: 'absolute',
                    right: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    opacity: 0.5,
                    fontSize: 16,
                }}>
                    {loading ? (
                        <span style={{
                            display: 'inline-block',
                            animation: 'spin 1s linear infinite',
                        }}>⟳</span>
                    ) : '🔍'}
                </div>
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 100,
                    marginTop: 4,
                    borderRadius: 12,
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-bg-card, #1a1a2e)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                    overflow: 'hidden',
                    maxHeight: 280,
                    overflowY: 'auto',
                }}>
                    {suggestions.map((s) => (
                        <button
                            key={s.place_id}
                            onClick={() => handleSelect(s)}
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                border: 'none',
                                borderBottom: '1px solid rgba(255,255,255,0.04)',
                                background: 'transparent',
                                color: 'var(--color-text, #eee)',
                                cursor: 'pointer',
                                textAlign: 'left',
                                fontSize: 13,
                                lineHeight: 1.5,
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 10,
                                transition: 'background 0.15s',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,107,53,0.08)')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                            <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>📍</span>
                            <span style={{ wordBreak: 'break-word' }}>{s.display_name}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Map Preview (shown after address selection) */}
            {selectedCoords && (
                <div style={{ marginTop: 12 }}>
                    <MapPreview lat={selectedCoords.lat} lng={selectedCoords.lng} />
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════
// Leaflet Map Preview (dynamic import)
// ═══════════════════════════════════

function MapPreview({ lat, lng }: { lat: number; lng: number }) {
    const [MapComponent, setMapComponent] = useState<React.ComponentType<{ lat: number; lng: number }> | null>(null);

    useEffect(() => {
        // Dynamically import leaflet components to avoid SSR issues
        import('./LeafletMap').then((mod) => {
            setMapComponent(() => mod.default);
        });
    }, []);

    if (!MapComponent) {
        return (
            <div style={{
                height: 200,
                borderRadius: 12,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--mist, #888)',
                fontSize: 13,
            }}>
                Loading map...
            </div>
        );
    }

    return <MapComponent lat={lat} lng={lng} />;
}
