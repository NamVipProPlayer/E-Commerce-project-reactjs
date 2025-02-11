import styles from "./styles.module.scss";
import Srollbanner1 from "@Images/nike-just-do-it.png";
import Scrollbanner2 from "@Images/nike-just-do-it (1).png";
import { useEffect, useRef, useState } from "react";

function ScrollBanner() {
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


    const { container, imgContainer, containerContent, btn_buy } = styles;

    return (
        <div className={container}>
            <div
                className={imgContainer}
                style={{
                    transform: `translateX(${translateXPosition}px)`,
                    transition: "transform 500ms ease"
                }}
            >
                <img src={Srollbanner1} alt="Scroll Banner" />
            </div>
            <div className={containerContent}>
                <h2>Sale of the year</h2>
                <p>You can't ban greatness</p>
                <button className={btn_buy}>Shop</button>
            </div>
            <div
                className={imgContainer}
                style={{
                    transform: `translateX(-${translateXPosition}px)`,
                    transition: "transform 500ms ease"
                }}
            >
                <img src={Scrollbanner2} alt="Scroll Banner" />
            </div>
        </div>
    );
}

export default ScrollBanner;
