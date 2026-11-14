import { useState, useEffect } from 'react';

/**
 * Section 4.1 Dashboard Number Counter Hook
 * Smoothly animates number from 0 to target
 */
export const useCountUp = (target = 0, duration = 1400, decimals = 0) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        // Agar user ne prefers-reduced-motion rakha hai toh animation skip karo
        const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (rm) {
            setCount(target);
            return;
        }

        let startTime = null;
        let animationFrameId = null;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);

            // Ease-out cubic formula: 1 - Math.pow(1 - progress, 3)
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const current = target * easeProgress;

            setCount(current);

            if (progress < 1) {
                animationFrameId = requestAnimationFrame(animate);
            } else {
                setCount(target);
            }
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [target, duration]);

    return decimals > 0
        ? count.toFixed(decimals)
        : Math.round(count).toLocaleString();
};