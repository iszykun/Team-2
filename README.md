# Team-2 Project Guide

## 📢 Team Announcement

> **Important Notice for All Team Members**

* The **code merge process will officially start next week**.
* **Branch protection rules have been configured on the `main` branch.**
* Direct pushes or merges to `main` are **NOT allowed**.
* All Pull Requests (PRs) will be reviewed by the **repository administrator** before merging.
* After creating your Pull Request, **please notify the team/admin via Microsoft Teams** so that the review process can begin.

---

# 🌳 Git Workflow Guide

## 1. Creating a New Branch

Always create your branch from the latest version of `main`.

### Step 1: Switch to main

```bash
git checkout main
```

### Step 2: Pull the latest changes

```bash
git pull origin main
```

### Step 3: Create your branch

```bash
git checkout -b branch-name
```

### Branch Naming Conventions

| Type          | Example              |
| ------------- | -------------------- |
| New Feature   | `feature/login-page` |
| Bug Fix       | `fix/navbar-error`   |
| Documentation | `docs/readme-update` |
| Personal Work | `john-profile-page`  |

### Examples

```bash
git checkout -b feature/user-authentication
```

```bash
git checkout -b fix/cart-bug
```

```bash
git checkout -b docs/setup-guide
```

---

# 💾 Making Changes & Committing

## Check Current Status

Use this command frequently to see modified files.

```bash
git status
```

## Stage Files

### Stage all changes

```bash
git add .
```

### Stage a specific file

```bash
git add filename.js
```

## Commit Changes

```bash
git commit -m "feat: add login functionality"
```

### Commit Message Format

| Prefix      | Usage                 |
| ----------- | --------------------- |
| `feat:`     | New feature           |
| `fix:`      | Bug fix               |
| `docs:`     | Documentation changes |
| `style:`    | Formatting/UI changes |
| `refactor:` | Code restructuring    |
| `test:`     | Add/update tests      |
| `chore:`    | Maintenance tasks     |

### Examples

```bash
git commit -m "feat: implement user authentication"
```

```bash
git commit -m "fix: resolve navbar responsive issue"
```

```bash
git commit -m "docs: update installation instructions"
```

### Commit Message Guidelines

✅ Keep messages short and meaningful.

✅ Describe **what changed**, not how.

✅ Use present tense.

Good examples:

```text
feat: add profile page
fix: resolve login validation error
docs: update API documentation
```

Avoid:

```text
updated stuff
fixed bug
changes
```

---

# 🔄 Pulling Latest Changes

## Update Local Main Branch

```bash
git checkout main
git pull origin main
```

## Fetch All Remote Branches

```bash
git fetch --all
```

## Update Your Working Branch with Latest Main

Switch to your branch first:

```bash
git checkout feature/my-feature
```

Merge latest changes:

```bash
git pull origin main
```

Alternative:

```bash
git fetch origin
git merge origin/main
```

---

# 🚀 Pushing Changes to GitHub

## First Push (New Branch)

```bash
git push -u origin branch-name
```

Example:

```bash
git push -u origin feature/login-page
```

The `-u` flag sets the upstream branch.

---

## Subsequent Pushes

```bash
git push origin branch-name
```

Example:

```bash
git push origin feature/login-page
```

---

## If Push Is Rejected

Usually this means your branch is behind remote changes.

Update your branch first:

```bash
git pull origin your-branch
```

Resolve conflicts if any, then:

```bash
git add .
git commit
git push origin your-branch
```

---

# 🔀 Creating a Pull Request (PR)

## Step-by-Step

### Step 1

Push your branch to GitHub.

### Step 2

Open the GitHub repository.

### Step 3

Click:

```text
Compare & pull request
```

or

```text
Pull Requests → New Pull Request
```

### Step 4

Verify:

```text
Base branch: main
Compare branch: your branch
```

### Step 5

Fill in the PR title and description.

### PR Description Template

```markdown
## Description
Brief summary of changes.

## Changes Made
- Added ...
- Updated ...
- Fixed ...

## Testing Done
- [x] Tested locally
- [x] No console errors
- [x] Application builds successfully

## Screenshots (if applicable)

## Notes
Additional information for reviewers.
```

### Step 6

Click:

```text
Create Pull Request
```

### Step 7

Request review from the repository administrator.

### Step 8

Notify the team/admin on Microsoft Teams.

---

# ⚠️ Resolving Merge Conflicts

## Identify Conflicts

Git will display messages similar to:

```text
CONFLICT (content): Merge conflict in src/App.js
```

Files with conflicts can be viewed:

```bash
git status
```

---

## Conflict Example

```text
<<<<<<< HEAD
Your changes
=======
Incoming changes
>>>>>>> main
```

Edit the file and keep the correct code.

Remove:

```text
<<<<<<<
=======
>>>>>>>
```

---

## Mark Conflict as Resolved

```bash
git add filename.js
```

Complete merge:

```bash
git commit -m "fix: resolve merge conflict"
```

---

## Abort Merge (Optional)

If you want to cancel the merge:

```bash
git merge --abort
```

---

# ✅ Pre-PR Requirements Checklist

Before submitting your Pull Request, ensure all items below are completed.

* [ ] Test application locally (no errors/bugs)
* [ ] Commit all changes
* [ ] Push latest changes to GitHub
* [ ] Create a local ZIP backup of the entire project
* [ ] Create a Git backup branch (`your-name-backup`)
* [ ] Push the backup branch to GitHub
* [ ] Create the Pull Request
* [ ] Notify the team/admin on Microsoft Teams

## Creating Backup Branch

```bash
git checkout -b your-name-backup
git push -u origin your-name-backup
```

---

# 🐳 Docker Containerisation Guide

## Creating a Dockerfile

Create a file named:

```text
Dockerfile
```

Example for a Node.js/React application:

```dockerfile
# Base image
FROM node:20-alpine

# Create application directory
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

# Build React application
RUN npm run build

# Expose application port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

## Dockerfile Explanation

### FROM

Specifies the base image.

```dockerfile
FROM node:20-alpine
```

---

### WORKDIR

Sets the working directory inside the container.

```dockerfile
WORKDIR /app
```

---

### COPY

Copies files from host machine into container.

```dockerfile
COPY . .
```

---

### RUN

Executes commands during image build.

```dockerfile
RUN npm install
```

---

### EXPOSE

Documents which port the application uses.

```dockerfile
EXPOSE 3000
```

---

### CMD

Specifies the command executed when container starts.

```dockerfile
CMD ["npm", "start"]
```

---

# Build Docker Image

```bash
docker build -t team-2-app .
```

Verify image creation:

```bash
docker images
```

Expected output:

```text
REPOSITORY     TAG       IMAGE ID
team-2-app     latest    xxxxxxxxx
```

---

# Run Docker Container

```bash
docker run -p 3000:3000 team-2-app
```

Access application:

```text
http://localhost:3000
```

---

# Verify Running Containers

```bash
docker ps
```

---

# 📝 Docker Commands Cheat Sheet

| Command                              | Purpose                 |
| ------------------------------------ | ----------------------- |
| `docker build -t team-2-app .`       | Build image             |
| `docker run -p 3000:3000 team-2-app` | Run container           |
| `docker ps`                          | List running containers |
| `docker stop <container-id>`         | Stop container          |
| `docker rm <container-id>`           | Remove container        |
| `docker images`                      | List images             |
| `docker rmi <image-id>`              | Remove image            |

---

# Docker Best Practices

## Use Specific Versions

✅ Good

```dockerfile
FROM node:20-alpine
```

❌ Avoid

```dockerfile
FROM node:latest
```

---

## Keep Images Small

Use lightweight images:

```dockerfile
node:20-alpine
```

---

## Use `.dockerignore`

Example:

```text
node_modules
.git
.gitignore
README.md
Dockerfile
.env
```

---

## Optimize Layer Caching

Copy dependency files first.

```dockerfile
COPY package*.json ./
RUN npm install

COPY . .
```

This avoids reinstalling dependencies every build.

---

# ⚙️ Jenkins CI/CD Pipeline Guide

## Declarative vs Scripted Pipeline

| Declarative Pipeline      | Scripted Pipeline              |
| ------------------------- | ------------------------------ |
| Easier to read            | More flexible                  |
| Structured syntax         | Full Groovy scripting          |
| Recommended for beginners | Recommended for advanced users |
| Uses predefined blocks    | Uses custom logic              |

Example:

### Declarative

```groovy
pipeline {
    agent any
    stages {
        stage('Build') {
            steps {
                sh 'npm install'
            }
        }
    }
}
```

### Scripted

```groovy
node {
    stage('Build') {
        sh 'npm install'
    }
}
```

---

# Example Jenkinsfile

```groovy
pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/your-repo.git'
            }
        }

        stage('Build') {
            steps {
                sh 'npm install'
                sh 'npm run build'
            }
        }

        stage('Test') {
            steps {
                sh 'npm test'
            }
        }

        stage('Docker Build') {
            steps {
                sh 'docker build -t team-2-app .'
            }
        }

        stage('Deploy') {
            steps {
                sh 'docker run -d -p 3000:3000 team-2-app'
            }
        }
    }

    post {

        always {
            echo 'Pipeline completed.'

            // Optional cleanup
            sh 'docker system prune -f || true'
        }

        success {
            echo 'Build completed successfully.'
        }

        failure {
            echo 'Build failed.'
        }
    }
}
```

---

# 🔄 Typical CI/CD Flow

```text
Developer pushes code
        ↓
GitHub Repository
        ↓
Jenkins detects changes
        ↓
Checkout source code
        ↓
Build application
        ↓
Run tests
        ↓
Build Docker image
        ↓
Deploy application
        ↓
Notify team of build status
```

---

# 👥 Team Responsibilities

* Work only on your assigned branch.
* Never push directly to `main`.
* Keep branches updated regularly.
* Submit Pull Requests early.
* Resolve conflicts promptly.
* Always notify the team/admin after opening a PR.
* Maintain backups before every merge.

```
```
