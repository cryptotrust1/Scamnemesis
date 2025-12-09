# Test Plan - Scamnemesis

## 1. Testing Strategy

### 1.1 Testing Pyramid

```
                    ┌─────────────┐
                    │   E2E Tests │  (10%)
                    │  Playwright │
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │    Integration Tests    │  (30%)
              │   Supertest + Testcontainers
              └────────────┬────────────┘
                           │
         ┌─────────────────┴─────────────────┐
         │           Unit Tests              │  (60%)
         │    Jest + Vitest + pytest        │
         └───────────────────────────────────┘
```

### 1.2 Coverage Targets

| Type | Target Coverage | Critical Paths |
|------|-----------------|----------------|
| Unit | 80% | 95% |
| Integration | 70% | 90% |
| E2E | Key flows | 100% |

## 2. Unit Tests

### 2.1 Backend Unit Tests

```typescript
// tests/unit/services/masking.test.ts
import { MaskingService } from '@/services/masking';

describe('MaskingService', () => {
  let service: MaskingService;

  beforeEach(() => {
    service = new MaskingService({ salt: 'test-salt' });
  });

  describe('maskName', () => {
    it('should mask middle characters', () => {
      expect(service.maskName('Vladimir')).toBe('Vlxxxxr');
      expect(service.maskName('Vladimir Gala')).toBe('Vlxxxxr Gxa');
    });

    it('should handle short names', () => {
      expect(service.maskName('Jo')).toBe('Jo');
      expect(service.maskName('Joe')).toBe('Jxe');
    });

    it('should be deterministic', () => {
      const result1 = service.maskName('Vladimir');
      const result2 = service.maskName('Vladimir');
      expect(result1).toBe(result2);
    });
  });

  describe('maskPhone', () => {
    it('should mask middle 60% of digits', () => {
      expect(service.maskPhone('+421912345678')).toBe('+421 9** *** 678');
    });

    it('should handle different formats', () => {
      expect(service.maskPhone('0912 345 678')).toBe('09** *** 678');
    });
  });

  describe('maskEmail', () => {
    it('should keep first char and domain', () => {
      expect(service.maskEmail('john.doe@example.com')).toBe('j*****@example.com');
    });
  });

  describe('maskIBAN', () => {
    it('should show first 4 and last 2 chars', () => {
      expect(service.maskIBAN('SK8911000000002949129426'))
        .toBe('SK89 **** **** **** **** **26');
    });
  });
});
```

```typescript
// tests/unit/services/duplicateDetection.test.ts
import { DuplicateDetector } from '@/services/duplicateDetection';

describe('DuplicateDetector', () => {
  describe('exactMatch', () => {
    it('should detect exact phone match', async () => {
      const detector = new DuplicateDetector(mockDb);
      const result = await detector.checkExact({
        phone: '+421912345678'
      });
      expect(result.isExactMatch).toBe(true);
      expect(result.matchedFields).toContain('phone');
    });
  });

  describe('fuzzyMatch', () => {
    it('should detect similar names', async () => {
      const result = await detector.checkFuzzy({
        name: 'Vladimir Galla'  // typo
      });
      expect(result.possibleMatches.length).toBeGreaterThan(0);
      expect(result.possibleMatches[0].similarity).toBeGreaterThan(0.8);
    });
  });

  describe('normalization', () => {
    it('should normalize phone numbers', () => {
      expect(detector.normalizePhone('+421 912 345 678')).toBe('421912345678');
      expect(detector.normalizePhone('00421912345678')).toBe('421912345678');
    });

    it('should normalize IBANs', () => {
      expect(detector.normalizeIBAN('SK89 1100 0000 0029'))
        .toBe('SK8911000000029');
    });
  });
});
```

### 2.2 Frontend Unit Tests

```typescript
// tests/unit/components/SearchBar.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SearchBar } from '@/components/SearchBar';

describe('SearchBar', () => {
  it('should render search input', () => {
    render(<SearchBar onSearch={jest.fn()} />);
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it('should call onSearch with query', async () => {
    const onSearch = jest.fn();
    render(<SearchBar onSearch={onSearch} />);

    const input = screen.getByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: 'Vladimir' } });
    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith('Vladimir', expect.any(Object));
    });
  });

  it('should detect search type automatically', () => {
    render(<SearchBar onSearch={jest.fn()} />);

    const input = screen.getByPlaceholderText(/search/i);

    // Phone pattern
    fireEvent.change(input, { target: { value: '+421912345678' } });
    expect(screen.getByText(/exact match/i)).toBeInTheDocument();

    // Name pattern
    fireEvent.change(input, { target: { value: 'Vladimir Gala' } });
    expect(screen.getByText(/fuzzy search/i)).toBeInTheDocument();
  });
});
```

### 2.3 ML Service Unit Tests

```python
# tests/unit/test_face_detection.py
import pytest
from services.face_detection import FaceDetector

class TestFaceDetector:
    @pytest.fixture
    def detector(self):
        return FaceDetector()

    def test_detect_single_face(self, detector, sample_face_image):
        faces = detector.detect(sample_face_image)
        assert len(faces) == 1
        assert faces[0].confidence > 0.9

    def test_detect_no_face(self, detector, landscape_image):
        faces = detector.detect(landscape_image)
        assert len(faces) == 0

    def test_detect_multiple_faces(self, detector, group_photo):
        faces = detector.detect(group_photo)
        assert len(faces) > 1

    def test_embedding_dimension(self, detector, sample_face_image):
        faces = detector.detect(sample_face_image)
        embedding = detector.get_embedding(faces[0])
        assert len(embedding) == 512  # ArcFace dimension

    def test_embedding_similarity(self, detector, same_person_images):
        emb1 = detector.get_embedding(same_person_images[0])
        emb2 = detector.get_embedding(same_person_images[1])
        similarity = detector.cosine_similarity(emb1, emb2)
        assert similarity > 0.8
```

## 3. Integration Tests

### 3.1 API Integration Tests

```typescript
// tests/integration/api/reports.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { setupTestApp, teardownTestApp, createTestUser } from '../helpers';

describe('Reports API', () => {
  let app: Express;
  let authToken: string;

  beforeAll(async () => {
    app = await setupTestApp();
    const user = await createTestUser({ role: 'standard' });
    authToken = user.token;
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  describe('POST /reports', () => {
    it('should create a new report', async () => {
      const reportData = {
        incident: {
          fraud_type: 'romance_scam',
          summary: 'Test incident',
          date: '2024-01-15'
        },
        perpetrator: {
          full_name: 'John Doe',
          phone: '+421912345678'
        },
        reporter: {
          email: 'reporter@test.com',
          consent: true
        }
      };

      const response = await request(app)
        .post('/api/v1/reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reportData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        status: 'pending'
      });
    });

    it('should reject report without required fields', async () => {
      const response = await request(app)
        .post('/api/v1/reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.error).toBe('validation_error');
    });

    it('should detect duplicates', async () => {
      // Create first report
      await request(app)
        .post('/api/v1/reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          perpetrator: { phone: '+421999888777' },
          incident: { fraud_type: 'phishing', summary: 'First report' },
          reporter: { email: 'test@test.com', consent: true }
        });

      // Create duplicate
      const response = await request(app)
        .post('/api/v1/reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          perpetrator: { phone: '+421999888777' },
          incident: { fraud_type: 'investment_fraud', summary: 'Second report' },
          reporter: { email: 'test2@test.com', consent: true }
        })
        .expect(201);

      expect(response.body.duplicate_check.has_duplicates).toBe(true);
    });
  });

  describe('GET /reports/:id', () => {
    it('should return masked data for basic user', async () => {
      const basicUser = await createTestUser({ role: 'basic' });

      const response = await request(app)
        .get(`/api/v1/reports/${testReportId}`)
        .set('Authorization', `Bearer ${basicUser.token}`)
        .expect(200);

      expect(response.body.perpetrator.phone).toMatch(/\*+/);
      expect(response.body.perpetrator.email).toMatch(/\*+@/);
    });

    it('should return unmasked data for gold user', async () => {
      const goldUser = await createTestUser({ role: 'gold' });

      const response = await request(app)
        .get(`/api/v1/reports/${testReportId}`)
        .set('Authorization', `Bearer ${goldUser.token}`)
        .expect(200);

      expect(response.body.perpetrator.phone).not.toMatch(/\*+/);
    });
  });
});
```

### 3.2 Search Integration Tests

```typescript
// tests/integration/search.test.ts
describe('Search Integration', () => {
  beforeAll(async () => {
    // Seed test data
    await seedReports([
      { perpetrator: { name: 'Vladimir Gala' }, status: 'approved' },
      { perpetrator: { name: 'Maria Smith' }, status: 'approved' },
      { perpetrator: { name: 'Vladimír Galla' }, status: 'approved' }, // similar
      { perpetrator: { name: 'John Hidden' }, status: 'pending' } // not searchable
    ]);

    // Wait for index sync
    await waitForIndexSync();
  });

  it('should find exact matches', async () => {
    const response = await request(app)
      .get('/api/v1/search')
      .query({ q: '+421912345678', mode: 'exact' })
      .expect(200);

    expect(response.body.results.length).toBeGreaterThan(0);
    expect(response.body.results[0].source).toBe('exact');
  });

  it('should find fuzzy matches for names', async () => {
    const response = await request(app)
      .get('/api/v1/search')
      .query({ q: 'Vladimir Galla', mode: 'fuzzy' }) // typo
      .expect(200);

    const names = response.body.results.map(r => r.perpetrator.name);
    expect(names).toContain('Vladimir Gala');
    expect(names).toContain('Vladimír Galla');
  });

  it('should not return pending reports', async () => {
    const response = await request(app)
      .get('/api/v1/search')
      .query({ q: 'John Hidden' })
      .expect(200);

    expect(response.body.results.length).toBe(0);
  });

  it('should apply filters', async () => {
    const response = await request(app)
      .get('/api/v1/search')
      .query({
        q: 'scam',
        country: 'SK',
        fraud_type: 'romance_scam'
      })
      .expect(200);

    response.body.results.forEach(r => {
      expect(r.country).toBe('SK');
      expect(r.fraud_type).toBe('romance_scam');
    });
  });
});
```

### 3.3 Database Integration Tests

```typescript
// tests/integration/database.test.ts
import { PostgreSqlContainer } from '@testcontainers/postgresql';

describe('Database Operations', () => {
  let container: PostgreSqlContainer;
  let db: Database;

  beforeAll(async () => {
    container = await new PostgreSqlContainer('pgvector/pgvector:pg16')
      .withExposedPorts(5432)
      .start();

    db = await connectDatabase(container.getConnectionUri());
    await runMigrations(db);
  });

  afterAll(async () => {
    await db.close();
    await container.stop();
  });

  it('should store and retrieve reports', async () => {
    const report = await db.reports.create({
      incident: { fraud_type: 'phishing', summary: 'Test' },
      perpetrator: { name: 'Test Person' }
    });

    const retrieved = await db.reports.findById(report.id);
    expect(retrieved.incident.fraud_type).toBe('phishing');
  });

  it('should enforce foreign key constraints', async () => {
    await expect(
      db.evidence.create({ report_id: 'non-existent-id' })
    ).rejects.toThrow();
  });

  it('should support vector similarity search', async () => {
    // Insert embeddings
    await db.faceDetections.create({
      embedding: new Array(512).fill(0.1)
    });

    const results = await db.query(`
      SELECT id, 1 - (embedding <=> $1::vector) as similarity
      FROM face_detections
      ORDER BY embedding <=> $1::vector
      LIMIT 10
    `, [new Array(512).fill(0.1)]);

    expect(results[0].similarity).toBeCloseTo(1, 5);
  });
});
```

## 4. E2E Tests

### 4.1 Playwright Tests

```typescript
// tests/e2e/report-submission.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Report Submission Flow', () => {
  test('should submit a new fraud report', async ({ page }) => {
    await page.goto('/report/new');

    // Step 1: Incident details
    await page.selectOption('[name="fraud_type"]', 'romance_scam');
    await page.fill('[name="summary"]', 'Test fraud report');
    await page.fill('[name="incident_date"]', '2024-01-15');
    await page.click('button:text("Next")');

    // Step 2: Perpetrator info
    await page.fill('[name="perpetrator_name"]', 'John Scammer');
    await page.fill('[name="perpetrator_phone"]', '+421912345678');
    await page.fill('[name="perpetrator_email"]', 'scammer@fake.com');
    await page.click('button:text("Next")');

    // Step 3: Evidence upload
    await page.setInputFiles('[name="evidence"]', 'tests/fixtures/screenshot.png');
    await page.click('button:text("Next")');

    // Step 4: Reporter info
    await page.fill('[name="reporter_email"]', 'reporter@test.com');
    await page.check('[name="consent"]');
    await page.click('button:text("Submit Report")');

    // Verify submission
    await expect(page.locator('.success-message')).toBeVisible();
    await expect(page.locator('.report-id')).toHaveText(/RPT-/);
  });

  test('should search for existing reports', async ({ page }) => {
    await page.goto('/');

    // Perform search
    await page.fill('[name="search"]', 'Vladimir Gala');
    await page.click('button:text("Search")');

    // Verify results
    await expect(page.locator('.search-results')).toBeVisible();
    await expect(page.locator('.result-item')).toHaveCount.greaterThan(0);

    // Click result
    await page.locator('.result-item').first().click();
    await expect(page.url()).toContain('/report/');
  });
});

test.describe('Admin Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/admin/login');
    await page.fill('[name="email"]', 'admin@scamnemesis.com');
    await page.fill('[name="password"]', 'admin-password');
    await page.click('button:text("Login")');
  });

  test('should approve pending report', async ({ page }) => {
    await page.goto('/admin/reports/pending');

    // Select first pending report
    await page.locator('.report-row').first().click();

    // Review and approve
    await page.click('button:text("Approve")');

    // Verify
    await expect(page.locator('.status-badge')).toHaveText('Approved');
  });

  test('should merge duplicate cluster', async ({ page }) => {
    await page.goto('/admin/duplicates');

    // Select cluster
    await page.locator('.cluster-row').first().click();

    // Select reports to merge
    await page.locator('.report-checkbox').first().check();
    await page.click('button:text("Merge Selected")');

    // Confirm
    await page.click('button:text("Confirm Merge")');
    await expect(page.locator('.success-toast')).toBeVisible();
  });
});
```

## 5. Load Testing

### 5.1 k6 Load Test

```javascript
// tests/load/search.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const searchDuration = new Trend('search_duration');

export const options = {
  stages: [
    { duration: '2m', target: 50 },   // Ramp up
    { duration: '5m', target: 100 },  // Sustained load
    { duration: '2m', target: 200 },  // Peak load
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% under 500ms
    errors: ['rate<0.01'],              // Error rate under 1%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const searchQueries = [
  'Vladimir',
  'Maria Smith',
  '+421912345678',
  'john.doe@example.com',
  'SK8911000000002949129426',
];

export default function () {
  const query = searchQueries[Math.floor(Math.random() * searchQueries.length)];

  const start = Date.now();
  const response = http.get(`${BASE_URL}/api/v1/search?q=${encodeURIComponent(query)}`);
  const duration = Date.now() - start;

  searchDuration.add(duration);

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
    'has results': (r) => JSON.parse(r.body).results !== undefined,
  }) || errorRate.add(1);

  sleep(1);
}
```

### 5.2 Load Test Targets

| Scenario | RPS | Duration | Success Criteria |
|----------|-----|----------|------------------|
| Baseline | 10 | 5 min | p95 < 200ms, 0% errors |
| Normal load | 50 | 10 min | p95 < 300ms, <0.1% errors |
| Peak load | 100 | 5 min | p95 < 500ms, <1% errors |
| Stress test | 200 | 2 min | Service stable, graceful degradation |

## 6. CI Pipeline

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: pgvector/pgvector:pg16
        env:
          POSTGRES_PASSWORD: test
        ports:
          - 5432:5432
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run migrations
        run: npm run db:migrate
        env:
          DATABASE_URL: postgres://postgres:test@localhost:5432/test

      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgres://postgres:test@localhost:5432/test
          REDIS_URL: redis://localhost:6379

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Start services
        run: docker-compose -f docker-compose.test.yml up -d

      - name: Wait for services
        run: npm run wait-for-services

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test artifacts
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/

  load-tests:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    needs: [integration-tests]
    steps:
      - uses: actions/checkout@v4

      - name: Run k6 load test
        uses: grafana/k6-action@v0.3.1
        with:
          filename: tests/load/search.js
          flags: --out json=results.json
        env:
          BASE_URL: ${{ secrets.STAGING_URL }}

      - name: Check thresholds
        run: |
          if grep -q '"thresholds":{"http_req_duration":\["fail"\]' results.json; then
            echo "Load test failed!"
            exit 1
          fi
```

## 7. Test Checklist

### 7.1 Pre-release Checklist

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All E2E tests pass
- [ ] Load test meets SLOs
- [ ] Security scan passes (OWASP ZAP)
- [ ] Dependency audit clean
- [ ] Code coverage > 80%
- [ ] No critical/high severity bugs
- [ ] Database migrations tested
- [ ] Rollback procedure verified
