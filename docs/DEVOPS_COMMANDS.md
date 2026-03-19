# DevOps Commands Quick Reference

## 🚀 CI/CD Commands

### GitHub Actions

```bash
# List workflows
gh workflow list

# View workflow runs
gh run list

# View specific run
gh run view <run-id>

# Trigger manual deployment
gh workflow run deploy.yml -f environment=production

# Cancel a run
gh run cancel <run-id>

# Download artifacts
gh run download <run-id>
```

### Local CI Testing

```bash
# Run all CI checks locally
npm run tsc --noEmit && \
npm run lint && \
npm run test:coverage && \
npm run build

# Type checking
npm run tsc --noEmit

# Linting (with auto-fix)
npm run lint -- --fix

# Tests with coverage
npm run test:coverage

# Build production bundle
npm run build

# Analyze bundle
npm run analyze

# Preview production build
npm run preview
```

## 🐳 Docker Commands

### Build & Run

```bash
# Build image
docker build -t rideshare-app:latest .

# Build with specific tag
docker build -t rideshare-app:v1.0.0 .

# Build without cache
docker build --no-cache -t rideshare-app:latest .

# Run container
docker run -d -p 8080:8080 --name rideshare rideshare-app:latest

# Run with environment variables
docker run -d -p 8080:8080 \
  -e NODE_ENV=production \
  --name rideshare \
  rideshare-app:latest

# Run interactively
docker run -it --rm -p 8080:8080 rideshare-app:latest sh
```

### Container Management

```bash
# List running containers
docker ps

# List all containers
docker ps -a

# Stop container
docker stop rideshare

# Start container
docker start rideshare

# Restart container
docker restart rideshare

# Remove container
docker rm rideshare

# Remove container (force)
docker rm -f rideshare

# View logs
docker logs rideshare

# Follow logs
docker logs -f rideshare

# Execute command in container
docker exec -it rideshare sh

# Check health
docker exec rideshare curl localhost:8080/health
```

### Image Management

```bash
# List images
docker images

# Remove image
docker rmi rideshare-app:latest

# Remove unused images
docker image prune

# Remove all unused data
docker system prune -a

# Tag image
docker tag rideshare-app:latest registry.example.com/rideshare-app:latest

# Push to registry
docker push registry.example.com/rideshare-app:latest

# Pull from registry
docker pull registry.example.com/rideshare-app:latest

# Inspect image
docker inspect rideshare-app:latest

# View image history
docker history rideshare-app:latest
```

### Docker Compose (if using)

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild and start
docker-compose up -d --build

# Scale service
docker-compose up -d --scale frontend=3
```

## ☸️ Kubernetes Commands

### Cluster Management

```bash
# Get cluster info
kubectl cluster-info

# Get nodes
kubectl get nodes

# Describe node
kubectl describe node <node-name>

# Get namespaces
kubectl get namespaces

# Create namespace
kubectl create namespace rideshare-app

# Set default namespace
kubectl config set-context --current --namespace=rideshare-app
```

### Deployment Management

```bash
# Apply all manifests
kubectl apply -f kubernetes/

# Apply specific manifest
kubectl apply -f kubernetes/deployment.yaml

# Get deployments
kubectl get deployments -n rideshare-app

# Describe deployment
kubectl describe deployment rideshare-frontend -n rideshare-app

# Get deployment status
kubectl rollout status deployment/rideshare-frontend -n rideshare-app

# View rollout history
kubectl rollout history deployment/rideshare-frontend -n rideshare-app

# Rollback deployment
kubectl rollout undo deployment/rideshare-frontend -n rideshare-app

# Rollback to specific revision
kubectl rollout undo deployment/rideshare-frontend --to-revision=2 -n rideshare-app

# Restart deployment
kubectl rollout restart deployment/rideshare-frontend -n rideshare-app

# Scale deployment
kubectl scale deployment rideshare-frontend --replicas=5 -n rideshare-app

# Update image
kubectl set image deployment/rideshare-frontend \
  frontend=registry.example.com/rideshare-app:v1.0.1 \
  -n rideshare-app
```

### Pod Management

```bash
# Get pods
kubectl get pods -n rideshare-app

# Get pods with more info
kubectl get pods -n rideshare-app -o wide

# Watch pods
kubectl get pods -n rideshare-app -w

# Describe pod
kubectl describe pod <pod-name> -n rideshare-app

# Get pod logs
kubectl logs <pod-name> -n rideshare-app

# Follow pod logs
kubectl logs -f <pod-name> -n rideshare-app

# Get logs from previous container
kubectl logs <pod-name> -n rideshare-app --previous

# Execute command in pod
kubectl exec -it <pod-name> -n rideshare-app -- sh

# Execute specific command
kubectl exec <pod-name> -n rideshare-app -- curl localhost:8080/health

# Copy files to/from pod
kubectl cp <pod-name>:/path/to/file ./local-file -n rideshare-app
kubectl cp ./local-file <pod-name>:/path/to/file -n rideshare-app

# Delete pod
kubectl delete pod <pod-name> -n rideshare-app

# Force delete pod
kubectl delete pod <pod-name> -n rideshare-app --force --grace-period=0
```

### Service Management

```bash
# Get services
kubectl get services -n rideshare-app

# Describe service
kubectl describe service rideshare-frontend-service -n rideshare-app

# Get endpoints
kubectl get endpoints -n rideshare-app

# Port forward
kubectl port-forward svc/rideshare-frontend-service 8080:80 -n rideshare-app

# Port forward to pod
kubectl port-forward <pod-name> 8080:8080 -n rideshare-app
```

### ConfigMap & Secrets

```bash
# Get configmaps
kubectl get configmaps -n rideshare-app

# Describe configmap
kubectl describe configmap rideshare-config -n rideshare-app

# Edit configmap
kubectl edit configmap rideshare-config -n rideshare-app

# Get secrets
kubectl get secrets -n rideshare-app

# Describe secret
kubectl describe secret <secret-name> -n rideshare-app

# Create secret from literal
kubectl create secret generic my-secret \
  --from-literal=key1=value1 \
  --from-literal=key2=value2 \
  -n rideshare-app

# Create secret from file
kubectl create secret generic my-secret \
  --from-file=./secret-file \
  -n rideshare-app
```

### HPA Management

```bash
# Get HPA
kubectl get hpa -n rideshare-app

# Describe HPA
kubectl describe hpa rideshare-frontend-hpa -n rideshare-app

# Watch HPA
kubectl get hpa -n rideshare-app -w

# Edit HPA
kubectl edit hpa rideshare-frontend-hpa -n rideshare-app
```

### Resource Monitoring

```bash
# Get resource usage (requires metrics-server)
kubectl top nodes

# Get pod resource usage
kubectl top pods -n rideshare-app

# Get pod resource usage (sorted)
kubectl top pods -n rideshare-app --sort-by=memory
kubectl top pods -n rideshare-app --sort-by=cpu

# Get all resources
kubectl get all -n rideshare-app

# Get events
kubectl get events -n rideshare-app

# Get events (sorted)
kubectl get events -n rideshare-app --sort-by='.lastTimestamp'
```

### Debugging

```bash
# Debug pod
kubectl debug <pod-name> -n rideshare-app -it --image=busybox

# Run temporary pod
kubectl run debug --rm -it --image=busybox -n rideshare-app -- sh

# Check pod status
kubectl get pod <pod-name> -n rideshare-app -o yaml

# Check pod events
kubectl describe pod <pod-name> -n rideshare-app | grep Events -A 20

# Check container logs
kubectl logs <pod-name> -c <container-name> -n rideshare-app

# Check previous container logs
kubectl logs <pod-name> -c <container-name> -n rideshare-app --previous
```

### Cleanup

```bash
# Delete all resources in namespace
kubectl delete all --all -n rideshare-app

# Delete specific resources
kubectl delete deployment rideshare-frontend -n rideshare-app
kubectl delete service rideshare-frontend-service -n rideshare-app

# Delete namespace (and all resources)
kubectl delete namespace rideshare-app

# Delete resources from file
kubectl delete -f kubernetes/
```

## 🔍 Lighthouse CI

```bash
# Run Lighthouse locally
npx lighthouse http://localhost:3003 --view

# Run Lighthouse with specific config
npx lighthouse http://localhost:3003 \
  --config-path=.lighthouserc.json \
  --view

# Run Lighthouse CI
npm install -g @lhci/cli
lhci autorun

# Run Lighthouse with specific categories
npx lighthouse http://localhost:3003 \
  --only-categories=performance,accessibility \
  --view
```

## 📊 Monitoring & Logs

### Application Logs

```bash
# View nginx access logs
kubectl exec <pod-name> -n rideshare-app -- tail -f /var/log/nginx/access.log

# View nginx error logs
kubectl exec <pod-name> -n rideshare-app -- tail -f /var/log/nginx/error.log

# View all logs
kubectl logs -f deployment/rideshare-frontend -n rideshare-app --all-containers=true
```

### Health Checks

```bash
# Check health endpoint (local)
curl http://localhost:8080/health

# Check health endpoint (Kubernetes)
kubectl exec <pod-name> -n rideshare-app -- curl localhost:8080/health

# Check health endpoint (production)
curl https://your-domain.com/health

# Check build info
curl https://your-domain.com/build-info.json
```

### Performance Testing

```bash
# Apache Bench
ab -n 1000 -c 10 http://localhost:8080/

# wrk
wrk -t12 -c400 -d30s http://localhost:8080/

# Hey
hey -n 1000 -c 10 http://localhost:8080/
```

## 🔐 Security

### Security Scanning

```bash
# npm audit
npm audit

# npm audit (fix)
npm audit fix

# npm audit (high severity only)
npm audit --audit-level=high

# Snyk scan
npx snyk test

# Snyk monitor
npx snyk monitor

# Trivy scan (Docker image)
trivy image rideshare-app:latest

# Trivy scan (filesystem)
trivy fs .
```

### Certificate Management

```bash
# Check certificate
openssl s_client -connect your-domain.com:443 -servername your-domain.com

# View certificate details
echo | openssl s_client -connect your-domain.com:443 2>/dev/null | openssl x509 -noout -text
```

## 🔄 Backup & Restore

### Kubernetes Backup

```bash
# Backup all resources
kubectl get all -n rideshare-app -o yaml > backup.yaml

# Backup specific resource
kubectl get deployment rideshare-frontend -n rideshare-app -o yaml > deployment-backup.yaml

# Restore from backup
kubectl apply -f backup.yaml
```

## 📈 Scaling

```bash
# Manual scaling
kubectl scale deployment rideshare-frontend --replicas=5 -n rideshare-app

# Autoscaling
kubectl autoscale deployment rideshare-frontend \
  --min=2 --max=10 --cpu-percent=70 \
  -n rideshare-app

# Check autoscaling status
kubectl get hpa -n rideshare-app -w
```

## 🎯 Quick Troubleshooting

```bash
# Pod not starting
kubectl describe pod <pod-name> -n rideshare-app
kubectl logs <pod-name> -n rideshare-app

# Service not accessible
kubectl get endpoints -n rideshare-app
kubectl describe service rideshare-frontend-service -n rideshare-app

# High memory usage
kubectl top pods -n rideshare-app --sort-by=memory

# High CPU usage
kubectl top pods -n rideshare-app --sort-by=cpu

# Check resource limits
kubectl describe pod <pod-name> -n rideshare-app | grep -A 5 "Limits"
```

## 📚 Useful Aliases

Add to your `.bashrc` or `.zshrc`:

```bash
# Kubectl aliases
alias k='kubectl'
alias kgp='kubectl get pods'
alias kgs='kubectl get services'
alias kgd='kubectl get deployments'
alias kl='kubectl logs'
alias kd='kubectl describe'
alias ke='kubectl exec -it'
alias kpf='kubectl port-forward'

# Docker aliases
alias d='docker'
alias dps='docker ps'
alias di='docker images'
alias dl='docker logs'
alias de='docker exec -it'

# Application aliases
alias rideshare-logs='kubectl logs -f deployment/rideshare-frontend -n rideshare-app'
alias rideshare-health='kubectl exec -it $(kubectl get pod -l app=rideshare-frontend -n rideshare-app -o jsonpath="{.items[0].metadata.name}") -n rideshare-app -- curl localhost:8080/health'
```

---

**Tip**: Use `kubectl explain <resource>` to get documentation for any Kubernetes resource!

Example: `kubectl explain deployment.spec.template.spec.containers`
