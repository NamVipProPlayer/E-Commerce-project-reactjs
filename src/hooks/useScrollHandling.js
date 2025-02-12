import { useEffect, useRef, useState } from "react";

const useScrollHandling = () => {
    const [scrollDirec, setScrollDirec] = useState(null);
    const prevPositionScroll = useRef(0);

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

    return {
        scrollDirec,
        position
    };
};
export default useScrollHandling;
