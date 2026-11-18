# AI PDF Assistant

An AI-powered PDF question-answering application built with React, Node.js, LangChain, Ollama and ChromaDB.

The application allows users to upload PDF documents and ask questions about their contents. It uses Retrieval-Augmented Generation (RAG) to retrieve relevant information from uploaded documents and generate context-aware responses.

## Features

- Upload PDF documents.
- Extract and split document text into chunks.
- Generate embeddings using Ollama.
- Store document embeddings in ChromaDB.
- Retrieve relevant information using semantic search.
- Ask questions and receive AI-generated answers based on document content.

## Technologies Used

- React
- Node.js
- Express.js
- LangChain
- Ollama
- ChromaDB

## Getting Started

This project is designed to run locally. It is not currently hosted.

To use the application, clone the repository and follow the installation instructions below.

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd ai-pdf-assistant
```

Install the dependencies in both the frontend and backend folders, configure the required environment, and start the services.

### Requirements

- Node.js
- Python
- Ollama
- ChromaDB
- The `llama3.2` model
- The `embeddinggemma` model

Pull the required Ollama models:

```bash
ollama pull llama3.2
ollama pull embeddinggemma
```

### Running the application

Start ChromaDB, then start the backend and frontend in separate terminals.

The frontend communicates with the local Express backend, which uses Ollama and ChromaDB for document processing and question answering.

## Important Note

This application currently runs locally and requires the dependencies listed above. No hosted demo is available yet.
