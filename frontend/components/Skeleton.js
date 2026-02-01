"use client";

export default function Skeleton({ width, height, borderRadius = "4px", margin = "0" }) {
    return (
        <div style={{
            width: width || "100%",
            height: height || "1rem",
            backgroundColor: "#2a2a2a",
            borderRadius: borderRadius,
            margin: margin,
            position: "relative",
            overflow: "hidden"
        }}>
            <div className="shimmer-wrapper">
                <div className="shimmer"></div>
            </div>
            <style jsx>{`
                .shimmer-wrapper {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    animation: shimmer 1.5s infinite;
                }
                .shimmer {
                    width: 50%;
                    height: 100%;
                    background: linear-gradient(
                        90deg,
                        transparent,
                        rgba(255, 255, 255, 0.05),
                        transparent
                    );
                    transform: skewX(-20deg);
                }
                @keyframes shimmer {
                    0% { transform: translateX(-150%); }
                    100% { transform: translateX(150%); }
                }
            `}</style>
        </div>
    );
}

export function CardSkeleton() {
    return (
        <div style={{ backgroundColor: '#181818', padding: '16px', borderRadius: '6px' }}>
            <Skeleton width="100%" height="auto" borderRadius="4px" margin="0 0 16px 0" />
            <div style={{ height: '180px', visibility: 'hidden' }}></div> {/* Spacer */}
            <Skeleton width="80%" height="1.2rem" margin="0 0 8px 0" />
            <Skeleton width="60%" height="1rem" />
        </div>
    );
}

export function ListSkeleton() {
    return (
        <div style={{ display: 'flex', alignItems: 'center', padding: '8px 16px' }}>
            <Skeleton width="40px" height="40px" margin="0 16px 0 0" />
            <div style={{ flex: 1 }}>
                <Skeleton width="40%" height="1.1rem" margin="0 0 4px 0" />
                <Skeleton width="20%" height="0.9rem" />
            </div>
        </div>
    );
}
