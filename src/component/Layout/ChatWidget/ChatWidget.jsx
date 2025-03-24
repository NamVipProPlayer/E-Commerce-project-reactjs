import { useState, useEffect } from "react";
import { MessageSquare, X, MinusCircle } from "lucide-react";
import ChatInterface from "@component/ChatInterface/ChatInterface";
import styles from "./ChatWidget.module.scss";

const ChatWidget = () => {
    const [chatOpen, setChatOpen] = useState(false);
    const [minimized, setMinimized] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [messages, setMessages] = useState([]);

    // Load initial messages - removing the initial load logic as ChatInterface will handle it
    useEffect(() => {
        // Initialize with empty array, ChatInterface will handle the loading
        setMessages([]);
    }, []);

    // For demo purposes - simulate receiving a new message when chat is closed
    useEffect(() => {
        if (!chatOpen) {
            const timer = setTimeout(() => {
                setUnreadCount((prev) => prev + 1);
            }, 30000); // Add unread message every 30 seconds when closed
            return () => clearTimeout(timer);
        }
    }, [chatOpen]);

    // Reset unread count when opening chat
    useEffect(() => {
        if (chatOpen) {
            setUnreadCount(0);
        }
    }, [chatOpen]);

    const toggleChat = () => {
        setChatOpen(!chatOpen);
        // Removed the clearChatHistory call that was causing history to be cleared
        if (minimized) setMinimized(false);
    };

    const toggleMinimize = (e) => {
        e.stopPropagation();
        setMinimized(!minimized);
    };

    return (
        <div className={`${styles.chatWidget} ${chatOpen ? styles.open : ""}`}>
            {chatOpen ? (
                <div
                    className={`${styles.chatContainer} ${
                        minimized ? styles.minimized : ""
                    }`}
                >
                    <div className={styles.chatHeader}>
                        <div className={styles.headerInfo}>
                            <div className={styles.statusIndicator}></div>
                            <h3 className={styles.headerTitle}>
                                Customer Support
                            </h3>
                        </div>
                        <div className={styles.headerControls}>
                            <button
                                className={styles.controlButton}
                                onClick={toggleMinimize}
                                aria-label={
                                    minimized ? "Expand chat" : "Minimize chat"
                                }
                            >
                                <MinusCircle size={18} />
                            </button>
                            <button
                                className={styles.controlButton}
                                onClick={toggleChat}
                                aria-label="Close chat"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {!minimized && (
                        <div className={styles.chatBody}>
                            <ChatInterface
                                messages={messages}
                                setMessages={setMessages}
                            />
                        </div>
                    )}
                </div>
            ) : (
                <button
                    className={styles.chatButton}
                    onClick={toggleChat}
                    aria-label="Open chat"
                >
                    <MessageSquare size={24} className={styles.chatIcon} />
                    <span className={styles.chatText}>Chat with NMN</span>

                    {unreadCount > 0 && (
                        <span className={styles.unreadBadge}>
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </button>
            )}
        </div>
    );
};

export default ChatWidget;
