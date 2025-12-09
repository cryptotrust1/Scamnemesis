"""
Text embedding service using sentence-transformers
Model: paraphrase-multilingual-MiniLM-L12-v2
Supports: 50+ languages including Slovak, Czech, English
"""

from sentence_transformers import SentenceTransformer
import numpy as np
from typing import List, Dict, Optional, Tuple
import torch
import logging

logger = logging.getLogger(__name__)


class EmbeddingService:
    """
    Service for generating and comparing text embeddings

    Model: sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
    Embedding dimension: 384
    Max sequence length: 128 tokens
    """

    def __init__(
        self,
        model_name: str = "paraphrase-multilingual-MiniLM-L12-v2",
        cache_dir: Optional[str] = None
    ):
        """
        Initialize embedding service

        Args:
            model_name: HuggingFace model name
            cache_dir: Directory to cache downloaded models
        """
        logger.info(f"Loading embedding model: {model_name}")

        self.model_name = model_name
        self.device = "cuda" if torch.cuda.is_available() else "cpu"

        self.model = SentenceTransformer(model_name, cache_folder=cache_dir)
        self.model.to(self.device)

        self.embedding_dim = self.model.get_sentence_embedding_dimension()

        logger.info(
            f"Model loaded on {self.device}. Embedding dimension: {self.embedding_dim}"
        )

    def create_report_text(self, report: Dict) -> str:
        """
        Combine report fields into single text for embedding

        Args:
            report: Dictionary with report fields

        Returns:
            Combined text string
        """
        parts = []

        # Add name (highest weight in similarity)
        if report.get("scammer_name"):
            parts.append(f"Meno: {report['scammer_name']}")

        if report.get("company_name"):
            parts.append(f"Firma: {report['company_name']}")

        # Add description (most informative field)
        if report.get("description"):
            # Truncate long descriptions to avoid token limit
            description = report["description"]
            if len(description) > 500:
                description = description[:500] + "..."
            parts.append(f"Popis: {description}")

        # Add location info
        if report.get("address"):
            parts.append(f"Adresa: {report['address']}")

        if report.get("city"):
            parts.append(f"Mesto: {report['city']}")

        # Add contact info (for semantic matching)
        if report.get("website"):
            parts.append(f"Web: {report['website']}")

        if report.get("email"):
            # Include email domain for similarity
            parts.append(f"Email: {report['email']}")

        # Add scam type if available
        if report.get("scam_type"):
            parts.append(f"Typ: {report['scam_type']}")

        return " | ".join(parts)

    def generate_embedding(self, text: str) -> np.ndarray:
        """
        Generate embedding vector for text

        Args:
            text: Input text

        Returns:
            384-dimensional embedding vector
        """
        if not text or len(text.strip()) == 0:
            # Return zero vector for empty text
            return np.zeros(self.embedding_dim, dtype=np.float32)

        embedding = self.model.encode(
            text,
            convert_to_numpy=True,
            normalize_embeddings=True,  # L2 normalization
            show_progress_bar=False,
        )

        return embedding

    def batch_generate_embeddings(
        self, texts: List[str], batch_size: int = 32
    ) -> np.ndarray:
        """
        Generate embeddings for multiple texts efficiently

        Args:
            texts: List of input texts
            batch_size: Batch size for encoding

        Returns:
            Array of embeddings (N x 384)
        """
        # Replace empty texts with placeholder
        processed_texts = [
            text if text and len(text.strip()) > 0 else "[empty]" for text in texts
        ]

        embeddings = self.model.encode(
            processed_texts,
            convert_to_numpy=True,
            normalize_embeddings=True,
            batch_size=batch_size,
            show_progress_bar=len(texts) > 100,
        )

        return embeddings

    def cosine_similarity(
        self, embedding1: np.ndarray, embedding2: np.ndarray
    ) -> float:
        """
        Calculate cosine similarity between two embeddings

        Args:
            embedding1, embedding2: Embedding vectors

        Returns:
            Similarity score between 0 and 1 (since vectors are normalized)
        """
        # If embeddings are L2-normalized, cosine similarity = dot product
        dot_product = np.dot(embedding1, embedding2)

        # Clamp to [0, 1] range (account for floating point errors)
        return float(np.clip(dot_product, 0.0, 1.0))

    def batch_cosine_similarity(
        self, embedding1: np.ndarray, embeddings: np.ndarray
    ) -> np.ndarray:
        """
        Calculate cosine similarity between one embedding and multiple embeddings

        Args:
            embedding1: Single embedding vector (384,)
            embeddings: Multiple embeddings (N x 384)

        Returns:
            Array of similarity scores (N,)
        """
        # Matrix multiplication for efficiency
        similarities = np.dot(embeddings, embedding1)

        # Clamp to [0, 1]
        return np.clip(similarities, 0.0, 1.0)

    def find_similar_reports(
        self,
        query_embedding: np.ndarray,
        candidate_embeddings: List[np.ndarray],
        candidate_ids: List[str],
        threshold: float = 0.85,
        top_k: Optional[int] = None,
    ) -> List[Tuple[str, float]]:
        """
        Find reports with similarity above threshold

        Args:
            query_embedding: Embedding of query report
            candidate_embeddings: List of candidate embeddings
            candidate_ids: List of candidate report IDs
            threshold: Minimum similarity threshold
            top_k: Return only top K results (optional)

        Returns:
            List of (report_id, similarity_score) tuples, sorted by similarity
        """
        if len(candidate_embeddings) == 0:
            return []

        # Convert to numpy array for batch processing
        embeddings_array = np.array(candidate_embeddings)

        # Batch compute similarities
        similarities = self.batch_cosine_similarity(query_embedding, embeddings_array)

        # Filter by threshold and create result list
        results = [
            (candidate_ids[i], float(similarities[i]))
            for i in range(len(similarities))
            if similarities[i] >= threshold
        ]

        # Sort by similarity descending
        results.sort(key=lambda x: x[1], reverse=True)

        # Return top K if specified
        if top_k is not None:
            results = results[:top_k]

        return results

    def compute_centroid(self, embeddings: List[np.ndarray]) -> np.ndarray:
        """
        Compute centroid (average) of multiple embeddings
        Useful for representing a cluster of reports

        Args:
            embeddings: List of embedding vectors

        Returns:
            Centroid embedding vector
        """
        if len(embeddings) == 0:
            return np.zeros(self.embedding_dim, dtype=np.float32)

        embeddings_array = np.array(embeddings)
        centroid = np.mean(embeddings_array, axis=0)

        # Re-normalize
        norm = np.linalg.norm(centroid)
        if norm > 0:
            centroid = centroid / norm

        return centroid


# Singleton instance
_embedding_service: Optional[EmbeddingService] = None


def get_embedding_service() -> EmbeddingService:
    """
    Get or create singleton embedding service instance

    Returns:
        EmbeddingService instance
    """
    global _embedding_service

    if _embedding_service is None:
        _embedding_service = EmbeddingService()

    return _embedding_service


# Example usage
if __name__ == "__main__":
    # Test the embedding service
    service = EmbeddingService()

    # Test reports
    report1 = {
        "scammer_name": "Ján Novák",
        "description": "Ponúkal falošnú investíciu do kryptomien s garantovaným výnosom 20% mesačne.",
        "address": "Hlavná 123, Bratislava",
    }

    report2 = {
        "scammer_name": "Jan Novak",
        "description": "Sľuboval vysoké zisky z investície do Bitcoinu, nakoniec zmizol s peniazmi.",
        "address": "Hlavná 125, Bratislava",
    }

    report3 = {
        "scammer_name": "Peter Kováč",
        "description": "Predával neexistujúce autá cez inzerciu.",
        "address": "Mierová 45, Košice",
    }

    # Generate embeddings
    text1 = service.create_report_text(report1)
    text2 = service.create_report_text(report2)
    text3 = service.create_report_text(report3)

    emb1 = service.generate_embedding(text1)
    emb2 = service.generate_embedding(text2)
    emb3 = service.generate_embedding(text3)

    # Calculate similarities
    sim_1_2 = service.cosine_similarity(emb1, emb2)
    sim_1_3 = service.cosine_similarity(emb1, emb3)

    print(f"Similarity report1 <-> report2: {sim_1_2:.4f}")  # Should be high
    print(f"Similarity report1 <-> report3: {sim_1_3:.4f}")  # Should be low

    # Test batch similarity
    results = service.find_similar_reports(
        emb1, [emb2, emb3], ["report2", "report3"], threshold=0.7
    )
    print(f"\nSimilar reports to report1: {results}")
