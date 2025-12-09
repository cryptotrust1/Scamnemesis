"""
Image duplicate detection using perceptual hashing

Supports multiple hash types:
- pHash: Robust to scaling, aspect ratio, color changes
- aHash: Fast, good for exact duplicates
- dHash: Good for detecting gradients/edges
- wHash: Wavelet-based hash
"""

from PIL import Image
import imagehash
from typing import Dict, Tuple, List, Optional
import io
import requests
from pathlib import Path
import logging

logger = logging.getLogger(__name__)


class ImageDuplicateDetector:
    """
    Detect duplicate/similar images using perceptual hashing

    Hash types:
    - pHash (Perceptual): Most robust, recommended for primary matching
    - aHash (Average): Fast, good for basic duplicates
    - dHash (Difference): Good for edge detection
    - wHash (Wavelet): Sophisticated, CPU-intensive
    """

    def __init__(self, hash_size: int = 8):
        """
        Initialize image duplicate detector

        Args:
            hash_size: Size of hash (8 = 64-bit hash, 16 = 256-bit hash)
                      Larger = more precise but slower
        """
        self.hash_size = hash_size
        logger.info(f"ImageDuplicateDetector initialized with hash_size={hash_size}")

    def load_image(self, image_source: str) -> Optional[Image.Image]:
        """
        Load image from file path or URL

        Args:
            image_source: Local file path or HTTP(S) URL

        Returns:
            PIL Image object or None if loading failed
        """
        try:
            if image_source.startswith(("http://", "https://")):
                # Load from URL
                logger.debug(f"Loading image from URL: {image_source}")
                response = requests.get(image_source, timeout=10)
                response.raise_for_status()
                img = Image.open(io.BytesIO(response.content))
            else:
                # Load from file
                logger.debug(f"Loading image from file: {image_source}")
                img = Image.open(image_source)

            # Convert to RGB if necessary (handle RGBA, grayscale, etc.)
            if img.mode not in ("RGB", "L"):
                img = img.convert("RGB")

            return img

        except Exception as e:
            logger.error(f"Error loading image {image_source}: {e}")
            return None

    def compute_image_hashes(self, image_source: str) -> Dict[str, str]:
        """
        Compute multiple perceptual hashes for an image

        Args:
            image_source: Local path or URL to image

        Returns:
            Dictionary with hash types and their hex values
            Example: {'phash': 'a1b2c3d4...', 'ahash': '...', ...}
        """
        img = self.load_image(image_source)

        if img is None:
            return {}

        try:
            # Compute all hash types
            p_hash = imagehash.phash(img, hash_size=self.hash_size)
            a_hash = imagehash.average_hash(img, hash_size=self.hash_size)
            d_hash = imagehash.dhash(img, hash_size=self.hash_size)
            w_hash = imagehash.whash(img, hash_size=self.hash_size)

            # Get image metadata
            width, height = img.size
            format_name = img.format or "unknown"

            hashes = {
                "phash": str(p_hash),
                "ahash": str(a_hash),
                "dhash": str(d_hash),
                "whash": str(w_hash),
                "width": width,
                "height": height,
                "format": format_name.lower(),
            }

            logger.debug(f"Computed hashes for {image_source}: {hashes}")
            return hashes

        except Exception as e:
            logger.error(f"Error computing hashes for {image_source}: {e}")
            return {}

    def hamming_distance(self, hash1: str, hash2: str) -> int:
        """
        Calculate Hamming distance between two hash strings
        (Number of differing bits)

        Args:
            hash1, hash2: Hash strings in hex format

        Returns:
            Hamming distance (0 = identical, higher = more different)
        """
        try:
            h1 = imagehash.hex_to_hash(hash1)
            h2 = imagehash.hex_to_hash(hash2)
            return h1 - h2  # imagehash overloads - operator for Hamming distance
        except Exception as e:
            logger.error(f"Error calculating Hamming distance: {e}")
            return 999  # Return large number to indicate error

    def compare_images(
        self,
        hashes1: Dict[str, str],
        hashes2: Dict[str, str],
        threshold: int = 10,
    ) -> Tuple[bool, Dict[str, int], float]:
        """
        Compare two sets of image hashes

        Args:
            hashes1, hashes2: Hash dictionaries from compute_image_hashes()
            threshold: Max Hamming distance to consider as duplicate

        Returns:
            Tuple of (is_duplicate, distances_dict, weighted_score)
        """
        if not hashes1 or not hashes2:
            return False, {}, 999.0

        distances = {}

        # Calculate Hamming distance for each hash type
        for hash_type in ["phash", "ahash", "dhash", "whash"]:
            if hash_type in hashes1 and hash_type in hashes2:
                dist = self.hamming_distance(hashes1[hash_type], hashes2[hash_type])
                distances[hash_type] = dist

        if not distances:
            return False, {}, 999.0

        # Calculate weighted score (pHash is most reliable)
        weights = {
            "phash": 0.5,  # Perceptual hash - most important
            "dhash": 0.3,  # Difference hash - good for edges
            "ahash": 0.15, # Average hash - fast but less reliable
            "whash": 0.05, # Wavelet hash - bonus if available
        }

        weighted_score = sum(
            distances.get(hash_type, 100) * weight
            for hash_type, weight in weights.items()
        )

        # Consider duplicate if weighted score is below threshold
        is_duplicate = weighted_score <= threshold

        return is_duplicate, distances, weighted_score

    def find_duplicate_images(
        self,
        target_hashes: Dict[str, str],
        candidate_list: List[Dict],
        threshold: int = 10,
    ) -> List[Dict]:
        """
        Find duplicate images from a list of candidates

        Args:
            target_hashes: Hashes of the image to check
            candidate_list: List of dicts with 'id' and 'hashes' keys
            threshold: Hamming distance threshold

        Returns:
            List of matching candidates with similarity scores
            Sorted by weighted_score (lower = more similar)
        """
        duplicates = []

        for candidate in candidate_list:
            is_dup, distances, weighted_score = self.compare_images(
                target_hashes, candidate.get("hashes", {}), threshold
            )

            if is_dup:
                duplicates.append(
                    {
                        "id": candidate["id"],
                        "distances": distances,
                        "weighted_score": weighted_score,
                        "avg_distance": (
                            sum(distances.values()) / len(distances)
                            if distances
                            else 999
                        ),
                    }
                )

        # Sort by weighted score (lower = more similar)
        duplicates.sort(key=lambda x: x["weighted_score"])

        return duplicates

    def batch_compute_hashes(
        self, image_sources: List[str]
    ) -> List[Dict[str, str]]:
        """
        Compute hashes for multiple images

        Args:
            image_sources: List of image paths or URLs

        Returns:
            List of hash dictionaries
        """
        results = []

        for source in image_sources:
            hashes = self.compute_image_hashes(source)
            results.append(hashes)

        return results

    def is_near_duplicate(
        self, image1: str, image2: str, threshold: int = 10
    ) -> bool:
        """
        Quick check if two images are near-duplicates

        Args:
            image1, image2: Image paths or URLs
            threshold: Hamming distance threshold

        Returns:
            True if images are duplicates
        """
        hashes1 = self.compute_image_hashes(image1)
        hashes2 = self.compute_image_hashes(image2)

        is_dup, _, _ = self.compare_images(hashes1, hashes2, threshold)
        return is_dup


# Singleton instance
_image_detector: Optional[ImageDuplicateDetector] = None


def get_image_detector(hash_size: int = 8) -> ImageDuplicateDetector:
    """
    Get or create singleton image detector instance

    Args:
        hash_size: Hash size (default 8)

    Returns:
        ImageDuplicateDetector instance
    """
    global _image_detector

    if _image_detector is None:
        _image_detector = ImageDuplicateDetector(hash_size=hash_size)

    return _image_detector


# Example usage and testing
if __name__ == "__main__":
    import sys

    logging.basicConfig(level=logging.INFO)

    # Test with sample images
    detector = ImageDuplicateDetector(hash_size=8)

    # Example 1: Compare two images
    if len(sys.argv) >= 3:
        image1_path = sys.argv[1]
        image2_path = sys.argv[2]

        print(f"Comparing:\n  {image1_path}\n  {image2_path}")

        hashes1 = detector.compute_image_hashes(image1_path)
        hashes2 = detector.compute_image_hashes(image2_path)

        print(f"\nHashes 1: {hashes1}")
        print(f"Hashes 2: {hashes2}")

        is_dup, distances, weighted_score = detector.compare_images(
            hashes1, hashes2, threshold=10
        )

        print(f"\nIs duplicate: {is_dup}")
        print(f"Distances: {distances}")
        print(f"Weighted score: {weighted_score:.2f}")
        print(
            f"Average distance: {sum(distances.values()) / len(distances):.2f}"
            if distances
            else "N/A"
        )

    else:
        print("Usage: python image_hashing.py <image1> <image2>")
        print("\nExample:")
        print("  python image_hashing.py ./image1.jpg ./image2.jpg")
        print("  python image_hashing.py https://example.com/img1.jpg ./local.jpg")

        # Demo with synthetic example
        print("\n--- Demo Mode ---")
        print("Testing hash computation on sample data...")

        # In real usage, you would provide actual image paths
        print(
            "To test with actual images, run:"
        )
        print("  python image_hashing.py path/to/image1.jpg path/to/image2.jpg")
