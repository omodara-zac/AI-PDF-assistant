
import { FileText, MessageSquare } from "lucide-react";
import FileUpload from "./FileUpload";
import "./Sidebar.css";

function Sidebar({ uploadedFile, setUploadedFile }) {

    return (
        <aside className="sidebar">

            <div className="sidebar-header">
                <h2>PDF Assistant</h2>
            </div>

            <div className="sidebar-content">

                <div className="sidebar-section">
                    <p className="section-title">DOCUMENT</p>

                    <FileUpload
                        setUploadedFile={setUploadedFile}
                    />
                </div>

                <div className="sidebar-section">
                    <p className="section-title">CURRENT DOCUMENT</p>

                    {uploadedFile ? (
                        <div className="uploaded-file">
                            <FileText size={18} />
                            <span>{uploadedFile}</span>
                        </div>
                    ) : (
                        <p className="empty-document">
                            No document uploaded yet
                        </p>
                    )}
                </div>

            </div>

            <div className="sidebar-footer">
                <MessageSquare size={17} />
                <span>AI PDF Assistant</span>
            </div>

        </aside>
    );
}

export default Sidebar;
