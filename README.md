PaperTrail MVP

A secure, user-owned financial document management system that streamlines loan applications, tax preparation, and professional collaboration.

Show Image Show Image Show Image Show Image
🚀 What is PaperTrail?
PaperTrail is a user-owned document management system designed for individuals who need to share financial documents with professionals like CPAs, loan officers, and financial advisors. Unlike other solutions that are built for the professionals, PaperTrail puts you in control of your documents.
✨ Key Features

📁 Smart Document Upload - Drag-and-drop with automatic categorization (W-2 → Tax Documents)
🔐 Role-Based Sharing - Grant time-bound access to CPAs, loan officers, financial advisors
📊 Complete Audit Trail - See exactly who accessed what and when for compliance
🛡️ Bank-Level Security - Encrypted storage, secure access tokens, comprehensive logging
⚡ Zero Friction - Professionals access documents instantly without creating accounts

🎯 Core Workflows
1. Upload & Categorize Documents
Drag file → Auto-detect type → Set tax year → Upload
Example: "W2_2023.pdf" automatically becomes "Tax Documents > W-2 > 2023"
2. Share with Professionals
Select document → Choose role (CPA/Loan Officer) → Enter professional's details → Set expiration → Share
Professional gets secure link with role-appropriate access
3. Track Everything
View complete audit log of who accessed which documents when
Download compliance reports for your records
🏗️ Technical Architecture

Frontend: React 18 + Tailwind CSS for modern, responsive UI
Backend: Node.js + Express with comprehensive security middleware
Database: PostgreSQL with row-level security and audit logging
Authentication: JWT tokens with secure refresh mechanism
File Storage: Local development, AWS S3 ready for production
Security: Rate limiting, CORS protection, file validation, encryption

🔧 Quick Start
Prerequisites

Node.js 16+
Docker (for database)
Git

Installation

Clone the repository
bashgit clone https://github.com/yourusername/papertrail-mvp.git
cd papertrail-mvp

Install dependencies
bash# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

Start the database
bash# From project root
docker-compose up -d

Run the application
bash# Terminal 1 - Backend (from backend folder)
npm start

# Terminal 2 - Frontend (from frontend folder)  
npm start

Open your browser
http://localhost:3000


🧪 Test the Core Flows
Flow 1: Document Upload

Go to Upload tab
Drag a file named W2_2023.pdf
Watch it auto-categorize as "Tax Documents"
Set tax year and upload
See it appear in Documents tab

Flow 2: Document Sharing

Go to Documents tab
Click share icon next to a document
Select "CPA / Tax Professional"
Enter: Name: "John Smith", Email: "john@cpa.com"
Set expiration (30 days)
Click Share

Flow 3: Audit Trail

Select a document from Documents tab
Go to Audit tab
See complete access history with timestamps

📊 MVP Success Metrics

✅ Upload documents in under 30 seconds
✅ Auto-categorization works for common document types
✅ Share permissions set up in under 2 minutes
✅ External professionals access documents without signup
✅ Complete audit trail for compliance
✅ Secure file handling with proper validation

🛡️ Security Features

Authentication: JWT tokens with secure generation
Authorization: Role-based access control
File Security: Type validation, size limits, virus scanning ready
API Security: Rate limiting, CORS protection, helmet.js
Audit Logging: Complete trail of all document interactions
Data Protection: Encryption at rest, secure access tokens

📈 Roadmap (Phase 2+)
Immediate Next Features

 OCR Integration - Extract text from documents for better search
 Email Notifications - Automated sharing notifications
 Mobile App - React Native app for document capture
 Real API Integrations - Plaid, ADP, QuickBooks sync

Advanced Features

 AI Categorization - Machine learning for better document classification
 White-label Portals - Branded portals for professional firms
 Compliance Exports - GDPR, SOX, audit-ready reports
 Advanced Analytics - Usage patterns, sharing insights

🤝 Contributing
We welcome contributions! Here's how to get started:

Fork the repository
Create a feature branch
bashgit checkout -b feature/amazing-feature

Make your changes
Add tests (when available)
Commit your changes
bashgit commit -m 'Add amazing feature'

Push to the branch
bashgit push origin feature/amazing-feature

Open a Pull Request

Development Guidelines

Follow existing code style and patterns
Add comments for complex logic
Test all new features thoroughly
Update documentation as needed

📋 Project Structure
papertrail-mvp/
├── backend/                 # Node.js API server
│   ├── app.js              # Main application file
│   ├── package.json        # Backend dependencies
│   └── scripts/            # Database scripts
├── frontend/               # React application  
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── index.js       # React entry point
│   │   └── index.css      # Tailwind CSS
│   ├── public/
│   │   └── index.html     # HTML template
│   └── package.json       # Frontend dependencies
├── docker-compose.yml     # Database setup
└── README.md             # This file
🆘 Troubleshooting
Common Issues
"Cannot connect to database"
bash# Make sure Docker is running
docker-compose up -d
# Check if container is running
docker ps
"Port already in use"
bash# Kill processes on ports 3000 or 5000
lsof -ti:3000 | xargs kill -9
lsof -ti:5000 | xargs kill -9
"Module not found" errors
bash# Reinstall dependencies
cd backend && rm -rf node_modules && npm install
cd frontend && rm -rf node_modules && npm install
Getting Help

🐛 Bug Reports: GitHub Issues
💡 Feature Requests: GitHub Discussions
📧 Email: support@papertrail.com
📖 Documentation: Check the code comments and this README

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
🎯 Why PaperTrail?
Traditional document sharing for financial processes is broken:

Email attachments are insecure and get lost
Professional portals make YOU adapt to THEIR system
Cloud storage lacks proper access controls and audit trails
Enterprise solutions are overkill and expensive for individuals

PaperTrail fixes this by putting document owners in control with:

✅ Your documents, your rules, your timeline
✅ Professional-grade security without enterprise complexity
✅ Compliance-ready audit trails
✅ Zero learning curve for professionals you work with


Built with ❤️ for secure financial document management
PaperTrail MVP - Taking control of your financial documents, one upload at a time.
