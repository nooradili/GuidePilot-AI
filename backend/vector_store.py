import os
import json
import math
import re
import requests
from backend import config

# Fallback Pure-Python Vector Store using TF-IDF + Cosine Similarity, or local Ollama embeddings
class LightVectorStore:
    def __init__(self, collection_name="guidepilot"):
        self.collection_name = collection_name
        self.storage_path = os.path.join(config.VECTOR_STORE_PATH, f"{collection_name}.json")
        self.documents = []  # list of dict: {"id": str, "text": str, "metadata": dict, "vector": list}
        self.load()

    def load(self):
        os.makedirs(config.VECTOR_STORE_PATH, exist_ok=True)
        if os.path.exists(self.storage_path):
            try:
                with open(self.storage_path, "r", encoding="utf-8") as f:
                    self.documents = json.load(f)
            except Exception:
                self.documents = []

    def save(self):
        try:
            with open(self.storage_path, "w", encoding="utf-8") as f:
                json.dump(self.documents, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"Error saving LightVectorStore: {e}")

    def _get_ollama_embedding(self, text):
        """Fetches vector embedding from local Ollama if running, otherwise returns dummy frequency list."""
        try:
            url = f"{config.OLLAMA_BASE_URL}/api/embeddings"
            payload = {"model": config.DEFAULT_MODEL, "prompt": text}
            response = requests.post(url, json=payload, timeout=2)
            if response.status_code == 200:
                return response.json().get("embedding", [])
        except Exception:
            pass
        
        # Pure Python fallback: Simple bag-of-words pseudo-embedding if Ollama is offline
        words = re.findall(r'\w+', text.lower())
        vector = [0.0] * 128
        for word in words:
            idx = sum(ord(c) for c in word) % 128
            vector[idx] += 1.0
        # Normalize vector
        magnitude = math.sqrt(sum(v**2 for v in vector))
        if magnitude > 0:
            vector = [v / magnitude for v in vector]
        return vector

    def add_texts(self, texts, metadatas=None):
        metadatas = metadatas or [{} for _ in texts]
        for idx, (text, meta) in enumerate(zip(texts, metadatas)):
            doc_id = f"doc_{len(self.documents) + idx}_{int(datetime_now_timestamp())}"
            vector = self._get_ollama_embedding(text)
            self.documents.append({
                "id": doc_id,
                "text": text,
                "metadata": meta,
                "vector": vector
            })
        self.save()

    def similarity_search(self, query, k=3):
        if not self.documents:
            return []
        
        query_vector = self._get_ollama_embedding(query)
        scored_docs = []
        for doc in self.documents:
            doc_vector = doc["vector"]
            # Cosine similarity
            dot_product = sum(q * d for q, d in zip(query_vector, doc_vector))
            q_mag = math.sqrt(sum(q**2 for q in query_vector))
            d_mag = math.sqrt(sum(d**2 for d in doc_vector))
            
            similarity = 0.0
            if q_mag > 0 and d_mag > 0:
                similarity = dot_product / (q_mag * d_mag)
                
            scored_docs.append((doc, similarity))
            
        # Sort by similarity descending
        scored_docs.sort(key=lambda x: x[1], reverse=True)
        return [item[0] for item in scored_docs[:k]]

def datetime_now_timestamp():
    import time
    return int(time.time())

# Main collection reference
try:
    import chromadb
    CHROMA_AVAILABLE = True
except ImportError:
    CHROMA_AVAILABLE = False

class GuidePilotVectorStore:
    def __init__(self, collection_name="guidepilot"):
        self.collection_name = collection_name
        self.use_chroma = CHROMA_AVAILABLE
        self.db = None
        self.collection = None
        
        if self.use_chroma:
            try:
                self.db = chromadb.PersistentClient(path=config.VECTOR_STORE_PATH)
                self.collection = self.db.get_or_create_collection(name=collection_name)
            except Exception as e:
                print(f"ChromaDB failed to initialize: {e}. Falling back to LightVectorStore.")
                self.use_chroma = False
                
        if not self.use_chroma:
            self.fallback_store = LightVectorStore(collection_name)

    def add_documents(self, texts, metadatas=None):
        if self.use_chroma:
            try:
                ids = [f"id_{i}_{int(datetime_now_timestamp())}" for i in range(len(texts))]
                self.collection.add(
                    documents=texts,
                    metadatas=metadatas,
                    ids=ids
                )
            except Exception as e:
                print(f"ChromaDB add error: {e}. Writing to fallback store.")
                self.fallback_store.add_texts(texts, metadatas)
        else:
            self.fallback_store.add_texts(texts, metadatas)

    def search(self, query, limit=3):
        if self.use_chroma:
            try:
                results = self.collection.query(
                    query_texts=[query],
                    n_results=limit
                )
                output = []
                if results and 'documents' in results and results['documents']:
                    docs = results['documents'][0]
                    metas = results['metadatas'][0] if 'metadatas' in results else [{}] * len(docs)
                    for text, meta in zip(docs, metas):
                        output.append({"text": text, "metadata": meta})
                return output
            except Exception as e:
                print(f"ChromaDB query error: {e}. Querying fallback store.")
                return self.fallback_store.similarity_search(query, limit)
        else:
            return self.fallback_store.similarity_search(query, limit)

    def clear(self):
        if self.use_chroma:
            try:
                self.db.delete_collection(self.collection_name)
                self.collection = self.db.get_or_create_collection(self.collection_name)
            except Exception:
                pass
        else:
            self.fallback_store.documents = []
            self.fallback_store.save()
