
import { useState } from "react";
import { Upload, FileText, LoaderCircle } from "lucide-react";

function FileUpload({ setUploadedFile }) {

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleUpload = async (e) => {
        const file = e.target.files[0];

        if (!file) return;

        if (file.type !== "application/pdf") {
            setMessage("Please select a PDF file.");
            return;
        }

        const formData = new FormData();
        formData.append("pdf", file);

        setLoading(true);
        setMessage("");

        try {
            const response = await fetch(
                "http://localhost:5000/api/upload",
                {
                    method: "POST",
                    body: formData
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Upload failed");
            }

            setUploadedFile(data.filename);
            setMessage(
                `PDF processed successfully! ${data.totalChunks} chunks created.`
            );

        } catch (error) {
            setMessage(error.message);

        } finally {
            setLoading(false);
            e.target.value = "";
        }
    };

    return (
        <div className="file-upload">

            <label className="upload-button">

                {loading ? (
                    <LoaderCircle size={18} className="spin" />
                ) : (
                    <Upload size={18} />
                )}

                <span>
                    {loading ? "Processing PDF..." : "Upload PDF"}
                </span>

                <input
                    type="file"
                    accept=".pdf,application/pdf"
                    hidden
                    onChange={handleUpload}
                    disabled={loading}
                />

            </label>

            {message && (
                <p className="upload-message">
                    {message}
                </p>
            )}

        </div>
    );
}

export default FileUpload;
