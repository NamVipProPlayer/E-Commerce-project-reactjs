import { useEffect, useRef, useState } from "react";
const useTranslateX = () => {
    const [scrollDirec, setScrollDirec] = useState(null);
    const prevPositionScroll = useRef(0);
    const [translateXPosition, setTranslateXPosition] = useState(90);
    const [position, setPosition] = useState(0);

    useEffect(() => {
        const scrollTracking = () => {
            const curPosition = window.pageYOffset;
            if (curPosition > prevPositionScroll.current) {
                setScrollDirec("down");
            } else if (curPosition < prevPositionScroll.current) {
                setScrollDirec("up");
            }
            prevPositionScroll.current = curPosition <= 0 ? 0 : curPosition;
            setPosition(curPosition);
        };

        window.addEventListener("scroll", scrollTracking);
        return () => window.removeEventListener("scroll", scrollTracking);
    }, []);

    useEffect(() => {
        let ticking = false;

        const handleScrollEvent = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    if (scrollDirec === "down" && position >= 1900) {
                        setTranslateXPosition((prev) => Math.max(prev - 80, 0));
                    } else if (scrollDirec === "up") {
                        setTranslateXPosition((prev) => Math.min(prev + 5, 90));
                    }
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener("scroll", handleScrollEvent);
        return () => window.removeEventListener("scroll", handleScrollEvent);
    }, [scrollDirec, position]);

    return {
        translateXPosition,
       
    };
};
export default useTranslateX;
