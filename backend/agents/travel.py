import os
from pypdf import PdfReader
from backend.agents.base import BaseAgent
from backend.vector_store import GuidePilotVectorStore

class TravelAgent(BaseAgent):
    def __init__(self):
        super().__init__("TravelAgent")
        self.vector_store = GuidePilotVectorStore(collection_name="travel_guides")

    def ingest_document(self, file_path):
        """Extracts text from files (PDF/TXT) and indexes chunks in vector store."""
        if not os.path.exists(file_path):
            return {"error": "File not found"}
            
        ext = os.path.splitext(file_path)[1].lower()
        text = ""
        
        try:
            if ext == ".pdf":
                reader = PdfReader(file_path)
                for page in reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            else: # TXT or MD fallback
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    text = f.read()
        except Exception as e:
            return {"error": f"Failed to parse file: {str(e)}"}
            
        if not text.strip():
            return {"error": "No readable text extracted from document"}
            
        # Segment into sliding chunk paragraphs
        paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
        chunks = []
        current_chunk = ""
        
        for para in paragraphs:
            if len(current_chunk) + len(para) < 600:
                current_chunk += para + "\n\n"
            else:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                current_chunk = para + "\n\n"
        if current_chunk:
            chunks.append(current_chunk.strip())
            
        # Store in vector database
        metadatas = [{"source": os.path.basename(file_path), "chunk_idx": i} for i, _ in enumerate(chunks)]
        self.vector_store.add_documents(chunks, metadatas)
        
        # Extract metadata summaries for display
        summary_prompt = f"Summarize this document content focusing solely on accessibility features, wheelchair entrances, ramp guides, elevators, and contact numbers. Limit to 3 bullet points. Text: {text[:2000]}"
        summary_template = {
            "accessible_entrances": ["Gate A Entrance"],
            "elevator_locations": ["Beside main elevator lobby"],
            "assistance_contact": "Emergency: +1-800-555-0100"
        }
        
        extracted_info = self.query_structured("You are GuidePilot Travel Agent. Summarize document details.", summary_prompt, summary_template)
        
        return {
            "status": "success",
            "filename": os.path.basename(file_path),
            "chunks_count": len(chunks),
            "extracted_highlights": extracted_info
        }

    def answer_query(self, query):
        """RAG query workflow: Retrieves context and queries LLM."""
        results = self.vector_store.search(query, limit=3)
        context_str = "\n---\n".join([doc["text"] for doc in results])
        
        if not context_str.strip():
            context_str = "No specific guide match was indexed. Recommend utilizing local facility map data."
            
        system_prompt = "You are GuidePilot Travel Agent. Answer user questions based on the retrieved document context. Be brief and highly clear. If the context does not answer the query, supply helpful general recommendations."
        user_prompt = f"Context details:\n{context_str}\n\nQuestion: {query}"
        
        llm_response = self.query_ollama(system_prompt, user_prompt)
        
        return {
            "query": query,
            "answer": llm_response,
            "sources": list(set([doc["metadata"].get("source", "Unknown") for doc in results if "metadata" in doc]))
        }
