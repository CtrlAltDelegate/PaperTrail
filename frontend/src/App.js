javascriptimport React, { useState, useContext, createContext } from 'react';
import { Upload, FileText, Users, Eye, Download, Share2, Clock, Shield, Plus, X, Check, AlertCircle, User, Calendar, Tag } from 'lucide-react';

// Auth Context
const AuthContext = createContext();

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// Mock Data & Constants
const DOCUMENT_CATEGORIES = {
  tax: { name: 'Tax Documents', icon: FileText, color: 'bg-blue-100 text-blue-800' },
  income: { name: 'Income Documents', icon: Upload, color: 'bg-green-100 text-green-800' },
  banking: { name: 'Banking & Financial', icon: Shield, color: 'bg-purple-100 text-purple-800' },
  loans: { name: 'Loans & Mortgages', icon: Users, color: 'bg-orange-100 text-orange-800' },
  insurance: { name: 'Insurance', icon: Eye, color: 'bg-indigo-100 text-indigo-800' }
};

const PROFESSIONAL_ROLES = {
  cpa: { name: 'CPA / Tax Professional', allowedCategories: ['tax', 'income'], icon: User },
  loan_officer: { name: 'Loan Officer', allowedCategories: ['income', 'banking', 'loans'], icon: Users },
  financial_advisor: { name: 'Financial Advisor', allowedCategories: ['banking', 'insurance'], icon: Shield }
};

// Mock API Functions
const mockApi = {
  uploadDocument: async (file, metadata) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      id: `doc_${Date.now()}`,
      filename: file.name,
      fileSize: file.size,
      category: metadata.category,
      subcategory: metadata.subcategory,
      taxYear: metadata.taxYear,
      createdAt: new Date().toISOString(),
      ...metadata
    };
  },
  
  shareDocument: async (documentId, permissions) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      id: `perm_${Date.now()}`,
      documentId,
      ...permissions,
      createdAt: new Date().toISOString()
    };
  },

  getAuditLogs: async (documentId) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      {
        id: 'audit_1',
        action: 'upload',
        accessedByName: 'You',
        createdAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'audit_2',
        action: 'view',
        accessedByName: 'John Smith (CPA)',
        accessedByEmail: 'john@smithcpa.com',
        createdAt: new Date(Date.now() - 1800000).toISOString()
      }
    ];
  }
};

// Document Upload Component
const DocumentUpload = ({ onDocumentUploaded }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [taxYear, setTaxYear] = useState(new Date().getFullYear());
  const [file, setFile] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const categorizeFile = (filename) => {
    const lower = filename.toLowerCase();
    if (lower.includes('w2') || lower.includes('w-2')) return 'tax';
    if (lower.includes('paystub') || lower.includes('payroll')) return 'income';
    if (lower.includes('bank') || lower.includes('statement')) return 'banking';
    if (lower.includes('mortgage') || lower.includes('loan')) return 'loans';
    return 'tax';
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    try {
      const suggestedCategory = categorizeFile(file.name);
      const finalCategory = selectedCategory || suggestedCategory;
      
      const document = await mockApi.uploadDocument(file, {
        category: finalCategory,
        taxYear: finalCategory === 'tax' ? taxYear : null
      });
      
      onDocumentUploaded(document);
      setFile(null);
      setSelectedCategory('');
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Upload className="w-5 h-5" />
        Upload Documents
      </h3>
      
      <div
        className={`border-2 border-dashed p-8 rounded-lg text-center transition-colors ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {file ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-green-600">
              <Check className="w-5 h-5" />
              <span className="font-medium">{file.name}</span>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Auto-detect ({categorizeFile(file.name)})</option>
                  {Object.entries(DOCUMENT_CATEGORIES).map(([key, cat]) => (
                    <option key={key} value={key}>{cat.name}</option>
                  ))}
                </select>
              </div>
              
              {(selectedCategory === 'tax' || categorizeFile(file.name) === 'tax') && (
                <div>
                  <label className="block text-sm font-medium mb-2">Tax Year</label>
                  <select
                    value={taxYear}
                    onChange={(e) => setTaxYear(parseInt(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    {[2024, 2023, 2022, 2021, 2020].map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            <div className="flex gap-2 justify-center">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {uploading ? 'Uploading...' : 'Upload Document'}
              </button>
              <button
                onClick={() => setFile(null)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Drop files here or click to upload
            </p>
            <p className="text-sm text-gray-500 mb-4">
              PDF, DOC, DOCX, CSV files up to 10MB
            </p>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.csv"
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 cursor-pointer inline-block"
            >
              Choose Files
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

// Document List Component
const DocumentList = ({ documents, onSelectDocument, onShareDocument }) => {
  const [selectedDoc, setSelectedDoc] = useState(null);

  const handleDocumentClick = (doc) => {
    setSelectedDoc(doc);
    onSelectDocument(doc);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Your Documents ({documents.length})
        </h3>
      </div>
      
      {documents.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">No documents yet</p>
          <p>Upload your first document to get started</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {documents.map((doc) => {
            const category = DOCUMENT_CATEGORIES[doc.category];
            const Icon = category?.icon || FileText;
            
            return (
              <div
                key={doc.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedDoc?.id === doc.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
                onClick={() => handleDocumentClick(doc)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="w-8 h-8 text-gray-400" />
                    <div>
                      <p className="font-medium text-sm">{doc.filename}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${category?.color || 'bg-gray-100 text-gray-800'}`}>
                          {category?.name || 'Uncategorized'}
                        </span>
                        {doc.taxYear && (
                          <span className="text-xs text-gray-500">{doc.taxYear}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onShareDocument(doc);
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [activeTab, setActiveTab] = useState('upload');

  const handleDocumentUploaded = (document) => {
    setDocuments(prev => [document, ...prev]);
    setActiveTab('documents');
  };

  const handleShareDocument = (document) => {
    // Mock sharing
    console.log('Sharing document:', document.filename);
  };

  const tabs = [
    { id: 'upload', name: 'Upload', icon: Upload },
    { id: 'documents', name: 'Documents', icon: FileText },
    { id: 'audit', name: 'Audit', icon: Clock }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">PaperTrail</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome back, John</span>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {activeTab === 'upload' && (
              <DocumentUpload onDocumentUploaded={handleDocumentUploaded} />
            )}
            
            {activeTab === 'documents' && (
              <DocumentList
                documents={documents}
                onSelectDocument={setSelectedDocument}
                onShareDocument={handleShareDocument}
              />
            )}
            
            {activeTab === 'audit' && selectedDocument && (
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Access History
                </h3>
                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                  <p className="font-medium text-sm">{selectedDocument.filename}</p>
                  <p className="text-xs text-gray-500">
                    {DOCUMENT_CATEGORIES[selectedDocument.category]?.name}
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 border border-gray-200 rounded-md">
                    <Upload className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Upload</p>
                      <p className="text-sm text-gray-600">by You</p>
                      <time className="text-xs text-gray-500">
                        {new Date(selectedDocument.createdAt).toLocaleString()}
                      </time>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'audit' && !selectedDocument && (
              <div className="bg-white p-8 rounded-lg border border-gray-200 text-center text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Select a document</p>
                <p>Choose a document from the Documents tab to view its access history</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Documents</span>
                  <span className="font-medium">{documents.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Shared Documents</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Active Shares</span>
                  <span className="font-medium">0</span>
                </div>
              </div>
            </div>

            {selectedDocument && (
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Selected Document</h3>
                <div className="space-y-2">
                  <p className="font-medium text-sm">{selectedDocument.filename}</p>
                  <p className="text-xs text-gray-500">
                    {DOCUMENT_CATEGORIES[selectedDocument.category]?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Uploaded {new Date(selectedDocument.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Auth Provider
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({ 
    id: 'user_1', 
    email: 'john@example.com', 
    firstName: 'John', 
    lastName: 'Doe' 
  });

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
};

// Main App
const App = () => {
  return (
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  );
};

export default App;
