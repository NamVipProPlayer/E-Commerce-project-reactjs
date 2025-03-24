import { createContext, useState } from "react";

export const SideBarContext = createContext();

export const SideBarProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [type, setType] = useState("");
    return (
        <SideBarContext.Provider value={{ isOpen, setIsOpen, type, setType }}>
            {children}
        </SideBarContext.Provider>
    );
};
