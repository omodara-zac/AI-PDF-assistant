
import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";

import { ChatOllama, OllamaEmbeddings } from "@langchain/ollama";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { Document } from "@langchain/core/documents";

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
    origin: "http://localhost:5173"
}));

app.use(express.json());

// Create uploads folder
const uploadDir = path.join(process.cwd(), "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 20 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== "application/pdf") {
            return cb(new Error("Only PDF files are allowed"));
        }

        cb(null, true);
    }
});

// Ollama model
const model = new ChatOllama({
    model: "llama3.2",
    baseUrl: "http://localhost:11434",
    temperature: 0.8,
    verbose: false
});

// Embeddings
const embeddings = new OllamaEmbeddings({
    model: "embeddinggemma",
    baseUrl: "http://localhost:11434"
});

// Store the active document's vector store
let activeVectorStore = null;

// PDF upload endpoint
app.post("/api/upload", upload.single("pdf"), async (req, res) => {

    try {
        if (!req.file) {
            return res.status(400).json({
                message: "Please upload a PDF file"
            });
        }

        console.log("PDF uploaded:", req.file.originalname);

        // Load uploaded PDF
        const loader = new PDFLoader(req.file.path);
        const docs = await loader.load();

        // Split PDF into chunks
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 150
        });

        const splittedDocs = await textSplitter.splitDocuments(docs);

        // Create new documents with Chroma-compatible metadata
        const cleanedDocs = splittedDocs.map(doc => {

            const pageNumber = doc.metadata?.loc?.pageNumber;

            return new Document({
                pageContent: doc.pageContent,

                metadata: {
                    source: String(
                        doc.metadata?.source ?? req.file.originalname
                    ),

                    ...(pageNumber !== undefined && pageNumber !== null
                        ? { page: Number(pageNumber) }
                        : {})
                }
            });
        });

        console.log("PDF extraction completed:", docs.length);
        console.log("PDF chunks created:", cleanedDocs.length);
        console.log("Connecting to ChromaDB...");

        // Create vector store
        const vectorStore = new Chroma(embeddings, {
            collectionName: "pdf_documents",
            host: "localhost",
            port: 8000,
            ssl: false
        });

        console.log("Adding documents to ChromaDB...");

        await vectorStore.addDocuments(cleanedDocs);

        console.log("Documents successfully added to ChromaDB");

        // Make this the active document
        activeVectorStore = vectorStore;

        console.log("PDF processed successfully");

        res.status(200).json({
            message: "PDF uploaded and processed successfully",
            filename: req.file.originalname,
            totalChunks: cleanedDocs.length
        });

    } catch (error) {

        console.error("Upload error:", error);

        res.status(500).json({
            message: "Failed to process PDF",
            error: error.message
        });
    }
});

// Question endpoint
app.post("/api/ask", async (req, res) => {

    try {
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({
                message: "Please provide a question"
            });
        }

        if (!activeVectorStore) {
            return res.status(400).json({
                message: "Upload a PDF before asking questions"
            });
        }

        // Create retriever
        const retriever = activeVectorStore.asRetriever({
            k: 2
        });

        // Retrieve relevant documents
        const results = await retriever.invoke(question);

        const resultDocs = results.map(
            doc => doc.pageContent
        );

        // Build prompt
        const template = ChatPromptTemplate.fromMessages([
            ["system", `Answer the user's question using only the
            information provided in the context below.

            If the answer is not available in the context,
            say you don't know.

            Context: {context}`],

            ["user", "{input}"]
        ]);

        const parser = new StringOutputParser();

        const chain = template.pipe(model).pipe(parser);

        // Generate response
        const response = await chain.invoke({
            input: question,
            context: resultDocs.join("\n\n")
        });

        res.status(200).json({
            answer: response
        });

    } catch (error) {

        console.error("Question error:", error);

        res.status(500).json({
            message: "Failed to answer question",
            error: error.message
        });
    }
});

// Error handler
app.use((error, req, res, next) => {
    res.status(400).json({
        message: error.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});
