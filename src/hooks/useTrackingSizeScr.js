import { useEffect, useState } from "react";

const useTrackingSizeScr = ()=>{
    const [isMenuOpen, setIsMenuOpen] = useState(false);
        const [isScreenSmall, setIsScreenSmall] = useState(
            window.innerWidth <= 828
        );
    
        const handleMenuToggle = () => {
            setIsMenuOpen((prevState) => !prevState);
        };
    
        // Detect screen size changes and update state
        useEffect(() => {
            const handleResize = () => {
                setIsScreenSmall(window.innerWidth <= 828);
                if (window.innerWidth > 828) {
                    setIsMenuOpen(false); // Close menu on large screens
                }
            };
    
            window.addEventListener("resize", handleResize);
            return () => {
                window.removeEventListener("resize", handleResize);
            };
        }, []);

        return {
            isMenuOpen,
            isScreenSmall,
            handleMenuToggle
        };
}
export default useTrackingSizeScr;