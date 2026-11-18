
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Chat from "./components/Chat";
import "./App.css";

function App() {
    const [messages, setMessages] = useState([]);
    const [uploadedFile, setUploadedFile] = useState(null);

    return (
        <div className="app">
            <Sidebar
                uploadedFile={uploadedFile}
                setUploadedFile={setUploadedFile}
            />

            <Chat
                messages={messages}
                setMessages={setMessages}
                uploadedFile={uploadedFile}
            />
        </div>
    );
}

export default App;
