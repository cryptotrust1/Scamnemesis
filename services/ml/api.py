"""
FastAPI REST API for ML services
Provides endpoints for embeddings and image hashing
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
import logging
import os

from embeddings import get_embedding_service
from image_hashing import get_image_detector

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Scamnemesis ML Service",
    description="Machine learning services for duplicate detection",
    version="1.0.0",
)

# Configure CORS - use environment variable for allowed origins
# Default to localhost for development, require explicit config for production
ALLOWED_ORIGINS = os.environ.get(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:8000"
).split(",")

# In production, ALLOWED_ORIGINS should be set to specific domains
# e.g., ALLOWED_ORIGINS=https://scamnemesis.com,https://api.scamnemesis.com
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in ALLOWED_ORIGINS],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],  # Only needed methods
    allow_headers=["Content-Type", "Authorization", "X-API-Key"],
)

# Initialize services on startup
@app.on_event("startup")
async def startup_event():
    logger.info("Initializing ML services...")
    get_embedding_service()  # Pre-load model
    get_image_detector()
    logger.info("ML services ready")


# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class ReportData(BaseModel):
    """Report data for embedding generation"""
    scammer_name: Optional[str] = None
    company_name: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    website: Optional[str] = None
    email: Optional[str] = None
    scam_type: Optional[str] = None


class EmbeddingRequest(BaseModel):
    """Request to generate embedding from report data"""
    report: ReportData


class TextEmbeddingRequest(BaseModel):
    """Request to generate embedding from raw text"""
    text: str = Field(..., min_length=1)


class BatchEmbeddingRequest(BaseModel):
    """Request to generate embeddings for multiple texts"""
    texts: List[str] = Field(..., min_items=1, max_items=1000)


class SimilarityRequest(BaseModel):
    """Request to compute similarity between two embeddings"""
    embedding1: List[float] = Field(..., min_items=384, max_items=384)
    embedding2: List[float] = Field(..., min_items=384, max_items=384)


class FindSimilarRequest(BaseModel):
    """Request to find similar reports"""
    query_embedding: List[float] = Field(..., min_items=384, max_items=384)
    candidate_embeddings: List[List[float]]
    candidate_ids: List[str]
    threshold: float = Field(0.85, ge=0.0, le=1.0)
    top_k: Optional[int] = Field(None, ge=1, le=100)


class ImageHashRequest(BaseModel):
    """Request to compute image hashes"""
    image_url: str = Field(..., min_length=1)


class ImageCompareRequest(BaseModel):
    """Request to compare two sets of image hashes"""
    hashes1: Dict[str, str]
    hashes2: Dict[str, str]
    threshold: int = Field(10, ge=0, le=64)


class BatchImageHashRequest(BaseModel):
    """Request to compute hashes for multiple images"""
    image_urls: List[str] = Field(..., min_items=1, max_items=100)


# ============================================================================
# EMBEDDING ENDPOINTS
# ============================================================================

@app.post("/api/v1/embeddings/generate")
async def generate_embedding(request: EmbeddingRequest):
    """
    Generate embedding vector from report data

    Returns:
        - embedding: 384-dimensional vector
        - text: The combined text that was embedded
    """
    try:
        service = get_embedding_service()

        # Create combined text from report
        text = service.create_report_text(request.report.dict())

        # Generate embedding
        embedding = service.generate_embedding(text)

        return {
            "success": True,
            "embedding": embedding.tolist(),
            "text": text,
            "dimension": len(embedding),
        }

    except Exception as e:
        logger.error(f"Error generating embedding: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/embeddings/generate-from-text")
async def generate_embedding_from_text(request: TextEmbeddingRequest):
    """
    Generate embedding vector from raw text

    Returns:
        - embedding: 384-dimensional vector
    """
    try:
        service = get_embedding_service()
        embedding = service.generate_embedding(request.text)

        return {
            "success": True,
            "embedding": embedding.tolist(),
            "dimension": len(embedding),
        }

    except Exception as e:
        logger.error(f"Error generating embedding: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/embeddings/batch-generate")
async def batch_generate_embeddings(request: BatchEmbeddingRequest):
    """
    Generate embeddings for multiple texts in batch

    Returns:
        - embeddings: List of 384-dimensional vectors
    """
    try:
        service = get_embedding_service()
        embeddings = service.batch_generate_embeddings(request.texts)

        return {
            "success": True,
            "embeddings": embeddings.tolist(),
            "count": len(embeddings),
            "dimension": embeddings.shape[1],
        }

    except Exception as e:
        logger.error(f"Error generating batch embeddings: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/embeddings/similarity")
async def compute_similarity(request: SimilarityRequest):
    """
    Compute cosine similarity between two embeddings

    Returns:
        - similarity: Score between 0 and 1
    """
    try:
        import numpy as np

        service = get_embedding_service()

        emb1 = np.array(request.embedding1)
        emb2 = np.array(request.embedding2)

        similarity = service.cosine_similarity(emb1, emb2)

        return {
            "success": True,
            "similarity": float(similarity),
        }

    except Exception as e:
        logger.error(f"Error computing similarity: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/embeddings/find-similar")
async def find_similar(request: FindSimilarRequest):
    """
    Find similar reports from candidates

    Returns:
        - matches: List of (id, similarity) tuples
    """
    try:
        import numpy as np

        service = get_embedding_service()

        query_emb = np.array(request.query_embedding)
        candidate_embs = [np.array(emb) for emb in request.candidate_embeddings]

        matches = service.find_similar_reports(
            query_emb,
            candidate_embs,
            request.candidate_ids,
            request.threshold,
            request.top_k,
        )

        return {
            "success": True,
            "matches": [
                {"id": match_id, "similarity": score} for match_id, score in matches
            ],
            "count": len(matches),
        }

    except Exception as e:
        logger.error(f"Error finding similar reports: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# IMAGE HASHING ENDPOINTS
# ============================================================================

@app.post("/api/v1/images/compute-hash")
async def compute_image_hash(request: ImageHashRequest):
    """
    Compute perceptual hashes for an image

    Returns:
        - hashes: Dictionary with phash, ahash, dhash, whash
        - metadata: Image width, height, format
    """
    try:
        detector = get_image_detector()
        hashes = detector.compute_image_hashes(request.image_url)

        if not hashes:
            raise HTTPException(
                status_code=400, detail="Failed to compute hashes for image"
            )

        return {
            "success": True,
            "hashes": hashes,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error computing image hash: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/images/compare")
async def compare_images(request: ImageCompareRequest):
    """
    Compare two sets of image hashes

    Returns:
        - is_duplicate: Boolean
        - distances: Hamming distances for each hash type
        - weighted_score: Overall similarity score
    """
    try:
        detector = get_image_detector()

        is_dup, distances, weighted_score = detector.compare_images(
            request.hashes1, request.hashes2, request.threshold
        )

        avg_distance = (
            sum(distances.values()) / len(distances) if distances else None
        )

        return {
            "success": True,
            "is_duplicate": is_dup,
            "distances": distances,
            "weighted_score": float(weighted_score),
            "avg_distance": float(avg_distance) if avg_distance else None,
        }

    except Exception as e:
        logger.error(f"Error comparing images: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/images/batch-compute-hash")
async def batch_compute_hashes(request: BatchImageHashRequest):
    """
    Compute hashes for multiple images

    Returns:
        - results: List of hash dictionaries
    """
    try:
        detector = get_image_detector()
        results = detector.batch_compute_hashes(request.image_urls)

        return {
            "success": True,
            "results": results,
            "count": len(results),
        }

    except Exception as e:
        logger.error(f"Error computing batch hashes: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "ml-service",
        "version": "1.0.0",
    }


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Scamnemesis ML Service",
        "version": "1.0.0",
        "endpoints": {
            "embeddings": "/api/v1/embeddings/*",
            "images": "/api/v1/images/*",
            "health": "/health",
            "docs": "/docs",
        },
    }


# ============================================================================
# RUN SERVER
# ============================================================================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "api:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Enable auto-reload in development
        log_level="info",
    )
