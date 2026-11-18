
import { User, Bot } from "lucide-react";
import "./Message.css";

function Message({ role, content }) {

    const isUser = role === "user";

    return (
        <div className={`message ${isUser ? "user-message" : "assistant-message"}`}>

            <div className="message-avatar">
                {isUser ? (
                    <User size={18} />
                ) : (
                    <Bot size={18} />
                )}
            </div>

            <div className="message-content">
                <p className="message-role">
                    {isUser ? "You" : "Assistant"}
                </p>

                <p className="message-text">
                    {content}
                </p>
            </div>

        </div>
    );
}

export default Message;
