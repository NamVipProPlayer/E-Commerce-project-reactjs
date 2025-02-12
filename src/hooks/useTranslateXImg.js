import { useEffect, useRef, useState } from "react";
import useScrollHandling from "@/hooks/useScrollHandling";

const useTranslateXImg = () => {
    const [translateXPosition, setTranslateXPosition] = useState(90);

    const { scrollDirec, position } = useScrollHandling();

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
        translateXPosition
    };
};

export default useTranslateXImg;
