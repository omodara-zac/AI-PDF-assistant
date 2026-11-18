
import { useState } from "react";
import { Send, Bot } from "lucide-react";
import Message from "./Message";
import "./Chat.css";

function Chat({ messages, setMessages, uploadedFile }) {

    const [question, setQuestion] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!question.trim() || loading) return;

        if (!uploadedFile) {
            alert("Please upload a PDF first.");
            return;
        }

        const userQuestion = question.trim();

        setMessages((prev) => [
            ...prev,
            {
                role: "user",
                content: userQuestion
            }
        ]);

        setQuestion("");
        setLoading(true);

        try {
            const response = await fetch("http://localhost:5000/api/ask", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    question: userQuestion
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Something went wrong");
            }

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: data.answer
                }
            ]);

        } catch (error) {
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: `Error: ${error.message}`
                }
            ]);

        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="chat-container">

            <header className="chat-header">
                <div>
                    <h2>AI PDF Assistant</h2>
                    <p>Ask questions about your documents</p>
                </div>
            </header>

            <div className="chat-messages">

                {messages.length === 0 ? (
                    <div className="welcome-message">
                        <Bot size={40} />

                        <h2>How can I help you?</h2>

                        <p>
                            Upload a PDF document and start asking
                            questions about its contents.
                        </p>
                    </div>
                ) : (
                    messages.map((message, index) => (
                        <Message
                            key={index}
                            role={message.role}
                            content={message.content}
                        />
                    ))
                )}

                {loading && (
                    <div className="loading-message">
                        <Bot size={20} />
                        <span>Thinking...</span>
                    </div>
                )}

            </div>

            <form className="chat-input-area" onSubmit={handleSubmit}>

                <input
                    type="text"
                    placeholder={
                        uploadedFile
                            ? "Ask something about your PDF..."
                            : "Upload a PDF to get started..."
                    }
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    disabled={!uploadedFile || loading}
                />

                <button
                    type="submit"
                    disabled={!question.trim() || !uploadedFile || loading}
                >
                    <Send size={18} />
                </button>

            </form>

        </main>
    );
}

export default Chat;
