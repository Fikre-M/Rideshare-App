# Rideshare App Deployment Script (PowerShell)
# Usage: .\scripts\deploy.ps1 [command] [environment] [version]

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("build", "deploy", "full", "rollback", "status", "cleanup")]
    [string]$Command,
    
    [string]$Environment = "staging",
    [string]$Version = "latest"
)

# Configuration
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$Namespace = "rideshare-app"

# Colors for output
$Colors = @{
    Red = "Red"
    Green = "Green"
    Yellow = "Yellow"
    Blue = "Blue"
    White = "White"
}

# Logging functions
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Colors.Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Colors.Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Colors.Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Colors.Red
}

# Check prerequisites
function Test-Prerequisites {
    Write-Info "Checking prerequisites..."
    
    # Check if kubectl is installed
    if (-not (Get-Command kubectl -ErrorAction SilentlyContinue)) {
        Write-Error "kubectl is not installed. Please install kubectl first."
        exit 1
    }
    
    # Check if docker is installed
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Error "docker is not installed. Please install docker first."
        exit 1
    }
    
    # Check kubectl connection
    try {
        kubectl cluster-info | Out-Null
    }
    catch {
        Write-Error "Cannot connect to Kubernetes cluster. Please check your kubeconfig."
        exit 1
    }
    
    Write-Success "Prerequisites check passed"
}

# Build and push Docker image
function Build-AndPush {
    Write-Info "Building and pushing Docker image..."
    
    Set-Location $ProjectRoot
    
    # Build the image
    docker build -t "ghcr.io/your-org/rideshare-app:$Version" .
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Docker build failed"
        exit 1
    }
    
    # Push to registry
    docker push "ghcr.io/your-org/rideshare-app:$Version"
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Docker push failed"
        exit 1
    }
    
    Write-Success "Docker image built and pushed successfully"
}

# Deploy to Kubernetes
function Deploy-Kubernetes {
    Write-Info "Deploying to Kubernetes..."
    
    Set-Location $ProjectRoot
    
    # Create namespace if it doesn't exist
    kubectl create namespace $Namespace --dry-run=client -o yaml | kubectl apply -f -
    
    # Apply configurations in order
    Write-Info "Applying namespace and RBAC..."
    kubectl apply -f kubernetes/namespace.yaml
    
    Write-Info "Applying ConfigMaps..."
    kubectl apply -f kubernetes/configmap.yaml
    
    Write-Info "Applying Secrets..."
    kubectl apply -f kubernetes/secrets.yaml
    
    Write-Info "Applying Services..."
    kubectl apply -f kubernetes/service.yaml
    
    Write-Info "Applying Deployment..."
    # Update image version in deployment
    $deploymentContent = Get-Content kubernetes/deployment.yaml -Raw
    $updatedContent = $deploymentContent -replace "ghcr.io/your-org/rideshare-app:latest", "ghcr.io/your-org/rideshare-app:$Version"
    $updatedContent | kubectl apply -f -
    
    Write-Info "Applying HPA..."
    kubectl apply -f kubernetes/hpa.yaml
    
    Write-Info "Applying PodDisruptionBudget..."
    kubectl apply -f kubernetes/poddisruptionbudget.yaml
    
    Write-Info "Applying NetworkPolicy..."
    kubectl apply -f kubernetes/networkpolicy.yaml
    
    Write-Info "Applying Ingress..."
    kubectl apply -f kubernetes/ingress.yaml
    
    Write-Success "Kubernetes deployment completed"
}

# Wait for deployment to be ready
function Wait-ForDeployment {
    Write-Info "Waiting for deployment to be ready..."
    
    kubectl rollout status deployment/rideshare-frontend -n $Namespace --timeout=300s
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Deployment failed to become ready"
        exit 1
    }
    
    Write-Success "Deployment is ready"
}

# Run health checks
function Test-Health {
    Write-Info "Running health checks..."
    
    # Port forward for health check
    $portForwardJob = Start-Job -ScriptBlock {
        kubectl port-forward service/rideshare-frontend-service 8080:80 -n $using:Namespace
    }
    
    Start-Sleep -Seconds 5
    
    # Health check
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/health" -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Success "Health check passed"
        } else {
            Write-Error "Health check failed with status code: $($response.StatusCode)"
            Stop-Job $portForwardJob -Force
            exit 1
        }
    }
    catch {
        Write-Error "Health check failed: $($_.Exception.Message)"
        Stop-Job $portForwardJob -Force
        exit 1
    }
    
    # Clean up port forward
    Stop-Job $portForwardJob -Force
}

# Rollback deployment
function Invoke-Rollback {
    Write-Warning "Rolling back deployment..."
    kubectl rollout undo deployment/rideshare-frontend -n $Namespace
    kubectl rollout status deployment/rideshare-frontend -n $Namespace
    Write-Success "Rollback completed"
}

# Show deployment status
function Show-Status {
    Write-Info "Deployment Status:"
    Write-Host "===================="
    
    Write-Host "`nPods:" -ForegroundColor $Colors.Blue
    kubectl get pods -n $Namespace -l app=rideshare-frontend
    
    Write-Host "`nServices:" -ForegroundColor $Colors.Blue
    kubectl get services -n $Namespace
    
    Write-Host "`nIngress:" -ForegroundColor $Colors.Blue
    kubectl get ingress -n $Namespace
    
    Write-Host "`nHPA:" -ForegroundColor $Colors.Blue
    kubectl get hpa -n $Namespace
    
    Write-Host "`nRecent Events:" -ForegroundColor $Colors.Blue
    kubectl get events -n $Namespace --sort-by='.lastTimestamp' | Select-Object -Last 10
}

# Cleanup resources
function Remove-Resources {
    Write-Warning "Cleaning up resources..."
    kubectl delete namespace $Namespace --ignore-not-found=true
    Write-Success "Cleanup completed"
}

# Main execution
Write-Info "Starting deployment for environment: $Environment, version: $Version"

try {
    switch ($Command) {
        "build" {
            Test-Prerequisites
            Build-AndPush
        }
        "deploy" {
            Test-Prerequisites
            Deploy-Kubernetes
            Wait-ForDeployment
            Test-Health
            Show-Status
        }
        "full" {
            Test-Prerequisites
            Build-AndPush
            Deploy-Kubernetes
            Wait-ForDeployment
            Test-Health
            Show-Status
        }
        "rollback" {
            Invoke-Rollback
        }
        "status" {
            Show-Status
        }
        "cleanup" {
            Remove-Resources
        }
    }
}
catch {
    Write-Error "Deployment failed: $($_.Exception.Message)"
    exit 1
}