# DevOps Guide - Production-Grade 2026 Standards

## 🚀 Overview

Your rideshare app now has enterprise-grade DevOps infrastructure with comprehensive CI/CD pipelines, security hardening, and Kubernetes orchestration.

## ✅ Implemented Features

### 1. GitHub Actions CI Pipeline (`.github/workflows/ci.yml`)

Runs on every pull request with the following jobs:

#### Job 1: Code Quality & Linting
- TypeScript type checking (`tsc --noEmit`)
- ESLint with zero-warning policy
- Prettier formatting check

#### Job 2: Unit & Integration Tests
- Jest with coverage reporting
- Coverage thresholds enforcement
- Codecov integration
- PR comment with coverage report

#### Job 3: Build & Bundle Analysis
- Production build
- Bundle size analysis
- Size limit enforcement (500KB main bundle)
- PR comment with bundle sizes

#### Job 4: Lighthouse CI Performance
- Performance score must be ≥ 85
- Accessibility score must be ≥ 90
- Best practices score must be ≥ 90
- SEO score must be ≥ 85
- Runs 3 times and averages results

#### Job 5: Security Audit
- npm audit (high severity)
- Snyk security scanning
- OWASP dependency check

#### Job 6: Docker Build Test
- Multi-stage Docker build
- Image testing
- Health check verification

### 2. GitHub Actions Deploy Pipeline (`.github/workflows/deploy.yml`)

Runs on merge to main:

#### Job 1: Build Production Bundle
- Security audit before build
- Production build with environment variables
- Build info generation
- Artifact upload

#### Job 2: Deploy to Vercel
- Vercel CLI deployment
- Environment URL output
- PR comment with deployment URL
- Deployment status tracking

#### Job 3: Post-Deploy Smoke Tests
- Homepage load test
- Health endpoint check
- Build info verification
- Static assets check
- Production Lighthouse run

#### Job 4: Deploy to Kubernetes (Optional)
- Docker image build and push
- Kubernetes deployment update
- Rollout status verification

#### Job 5: Notifications
- Slack notifications
- GitHub release creation

### 3. Multi-Stage Dockerfile

**Stage 1: Builder**
- Node 20 Alpine
- Install all dependencies
- Build production bundle
- Prune devDependencies

**Stage 2: Production Server**
- Nginx Alpine
- Security updates
- Health check endpoint
- Non-root user (nginx:1001)
- Port 8080
- Security labels

**Features**:
- Minimal image size
- Security hardening
- Health checks
- Proper caching layers

### 4. Production-Grade Nginx Configuration

**Security Headers**:
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=(self), microphone=(), camera=()`
- `Strict-Transport-Security: max-age=31536000`

**Content Security Policy**:
- Allows OpenAI API (`https://api.openai.com`)
- Allows Mapbox API (`https://api.mapbox.com`)
- Allows WebSocket connections
- Blocks unsafe inline scripts (except where needed)

**Caching Strategy**:
- Hashed assets (`/assets/*`): 1 year, immutable
- Images: 30 days
- Fonts: 1 year
- index.html: no-cache
- Service worker: no-cache

**Compression**:
- Gzip enabled for all text assets
- Compression level 6
- Multiple MIME types

**Performance**:
- Worker processes: auto
- Worker connections: 4096
- Sendfile, tcp_nopush, tcp_nodelay enabled
- Keepalive timeout: 65s

### 5. Kubernetes Manifests

#### Deployment (`kubernetes/deployment.yaml`)

**Resource Limits**:
```yaml
requests:
  memory: 256Mi
  cpu: 200m
  ephemeral-storage: 1Gi
limits:
  memory: 512Mi
  cpu: 500m
  ephemeral-storage: 2Gi
```

**Probes**:
- **Liveness**: Checks if container is alive
  - Path: `/health`
  - Initial delay: 30s
  - Period: 10s
  - Timeout: 5s
  - Failure threshold: 3

- **Readiness**: Checks if ready for traffic
  - Path: `/health`
  - Initial delay: 10s
  - Period: 5s
  - Timeout: 3s
  - Failure threshold: 3

- **Startup**: For slow-starting containers
  - Path: `/health`
  - Period: 5s
  - Failure threshold: 12

**Security**:
- Non-root user (1001)
- Read-only root filesystem
- No privilege escalation
- Dropped all capabilities
- Seccomp profile

**High Availability**:
- Pod anti-affinity
- Topology spread constraints
- 3 replicas minimum

#### HPA (`kubernetes/hpa.yaml`)

**Autoscaling**:
- Min replicas: 2
- Max replicas: 10
- CPU target: 70%
- Memory target: 80%

**Behavior**:
- Scale up: 50% or 2 pods per minute
- Scale down: 10% per minute with 5min stabilization

#### ConfigMap (`kubernetes/configmap.yaml`)

**Application Config**:
- Environment variables
- Feature flags
- API endpoints

**Nginx Config**:
- Complete nginx.conf
- Security headers
- Caching rules
- Health endpoint

#### Service (`kubernetes/service.yaml`)

**ClusterIP Service**:
- Port 80 → 8080
- Session affinity enabled
- 3-hour timeout

**Headless Service**:
- For StatefulSet support
- Direct pod access

#### ServiceAccount (`kubernetes/serviceaccount.yaml`)

**RBAC**:
- Minimal permissions
- ConfigMap read access
- Secret read access
- No token auto-mount

## 🔧 Configuration

### Required GitHub Secrets

```bash
# Vercel
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID

# Container Registry
REGISTRY_URL
REGISTRY_USERNAME
REGISTRY_PASSWORD

# Kubernetes
KUBE_CONFIG

# Notifications
SLACK_WEBHOOK_URL

# Security Scanning
SNYK_TOKEN

# Environment Variables
VITE_API_URL
VITE_WS_URL
```

### Lighthouse CI Configuration (`.lighthouserc.json`)

**Thresholds**:
- Performance: ≥ 85
- Accessibility: ≥ 90
- Best Practices: ≥ 90
- SEO: ≥ 85

**Metrics**:
- First Contentful Paint: < 2s
- Largest Contentful Paint: < 3s
- Cumulative Layout Shift: < 0.1
- Total Blocking Time: < 300ms
- Speed Index: < 3.5s
- Time to Interactive: < 4s

### Docker Ignore (`.dockerignore`)

Excludes:
- node_modules
- .env files
- Test files
- Documentation
- Git files
- IDE files
- Build artifacts

## 🚀 Deployment Workflows

### Development Workflow

1. Create feature branch
2. Make changes
3. Push to GitHub
4. CI pipeline runs automatically
5. Review PR comments (coverage, bundle size)
6. Fix any issues
7. Merge to main

### Production Deployment

1. Merge to main
2. Deploy pipeline runs
3. Build production bundle
4. Security audit
5. Deploy to Vercel
6. Smoke tests run
7. Kubernetes deployment (optional)
8. Slack notification

### Manual Deployment

```bash
# Trigger manual deployment
gh workflow run deploy.yml -f environment=production

# Or via GitHub UI
# Actions → Deploy to Production → Run workflow
```

## 📊 Monitoring & Observability

### Health Checks

```bash
# Local
curl http://localhost:8080/health

# Kubernetes
kubectl exec -it <pod-name> -n rideshare-app -- curl localhost:8080/health

# Production
curl https://your-domain.com/health
```

### Build Info

```bash
# Check deployed version
curl https://your-domain.com/build-info.json
```

### Kubernetes Monitoring

```bash
# Check pod status
kubectl get pods -n rideshare-app

# Check HPA status
kubectl get hpa -n rideshare-app

# View logs
kubectl logs -f deployment/rideshare-frontend -n rideshare-app

# Check resource usage
kubectl top pods -n rideshare-app
```

## 🔒 Security Best Practices

### Container Security

1. **Non-root user**: Runs as nginx:1001
2. **Read-only filesystem**: Prevents tampering
3. **No privilege escalation**: Security hardening
4. **Minimal base image**: Alpine Linux
5. **Security updates**: Automated in Dockerfile
6. **Dropped capabilities**: ALL capabilities dropped

### Network Security

1. **CSP headers**: Restricts resource loading
2. **HSTS**: Forces HTTPS
3. **X-Frame-Options**: Prevents clickjacking
4. **X-Content-Type-Options**: Prevents MIME sniffing
5. **Referrer-Policy**: Controls referrer information

### Kubernetes Security

1. **RBAC**: Minimal permissions
2. **Network policies**: Traffic control
3. **Pod security**: Seccomp, AppArmor
4. **Secrets management**: Encrypted at rest
5. **Service accounts**: Dedicated per service

## 🧪 Testing

### Run CI Locally

```bash
# Type checking
npm run tsc --noEmit

# Linting
npm run lint

# Tests with coverage
npm run test:coverage

# Build
npm run build

# Lighthouse
npm run preview
npx lighthouse http://localhost:3003 --view
```

### Docker Testing

```bash
# Build image
docker build -t rideshare-app:test .

# Run container
docker run -d -p 8080:8080 --name test rideshare-app:test

# Test health
curl http://localhost:8080/health

# Check logs
docker logs test

# Stop and remove
docker stop test && docker rm test
```

### Kubernetes Testing

```bash
# Apply manifests
kubectl apply -f kubernetes/

# Check deployment
kubectl rollout status deployment/rideshare-frontend -n rideshare-app

# Port forward
kubectl port-forward svc/rideshare-frontend-service 8080:80 -n rideshare-app

# Test locally
curl http://localhost:8080/health
```

## 📈 Performance Optimization

### Bundle Size Targets

- Main bundle: < 500KB (gzipped)
- Vendor: < 350KB (gzipped)
- MUI: < 120KB (gzipped)
- Charts: < 110KB (gzipped)
- AI: < 40KB (gzipped)
- Maps: < 50KB (gzipped)

### Lighthouse Targets

- Performance: ≥ 85
- Accessibility: ≥ 90
- Best Practices: ≥ 90
- SEO: ≥ 85
- FCP: < 2s
- LCP: < 3s
- CLS: < 0.1
- TBT: < 300ms

### Kubernetes Resource Tuning

```yaml
# Adjust based on actual usage
requests:
  memory: "256Mi"  # Minimum needed
  cpu: "200m"      # 0.2 CPU cores

limits:
  memory: "512Mi"  # Maximum allowed
  cpu: "500m"      # 0.5 CPU cores
```

## 🐛 Troubleshooting

### CI Pipeline Failures

**Type checking fails**:
```bash
npm run tsc --noEmit
# Fix TypeScript errors
```

**Linting fails**:
```bash
npm run lint -- --fix
# Fix remaining issues manually
```

**Tests fail**:
```bash
npm test -- --verbose
# Check test output
```

**Bundle size exceeds limit**:
```bash
npm run build
npm run analyze
# Check dist/stats.html
# Optimize imports and lazy loading
```

**Lighthouse fails**:
```bash
npm run preview
npx lighthouse http://localhost:3003 --view
# Check specific metrics
# Optimize performance
```

### Deployment Failures

**Vercel deployment fails**:
- Check VERCEL_TOKEN is valid
- Verify project ID and org ID
- Check build logs

**Kubernetes deployment fails**:
```bash
kubectl describe pod <pod-name> -n rideshare-app
kubectl logs <pod-name> -n rideshare-app
```

**Health check fails**:
```bash
kubectl exec -it <pod-name> -n rideshare-app -- curl localhost:8080/health
# Check nginx logs
kubectl logs <pod-name> -n rideshare-app
```

### Docker Issues

**Build fails**:
```bash
docker build -t rideshare-app:debug --progress=plain .
# Check build output
```

**Container crashes**:
```bash
docker logs <container-id>
# Check error messages
```

**Health check fails**:
```bash
docker exec -it <container-id> curl localhost:8080/health
docker exec -it <container-id> cat /usr/share/nginx/html/health
```

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Documentation](https://vercel.com/docs)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

## 🎉 Summary

Your DevOps setup now includes:
- ✅ Comprehensive CI pipeline with quality gates
- ✅ Automated deployment to Vercel
- ✅ Production-grade Docker images
- ✅ Security-hardened Nginx configuration
- ✅ Kubernetes manifests with best practices
- ✅ Health checks and monitoring
- ✅ Horizontal pod autoscaling
- ✅ RBAC and security policies
- ✅ Performance testing with Lighthouse
- ✅ Bundle size monitoring
- ✅ Automated notifications

Ready for production deployment! 🚀
