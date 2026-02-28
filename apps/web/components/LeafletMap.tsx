'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default marker icons in Next.js
const markerIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

interface LeafletMapProps {
    lat: number;
    lng: number;
}

export default function LeafletMap({ lat, lng }: LeafletMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);

    useEffect(() => {
        if (!mapRef.current) return;

        // Create map if not already created
        if (!mapInstanceRef.current) {
            const map = L.map(mapRef.current, {
                center: [lat, lng],
                zoom: 16,
                zoomControl: true,
                attributionControl: false,
            });

            // Add dark-themed tiles
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                maxZoom: 19,
            }).addTo(map);

            // Add marker
            const marker = L.marker([lat, lng], { icon: markerIcon }).addTo(map);
            marker.bindPopup('📍 Delivery location').openPopup();

            mapInstanceRef.current = map;
            markerRef.current = marker;
        } else {
            // Update map position
            mapInstanceRef.current.setView([lat, lng], 16);
            markerRef.current?.setLatLng([lat, lng]);
        }

        return () => {
            // Cleanup on unmount only
        };
    }, [lat, lng]);

    // Cleanup map on unmount
    useEffect(() => {
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    return (
        <div
            ref={mapRef}
            style={{
                height: 200,
                borderRadius: 12,
                overflow: 'hidden',
                border: '1px solid var(--color-border, rgba(255,255,255,0.08))',
            }}
        />
    );
}
