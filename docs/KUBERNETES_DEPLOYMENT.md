# Kubernetes Deployment - Scamnemesis

## 1. Cluster Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        KUBERNETES CLUSTER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  INGRESS LAYER                                                         │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                    │  │
│  │  │ CloudFlare  │─▶│ Nginx       │─▶│ Cert-Manager│                    │  │
│  │  │ DNS + WAF   │  │ Ingress     │  │ (Let's Enc) │                    │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                    │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  NAMESPACE: scamnemesis-prod                                           │  │
│  │                                                                        │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│  │  │ Frontend    │  │ Backend     │  │ ML Service  │  │ Workers     │  │  │
│  │  │ Deployment  │  │ Deployment  │  │ Deployment  │  │ Deployment  │  │  │
│  │  │ (3 pods)    │  │ (3 pods)    │  │ (2 pods)    │  │ (HPA)       │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │  │
│  │                                                                        │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  NAMESPACE: scamnemesis-data                                           │  │
│  │                                                                        │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│  │  │ PostgreSQL  │  │ Redis       │  │ Typesense   │  │ MinIO       │  │  │
│  │  │ StatefulSet │  │ StatefulSet │  │ StatefulSet │  │ StatefulSet │  │  │
│  │  │ (HA)        │  │ (Cluster)   │  │ (Cluster)   │  │ (Distributed│  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │  │
│  │                                                                        │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  NAMESPACE: scamnemesis-monitoring                                     │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                    │  │
│  │  │ Prometheus  │  │ Grafana     │  │ Jaeger      │                    │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                    │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  GPU NODE POOL (optional)                                              │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │ Face Embedding Worker (NVIDIA T4)                                │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 2. Helm Chart Structure

```
helm/scamnemesis/
├── Chart.yaml
├── values.yaml
├── values-dev.yaml
├── values-staging.yaml
├── values-prod.yaml
├── templates/
│   ├── _helpers.tpl
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secrets.yaml
│   │
│   ├── frontend/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   └── hpa.yaml
│   │
│   ├── backend/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── hpa.yaml
│   │   └── pdb.yaml
│   │
│   ├── ml-service/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   └── hpa.yaml
│   │
│   ├── workers/
│   │   ├── image-worker-deployment.yaml
│   │   ├── crawler-worker-deployment.yaml
│   │   ├── ocr-worker-deployment.yaml
│   │   └── face-worker-deployment.yaml (GPU)
│   │
│   ├── ingress.yaml
│   ├── networkpolicy.yaml
│   └── servicemonitor.yaml
│
└── charts/
    ├── postgresql/
    ├── redis/
    ├── typesense/
    └── minio/
```

## 3. Core Kubernetes Manifests

### 3.1 Namespace

```yaml
# templates/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: {{ .Values.namespace }}
  labels:
    app.kubernetes.io/name: scamnemesis
    app.kubernetes.io/managed-by: helm
```

### 3.2 ConfigMap

```yaml
# templates/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: scamnemesis-config
  namespace: {{ .Values.namespace }}
data:
  NODE_ENV: {{ .Values.environment }}
  LOG_LEVEL: {{ .Values.logLevel }}
  API_URL: {{ .Values.apiUrl }}
  TYPESENSE_HOST: {{ .Values.typesense.host }}
  TYPESENSE_PORT: "{{ .Values.typesense.port }}"
  S3_ENDPOINT: {{ .Values.minio.endpoint }}
  S3_BUCKET: {{ .Values.minio.bucket }}
  OCR_LANGUAGES: "eng+slk+ces+deu+rus+ukr"
  FACE_DETECTION_ENABLED: "{{ .Values.features.faceDetection }}"
```

### 3.3 Secrets (External Secrets / Sealed Secrets)

```yaml
# templates/secrets.yaml
{{- if .Values.externalSecrets.enabled }}
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: scamnemesis-secrets
  namespace: {{ .Values.namespace }}
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: {{ .Values.externalSecrets.store }}
    kind: ClusterSecretStore
  target:
    name: scamnemesis-secrets
  data:
    - secretKey: DATABASE_URL
      remoteRef:
        key: scamnemesis/database-url
    - secretKey: REDIS_URL
      remoteRef:
        key: scamnemesis/redis-url
    - secretKey: JWT_SECRET
      remoteRef:
        key: scamnemesis/jwt-secret
    - secretKey: S3_ACCESS_KEY
      remoteRef:
        key: scamnemesis/s3-access-key
    - secretKey: S3_SECRET_KEY
      remoteRef:
        key: scamnemesis/s3-secret-key
    - secretKey: TYPESENSE_API_KEY
      remoteRef:
        key: scamnemesis/typesense-api-key
{{- else }}
apiVersion: v1
kind: Secret
metadata:
  name: scamnemesis-secrets
  namespace: {{ .Values.namespace }}
type: Opaque
stringData:
  DATABASE_URL: {{ .Values.secrets.databaseUrl | quote }}
  REDIS_URL: {{ .Values.secrets.redisUrl | quote }}
  JWT_SECRET: {{ .Values.secrets.jwtSecret | quote }}
  S3_ACCESS_KEY: {{ .Values.secrets.s3AccessKey | quote }}
  S3_SECRET_KEY: {{ .Values.secrets.s3SecretKey | quote }}
  TYPESENSE_API_KEY: {{ .Values.secrets.typesenseApiKey | quote }}
{{- end }}
```

### 3.4 Backend Deployment

```yaml
# templates/backend/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: scamnemesis-backend
  namespace: {{ .Values.namespace }}
  labels:
    app: scamnemesis
    component: backend
spec:
  replicas: {{ .Values.backend.replicas }}
  selector:
    matchLabels:
      app: scamnemesis
      component: backend
  template:
    metadata:
      labels:
        app: scamnemesis
        component: backend
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "3000"
        prometheus.io/path: "/metrics"
    spec:
      serviceAccountName: scamnemesis-backend
      containers:
        - name: backend
          image: "{{ .Values.backend.image.repository }}:{{ .Values.backend.image.tag }}"
          imagePullPolicy: {{ .Values.backend.image.pullPolicy }}
          ports:
            - containerPort: 3000
              name: http
          envFrom:
            - configMapRef:
                name: scamnemesis-config
            - secretRef:
                name: scamnemesis-secrets
          resources:
            requests:
              cpu: {{ .Values.backend.resources.requests.cpu }}
              memory: {{ .Values.backend.resources.requests.memory }}
            limits:
              cpu: {{ .Values.backend.resources.limits.cpu }}
              memory: {{ .Values.backend.resources.limits.memory }}
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
            timeoutSeconds: 5
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /health/ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
            timeoutSeconds: 3
            failureThreshold: 3
          securityContext:
            runAsNonRoot: true
            runAsUser: 1000
            readOnlyRootFilesystem: true
            allowPrivilegeEscalation: false
          volumeMounts:
            - name: tmp
              mountPath: /tmp
      volumes:
        - name: tmp
          emptyDir: {}
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
            - weight: 100
              podAffinityTerm:
                labelSelector:
                  matchLabels:
                    app: scamnemesis
                    component: backend
                topologyKey: kubernetes.io/hostname
      topologySpreadConstraints:
        - maxSkew: 1
          topologyKey: topology.kubernetes.io/zone
          whenUnsatisfiable: ScheduleAnyway
          labelSelector:
            matchLabels:
              app: scamnemesis
              component: backend
```

### 3.5 Backend HPA

```yaml
# templates/backend/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: scamnemesis-backend
  namespace: {{ .Values.namespace }}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: scamnemesis-backend
  minReplicas: {{ .Values.backend.autoscaling.minReplicas }}
  maxReplicas: {{ .Values.backend.autoscaling.maxReplicas }}
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: {{ .Values.backend.autoscaling.targetCPUUtilization }}
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: {{ .Values.backend.autoscaling.targetMemoryUtilization }}
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Percent
          value: 10
          periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
        - type: Percent
          value: 100
          periodSeconds: 15
        - type: Pods
          value: 4
          periodSeconds: 15
      selectPolicy: Max
```

### 3.6 Worker Deployment (Crawler)

```yaml
# templates/workers/crawler-worker-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: scamnemesis-crawler-worker
  namespace: {{ .Values.namespace }}
spec:
  replicas: {{ .Values.workers.crawler.replicas }}
  selector:
    matchLabels:
      app: scamnemesis
      component: crawler-worker
  template:
    metadata:
      labels:
        app: scamnemesis
        component: crawler-worker
    spec:
      containers:
        - name: crawler-worker
          image: "{{ .Values.workers.crawler.image.repository }}:{{ .Values.workers.crawler.image.tag }}"
          envFrom:
            - configMapRef:
                name: scamnemesis-config
            - secretRef:
                name: scamnemesis-secrets
          resources:
            requests:
              cpu: "500m"
              memory: "512Mi"
            limits:
              cpu: "1"
              memory: "1Gi"
```

### 3.7 GPU Worker (Face Embeddings)

```yaml
# templates/workers/face-worker-deployment.yaml
{{- if .Values.workers.face.enabled }}
apiVersion: apps/v1
kind: Deployment
metadata:
  name: scamnemesis-face-worker
  namespace: {{ .Values.namespace }}
spec:
  replicas: {{ .Values.workers.face.replicas }}
  selector:
    matchLabels:
      app: scamnemesis
      component: face-worker
  template:
    metadata:
      labels:
        app: scamnemesis
        component: face-worker
    spec:
      nodeSelector:
        cloud.google.com/gke-accelerator: nvidia-tesla-t4
      tolerations:
        - key: nvidia.com/gpu
          operator: Exists
          effect: NoSchedule
      containers:
        - name: face-worker
          image: "{{ .Values.workers.face.image.repository }}:{{ .Values.workers.face.image.tag }}"
          envFrom:
            - configMapRef:
                name: scamnemesis-config
            - secretRef:
                name: scamnemesis-secrets
          resources:
            requests:
              cpu: "2"
              memory: "4Gi"
              nvidia.com/gpu: 1
            limits:
              cpu: "4"
              memory: "8Gi"
              nvidia.com/gpu: 1
{{- end }}
```

### 3.8 Ingress

```yaml
# templates/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: scamnemesis-ingress
  namespace: {{ .Values.namespace }}
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-body-size: "50m"
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/rate-limit-window: "1m"
spec:
  tls:
    - hosts:
        - {{ .Values.ingress.host }}
        - api.{{ .Values.ingress.host }}
      secretName: scamnemesis-tls
  rules:
    - host: {{ .Values.ingress.host }}
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: scamnemesis-frontend
                port:
                  number: 3001
    - host: api.{{ .Values.ingress.host }}
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: scamnemesis-backend
                port:
                  number: 3000
```

### 3.9 Network Policy

```yaml
# templates/networkpolicy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: scamnemesis-network-policy
  namespace: {{ .Values.namespace }}
spec:
  podSelector:
    matchLabels:
      app: scamnemesis
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: ingress-nginx
        - podSelector:
            matchLabels:
              app: scamnemesis
  egress:
    - to:
        - podSelector:
            matchLabels:
              app: scamnemesis
    - to:
        - namespaceSelector:
            matchLabels:
              name: scamnemesis-data
    - to:
        - ipBlock:
            cidr: 0.0.0.0/0
            except:
              - 10.0.0.0/8
              - 172.16.0.0/12
              - 192.168.0.0/16
      ports:
        - protocol: TCP
          port: 443
        - protocol: TCP
          port: 80
```

## 4. Values Files

### 4.1 values.yaml (defaults)

```yaml
# values.yaml
namespace: scamnemesis-prod
environment: production
logLevel: info
apiUrl: https://api.scamnemesis.com

# External Secrets
externalSecrets:
  enabled: true
  store: vault-backend

# Backend
backend:
  replicas: 3
  image:
    repository: ghcr.io/scamnemesis/backend
    tag: latest
    pullPolicy: IfNotPresent
  resources:
    requests:
      cpu: "500m"
      memory: "512Mi"
    limits:
      cpu: "2"
      memory: "2Gi"
  autoscaling:
    minReplicas: 3
    maxReplicas: 10
    targetCPUUtilization: 70
    targetMemoryUtilization: 80

# Frontend
frontend:
  replicas: 2
  image:
    repository: ghcr.io/scamnemesis/frontend
    tag: latest
  resources:
    requests:
      cpu: "200m"
      memory: "256Mi"
    limits:
      cpu: "1"
      memory: "1Gi"

# ML Service
mlService:
  replicas: 2
  image:
    repository: ghcr.io/scamnemesis/ml-service
    tag: latest
  resources:
    requests:
      cpu: "1"
      memory: "2Gi"
    limits:
      cpu: "4"
      memory: "8Gi"

# Workers
workers:
  image:
    replicas: 2
    resources:
      requests:
        cpu: "500m"
        memory: "512Mi"
      limits:
        cpu: "2"
        memory: "2Gi"

  crawler:
    replicas: 2
    resources:
      requests:
        cpu: "500m"
        memory: "512Mi"

  ocr:
    replicas: 2
    resources:
      requests:
        cpu: "1"
        memory: "1Gi"

  face:
    enabled: false  # Enable when GPU available
    replicas: 1

# Data services (use managed services in prod)
postgresql:
  enabled: false  # Use Cloud SQL / RDS

redis:
  enabled: false  # Use Memorystore / ElastiCache

typesense:
  enabled: true
  replicas: 3
  host: typesense-headless
  port: 8108

minio:
  enabled: false  # Use Cloud Storage / S3
  endpoint: https://storage.googleapis.com
  bucket: scamnemesis-prod

# Ingress
ingress:
  host: demo.scamnemesis.com

# Features
features:
  faceDetection: true
  ocrEnabled: true
  crawlersEnabled: true
```

### 4.2 values-dev.yaml

```yaml
# values-dev.yaml
namespace: scamnemesis-dev
environment: development
logLevel: debug

externalSecrets:
  enabled: false

backend:
  replicas: 1
  resources:
    requests:
      cpu: "100m"
      memory: "256Mi"
    limits:
      cpu: "500m"
      memory: "512Mi"
  autoscaling:
    minReplicas: 1
    maxReplicas: 3

frontend:
  replicas: 1
  resources:
    requests:
      cpu: "100m"
      memory: "128Mi"

mlService:
  replicas: 1
  resources:
    requests:
      cpu: "500m"
      memory: "1Gi"

workers:
  image:
    replicas: 1
  crawler:
    replicas: 1
  ocr:
    replicas: 1
  face:
    enabled: false

postgresql:
  enabled: true

redis:
  enabled: true

typesense:
  enabled: true
  replicas: 1

minio:
  enabled: true
  endpoint: http://minio:9000
  bucket: scamnemesis-dev

ingress:
  host: dev.scamnemesis.local

secrets:
  databaseUrl: "postgresql://postgres:devpassword@postgresql:5432/scamnemesis"
  redisUrl: "redis://redis:6379"
  jwtSecret: "dev-jwt-secret"
  s3AccessKey: "minioadmin"
  s3SecretKey: "minioadmin"
  typesenseApiKey: "dev-typesense-key"
```

## 5. Migration Path

### 5.1 Docker Compose → k3s (Single Node)

```bash
# 1. Install k3s
curl -sfL https://get.k3s.io | sh -

# 2. Install Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# 3. Deploy with minimal values
helm install scamnemesis ./helm/scamnemesis \
  -f ./helm/scamnemesis/values-dev.yaml \
  --set postgresql.enabled=true \
  --set redis.enabled=true \
  --set minio.enabled=true
```

### 5.2 k3s → Managed Kubernetes

```bash
# 1. Create GKE cluster
gcloud container clusters create scamnemesis-prod \
  --num-nodes=3 \
  --machine-type=e2-standard-4 \
  --region=europe-west1

# 2. Add GPU node pool (optional)
gcloud container node-pools create gpu-pool \
  --cluster=scamnemesis-prod \
  --num-nodes=1 \
  --machine-type=n1-standard-4 \
  --accelerator=type=nvidia-tesla-t4,count=1

# 3. Deploy with production values
helm install scamnemesis ./helm/scamnemesis \
  -f ./helm/scamnemesis/values-prod.yaml
```

## 6. Resource Estimates for 160k visits/day

### Node Pool Configuration

| Pool | Nodes | Machine Type | vCPU | RAM | Purpose |
|------|-------|--------------|------|-----|---------|
| default | 3 | e2-standard-4 | 4 | 16GB | Backend, Frontend, Workers |
| data | 2 | e2-standard-8 | 8 | 32GB | Typesense, PostgreSQL (if self-hosted) |
| gpu | 1 | n1-standard-4 + T4 | 4 | 15GB | Face embeddings (optional) |

### Pod Resource Allocation

| Service | Replicas | CPU Request | Memory Request | CPU Limit | Memory Limit |
|---------|----------|-------------|----------------|-----------|--------------|
| Frontend | 2-5 | 200m | 256Mi | 1 | 1Gi |
| Backend | 3-10 | 500m | 512Mi | 2 | 2Gi |
| ML Service | 2-4 | 1 | 2Gi | 4 | 8Gi |
| Image Worker | 2-5 | 500m | 512Mi | 2 | 2Gi |
| Crawler Worker | 2-4 | 500m | 512Mi | 1 | 1Gi |
| OCR Worker | 2-4 | 1 | 1Gi | 2 | 2Gi |
| Face Worker (GPU) | 1-2 | 2 | 4Gi | 4 | 8Gi |

### Estimated Monthly Costs

| Provider | Configuration | Estimated Cost |
|----------|--------------|----------------|
| GKE | 3x e2-standard-4 + managed services | $800-1,200/month |
| EKS | 3x t3.xlarge + managed services | $900-1,400/month |
| Self-hosted (Hetzner) | 3x CCX32 | $300-500/month |
| DigitalOcean | 3x s-4vcpu-8gb + managed DB | $400-700/month |
