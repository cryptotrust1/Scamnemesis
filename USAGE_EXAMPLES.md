# Usage Examples - Duplicate Detection System

Practical examples of using the duplicate detection system.

---

## Table of Contents

1. [API Examples](#api-examples)
2. [TypeScript Integration](#typescript-integration)
3. [Python Integration](#python-integration)
4. [Admin UI Examples](#admin-ui-examples)
5. [Common Scenarios](#common-scenarios)

---

## API Examples

### 1. Submit a New Report

```bash
curl -X POST http://localhost:3000/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "scammer_name": "Ján Novák",
    "company_name": "Fake Investment s.r.o.",
    "phone": "+421 911 123 456",
    "email": "jan.novak@fake-investment.sk",
    "iban": "SK31 1200 0000 1987 4263 7541",
    "description": "Ponúkali investíciu s garantovaným výnosom 20% mesačne. Po vložení peňazí prestali odpovedať.",
    "amount_lost": 5000,
    "currency": "EUR",
    "address": "Hlavná 123, 841 01 Bratislava"
  }'
```

**Response:**

```json
{
  "success": true,
  "report_id": "550e8400-e29b-41d4-a716-446655440000",
  "duplicates": {
    "found": true,
    "cluster_id": "660e8400-e29b-41d4-a716-446655440000",
    "match_count": 2,
    "confidence": 0.92
  }
}
```

### 2. Get Duplicate Clusters

```bash
curl -X GET "http://localhost:3000/api/admin/duplicates?filter=high&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "cluster-123",
      "primary_report_id": "report-456",
      "total_reports": 4,
      "avg_confidence": 0.92,
      "is_reviewed": false,
      "merge_status": "pending",
      "created_at": "2025-12-01T10:00:00Z",
      "primary_report": {
        "scammer_name": "Ján Novák",
        "phone": "+421911123456",
        "email": "jan.novak@example.com"
      },
      "matches": [
        {
          "report_id_2": "report-457",
          "match_type": "exact",
          "confidence": 1.0,
          "matched_fields": ["phone", "email"]
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

### 3. Merge Cluster

```bash
curl -X POST http://localhost:3000/api/admin/duplicates/cluster-123/merge \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "admin_user_id": "admin-789"
  }'
```

### 4. Unlink Report from Cluster

```bash
curl -X POST http://localhost:3000/api/admin/duplicates/cluster-123/unlink \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "report_id": "report-457",
    "admin_user_id": "admin-789"
  }'
```

### 5. Generate Embedding (ML Service)

```bash
curl -X POST http://localhost:8000/api/v1/embeddings/generate \
  -H "Content-Type: application/json" \
  -d '{
    "report": {
      "scammer_name": "Ján Novák",
      "description": "Falošná investícia do kryptomien",
      "address": "Hlavná 123, Bratislava"
    }
  }'
```

**Response:**

```json
{
  "success": true,
  "embedding": [0.123, -0.456, 0.789, ...],  // 384 values
  "text": "Meno: Ján Novák | Popis: Falošná investícia do kryptomien | Adresa: Hlavná 123, Bratislava",
  "dimension": 384
}
```

### 6. Compute Image Hash

```bash
curl -X POST http://localhost:8000/api/v1/images/compute-hash \
  -H "Content-Type: application/json" \
  -d '{
    "image_url": "https://example.com/scammer-profile.jpg"
  }'
```

**Response:**

```json
{
  "success": true,
  "hashes": {
    "phash": "8f8f8f8f8f8f8f8f",
    "ahash": "ffffffffffffffff",
    "dhash": "0000000000000000",
    "whash": "1234567890abcdef",
    "width": 800,
    "height": 600,
    "format": "jpg"
  }
}
```

---

## TypeScript Integration

### Using the Duplicate Detection Service

```typescript
// src/services/duplicate-detection-service.ts

import { normalizeAllFields } from '@/lib/duplicate-detection/normalizers';
import { matchNames } from '@/lib/duplicate-detection/fuzzy-matchers';
import { DEFAULT_THRESHOLDS } from '@/lib/duplicate-detection/config';
import { db } from '@/lib/db';
import axios from 'axios';

export class DuplicateDetectionService {
  private mlServiceUrl: string;

  constructor(mlServiceUrl: string = process.env.ML_SERVICE_URL || 'http://localhost:8000') {
    this.mlServiceUrl = mlServiceUrl;
  }

  /**
   * Check for duplicates when submitting a new report
   */
  async checkForDuplicates(reportData: any): Promise<{
    hasDuplicates: boolean;
    matches: any[];
    clusterId?: string;
  }> {
    // 1. Normalize fields
    const normalized = normalizeAllFields(reportData);

    // 2. Check for exact matches
    const exactMatches = await this.findExactMatches(normalized);

    if (exactMatches.length > 0) {
      return {
        hasDuplicates: true,
        matches: exactMatches,
      };
    }

    // 3. Generate embedding for fuzzy matching
    const embedding = await this.generateEmbedding(reportData);

    // 4. Find similar reports using vector search
    const vectorMatches = await this.findVectorSimilar(embedding);

    // 5. Apply fuzzy name matching
    const fuzzyMatches = await this.fuzzyMatchNames(reportData.scammer_name, vectorMatches);

    return {
      hasDuplicates: fuzzyMatches.length > 0,
      matches: fuzzyMatches,
    };
  }

  /**
   * Find exact matches using normalized fields
   */
  private async findExactMatches(normalized: any): Promise<any[]> {
    const matches: any[] = [];

    // Check each normalized field
    for (const [field, value] of Object.entries(normalized)) {
      if (!value) continue;

      const results = await db.normalizedFields.findMany({
        where: { [field]: value },
        include: { report: true },
      });

      matches.push(...results);
    }

    return matches;
  }

  /**
   * Generate embedding via ML service
   */
  private async generateEmbedding(reportData: any): Promise<number[]> {
    try {
      const response = await axios.post(`${this.mlServiceUrl}/api/v1/embeddings/generate`, {
        report: {
          scammer_name: reportData.scammer_name,
          company_name: reportData.company_name,
          description: reportData.description,
          address: reportData.address,
          city: reportData.city,
          website: reportData.website,
          email: reportData.email,
        },
      });

      return response.data.embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  }

  /**
   * Find similar reports using vector search
   */
  private async findVectorSimilar(embedding: number[]): Promise<any[]> {
    const embeddingStr = `[${embedding.join(',')}]`;

    const results = await db.$queryRaw`
      SELECT
        id,
        scammer_name,
        company_name,
        description,
        1 - (embedding <=> ${embeddingStr}::vector) as similarity
      FROM fraud_reports
      WHERE 1 - (embedding <=> ${embeddingStr}::vector) > 0.85
      ORDER BY embedding <=> ${embeddingStr}::vector
      LIMIT 50
    `;

    return results as any[];
  }

  /**
   * Apply fuzzy name matching to filter results
   */
  private async fuzzyMatchNames(targetName: string, candidates: any[]): Promise<any[]> {
    const matches: any[] = [];

    for (const candidate of candidates) {
      const nameMatch = matchNames(targetName, candidate.scammer_name, DEFAULT_THRESHOLDS);

      if (nameMatch.isMatch) {
        matches.push({
          ...candidate,
          nameMatchConfidence: nameMatch.confidence,
          nameMatchDetails: nameMatch.methods,
        });
      }
    }

    return matches;
  }

  /**
   * Check if two images are duplicates
   */
  async checkImageDuplicate(imageUrl1: string, imageUrl2: string): Promise<boolean> {
    try {
      // Compute hashes for both images
      const [hashes1, hashes2] = await Promise.all([
        this.computeImageHash(imageUrl1),
        this.computeImageHash(imageUrl2),
      ]);

      // Compare hashes
      const response = await axios.post(`${this.mlServiceUrl}/api/v1/images/compare`, {
        hashes1: hashes1.hashes,
        hashes2: hashes2.hashes,
        threshold: 10,
      });

      return response.data.is_duplicate;
    } catch (error) {
      console.error('Error checking image duplicate:', error);
      return false;
    }
  }

  private async computeImageHash(imageUrl: string): Promise<any> {
    const response = await axios.post(`${this.mlServiceUrl}/api/v1/images/compute-hash`, {
      image_url: imageUrl,
    });

    return response.data;
  }
}

// Usage example
const service = new DuplicateDetectionService();

const reportData = {
  scammer_name: 'Ján Novák',
  phone: '+421 911 123 456',
  email: 'jan.novak@example.com',
  description: 'Falošná investícia',
};

const result = await service.checkForDuplicates(reportData);

if (result.hasDuplicates) {
  console.log(`Found ${result.matches.length} potential duplicates`);
}
```

---

## Python Integration

### Using the Embedding Service

```python
# example_usage.py

import asyncio
import aiohttp
from typing import List, Dict

class DuplicateDetectionClient:
    """Client for interacting with duplicate detection services"""

    def __init__(self, ml_service_url: str = "http://localhost:8000"):
        self.ml_service_url = ml_service_url

    async def check_duplicates(self, report_data: Dict) -> Dict:
        """Check for duplicates using ML service"""

        # Generate embedding
        embedding = await self.generate_embedding(report_data)

        # Find similar reports (this would query your database)
        similar_reports = await self.find_similar_reports(embedding)

        return {
            "has_duplicates": len(similar_reports) > 0,
            "matches": similar_reports
        }

    async def generate_embedding(self, report_data: Dict) -> List[float]:
        """Generate embedding for report"""

        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.ml_service_url}/api/v1/embeddings/generate",
                json={"report": report_data}
            ) as response:
                data = await response.json()
                return data["embedding"]

    async def find_similar_reports(self, embedding: List[float]) -> List[Dict]:
        """Find similar reports (mock implementation)"""

        # In production, this would query your database
        # For now, return empty list
        return []

    async def compute_image_hash(self, image_url: str) -> Dict:
        """Compute perceptual hash for image"""

        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.ml_service_url}/api/v1/images/compute-hash",
                json={"image_url": image_url}
            ) as response:
                data = await response.json()
                return data["hashes"]

    async def compare_images(
        self,
        hashes1: Dict[str, str],
        hashes2: Dict[str, str],
        threshold: int = 10
    ) -> bool:
        """Compare two image hashes"""

        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.ml_service_url}/api/v1/images/compare",
                json={
                    "hashes1": hashes1,
                    "hashes2": hashes2,
                    "threshold": threshold
                }
            ) as response:
                data = await response.json()
                return data["is_duplicate"]


# Example usage
async def main():
    client = DuplicateDetectionClient()

    # Check for duplicates
    report = {
        "scammer_name": "Ján Novák",
        "description": "Ponúkali falošnú investíciu do kryptomien",
        "address": "Hlavná 123, Bratislava"
    }

    result = await client.check_duplicates(report)
    print(f"Has duplicates: {result['has_duplicates']}")

    # Check image similarity
    image1_hash = await client.compute_image_hash("https://example.com/image1.jpg")
    image2_hash = await client.compute_image_hash("https://example.com/image2.jpg")

    is_duplicate = await client.compare_images(image1_hash, image2_hash)
    print(f"Images are duplicates: {is_duplicate}")


if __name__ == "__main__":
    asyncio.run(main())
```

---

## Admin UI Examples

### React Component for Duplicate Review

```tsx
// components/admin/DuplicateReview.tsx

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface DuplicateCluster {
  id: string;
  primaryReport: any;
  linkedReports: any[];
  avgConfidence: number;
}

export function DuplicateReview({ cluster }: { cluster: DuplicateCluster }) {
  const [loading, setLoading] = useState(false);

  const handleMerge = async () => {
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/duplicates/${cluster.id}/merge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_user_id: 'current-user-id' }),
      });

      if (response.ok) {
        alert('Cluster merged successfully');
        // Reload data
      }
    } catch (error) {
      console.error('Error merging cluster:', error);
      alert('Failed to merge cluster');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlink = async (reportId: string) => {
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/duplicates/${cluster.id}/unlink`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report_id: reportId,
          admin_user_id: 'current-user-id',
        }),
      });

      if (response.ok) {
        alert('Report unlinked successfully');
        // Reload data
      }
    } catch (error) {
      console.error('Error unlinking report:', error);
      alert('Failed to unlink report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-4">
        Cluster #{cluster.id} - Confidence: {(cluster.avgConfidence * 100).toFixed(0)}%
      </h3>

      {/* Primary Report */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold mb-2">Primary Report</h4>
        <div className="text-sm">
          <div><strong>Name:</strong> {cluster.primaryReport.scammerName}</div>
          <div><strong>Phone:</strong> {cluster.primaryReport.phone}</div>
          <div><strong>Email:</strong> {cluster.primaryReport.email}</div>
        </div>
      </div>

      {/* Linked Reports */}
      <div className="space-y-3">
        <h4 className="font-semibold">Linked Reports ({cluster.linkedReports.length})</h4>

        {cluster.linkedReports.map((report) => (
          <Card key={report.id} className="p-4 bg-gray-50">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="text-sm space-y-1">
                  <div><strong>Name:</strong> {report.scammerName}</div>
                  <div><strong>Phone:</strong> {report.phone}</div>
                  <div><strong>Confidence:</strong> {(report.confidence * 100).toFixed(0)}%</div>
                  <div className="text-xs text-gray-600">
                    Matched: {report.matchedFields.join(', ')}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUnlink(report.id)}
                  disabled={loading}
                >
                  Unlink
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-3">
        <Button onClick={handleMerge} disabled={loading}>
          Merge All into Primary
        </Button>
        <Button variant="outline" disabled={loading}>
          Mark as Reviewed
        </Button>
      </div>
    </Card>
  );
}
```

---

## Common Scenarios

### Scenario 1: Bulk Import with Duplicate Detection

```typescript
// scripts/bulk-import.ts

import { DuplicateDetectionService } from '@/services/duplicate-detection-service';
import { db } from '@/lib/db';

async function bulkImportWithDuplicateCheck(reports: any[]) {
  const service = new DuplicateDetectionService();
  const results = {
    imported: 0,
    duplicates: 0,
    errors: 0,
  };

  for (const reportData of reports) {
    try {
      // Check for duplicates
      const duplicateCheck = await service.checkForDuplicates(reportData);

      if (duplicateCheck.hasDuplicates) {
        console.log(`Skipping duplicate: ${reportData.scammer_name}`);
        results.duplicates++;
        continue;
      }

      // Import report
      await db.fraudReport.create({
        data: {
          ...reportData,
          status: 'verified', // Bulk imports are pre-verified
        },
      });

      results.imported++;
    } catch (error) {
      console.error(`Error importing report: ${error}`);
      results.errors++;
    }
  }

  return results;
}
```

### Scenario 2: Automated Duplicate Merging

```typescript
// scripts/auto-merge-high-confidence.ts

async function autoMergeHighConfidence() {
  // Get high-confidence unreviewed clusters
  const clusters = await db.duplicateCluster.findMany({
    where: {
      isReviewed: false,
      avgConfidence: { gte: 0.95 },
    },
    include: {
      primaryReport: true,
      matches: true,
    },
  });

  console.log(`Found ${clusters.length} high-confidence clusters to merge`);

  for (const cluster of clusters) {
    try {
      // Merge cluster
      await mergeCluster(cluster.id, 'system-auto-merge');

      console.log(`Merged cluster ${cluster.id}`);
    } catch (error) {
      console.error(`Error merging cluster ${cluster.id}:`, error);
    }
  }
}

async function mergeCluster(clusterId: string, adminUserId: string) {
  await db.$transaction(async (tx) => {
    // Update cluster status
    await tx.duplicateCluster.update({
      where: { id: clusterId },
      data: {
        mergeStatus: 'merged',
        isReviewed: true,
        reviewedBy: adminUserId,
        reviewedAt: new Date(),
      },
    });

    // Update reports
    const cluster = await tx.duplicateCluster.findUnique({
      where: { id: clusterId },
    });

    await tx.fraudReport.updateMany({
      where: {
        id: { in: cluster!.reportIds.filter((id) => id !== cluster!.primaryReportId) },
      },
      data: {
        status: 'merged',
        mergedIntoId: cluster!.primaryReportId,
      },
    });
  });
}
```

### Scenario 3: Generate Similarity Report

```typescript
// scripts/similarity-report.ts

async function generateSimilarityReport(reportId: string) {
  const service = new DuplicateDetectionService();

  // Get report
  const report = await db.fraudReport.findUnique({
    where: { id: reportId },
  });

  if (!report) {
    throw new Error('Report not found');
  }

  // Find duplicates
  const duplicates = await service.checkForDuplicates(report);

  // Generate report
  const similarityReport = {
    reportId,
    scammerName: report.scammerName,
    checkedAt: new Date().toISOString(),
    totalMatches: duplicates.matches.length,
    matches: duplicates.matches.map((match) => ({
      matchId: match.id,
      matchType: match.matchType,
      confidence: match.confidence,
      matchedFields: match.matchedFields,
      details: {
        name: match.scammerName,
        phone: match.phone,
        email: match.email,
        similarity: match.similarity,
      },
    })),
  };

  // Save to file
  const fs = require('fs');
  fs.writeFileSync(
    `similarity-report-${reportId}.json`,
    JSON.stringify(similarityReport, null, 2)
  );

  console.log(`Similarity report saved for ${reportId}`);
}
```

---

## Performance Benchmarks

### Expected Performance

| Operation | Latency (p50) | Latency (p99) | Throughput |
|-----------|---------------|---------------|------------|
| Exact match check | 20ms | 50ms | 500 req/s |
| Vector search (pgvector) | 100ms | 300ms | 100 req/s |
| Embedding generation | 150ms | 400ms | 50 req/s |
| Image hash computation | 500ms | 2s | 20 req/s |
| Fuzzy name matching | 10ms | 30ms | 1000 req/s |

### Optimization Tips

1. **Use caching** for frequently accessed embeddings
2. **Batch process** multiple reports together
3. **Index optimization** for vector search (tune HNSW parameters)
4. **Connection pooling** for database
5. **Async processing** for image hashing

---

For more examples and documentation, see:
- [DUPLICATE_DETECTION_SYSTEM.md](./DUPLICATE_DETECTION_SYSTEM.md) - Complete system specification
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Installation and deployment guide
