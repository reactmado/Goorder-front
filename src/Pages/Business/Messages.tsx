import React, { useState, useEffect, useRef } from "react";
import { FaPaperPlane } from "react-icons/fa";
import "../../styles/Messages.css";
import Navbar from "../../components/navbar copy/Navbar";
import {
  getChats,
  getChatMessages,
  sendMessage,
  messageService,
} from "../../service/Messages_service";

interface Chat {
  id: number;
  adminConversation: boolean;
  businessId: string;
  customerId: string;
  business?: {
    id: string;
    businessName: string;
    image: string;
    phoneNumber: string;
    bankAccountNumber: string;
    address: string;
  };
  customer?: {
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    role: string;
    image: string;
  };
  messsages?: Message[];
}

interface Message {
  id: string;
  text: string;
  senderId: string;
  isSender: boolean;
  createdAt: string;
}

const Messages: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showChatModal, setShowChatModal] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Store messages for each chat to prevent disappearing
  const [chatMessagesCache, setChatMessagesCache] = useState<{
    [chatId: number]: Message[];
  }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatModalRef = useRef<HTMLDivElement>(null); // Ref for modal for outside click

  useEffect(() => {
    loadChats();
    initializeSignalR();

    // Cleanup on unmount
    return () => {
      messageService.stopConnection();
    };
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle clicks outside the chat modal to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        chatModalRef.current &&
        !chatModalRef.current.contains(event.target as Node) &&
        showChatModal
      ) {
        handleCloseModal();
      }
    };

    if (showChatModal) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showChatModal]);

  const initializeSignalR = async () => {
    try {
      await messageService.startConnection();
      setIsConnected(true);

      // Listen for incoming messages
      messageService.onReceiveMessage((incomingMessage: Message) => {
        console.log("Received real-time message:", incomingMessage);

        // Add the incoming message to the current chat if it matches
        if (selectedChat) {
          setMessages((prevMessages) => {
            // Check if message already exists to prevent duplicates
            const exists = prevMessages.some(
              (msg) => msg.id === incomingMessage.id
            );
            if (!exists) {
              const updatedMessages = [...prevMessages, incomingMessage].sort(
                (a, b) =>
                  new Date(a.createdAt).getTime() -
                  new Date(b.createdAt).getTime()
              );

              // Update cache as well
              setChatMessagesCache((prev) => ({
                ...prev,
                [selectedChat.id]: updatedMessages,
              }));

              return updatedMessages;
            }
            return prevMessages;
          });
        }

        // Update the cache for the appropriate chat
        setChatMessagesCache((prev) => {
          const updatedCache = { ...prev };

          Object.keys(updatedCache).forEach((chatIdStr) => {
            const chatId = parseInt(chatIdStr);
            const chat = chats.find((c) => c.id === chatId);

            if (
              chat &&
              (chat.customerId === incomingMessage.senderId ||
                chat.businessId === incomingMessage.senderId)
            ) {
              const existingMessages = updatedCache[chatId] || [];
              const exists = existingMessages.some(
                (msg) => msg.id === incomingMessage.id
              );

              if (!exists) {
                updatedCache[chatId] = [
                  ...existingMessages,
                  incomingMessage,
                ].sort(
                  (a, b) =>
                    new Date(a.createdAt).getTime() -
                    new Date(b.createdAt).getTime()
                );
              }
            }
          });

          return updatedCache;
        });
      });

      // Listen for connection status changes
      messageService.onConnectionStatusChange((connected: boolean) => {
        setIsConnected(connected);
        console.log(
          "SignalR connection status:",
          connected ? "Connected" : "Disconnected"
        );
      });
    } catch (error) {
      console.error("Failed to initialize SignalR:", error);
      setIsConnected(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChats = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const chatData = await getChats();
      setChats(chatData);
    } catch (error) {
      console.error("Error loading chats:", error);
      setErrorMessage("Failed to load chats");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatSelect = async (chat: Chat) => {
    setSelectedChat(chat);
    setShowChatModal(true);
    setLoadingMessages(true);
    setErrorMessage(null);

    // Use cached messages if available
    if (chatMessagesCache[chat.id]) {
      setMessages(chatMessagesCache[chat.id]);
      setLoadingMessages(false);
      scrollToBottom();
      return;
    }

    try {
      const chatResponse = await getChatMessages(chat.id);

      let messagesList: Message[] = [];

      if (chatResponse && typeof chatResponse === "object") {
        if (chatResponse.messsages && Array.isArray(chatResponse.messsages)) {
          messagesList = chatResponse.messsages.map(
            (msg: {
              id: string;
              text: string;
              senderId: string;
              isSender: boolean;
              createdAt: string;
            }) => ({
              id: msg.id,
              text: msg.text,
              senderId: msg.senderId,
              isSender: msg.isSender,
              createdAt: msg.createdAt,
            })
          );
        } else if (Array.isArray(chatResponse)) {
          const chatData = chatResponse[0];
          if (chatData && chatData.messsages) {
            messagesList = chatData.messsages.map(
              (msg: {
                id: string;
                text: string;
                senderId: string;
                isSender: boolean;
                createdAt: string;
              }) => ({
                id: msg.id,
                text: msg.text,
                senderId: msg.senderId,
                isSender: msg.isSender,
                createdAt: msg.createdAt,
              })
            );
          }
        }
      }

      const sortedMessages = messagesList.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      setMessages(sortedMessages);
      setChatMessagesCache((prev) => ({
        ...prev,
        [chat.id]: sortedMessages,
      }));
    } catch (error) {
      console.error("Error loading messages:", error);
      setErrorMessage("Failed to load messages");
      setMessages([]);
      setChatMessagesCache((prev) => ({
        ...prev,
        [chat.id]: [],
      }));
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || isSending) return;

    const messageText = newMessage.trim();
    setIsSending(true);
    setNewMessage(""); // Clear input immediately for better UX

    // Create optimistic message - business sending message (isSender: true)
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      text: messageText,
      senderId: "current_business", // Assuming "current_business" is the ID of the business user
      isSender: true, // Business sent this message
      createdAt: new Date().toISOString(),
    };

    // Add optimistic message to end of array (newest at bottom)
    const updatedMessages = [...messages, optimisticMessage];
    setMessages(updatedMessages);
    setChatMessagesCache((prev) => ({
      ...prev,
      [selectedChat.id]: updatedMessages,
    }));
    scrollToBottom(); // Scroll to show the optimistic message

    try {
      const response = await sendMessage(selectedChat.id, messageText);

      // Replace optimistic message with real message from server
      const finalMessages = updatedMessages.map((msg) =>
        msg.id === optimisticMessage.id
          ? {
              ...response,
              createdAt: response.createdAt || new Date().toISOString(),
            }
          : msg
      );

      // Update messages state and cache
      setMessages(finalMessages);
      setChatMessagesCache((prev) => ({
        ...prev,
        [selectedChat.id]: finalMessages,
      }));
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove optimistic message on error and restore input
      const revertedMessages = messages.filter(
        (m) => m.id !== optimisticMessage.id
      );
      setMessages(revertedMessages);
      setChatMessagesCache((prev) => ({
        ...prev,
        [selectedChat.id]: revertedMessages,
      }));
      setNewMessage(messageText); // Restore message text

      // Show error to user
      alert("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleCloseModal = () => {
    setShowChatModal(false);
    setErrorMessage(null);
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const dateTime = new Date(timestamp);
      const now = new Date();
      const difference = now.getTime() - dateTime.getTime();
      const daysDiff = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hoursDiff = Math.floor(difference / (1000 * 60 * 60));

      if (daysDiff > 0) {
        return dateTime.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      } else if (hoursDiff > 0) {
        return dateTime.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
      } else {
        return dateTime.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    } catch {
      return "";
    }
  };

  const getDisplayName = (chat: Chat) => {
    if (chat.customer) {
      return `${chat.customer.firstName} ${chat.customer.lastName}`.trim();
    }
    if (chat.business) {
      return chat.business.businessName;
    }
    return "Unknown";
  };

  const getDisplayAvatar = (chat: Chat) => {
    if (chat.customer?.image) {
      return chat.customer.image;
    }
    if (chat.business?.image) {
      return chat.business.image;
    }
    return "/images/avatar.png";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="messages-page">
        <div className="messages-content">
          <Navbar />
          <div className="loading-container fade-in">
            <div className="loading-spinner"></div>
            <p>Loading chats...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (errorMessage && !showChatModal) {
    return (
      <div className="messages-page">
        <div className="messages-content">
          <Navbar />
          <div className="error-container fade-in">
            <div className="error-icon">⚠️</div>
            <p className="error-message">{errorMessage}</p>
            <button className="retry-button" onClick={loadChats}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="messages-page">
      <div className="messages-content">
        <Navbar />

        <div className="messages-header">
          <h2 className="messages-title">Messages</h2>
          <div className="connection-status">
            <div
              className={`status-indicator ${
                isConnected ? "connected" : "disconnected"
              }`}
            >
              <div className="status-dot"></div>
              <span>{isConnected ? "Connected" : "Disconnected"}</span>
            </div>
          </div>
        </div>

        {chats.length === 0 ? (
          <div className="no-chats slide-up-fade-in">
            <div className="no-chats-icon">💬</div>
            <p>No chats available</p>
            <button className="refresh-button" onClick={loadChats}>
              Refresh
            </button>
          </div>
        ) : (
          <div className="chat-list">
            {chats.map((chat) => (
              <div
                className="review-card chat-card scale-in-center"
                key={chat.id}
                onClick={() => handleChatSelect(chat)}
                style={{ cursor: "pointer" }}
              >
                <div className="review-card-header">
                  <div className="review-card-left">
                    <img
                      src={getDisplayAvatar(chat)}
                      alt={`${getDisplayName(chat)} avatar`}
                      className="reviewer-avatar"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/images/avatar.png";
                      }}
                    />
                    <div>
                      <h3 className="reviewer-name">{getDisplayName(chat)}</h3>
                      <p className="review-date">
                        {chat.customer?.email ||
                          chat.business?.phoneNumber ||
                          "No contact info"}
                      </p>
                      {chat.customer?.phoneNumber && (
                        <p className="phone-number">
                          {chat.customer.phoneNumber}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="chat-indicator">
                    <span className="chat-badge">
                      Chat{" "}
                      {chatMessagesCache[chat.id]?.length > 0 &&
                        `(${chatMessagesCache[chat.id].length})`}
                    </span>
                  </div>
                </div>
                <p className="review-text">
                  {chatMessagesCache[chat.id]?.length > 0
                    ? `Last message: "${
                        chatMessagesCache[chat.id][
                          chatMessagesCache[chat.id].length - 1
                        ].text.substring(0, 50) + "..."
                      }"` // Show last message snippet
                    : "Click to open chat conversation"}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Chat Modal */}
        {showChatModal && selectedChat && (
          <div className="chat-modal-overlay">
            <div
              className="chat-modal scale-in-center"
              ref={chatModalRef}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="chat-header">
                <div className="chat-header-info">
                  <img
                    src={getDisplayAvatar(selectedChat)}
                    alt={`${getDisplayName(selectedChat)} avatar`}
                    className="chat-avatar"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/images/avatar.png";
                    }}
                  />
                  <div>
                    <h3 className="chat-name">
                      {getDisplayName(selectedChat)}
                    </h3>
                    <p className="chat-email">
                      {selectedChat.customer?.email ||
                        selectedChat.business?.phoneNumber}
                    </p>
                    {selectedChat.customer?.phoneNumber && (
                      <p className="chat-phone">
                        {selectedChat.customer.phoneNumber}
                      </p>
                    )}
                  </div>
                </div>
                <div className="chat-header-actions">
                  <div
                    className={`connection-status-mini ${
                      isConnected ? "connected" : "disconnected"
                    }`}
                  >
                    <div className="status-dot-mini"></div>
                  </div>
                  <button className="chat-close-btn" onClick={handleCloseModal}>
                    ×
                  </button>
                </div>
              </div>

              <div className="chat-messages">
                {loadingMessages ? (
                  <div className="loading-messages fade-in">
                    <div className="loading-spinner-small"></div>
                    <p>Loading messages...</p>
                  </div>
                ) : errorMessage ? (
                  <div className="error-messages fade-in">
                    <div className="error-icon">⚠️</div>
                    <p>{errorMessage}</p>
                    <button
                      className="retry-small-button"
                      onClick={() => handleChatSelect(selectedChat)}
                    >
                      Retry
                    </button>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="no-messages fade-in">
                    <div className="no-messages-icon">💬</div>
                    <p>No messages yet</p>
                    <p className="no-messages-subtitle">
                      Start a conversation with {getDisplayName(selectedChat)}
                    </p>
                  </div>
                ) : (
                  <>
                    {messages.map((message, index) => {
                      const isBusinessMessage = message.isSender; // true means business sent it
                      return (
                        <div
                          key={message.id || `message-${index}`}
                          className={`message ${
                            isBusinessMessage ? "sent" : "received"
                          } fade-in-message`}
                        >
                          <div className="message-content">
                            <p className="message-text">{message.text}</p>
                            <span className="message-time">
                              {formatTimestamp(message.createdAt)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              <div className="chat-input-container">
                <div className="chat-input-wrapper">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="chat-input"
                    onKeyPress={handleKeyPress}
                    disabled={isSending}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  className={`send-button ${isSending ? "sending" : ""}`}
                  disabled={isSending || !newMessage.trim()}
                  title={isSending ? "Sending..." : "Send message"}
                >
                  {isSending ? (
                    <div className="sending-spinner"></div>
                  ) : (
                    <FaPaperPlane />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;