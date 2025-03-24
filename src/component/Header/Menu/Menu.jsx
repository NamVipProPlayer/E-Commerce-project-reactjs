import { useContext, useState, useEffect, useRef } from "react"; // Added useRef and useEffect
import { useNavigate } from "react-router-dom";
import styles from "../stylesHeader.module.scss";
import { AuthContext } from "@Contexts/AuthContext";
import { StorageContext } from "@Contexts/StorageProvider.jsx";
import { LogOut, User, Package } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";

function Menu({ content, href, setIsOpen, setType }) {
    const { menuhover, dropDownMenu, dropDownItem } = styles;
    const { auth, setAuth } = useContext(AuthContext);
    const { userInfo, handleLogOut } = useContext(StorageContext);
    const [isMenuDropDown, setIsMenuDropDown] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef(null); // Reference to dropdown element for click outside detection

    // Handle clicks outside the dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                !event.target.closest(`.${menuhover}`)
            ) {
                setIsMenuDropDown(false);
            }
        };

        // Add event listener if dropdown is open
        if (isMenuDropDown) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        // Cleanup
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isMenuDropDown, menuhover]);

    const handleClick = (e) => {
        e.stopPropagation(); // Prevent event bubbling

        if (content === "Sign In") {
            if (auth) {
                // Toggle dropdown when authenticated user clicks username
                setIsMenuDropDown(!isMenuDropDown);
            } else {
                // Open Sign In Sidebar when not authenticated
                setIsOpen(true);
                setType("Sign In");
            }
        } else {
            setIsOpen(true);
            setType(content);
        }
    };

    // Handle dropdown item clicks
    const handleDropdownItemClick = (action, e) => {
        e.stopPropagation(); // Prevent event bubbling

        switch (action) {
            case "signout":
                localStorage.clear();
                sessionStorage.clear();
                setAuth(null);
                navigate("/");
                window.location.reload();
                break;
            case "orders":
                navigate("/account/orders");
                break;
            case "profile":
                navigate("/account/profile");
                break;
            default:
                break;
        }
        setIsMenuDropDown(false); // Close dropdown after action
    };

    return (
        <div className={menuhover} onClick={handleClick}>
            {content === "Sign In" && auth ? userInfo?.name : content}
            {content === "Sign In" && auth && isMenuDropDown && (
                <div
                    ref={dropdownRef}
                    className={dropDownMenu}
                    onClick={(e) => e.stopPropagation()} // Prevent clicks in dropdown from closing it
                >
                    <div
                        className={dropDownItem}
                        onClick={(e) => handleDropdownItemClick("profile", e)}
                    >
                        <User size={16} /> Profile
                    </div>
                    <div
                        className={dropDownItem}
                        onClick={(e) => handleDropdownItemClick("orders", e)}
                    >
                        <Package size={16} /> Orders
                    </div>
                    <div
                        className={dropDownItem}
                        onClick={(e) => handleDropdownItemClick("signout", e)}
                    >
                        <LogOut size={16} /> Sign Out
                    </div>
                </div>
            )}
        </div>
    );
}

export default Menu;
