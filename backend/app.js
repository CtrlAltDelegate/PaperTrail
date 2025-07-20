// app.js - Main Express application
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// File Upload Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.csv', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, CSV, and TXT files are allowed.'));
    }
  }
});

// Mock Database
const db = {
  users: new Map(),
  documents: new Map(),
  permissions: new Map(),
  auditLogs: new Map()
};

// Utility Functions
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
  } catch (error) {
    return null;
  }
};

const categorizeDocument = (filename) => {
  const lower = filename.toLowerCase();
  
  if (lower.includes('w2') || lower.includes('w-2')) return { category: 'tax', subcategory: 'w2' };
  if (lower.includes('1040')) return { category: 'tax', subcategory: '1040' };
  if (lower.includes('1099')) return { category: 'tax', subcategory: '1099' };
  if (lower.includes('paystub') || lower.includes('payroll')) return { category: 'income', subcategory: 'paystub' };
  if (lower.includes('bank') || lower.includes('statement')) return { category: 'banking', subcategory: 'bank_statement' };
  if (lower.includes('mortgage') || lower.includes('loan')) return { category: 'loans', subcategory: 'mortgage' };
  
  return { category: 'tax', subcategory: 'other' };
};

const logAudit = (documentId, action, userId = null, metadata = {}) => {
  const logId = uuidv4();
  const auditLog = {
    id: logId,
    documentId,
    userId,
    action,
    ipAddress: metadata.ipAddress,
    userAgent: metadata.userAgent,
    accessedByEmail: metadata.accessedByEmail,
    accessedByName: metadata.accessedByName,
    metadata: metadata.additionalData || {},
    createdAt: new Date().toISOString()
  };
  
  db.auditLogs.set(logId, auditLog);
  return auditLog;
};

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  req.userId = decoded.userId;
  next();
};

// Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const existingUser = Array.from(db.users.values()).find(u => u.email === email);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }
    
    const passwordHash = await bcrypt.hash(password, 12);
    
    const userId = uuidv4();
    const user = {
      id: userId,
      email,
      passwordHash,
      firstName,
      lastName,
      createdAt: new Date().toISOString(),
      subscriptionTier: 'free'
    };
    
    db.users.set(userId, user);
    const token = generateToken(userId);
    
    const { passwordHash: _, ...userResponse } = user;
    res.status(201).json({ user: userResponse, token });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = Array.from(db.users.values()).find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = generateToken(user.id);
    const { passwordHash: _, ...userResponse } = user;
    res.json({ user: userResponse, token });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/documents/upload', authenticateToken, upload.single('document'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const { category, subcategory, taxYear, description } = req.body;
    const autoCategorized = categorizeDocument(req.file.originalname);
    
    const documentId = uuidv4();
    const document = {
      id: documentId,
      userId: req.userId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      storagePath: req.file.path,
      category: category || autoCategorized.category,
      subcategory: subcategory || autoCategorized.subcategory,
      taxYear: taxYear ? parseInt(taxYear) : null,
      description: description || '',
      createdAt: new Date().toISOString()
    };
    
    db.documents.set(documentId, document);
    
    logAudit(documentId, 'upload', req.userId, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      accessedByName: 'You'
    });
    
    res.status(201).json(document);
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.get('/api/documents', authenticateToken, (req, res) => {
  try {
    const userDocuments = Array.from(db.documents.values())
      .filter(doc => doc.userId === req.userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    const documentsWithPermissions = userDocuments.map(doc => {
      const permissions = Array.from(db.permissions.values())
        .filter(perm => perm.documentId === doc.id && perm.isActive);
      
      return { ...doc, sharedWith: permissions };
    });
    
    res.json(documentsWithPermissions);
    
  } catch (error) {
    console.error('Fetch documents error:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

app.post('/api/documents/:id/share', authenticateToken, (req, res) => {
  try {
    const document = db.documents.get(req.params.id);
    
    if (!document || document.userId !== req.userId) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    const { grantedToEmail, grantedToName, role, expiresAt } = req.body;
    
    if (!grantedToEmail || !grantedToName || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const permissionId = uuidv4();
    const permission = {
      id: permissionId,
      documentId: document.id,
      grantedBy: req.userId,
      grantedToEmail,
      grantedToName,
      role,
      expiresAt: expiresAt || null,
      isActive: true,
      createdAt: new Date().toISOString(),
      accessToken: uuidv4()
    };
    
    db.permissions.set(permissionId, permission);
    
    logAudit(document.id, 'share', req.userId, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      accessedByName: 'You',
      additionalData: { sharedWith: grantedToEmail, role }
    });
    
    console.log(`📧 Sending share notification to ${grantedToEmail} for document ${document.originalName}`);
    
    res.status(201).json(permission);
    
  } catch (error) {
    console.error('Share document error:', error);
    res.status(500).json({ error: 'Failed to share document' });
  }
});

app.get('/api/documents/:id/audit', authenticateToken, (req, res) => {
  try {
    const document = db.documents.get(req.params.id);
    
    if (!document || document.userId !== req.userId) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    const auditLogs = Array.from(db.auditLogs.values())
      .filter(log => log.documentId === document.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(auditLogs);
    
  } catch (error) {
    console.error('Audit trail error:', error);
    res.status(500).json({ error: 'Failed to fetch audit trail' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 PaperTrail API server running on port ${PORT}`);
});

module.exports = app;
