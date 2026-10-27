<div align="center">

# ☕ Starbucks Egypt

**Enterprise Full-Stack Commerce Platform**

<p align="center">
  A premium, enterprise-grade digital experience for Starbucks Egypt. <br/>
  Built with <strong>React 19</strong>, <strong>ASP.NET Core 9.0</strong>, and <strong>Clean Architecture</strong> <br/>
  to deliver high-performance, accessible, and bilingual (AR/EN) coffee commerce.
</p>

<p align="center">
  <a href="https://starbucks73.vercel.app">
    <img src="https://img.shields.io/badge/Frontend-Live_App-black?style=for-the-badge&logo=vercel" alt="Frontend Deployment" />
  </a>
  <a href="http://starbucks.runasp.net/api">
    <img src="https://img.shields.io/badge/Backend-Live_API-success?style=for-the-badge&logo=dotnet" alt="Backend Status" />
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License" />
  </a>
</p>

</div>

---

## 🚀 Live Environments

Explore the application in real-time through our live deployment environments:

| Service | Environment | Live URL |
| :--- | :--- | :--- |
| **✨ Frontend App** | Production | [starbucks73.vercel.app](https://starbucks73.vercel.app) |
| **⚙️ Backend API** | Production | [starbucks.runasp.net/api](http://starbucks.runasp.net/api) |
| **📚 API Docs** | Swagger UI | [starbucks.runasp.net/swagger](http://starbucks.runasp.net/swagger) |

---

## 🏗️ Technical Pillar

Our technology stack is selected to provide a world-class, ultra-fast, and highly scalable user experience.

<div align="center">
  <table>
    <tr>
      <td align="center" width="50%">
        <h3>🎨 Frontend (Modern Stack)</h3>
      </td>
      <td align="center" width="50%">
        <h3>⚙️ Backend (Robust Architecture)</h3>
      </td>
    </tr>
    <tr>
      <td valign="top">
        <ul>
          <li><b>Framework:</b> React 19 + Vite</li>
          <li><b>Styling:</b> Tailwind CSS v4 (Glassmorphism & RTL support)</li>
          <li><b>State/Data:</b> TanStack Query v5 + Zustand</li>
          <li><b>Animations:</b> Framer Motion</li>
          <li><b>Localization:</b> i18next (Arabic / English)</li>
        </ul>
      </td>
      <td valign="top">
        <ul>
          <li><b>Core:</b> ASP.NET Core 9.0</li>
          <li><b>Architecture:</b> Clean Architecture & CQRS (MediatR)</li>
          <li><b>Persistence:</b> Entity Framework Core + SQL Server</li>
          <li><b>Caching:</b> Redis-backed sessions & response caching</li>
          <li><b>Security:</b> JWT Authentication & Identity</li>
        </ul>
      </td>
    </tr>
  </table>
</div>

---

## 💻 Quick Start Guide

Want to run the project locally? Follow these simple steps.

### Prerequisites
- **Node.js** 20+ (Frontend & dashboard) — see `engines` in `Frontend/package.json`
- **npm** 10+
- **.NET SDK** 9.0 (Backend)
- **Docker & Docker Compose** (Database & Redis)
- **Google OAuth Credentials** (for authentication)

### Ports

| App | Port | Command |
|-----|------|---------|
| Frontend | `http://localhost:5173` | `npm run dev` |
| Dashboard | `http://localhost:4200` | `ng serve` |
| Backend API | `https://localhost:7082` (or configured) | `dotnet run --project src/Starbucks.API` |

### Frontend Setup
```bash
cd Frontend
npm install --legacy-peer-deps

# Create .env file from example
cp .env.example .env
# Update VITE_GOOGLE_OAUTH_CLIENT_ID with your credentials

npm run dev
```
> The frontend application will start on `http://localhost:5173`

### Backend Setup
```bash
cd Backend

# Start the database and Redis instances
docker-compose up -d

# Run the API server
dotnet run --project src/Starbucks.API
```
> The API will be available on `https://localhost:7082` (or your configured port). Check out `/swagger` for API documentation.
> Static images are served from `/api/v1/images/` endpoints.

> **Secrets**: Never commit real credentials. Use User Secrets, environment variables (`Jwt__Secret`, `ConnectionStrings__DefaultConnection`, etc.), or Key Vault.

### Dashboard Setup
```bash
cd dashboard
npm install

# Create/update environment files with OAuth config
# environment.ts and environment.prod.ts already configured

ng serve
```
> The dashboard will start on `http://localhost:4200`

> **Note**: Folder name is lowercase `dashboard/` (case-sensitive on Linux/CI).

---

## 🔐 Google OAuth Configuration

All three applications (Frontend, Backend, Dashboard) are configured with Google OAuth:

**Credentials Used:**
- Client ID: `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com`

**Redirect URIs (Development):**
- Frontend: `http://localhost:5173/auth/google/callback`
- Dashboard: `http://localhost:4200/auth/google/callback`
- Backend: `http://localhost:8080/api/v1/auth/google-callback`

**Production Redirect URIs:**
- Frontend: `https://starbucks.eg/auth/google/callback`
- Dashboard: `https://dashboard.starbucks.eg/auth/google/callback`
- Backend: `https://api.starbucks.eg/api/v1/auth/google-callback`

> ⚠️ These redirect URIs must be registered in [Google Cloud Console](https://console.cloud.google.com/)

---

## 🖼️ Image Management

All images are now centralized and served through the Backend API:

**Image Storage:** `Backend/src/Starbucks.API/wwwroot/images/`

**Available Image Categories:**
- `/api/v1/images/home/` - Homepage banners and hero images
- `/api/v1/images/menu/` - Menu category images
- `/api/v1/images/statics/` - Static page content images
- `/api/v1/images/sustainability/` - Sustainability initiative images

**Configuration:**
- Frontend: Uses relative paths `/api/v1/images/*`
- Dashboard: Configured in `environment.ts` with `imageConfig.apiBaseUrl`
- Allowed formats: JPG, JPEG, PNG, WebP
- Max file size: 5MB

---

## 📊 Architecture Highlights

### Image Centralization ✅
- All product and content images served from Backend
- Eliminated external CDN dependency
- SEO-optimized meta tags (OG, Twitter) with local image URLs
- PWA caching strategy optimized for local images

### OAuth Integration ✅
- Google OAuth configured across all three applications
- Credentials secured in environment files
- Redirect URIs configured for development and production

### Dashboard Enhancements 🚀
- Environment configuration with Google OAuth support
- Image configuration for upload/display capabilities
- Ready for image implementation phase (Products, Locations, Users)

---

## 🌍 Localization & Bilingual Support

The Starbucks Egypt platform is fully bilingual with professional backend-driven localization:

### Architecture

- **Backend**: All business content (Menu, Locations, Orders) stored bilingual in database
- **Frontend**: Consumes bilingual DTOs from API, manages UI text via i18n
- **Dashboard**: Bilingual admin interface using @ngx-translate/core

### Language Support
- **English** (en) - Default
- **Arabic** (ar) - Full RTL support

### Key Features
✅ API language parameter: `?language=en|ar`  
✅ Server-side bilingual content resolution  
✅ React Query cache per language  
✅ RTL/LTR automatic styling  
✅ Dashboard i18n infrastructure  
✅ Persistent language preference  

### Documentation
For complete localization architecture and implementation details:
- **[🌐 Localization Architecture](docs/LOCALIZATION_ARCHITECTURE.md)** - Complete system design
- **[📋 Migration Summary](docs/LOCALIZATION_MIGRATION_SUMMARY.md)** - What changed and why
- **[🎨 Dashboard i18n Guide](docs/DASHBOARD_I18N_GUIDE.md)** - Dashboard translation implementation

---

## 📂 Documentation Deep-Dive

For detailed insights into our technical decisions, system design, and deployment pipelines, please explore our dedicated documentation modules:

| Document | Description |
| :--- | :--- |
| [**🏗️ Architecture & Design**](docs/ARCHITECTURE.md) | Technical philosophy, system design, and project structure. |
| [**🛠️ Development Guide**](docs/DEVELOPMENT.md) | Local setup instructions, tech stack details, and coding standards. |
| [**✨ Features & Use Cases**](docs/FEATURES.md) | Checklist of platform capabilities and common user workflows. |
| [**🚢 Deployment Guide**](docs/DEPLOYMENT.md) | Production hosting configurations and CI/CD pipeline details. |
| [**🔒 Security Policy**](docs/SECURITY.md) | Security best practices, threat models, and audit results. |

---

## 🤝 Contributing & Support

We welcome contributions! Before submitting a Pull Request, please read our [Contributing Guide](docs/CONTRIBUTING.md) and review our [Code of Conduct](docs/CODE_OF_CONDUCT.md).

Need help or found a bug? Feel free to check the [Documentation Index](docs/README.md) or open a [GitHub Issue](issues).

<div align="center">
  <br/>
  <p><b>Built with ❤️ for the Starbucks Egypt Community</b></p>
</div>
