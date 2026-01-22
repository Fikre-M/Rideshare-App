#!/bin/bash

# Rideshare App Deployment Script
# Usage: ./scripts/deploy.sh [environment] [version]

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENVIRONMENT=${1:-staging}
VERSION=${2:-latest}
NAMESPACE="rideshare-app"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if kubectl is installed
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed. Please install kubectl first."
        exit 1
    fi
    
    # Check if docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "docker is not installed. Please install docker first."
        exit 1
    fi
    
    # Check kubectl connection
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Cannot connect to Kubernetes cluster. Please check your kubeconfig."
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Build and push Docker image
build_and_push() {
    log_info "Building and pushing Docker image..."
    
    cd "$PROJECT_ROOT"
    
    # Build the image
    docker build -t "ghcr.io/your-org/rideshare-app:${VERSION}" .
    
    # Push to registry
    docker push "ghcr.io/your-org/rideshare-app:${VERSION}"
    
    log_success "Docker image built and pushed successfully"
}

# Deploy to Kubernetes
deploy_kubernetes() {
    log_info "Deploying to Kubernetes..."
    
    cd "$PROJECT_ROOT"
    
    # Create namespace if it doesn't exist
    kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -
    
    # Apply configurations in order
    log_info "Applying namespace and RBAC..."
    kubectl apply -f kubernetes/namespace.yaml
    
    log_info "Applying ConfigMaps..."
    kubectl apply -f kubernetes/configmap.yaml
    
    log_info "Applying Secrets..."
    kubectl apply -f kubernetes/secrets.yaml
    
    log_info "Applying Services..."
    kubectl apply -f kubernetes/service.yaml
    
    log_info "Applying Deployment..."
    # Update image version in deployment
    sed "s|ghcr.io/your-org/rideshare-app:latest|ghcr.io/your-org/rideshare-app:${VERSION}|g" kubernetes/deployment.yaml | kubectl apply -f -
    
    log_info "Applying HPA..."
    kubectl apply -f kubernetes/hpa.yaml
    
    log_info "Applying PodDisruptionBudget..."
    kubectl apply -f kubernetes/poddisruptionbudget.yaml
    
    log_info "Applying NetworkPolicy..."
    kubectl apply -f kubernetes/networkpolicy.yaml
    
    log_info "Applying Ingress..."
    kubectl apply -f kubernetes/ingress.yaml
    
    log_success "Kubernetes deployment completed"
}

# Wait for deployment to be ready
wait_for_deployment() {
    log_info "Waiting for deployment to be ready..."
    
    kubectl rollout status deployment/rideshare-frontend -n "$NAMESPACE" --timeout=300s
    
    log_success "Deployment is ready"
}

# Run health checks
health_check() {
    log_info "Running health checks..."
    
    # Get service endpoint
    SERVICE_IP=$(kubectl get service rideshare-frontend-service -n "$NAMESPACE" -o jsonpath='{.spec.clusterIP}')
    
    # Port forward for health check
    kubectl port-forward service/rideshare-frontend-service 8080:80 -n "$NAMESPACE" &
    PORT_FORWARD_PID=$!
    
    sleep 5
    
    # Health check
    if curl -f http://localhost:8080/health > /dev/null 2>&1; then
        log_success "Health check passed"
    else
        log_error "Health check failed"
        kill $PORT_FORWARD_PID 2>/dev/null || true
        exit 1
    fi
    
    # Clean up port forward
    kill $PORT_FORWARD_PID 2>/dev/null || true
}

# Rollback deployment
rollback() {
    log_warning "Rolling back deployment..."
    kubectl rollout undo deployment/rideshare-frontend -n "$NAMESPACE"
    kubectl rollout status deployment/rideshare-frontend -n "$NAMESPACE"
    log_success "Rollback completed"
}

# Show deployment status
show_status() {
    log_info "Deployment Status:"
    echo "===================="
    
    echo -e "\n${BLUE}Pods:${NC}"
    kubectl get pods -n "$NAMESPACE" -l app=rideshare-frontend
    
    echo -e "\n${BLUE}Services:${NC}"
    kubectl get services -n "$NAMESPACE"
    
    echo -e "\n${BLUE}Ingress:${NC}"
    kubectl get ingress -n "$NAMESPACE"
    
    echo -e "\n${BLUE}HPA:${NC}"
    kubectl get hpa -n "$NAMESPACE"
    
    echo -e "\n${BLUE}Recent Events:${NC}"
    kubectl get events -n "$NAMESPACE" --sort-by='.lastTimestamp' | tail -10
}

# Cleanup resources
cleanup() {
    log_warning "Cleaning up resources..."
    kubectl delete namespace "$NAMESPACE" --ignore-not-found=true
    log_success "Cleanup completed"
}

# Main deployment function
main() {
    log_info "Starting deployment for environment: $ENVIRONMENT, version: $VERSION"
    
    case "$1" in
        "build")
            check_prerequisites
            build_and_push
            ;;
        "deploy")
            check_prerequisites
            deploy_kubernetes
            wait_for_deployment
            health_check
            show_status
            ;;
        "full")
            check_prerequisites
            build_and_push
            deploy_kubernetes
            wait_for_deployment
            health_check
            show_status
            ;;
        "rollback")
            rollback
            ;;
        "status")
            show_status
            ;;
        "cleanup")
            cleanup
            ;;
        *)
            echo "Usage: $0 {build|deploy|full|rollback|status|cleanup} [environment] [version]"
            echo ""
            echo "Commands:"
            echo "  build    - Build and push Docker image"
            echo "  deploy   - Deploy to Kubernetes"
            echo "  full     - Build, push, and deploy"
            echo "  rollback - Rollback to previous version"
            echo "  status   - Show deployment status"
            echo "  cleanup  - Remove all resources"
            echo ""
            echo "Examples:"
            echo "  $0 full staging v1.2.3"
            echo "  $0 deploy production latest"
            echo "  $0 rollback"
            exit 1
            ;;
    esac
}

# Trap errors and cleanup
trap 'log_error "Deployment failed"; exit 1' ERR

# Run main function
main "$@"