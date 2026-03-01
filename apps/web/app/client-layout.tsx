'use client';

import Header from '../components/Header';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import AgeGate from '../components/AgeGate';
import SmoothScroll from '../components/SmoothScroll';
import { ScrollProgress } from '../components/ScrollAnimations';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <AgeGate />
            <SmoothScroll>
                <ScrollProgress />
                <Header />
                <main style={{ minHeight: 'calc(100vh - 64px)' }}>
                    {children}
                </main>
                <Footer />
                <CartDrawer />
            </SmoothScroll>
        </>
    );
}
