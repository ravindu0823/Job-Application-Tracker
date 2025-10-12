# Deployment Guide

This guide will help you deploy the Job Application Tracker API to Azure or AWS using GitHub Actions workflows.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Triggering Deployments](#triggering-deployments)
- [Azure Deployment Setup](#azure-deployment-setup)
- [AWS Deployment Setup](#aws-deployment-setup)
- [Discord Notifications Setup](#discord-notifications-setup)
- [Monitoring and Troubleshooting](#monitoring-and-troubleshooting)

## Prerequisites

- GitHub repository with Actions enabled
- Azure account (for Azure deployment) OR AWS account (for AWS deployment)
- Discord server (for notifications)

## 🚀 Triggering Deployments

The workflows are configured to run **ONLY** when:

1. **Commit message contains "deploy"**
   ```bash
   git commit -m "deploy: update API endpoints"
   git push
   ```

2. **Manual trigger via GitHub Actions UI**
   - Go to Actions tab in GitHub
   - Select the deployment workflow
   - Click "Run workflow"
   - Choose environment (staging/production)

### Examples of Valid Commit Messages

✅ **Will trigger deployment:**
- `deploy: fix authentication bug`
- `feat: add new endpoint [deploy]`
- `Deploy to production`
- `Update API - ready to deploy`

❌ **Will NOT trigger deployment:**
- `fix: update authentication`
- `feat: add new endpoint`
- `Update API configuration`

## ☁️ Azure Deployment Setup

### Step 1: Create Azure Resources

```bash
# Login to Azure
az login

# Create resource group
az group create --name job-tracker-rg --location eastus

# Create App Service Plan
az appservice plan create \
  --name job-tracker-plan \
  --resource-group job-tracker-rg \
  --sku B1 \
  --is-linux

# Create Azure SQL Server (if needed)
az sql server create \
  --name job-tracker-sql-server \
  --resource-group job-tracker-rg \
  --location eastus \
  --admin-user sqladmin \
  --admin-password <strong-password>

# Create Azure SQL Database
az sql db create \
  --resource-group job-tracker-rg \
  --server job-tracker-sql-server \
  --name job-tracker-db \
  --service-objective S0

# Create Azure Cache for Redis
az redis create \
  --name job-tracker-redis \
  --resource-group job-tracker-rg \
  --location eastus \
  --sku Basic \
  --vm-size c0

# Create Storage Account (for backups/logs)
az storage account create \
  --name jobtrackerstore \
  --resource-group job-tracker-rg \
  --location eastus \
  --sku Standard_LRS
```

### Step 2: Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions, and add:

#### Required Secrets:

| Secret Name | Description | How to Get |
|------------|-------------|------------|
| `AZURE_CREDENTIALS` | Azure service principal credentials | See below |
| `AZURE_SQL_CONNECTION_STRING_STAGING` | Staging database connection string | From Azure Portal |
| `AZURE_SQL_IDENTITY_CONNECTION_STRING_STAGING` | Staging identity database connection string | From Azure Portal |
| `AZURE_REDIS_CONNECTION_STRING_STAGING` | Staging Redis connection string | From Azure Portal |
| `AZURE_SQL_CONNECTION_STRING_PROD` | Production database connection string | From Azure Portal |
| `AZURE_SQL_IDENTITY_CONNECTION_STRING_PROD` | Production identity database connection string | From Azure Portal |
| `AZURE_REDIS_CONNECTION_STRING_PROD` | Production Redis connection string | From Azure Portal |
| `AZURE_STORAGE_CONNECTION_STRING_STAGING` | Staging storage connection string | From Azure Portal |
| `AZURE_STORAGE_CONNECTION_STRING_PROD` | Production storage connection string | From Azure Portal |
| `JWT_SECRET` | JWT secret key | Generate strong random string |
| `JWT_ISSUER` | JWT issuer (e.g., `https://api.jobtracker.com`) | Your domain |
| `JWT_AUDIENCE` | JWT audience (e.g., `https://jobtracker.com`) | Your domain |
| `JWT_EXPIRY_MINUTES` | JWT expiry time in minutes (e.g., `60`) | Your preference |
| `RABBITMQ_HOST_STAGING` | RabbitMQ host for staging | Your RabbitMQ server |
| `RABBITMQ_HOST_PROD` | RabbitMQ host for production | Your RabbitMQ server |
| `RABBITMQ_USERNAME` | RabbitMQ username | Your RabbitMQ username |
| `RABBITMQ_PASSWORD` | RabbitMQ password | Your RabbitMQ password |
| `SEQ_SERVER_URL_STAGING` | Seq logging server URL (staging) | Your Seq server |
| `SEQ_SERVER_URL_PROD` | Seq logging server URL (production) | Your Seq server |
| `DISCORD_WEBHOOK_URL` | Discord webhook URL | See Discord setup below |

#### Creating Azure Service Principal:

```bash
# Create service principal and get credentials
az ad sp create-for-rbac \
  --name "job-tracker-github-actions" \
  --role contributor \
  --scopes /subscriptions/{subscription-id}/resourceGroups/job-tracker-rg \
  --sdk-auth

# Output will be JSON - copy entire output to AZURE_CREDENTIALS secret
```

#### Getting Connection Strings:

```bash
# SQL Connection String
az sql db show-connection-string \
  --client ado.net \
  --server job-tracker-sql-server \
  --name job-tracker-db

# Redis Connection String
az redis list-keys \
  --name job-tracker-redis \
  --resource-group job-tracker-rg

# Storage Connection String
az storage account show-connection-string \
  --name jobtrackerstore \
  --resource-group job-tracker-rg
```

### Step 3: Update Workflow Variables

Edit `.github/workflows/deploy-azure.yml` and update:

```yaml
env:
  AZURE_WEBAPP_NAME: 'job-tracker-api'  # Your app name
  AZURE_RESOURCE_GROUP: 'job-tracker-rg'  # Your resource group
```

## 🔶 AWS Deployment Setup

### Step 1: Create AWS Resources

#### Using AWS CLI:

```bash
# Configure AWS CLI
aws configure

# Create VPC and Subnets (if needed)
# Or use existing VPC

# Create Security Group
aws ec2 create-security-group \
  --group-name job-tracker-sg \
  --description "Security group for Job Tracker API" \
  --vpc-id vpc-xxxxxx

# Allow inbound traffic
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxxx \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxxx \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0

# Create ECR repository
aws ecr create-repository \
  --repository-name job-tracker-api \
  --region us-east-1

# Create ECS execution role
aws iam create-role \
  --role-name ecsTaskExecutionRole \
  --assume-role-policy-document file://trust-policy.json

aws iam attach-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy

# Create Application Load Balancer
aws elbv2 create-load-balancer \
  --name job-tracker-alb-staging \
  --subnets subnet-xxxxx subnet-yyyyy \
  --security-groups sg-xxxxxx

# Create RDS subnet group
aws rds create-db-subnet-group \
  --db-subnet-group-name job-tracker-db-subnet \
  --db-subnet-group-description "Job Tracker DB subnet group" \
  --subnet-ids subnet-xxxxx subnet-yyyyy

# Create ElastiCache subnet group
aws elasticache create-cache-subnet-group \
  --cache-subnet-group-name job-tracker-cache-subnet \
  --cache-subnet-group-description "Job Tracker Cache subnet group" \
  --subnet-ids subnet-xxxxx subnet-yyyyy
```

### Step 2: Store Secrets in AWS Secrets Manager

```bash
# Create database secret
aws secretsmanager create-secret \
  --name job-tracker/db/staging \
  --secret-string "Server=xxx;Database=xxx;User Id=xxx;Password=xxx;"

# Create identity database secret
aws secretsmanager create-secret \
  --name job-tracker/identity-db/staging \
  --secret-string "Server=xxx;Database=xxx;User Id=xxx;Password=xxx;"

# Create Redis secret
aws secretsmanager create-secret \
  --name job-tracker/redis/staging \
  --secret-string "xxx.cache.amazonaws.com:6379"

# Create JWT secret
aws secretsmanager create-secret \
  --name job-tracker/jwt-secret \
  --secret-string "your-jwt-secret-key"
```

### Step 3: Configure GitHub Secrets for AWS

Add these secrets to your GitHub repository:

| Secret Name | Description | How to Get |
|------------|-------------|------------|
| `AWS_ACCESS_KEY_ID` | AWS access key | IAM Console |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | IAM Console |
| `AWS_VPC_ID` | VPC ID | EC2 Console |
| `AWS_SUBNET_IDS` | Comma-separated subnet IDs | EC2 Console |
| `AWS_SECURITY_GROUP_ID` | Security group ID | EC2 Console |
| `AWS_DB_SUBNET_GROUP` | RDS subnet group name | RDS Console |
| `AWS_CACHE_SUBNET_GROUP` | ElastiCache subnet group name | ElastiCache Console |
| `DB_MASTER_USERNAME` | Database master username | Your choice |
| `DB_MASTER_PASSWORD` | Database master password | Strong password |
| `ECS_EXECUTION_ROLE_ARN` | ECS execution role ARN | IAM Console |
| `ECS_TASK_ROLE_ARN` | ECS task role ARN | IAM Console |
| `AWS_SECRET_ARN_DB_STAGING` | Staging DB secret ARN | Secrets Manager |
| `AWS_SECRET_ARN_IDENTITY_STAGING` | Staging Identity DB secret ARN | Secrets Manager |
| `AWS_SECRET_ARN_REDIS_STAGING` | Staging Redis secret ARN | Secrets Manager |
| `AWS_SECRET_ARN_DB_PROD` | Production DB secret ARN | Secrets Manager |
| `AWS_SECRET_ARN_IDENTITY_PROD` | Production Identity DB secret ARN | Secrets Manager |
| `AWS_SECRET_ARN_REDIS_PROD` | Production Redis secret ARN | Secrets Manager |
| `AWS_SECRET_ARN_JWT` | JWT secret ARN | Secrets Manager |
| `DISCORD_WEBHOOK_URL` | Discord webhook URL | See Discord setup below |

### Step 4: Update Workflow Variables

Edit `.github/workflows/deploy-aws.yml` and update:

```yaml
env:
  AWS_REGION: 'us-east-1'  # Your preferred region
  ECR_REPOSITORY: 'job-tracker-api'  # Your ECR repository name
```

## 💬 Discord Notifications Setup

### Step 1: Create Discord Webhook

1. Open your Discord server
2. Go to Server Settings → Integrations
3. Click "Webhooks" → "New Webhook"
4. Name it "GitHub Deployments"
5. Select the channel for notifications
6. Copy the Webhook URL

### Step 2: Add to GitHub Secrets

Add the webhook URL as `DISCORD_WEBHOOK_URL` in your GitHub repository secrets.

### Notification Features

The Discord notifications include:

- ✅ Deployment status (success/failure/cancelled)
- 📦 Repository and branch information
- 👤 Author who triggered the deployment
- 💬 Commit message
- 🔗 Direct link to commit
- 🎯 Separate status for Staging and Production
- 🎨 Color-coded embeds (green=success, red=failure, yellow=cancelled)

### Example Notification

```
🚀 Azure Deployment Status
Deployment completed for Job Application Tracker API

Repository: user/Job-Application-Tracker
Branch: main
Commit: a1b2c3d
Author: johndoe

Deployment Status:
**Staging:** ✅ success
**Production:** ⏭️ skipped

Commit Message:
deploy: fix authentication bug

GitHub Actions • 2024-01-15 10:30:00 UTC
```

## 🔍 Monitoring and Troubleshooting

### Azure Monitoring

1. **Application Insights**: Automatically configured for both staging and production
   - View in Azure Portal → Application Insights
   - Monitor performance, errors, and custom events

2. **App Service Logs**:
   ```bash
   # Stream logs
   az webapp log tail \
     --name job-tracker-api \
     --resource-group job-tracker-rg
   ```

3. **Metrics Dashboard**:
   - Azure Portal → App Service → Monitoring → Metrics
   - Key metrics: CPU, Memory, Response Time, HTTP Errors

### AWS Monitoring

1. **CloudWatch Logs**:
   ```bash
   # View logs
   aws logs tail /ecs/job-tracker-prod --follow
   ```

2. **CloudWatch Alarms**: Automatically configured for:
   - High CPU usage (>80%)
   - High Memory usage (>85%)

3. **ECS Service Health**:
   ```bash
   # Check service status
   aws ecs describe-services \
     --cluster job-tracker-cluster-prod \
     --services job-tracker-service-prod
   ```

### Common Issues

#### Issue: Workflow doesn't run

**Solution**: Ensure commit message contains "deploy" or trigger manually

#### Issue: Discord notification not sent

**Solution**: 
1. Verify `DISCORD_WEBHOOK_URL` is set in secrets
2. Check webhook is active in Discord
3. Review workflow logs for curl errors

#### Issue: Azure deployment fails

**Solution**:
1. Verify all secrets are correctly set
2. Check Azure credentials are valid
3. Ensure resource group and app service exist
4. Review Application Insights for errors

#### Issue: AWS deployment fails

**Solution**:
1. Verify AWS credentials have necessary permissions
2. Check VPC, subnets, and security groups configuration
3. Verify Secrets Manager ARNs are correct
4. Review CloudWatch logs for errors

### Health Check Endpoints

Both deployments include health checks:

- **Azure**: `https://your-app.azurewebsites.net/health`
- **AWS**: `http://your-alb-dns/health`

### Rollback Strategy

#### Azure:
- Uses deployment slots for blue-green deployments
- If issues occur, swap slots back via Azure Portal or CLI:
  ```bash
  az webapp deployment slot swap \
    --name job-tracker-api \
    --resource-group job-tracker-rg \
    --slot production \
    --target-slot staging
  ```

#### AWS:
- ECS maintains minimum healthy instances during deployment
- Rollback by deploying previous task definition:
  ```bash
  aws ecs update-service \
    --cluster job-tracker-cluster-prod \
    --service job-tracker-service-prod \
    --task-definition job-tracker-task:PREVIOUS_VERSION
  ```

## 📊 Auto-scaling Configuration

### Azure

**Staging**:
- Min instances: 1
- Max instances: 5
- Scale out: CPU > 75% for 5 minutes
- Scale in: CPU < 25% for 5 minutes

**Production**:
- Min instances: 2
- Max instances: 10
- Scale out: CPU > 70% for 5 minutes
- Scale in: CPU < 30% for 5 minutes

### AWS

**Staging**:
- Min tasks: 1
- Max tasks: 5
- Target CPU: 70%
- Scale out cooldown: 60 seconds
- Scale in cooldown: 120 seconds

**Production**:
- Min tasks: 3
- Max tasks: 10
- Target CPU: 60%
- Target Memory: 70%
- Scale out cooldown: 60 seconds
- Scale in cooldown: 180 seconds

## 🔐 Security Best Practices

1. **Secrets Management**:
   - Never commit secrets to repository
   - Rotate secrets regularly
   - Use Azure Key Vault or AWS Secrets Manager

2. **Network Security**:
   - Use HTTPS only (enforced in workflows)
   - Configure proper security groups/NSGs
   - Limit database access to application subnets only

3. **Access Control**:
   - Use least privilege principle for service principals/IAM roles
   - Enable MFA for cloud accounts
   - Review and audit access regularly

4. **Compliance**:
   - Enable encryption at rest for databases
   - Enable encryption in transit (SSL/TLS)
   - Configure backup retention policies

## 📚 Additional Resources

- [Azure App Service Documentation](https://docs.microsoft.com/azure/app-service/)
- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [GitHub Actions Documentation](https://docs.github.com/actions)
- [Discord Webhook Documentation](https://discord.com/developers/docs/resources/webhook)

## 🆘 Support

If you encounter issues:

1. Check workflow logs in GitHub Actions
2. Review cloud provider logs (Azure/AWS)
3. Check Discord notifications for deployment status
4. Open an issue in the repository

---

**Last Updated**: October 2025

