import ChatInterface from "@component/ChatInterface/ChatInterface";
import Footer from "@component/Footer/Footer";
import Header from "@component/Header/Header";
import ChatWidget from "@component/Layout/ChatWidget/ChatWidget";
import styles from "@Layout/stylesLayout.module.scss";
import { useState } from "react";
function Layout({ children }) {
    const { wrapLayout, container } = styles;
    const [chatOpen, setChatOpen] = useState(false);
    return (
        <>
            <Header />
            <main className={wrapLayout}>
                <div className={container}>{children}</div>
            </main>
            <ChatWidget/>
            <Footer />
        </>
    );
}

export default Layout;
