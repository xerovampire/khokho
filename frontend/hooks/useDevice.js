"use client";
import { useState, useEffect } from "react";

export function useDevice() {
    const [device, setDevice] = useState({
        isMobile: false,
        isDesktop: false,
        isLoaded: false,
    });

    useEffect(() => {
        const handleResize = () => {
            // Logic: 
            // 1. If screen width < 1024px, it's likely mobile/tablet.
            // 2. To avoid landscape mobile switching to desktop, we check for touch support
            //    and potentially max-width in either orientation.

            const isTouch = window.matchMedia("(pointer: coarse)").matches;
            const width = window.innerWidth;
            const height = window.innerHeight;

            // If it's a touch device and width is reasonably small (even in landscape), call it mobile.
            // Typically 1024px is the cutoff for iPads.
            const isMobileSize = width < 1024;
            const isLandscapeMobile = isTouch && width > height && width < 1280; // Heuristic for landscape mobile

            const mobile = isMobileSize || isLandscapeMobile;

            setDevice({
                isMobile: mobile,
                isDesktop: !mobile,
                isLoaded: true,
            });
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return device;
}
