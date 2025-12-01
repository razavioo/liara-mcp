# Liara Platform Research Documentation

## Overview

Liara is a comprehensive Iranian Cloud Platform offering multiple services including PaaS, DBaaS, IaaS, Object Storage, Email Server, and DNS Management. This document contains all essential information for building an MCP server.

## Base URLs

- **Website**: https://liara.ir
- **Documentation**: https://docs.liara.ir
- **API Base URL**: https://api.iran.liara.ir
- **OpenAPI Spec**: https://openapi.liara.ir/paas.yaml
- **WebSocket**: wss://api.iran.liara.ir

## Authentication

### API Token (Bearer Token)

- **Method**: JWT Bearer Token
- **Header**: `Authorization: Bearer $TOKEN`
- **Token Generation**: Available in Liara console under API section
- **Team Access**: Use `teamID` parameter for team-specific operations

### WebSocket Authentication

```
wss://api.iran.liara.ir?token=<api-token>&cmd=/bin/bash&project_id=<project-id>&teamID=<team-id>
```

## Services Overview

### 1. PaaS (Platform as a Service)

Supported platforms:
- **Node.js** - NodeJS applications
- **Next.js** - React framework
- **Laravel** - PHP framework
- **PHP** - General PHP applications
- **Django** - Python framework
- **Flask** - Python micro-framework
- **.NET** - Microsoft framework
- **Static** - Static websites
- **React** - React applications
- **Angular** - Angular applications
- **Vue** - Vue.js applications
- **Docker** - Custom Docker containers
- **Python** - General Python applications
- **Go** - Go applications

Additional platforms via Docker:
- Nginx, Streamlit, FastAPI, ArangoDB, Deno, Bun, Seq, Flutter

### 2. DBaaS (Database as a Service)

Supported databases:
- **MariaDB**
- **MySQL**
- **PostgreSQL**
- **MSSQL** (SQL Server)
- **MongoDB**
- **Redis**
- **ElasticSearch**
- **RabbitMQ**

### 3. Object Storage

S3-compatible object storage service for file storage and CDN.

### 4. Email Server

Transactional email service with SMTP support and email management.

### 5. DNS Management System

Free DNS zone management service for domain configuration.

### 6. IaaS (Infrastructure as a Service)

Virtual machine provisioning and management.

## API Endpoints

### Apps Management

#### GET /v1/projects
Get all projects (apps) details.

#### POST /v1/projects
Create a new app.

**Request Body**:
```json
{
  "name": "string",
  "platform": "string",
  "planID": "string"
}
```

#### GET /v1/projects/{name}
Get specific project details.

#### DELETE /v1/projects/{name}
Delete an app.

#### POST /v1/projects/{name}/actions/scale
Turn app on/off.

**Request Body**:
```json
{
  "scale": 0 | 1
}
```

#### POST /v1/projects/{name}/actions/restart
Restart an app.

#### POST /v1/projects/{name}/resize
Change app plan.

**Request Body**:
```json
{
  "planID": "string"
}
```

### Deployment

#### POST /v2/projects/{name}/sources
Deploy source code (upload .gz file).

**Content-Type**: multipart/form-data

**Response**:
```json
{
  "sourceID": "string"
}
```

#### POST /v2/projects/{name}/releases
Deploy release.

**Response**:
```json
{
  "releaseID": "string"
}
```

### Settings

#### POST /v1/projects/{id}/zero-downtime/{status}
Enable/disable zero-downtime deployment.

**Path Parameters**:
- `id`: Project ID
- `status`: "enable" or "disable"

#### POST /v1/projects/{id}/default-subdomain/{status}
Enable/disable default subdomain.

#### POST /v1/projects/{id}/fixed-ip/{status}
Enable/disable static IP.

**Response** (when enabling):
```json
{
  "IP": "string"
}
```

#### POST /v1/projects/{id}/read-only/{status}
Enable/disable read-only mode.

#### POST /v1/projects/update-envs
Update environment variables.

**Request Body**:
```json
{
  "project": "string",
  "variables": [
    {
      "key": "string",
      "value": "string"
    }
  ]
}
```

### Disks Management

#### POST /v1/projects/{name}/disks/{dname}/ftp
Create FTP access for disk.

### Domains Management

#### GET /v1/domains/{id}/check
Check domain status.

### Reports

#### GET /v1/projects/{name}/metrics/summary
Get app metrics summary.

## CLI Commands

### Installation

```bash
npm install -g @liara/cli
```

### Account Management

- `liara login` - Login to account
- `liara account add` - Add new account
- `liara account list` / `liara account ls` - List accounts
- `liara account use` - Switch account
- `liara account remove` / `liara account rm` - Remove account

### App Management

- `liara create` - Create new app
- `liara deploy` - Deploy app
- `liara app list` / `liara app ls` - List apps
- `liara app delete` - Delete app
- `liara app start` - Start app
- `liara app stop` - Stop app
- `liara app restart` - Restart app
- `liara app logs` - View app logs
- `liara app shell` - Access app shell
- `liara shell` - Quick shell access
- `liara logs` - Quick logs access
- `liara start` - Quick start
- `liara stop` - Quick stop
- `liara restart` - Quick restart

### Database Management

- `liara db create` - Create database
- `liara db list` / `liara db ls` - List databases
- `liara db start` - Start database
- `liara db stop` - Stop database
- `liara db resize` - Resize database
- `liara db remove` / `liara db rm` - Delete database
- `liara db backup create` - Create backup
- `liara db backup list` / `liara db backup ls` - List backups
- `liara db backup download` / `liara db backup dl` - Download backup

### Storage (Bucket) Management

- `liara bucket create` - Create bucket
- `liara bucket list` / `liara bucket ls` - List buckets
- `liara bucket delete` - Delete bucket

### Environment Variables

- `liara env list` / `liara env ls` - List environment variables
- `liara env set [ENV]` - Set environment variable
- `liara env unset [ENV]` - Unset environment variable

### Disk Management

- `liara disk create` - Create disk

### Email Management

- `liara mail create` - Create email server
- `liara mail list` / `liara mail ls` - List email servers
- `liara mail delete` - Delete email server
- `liara mail send` - Send email

### Network Management

- `liara network create` - Create network
- `liara network list` / `liara network ls` - List networks

### DNS Zone Management

- `liara zone create` - Create DNS zone
- `liara zone list` / `liara zone ls` - List zones
- `liara zone get` - Get zone details
- `liara zone delete` / `liara zone del` / `liara zone rm` - Delete zone
- `liara zone check` / `liara zone ch` - Check zone
- `liara zone record create ZONE` - Create DNS record
- `liara zone record list` / `liara zone record ls` - List records
- `liara zone record get` - Get record details
- `liara zone record update` - Update record
- `liara zone record remove` / `liara zone record rm` - Remove record

### VM Management

- `liara vm create` - Create virtual machine
- `liara vm list` - List VMs
- `liara vm info` / `liara vm inspect` / `liara vm show` - Get VM details
- `liara vm start` - Start VM
- `liara vm stop` - Stop VM
- `liara vm restart` - Restart VM
- `liara vm shutdown` - Shutdown VM
- `liara vm power off` - Power off VM
- `liara vm delete` / `liara vm rm` - Delete VM

### Plan Management

- `liara plan list` / `liara plan ls` - List available plans

### Other Commands

- `liara init` - Initialize project configuration
- `liara help [COMMAND]` - Get help
- `liara version` - Show version
- `liara autocomplete [SHELL]` - Setup autocomplete

## Key Features to Implement in MCP Server

### Core Capabilities

1. **App Lifecycle Management**
   - Create, deploy, start, stop, restart, delete apps
   - Scale apps (turn on/off)
   - Change app plans

2. **Deployment Operations**
   - Source code deployment
   - Release deployment
   - Real-time deployment logs via WebSocket

3. **Configuration Management**
   - Environment variables CRUD
   - Zero-downtime deployment settings
   - Static IP configuration
   - Read-only mode

4. **Database Operations**
   - Create, start, stop, resize, delete databases
   - Backup management
   - Database connection info

5. **Storage Management**
   - Bucket CRUD operations
   - Object storage access

6. **Domain & DNS**
   - Domain management
   - DNS zone and record management

7. **Monitoring & Logs**
   - App logs streaming
   - Metrics and reports
   - Real-time monitoring

8. **Email Services**
   - Email server management
   - Send transactional emails

9. **Infrastructure**
   - VM lifecycle management
   - Network management
   - Disk management

10. **Team Collaboration**
    - Team-aware operations
    - Multi-account support

## Screenshots & Recordings

All captured screenshots are available in the artifacts directory:
- `liara_homepage_*.png` - Homepage overview
- `liara_docs_main_*.png` - Documentation structure
- `openapi_*.png` - API endpoint details
- `cli_*.png` - CLI documentation
- `*.webp` - Browser navigation recordings

## References

- [Liara Documentation](https://docs.liara.ir)
- [OpenAPI Specification](https://openapi.liara.ir)
- [CLI GitHub Repository](https://github.com/liara-cloud/cli)
- [API Documentation](https://docs.liara.ir/references/api/about/)
