# Airease - AI-Powered Flight Management System

![Airease Logo](https://img.shields.io/badge/Airease-v2.0-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14.2.3-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-6.6.0-green?style=flat-square&logo=mongodb)
![AI Powered](https://img.shields.io/badge/AI-Powered-purple?style=flat-square&logo=openai)

## Overview

Airease is a comprehensive AI-powered flight management system that helps travelers search flights, monitor prices, receive intelligent recommendations, and handle travel disruptions. Built with Next.js 14, React 18, and powered by advanced AI capabilities.

### Key Features

- 🤖 **AI-Powered Recommendations** - Personalized travel suggestions using Emergent LLM
- ✈️ **Smart Flight Search** - Enhanced flight search with realistic airline data
- 📊 **Price Monitoring** - AI-enhanced price tracking and alerts
- 📧 **Intelligent Notifications** - Smart email alerts with travel insights
- 🚨 **Missed Flight Recovery** - Emergency assistance for travel disruptions
- 📱 **Responsive Design** - Modern UI with Tailwind CSS and shadcn/ui
- 🔍 **Comprehensive Testing** - Full test suite for production readiness

## Tech Stack

### Frontend
- **Framework**: Next.js 14.2.3 with App Router
- **UI Library**: React 18
- **Styling**: Tailwind CSS 3.4.1 with shadcn/ui components
- **Theme**: Dark/Light mode support with next-themes
- **State Management**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Charts**: Recharts 2.15.3

### Backend
- **Database**: MongoDB 6.6.0
- **AI Integration**: Google Generative AI (@google/generative-ai)
- **HTTP Client**: Axios 1.10.0
- **Validation**: Zod 3.25.67

### Development Tools
- **Package Manager**: Yarn 1.22.22
- **CSS Framework**: PostCSS with Autoprefixer
- **Development**: Hot reload with Next.js dev server

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18.0.0 or higher)
- **Yarn** (version 1.22.22 or higher)
- **MongoDB** (version 6.6.0 or higher)
- **Git** (for version control)

### System Requirements

- **Memory**: Minimum 4GB RAM (8GB recommended)
- **Storage**: 2GB free space
- **OS**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 18.04+)

## Installation

### 1. Clone the Repository

```bash
git clone [your-repository-url]
cd airease
```

### 2. Install Dependencies

```bash
yarn install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```bash
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/airease
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/airease

# AI Configuration
GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# Email Configuration (Optional)
EMAIL_SERVICE_API_KEY=your_email_service_key
EMAIL_FROM=noreply@airease.com

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Production URLs (for deployment)
NEXT_PUBLIC_API_URL=https://tripmonitor-2.preview.emergentagent.com
```

### 4. Database Setup

#### Local MongoDB:
```bash
# Install MongoDB locally or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:6.6

# Or install MongoDB Community Edition from:
# https://www.mongodb.com/try/download/community
```

#### MongoDB Atlas (Cloud):
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Update the `MONGODB_URI` in your `.env.local`

### 5. Google AI API Setup

1. Go to [Google AI Studio](https://makersuite.google.com/)
2. Create a new API key
3. Add the key to your `.env.local` file

## Development

### Start the Development Server

```bash
# Standard development mode
yarn dev

# Development without auto-reload (for debugging)
yarn dev:no-reload

# Development with webpack debugging
yarn dev:webpack
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3000/api

### Development Scripts

```bash
# Start development server
yarn dev

# Build for production
yarn build

# Start production server
yarn start

# Run tests (if you add them)
yarn test
```

## Project Structure

```
airease/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   └── layout.js          # Root layout
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── lib/                  # Utility libraries
├── hooks/                # Custom React hooks
├── public/               # Static assets
├── .env.local           # Environment variables
├── .gitignore           # Git ignore rules
├── package.json         # Dependencies and scripts
├── tailwind.config.js   # Tailwind configuration
├── components.json      # shadcn/ui configuration
└── README.md           # This file
```

## API Endpoints

### Core Features
- `GET /api/` - Health check and version info
- `POST /api/flights/search` - Flight search
- `POST /api/flights/ai-recommendations` - AI recommendations
- `GET /api/flights/check-prices` - Price monitoring
- `POST /api/watchlist` - Create price watch
- `GET /api/notifications/test` - Test email notifications

### New Features (v2.0)
- `POST /api/missed-flight/recovery` - Missed flight recovery

## Configuration

### Tailwind CSS
The project uses Tailwind CSS with custom configuration in `tailwind.config.js`. Styles are defined in `app/globals.css`.

### shadcn/ui Components
UI components are configured in `components.json` with the "new-york" style variant.

### Memory Optimization
Development server is configured with `--max-old-space-size=512` for memory efficiency.

## Testing

### Backend Testing
Run the comprehensive backend test suite:

```bash
python backend_test.py
```

This tests all API endpoints, AI features, and production readiness.

### Test Coverage
- API health checks
- Flight search functionality
- AI recommendations
- Email notifications
- Price monitoring
- Watchlist creation
- Missed flight recovery
- CORS configuration

## Deployment

### Production Build

```bash
yarn build
yarn start
```

### Environment Variables for Production

Update your production environment with:

```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
MONGODB_URI=your_production_mongodb_uri
GOOGLE_AI_API_KEY=your_production_ai_key
```

### Deployment Platforms

The application can be deployed on:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **Railway**
- **DigitalOcean App Platform**
- **AWS/Azure/GCP**

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
# Or use a different port
yarn dev -- --port 3001
```

#### Memory Issues
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
yarn dev
```

#### MongoDB Connection Issues
```bash
# Check MongoDB status
mongosh --eval "db.adminCommand('ping')"

# Restart MongoDB service
sudo systemctl restart mongod
```

#### AI API Issues
- Verify your Google AI API key is correct
- Check API quotas and billing
- Ensure the API is enabled in Google Cloud Console

## Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the test suite for examples

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Changelog

### Version 2.0
- Added AI-powered recommendations using Emergent LLM
- Enhanced flight search with realistic data
- Implemented missed flight recovery system
- Improved email notifications with AI insights
- Added comprehensive testing suite
- Enhanced UI with shadcn/ui components

### Version 1.0
- Initial release with basic flight search
- Price monitoring functionality
- Email notifications
- Watchlist management

---

Made with ❤️ for travelers worldwide
