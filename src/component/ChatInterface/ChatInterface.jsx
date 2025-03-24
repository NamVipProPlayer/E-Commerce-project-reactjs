import React, { useState, useRef, useEffect, useContext } from "react";
import { chatService } from "@apis/chatbotService.js";
import DOMPurify from "dompurify";
import styles from "./ChatInterface.module.scss";
import bot_Icon from "@Images/botImg.jpg";
import { StorageContext } from "@Contexts/StorageProvider";

// Maximum number of messages to store in history
const MAX_HISTORY_LENGTH = 50;

const ChatInterface = ({ messages, setMessages }) => {
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const messageContainerRef = useRef(null);
    const { userInfo } = useContext(StorageContext);
    const [hasLoadedMessages, setHasLoadedMessages] = useState(false);

    // Check if user is authenticated based on token in storage
    const isAuthenticated = () => {
        return !!(
            localStorage.getItem("authToken") ||
            sessionStorage.getItem("authToken")
        );
    };

    // Configure DOMPurify for safe HTML rendering
    useEffect(() => {
        DOMPurify.addHook("afterSanitizeAttributes", function (node) {
            // Add target="_blank" and rel="noopener noreferrer" to all links
            if ("target" in node) {
                node.setAttribute("target", "_blank");
                node.setAttribute("rel", "noopener noreferrer");
            }
        });
    }, []);

    // Load chat history from localStorage when component mounts
    useEffect(() => {
        try {
            if (!hasLoadedMessages) {
                const savedMessages = localStorage.getItem("chatHistory");
                if (savedMessages) {
                    const parsedMessages = JSON.parse(savedMessages);
                    if (
                        Array.isArray(parsedMessages) &&
                        parsedMessages.length > 0
                    ) {
                        // Convert stored timestamp strings back to Date objects
                        const messagesWithDates = parsedMessages.map((msg) => ({
                            ...msg,
                            timestamp: new Date(msg.timestamp)
                        }));
                        setMessages(messagesWithDates);
                        console.log(
                            `Loaded ${messagesWithDates.length} messages from chat history`
                        );
                    } else {
                        // Initialize with welcome message if no saved messages
                        setMessages([
                            {
                                content: isAuthenticated()
                                    ? "Hi there! How can I help with your shoe shopping today?"
                                    : "Welcome! Please log in to use the chatbot and get personalized assistance with your shopping.",
                                sender: "bot",
                                timestamp: new Date()
                            }
                        ]);
                    }
                } else {
                    // Initialize with welcome message if no saved history
                    setMessages([
                        {
                            content: isAuthenticated()
                                ? "Hi there! How can I help with your shoe shopping today?"
                                : "Welcome! Please log in to use the chatbot and get personalized assistance with your shopping.",
                            sender: "bot",
                            timestamp: new Date()
                        }
                    ]);
                }
                setHasLoadedMessages(true);
            }
        } catch (error) {
            console.error("Error loading chat history:", error);
            // If there's an error, clear the corrupted storage
            localStorage.removeItem("chatHistory");
            // Initialize with welcome message
            setMessages([
                {
                    content: isAuthenticated()
                        ? "Hi there! How can I help with your shoe shopping today?"
                        : "Welcome! Please log in to use the chatbot and get personalized assistance with your shopping.",
                    sender: "bot",
                    timestamp: new Date()
                }
            ]);
            setHasLoadedMessages(true);
        }
    }, [setMessages, isAuthenticated]);

    // Save chat history to localStorage when messages change
    useEffect(() => {
        if (messages.length > 0 && hasLoadedMessages) {
            try {
                // Keep only the most recent messages if we exceed the limit
                const messagesToStore = messages.slice(-MAX_HISTORY_LENGTH);
                localStorage.setItem(
                    "chatHistory",
                    JSON.stringify(messagesToStore)
                );
                console.log(
                    `Saved ${messagesToStore.length} messages to localStorage`
                );
            } catch (error) {
                console.error("Error saving chat history:", error);
            }
        }
    }, [messages, hasLoadedMessages]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            // Use a small timeout to ensure content is rendered before scrolling
            setTimeout(() => {
                messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
            }, 100);
        }
    }, [messages]);

    // Focus on input when component loads
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Handle scroll behavior - show shadow at top when scrolled
    useEffect(() => {
        const container = messageContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            if (container.scrollTop > 20) {
                container.classList.add(styles.scrolled);
            } else {
                container.classList.remove(styles.scrolled);
            }
        };

        container.addEventListener("scroll", handleScroll);
        return () => {
            container.removeEventListener("scroll", handleScroll);
        };
    }, []);

    // Sanitize HTML content
    const sanitizeHtml = (html) => {
        return {
            __html: DOMPurify.sanitize(html, {
                ALLOWED_TAGS: [
                    "h1",
                    "h2",
                    "h3",
                    "h4",
                    "h5",
                    "h6",
                    "p",
                    "span",
                    "div",
                    "ul",
                    "ol",
                    "li",
                    "a",
                    "b",
                    "strong",
                    "i",
                    "em",
                    "mark",
                    "small",
                    "del",
                    "ins",
                    "sub",
                    "sup",
                    "table",
                    "thead",
                    "tbody",
                    "tr",
                    "th",
                    "td",
                    "code",
                    "pre",
                    "br",
                    "hr"
                ],
                ALLOWED_ATTR: [
                    "href",
                    "class",
                    "id",
                    "style",
                    "colspan",
                    "rowspan"
                ]
            })
        };
    };

    // Handle login redirect
    const handleLoginRedirect = () => {
        // Save current URL to return after login
        sessionStorage.setItem("redirectAfterLogin", window.location.pathname);
        // Redirect to login page
        window.location.href = "/login";
    };

    // Handle sending messages
    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!inputText.trim()) return;

        // Check if user is authenticated before sending message
        if (!isAuthenticated()) {
            const userMessage = {
                content: inputText,
                sender: "user",
                timestamp: new Date()
            };

            const loginMessage = {
                content:
                    "You need to be logged in to use the chatbot. Please log in to continue.",
                sender: "bot",
                timestamp: new Date(),
                isLoginPrompt: true
            };

            setMessages((prev) => [...prev, userMessage, loginMessage]);
            setInputText("");
            return;
        }

        // Add user message to chat
        const userMessage = {
            content: inputText,
            sender: "user",
            timestamp: new Date()
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputText("");
        setIsLoading(true);

        try {
            // Call API - axiosClient will handle the auth token
            const response = await chatService.sendMessage(inputText);
            let suggestedShoes = [];

            // If we have shoes array from response, use it
            if (response.shoes && Array.isArray(response.shoes)) {
                suggestedShoes = response.shoes;
            }
            // If we have a single shoe from action taken, make it an array
            else if (response.actionTaken && response.actionTaken.shoe) {
                suggestedShoes = [response.actionTaken.shoe];
            }

            // Create bot message
            const botMessage = {
                content: response.response,
                sender: "bot",
                timestamp: new Date(),
                suggestedShoes: suggestedShoes, // Product suggestions
                isHtml: true // Flag to indicate HTML content
            };

            setMessages((prev) => [...prev, botMessage]);
            console.log("Bot message:", suggestedShoes);

            // Handle action taken (if any)
            if (response.actionTaken) {
                // Update cart/wishlist UI if needed
                console.log("Action taken:", response.actionTaken);
            }
        } catch (error) {
            console.error("Chat error:", error);

            // Check specifically for 401 unauthorized errors
            let errorMessage;
            if (error.response && error.response.status === 401) {
                errorMessage = {
                    content:
                        "Your session has expired. Please log in again to continue using the chatbot.",
                    sender: "bot",
                    error: true,
                    isLoginPrompt: true,
                    timestamp: new Date()
                };
            } else {
                errorMessage = {
                    content:
                        error.message ||
                        "Sorry, I couldn't process your request. Please try again.",
                    sender: "bot",
                    error: true,
                    timestamp: new Date()
                };
            }

            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    // Rest of component remains the same
    return (
        <div className={styles.chat_interface}>
            <div
                className={styles.messages_container}
                ref={messageContainerRef}
            >
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`${styles.message} ${styles[msg.sender]} ${
                            msg.error ? styles.error : ""
                        } ${
                            msg.isLoginPrompt ? styles.login_prompt_message : ""
                        }`}
                    >
                        {msg.sender === "bot" && (
                            <div className={styles.message_avatar}>
                                <img src={bot_Icon} alt="Bot" />
                            </div>
                        )}
                        <div className={styles.message_bubble}>
                            <div className={styles.message_content}>
                                {msg.isHtml ||
                                (msg.sender === "bot" &&
                                    msg.content.includes("<")) ? (
                                    <div
                                        dangerouslySetInnerHTML={sanitizeHtml(
                                            msg.content
                                        )}
                                    />
                                ) : (
                                    msg.content
                                )}
                                {msg.isLoginPrompt && (
                                    <button
                                        className={styles.login_button}
                                        onClick={handleLoginRedirect}
                                    >
                                        Log In
                                    </button>
                                )}
                            </div>

                            {/* Display suggested shoes if any */}
                            {msg.suggestedShoes &&
                                Array.isArray(msg.suggestedShoes) &&
                                msg.suggestedShoes.length > 0 && (
                                    <div className={styles.suggested_shoes}>
                                        <h4
                                            className={styles.suggestions_title}
                                        >
                                            Products you might like:
                                        </h4>
                                        <div className={styles.shoes_carousel}>
                                            {msg.suggestedShoes.map((shoe) => (
                                                <ShoeSuggestionCard
                                                    key={shoe._id}
                                                    shoe={shoe}
                                                    styles={styles}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                            <div className={styles.message_time}>
                                {new Date(msg.timestamp).toLocaleTimeString(
                                    [],
                                    { hour: "2-digit", minute: "2-digit" }
                                )}
                            </div>
                        </div>
                        {msg.sender === "user" && (
                            <div className={styles.message_avatar}>
                                <div className={styles.user_icon}>
                                    {isAuthenticated()
                                        ? userInfo.name.charAt(0).toUpperCase()
                                        : "?"}
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {isLoading && (
                    <div className={`${styles.message} ${styles.bot}`}>
                        <div className={styles.message_avatar}>
                            <img src={bot_Icon} alt="Bot" />
                        </div>
                        <div
                            className={`${styles.message_bubble} ${styles.loading_bubble}`}
                        >
                            <div className={styles.typing_indicator}>
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <form className={styles.chat_input} onSubmit={handleSendMessage}>
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={
                        isAuthenticated()
                            ? "Ask about our shoes..."
                            : "Login to chat with us..."
                    }
                    disabled={!isAuthenticated()}
                    ref={inputRef}
                />
                <button
                    type="submit"
                    className={inputText.trim() ? styles.active : ""}
                    disabled={
                        isLoading || !inputText.trim() || !isAuthenticated()
                    }
                >
                    <svg
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        fill="currentColor"
                    >
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
                    </svg>
                </button>
            </form>
        </div>
    );
};

// Component to display suggested shoe cards
const ShoeSuggestionCard = ({ shoe, styles }) => (
    <div className={styles.shoe_card}>
        <div className={styles.shoe_image}>
            <img src={shoe.fSrc || "/placeholder-shoe.png"} alt={shoe.name} />
        </div>
        <div className={styles.shoe_info}>
            <h4 title={shoe.name}>{shoe.name}</h4>
            <p className={styles.brand}>{shoe.brand}</p>
            <div className={styles.price_action}>
                <p className={styles.price}>${shoe.price}</p>
                <button
                    className={styles.view_button}
                    onClick={() =>
                        (window.location.href = `/product/${shoe._id}`)
                    }
                >
                    View
                </button>
            </div>
        </div>
    </div>
);

export default ChatInterface;
