import React, { useState } from 'react';
import { Download, Upload, RefreshCw, AlertTriangle } from 'lucide-react';
import { SecurityUtils } from '../lib/security';
import { errorHandler } from '../lib/errorHandler';

export const DataManager: React.FC = () => {
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({type, text});
    setTimeout(() => setMessage(null), 3000);
  };

  const handleExport = () => {
    try {
      // In a real application, this would export actual data
      const mockData = {
        profiles: [],
        writeups: [],
        articles: [],
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
      
      const dataStr = JSON.stringify(mockData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `cybersec-portfolio-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showMessage('success', 'Data exported successfully!');
      errorHandler.logInfo('Data export completed');
    } catch (error) {
      showMessage('error', 'Failed to export data');
      errorHandler.logError('Data export failed', error);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Security: Validate file type and size
    if (!file.name.endsWith('.json')) {
      showMessage('error', 'Please select a valid JSON file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      showMessage('error', 'File size too large (max 10MB)');
      return;
    }

    setImporting(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const jsonData = e.target?.result as string;
        
        // Security: Sanitize JSON content
        const sanitizedData = SecurityUtils.sanitizeInput(jsonData);
        const parsedData = JSON.parse(sanitizedData);
        
        // Validate data structure
        if (!parsedData || typeof parsedData !== 'object') {
          throw new Error('Invalid data format');
        }

        // In a real application, this would import to the database
        showMessage('success', 'Data import completed successfully!');
        errorHandler.logInfo('Data import completed', { 
          fileSize: file.size,
          fileName: file.name 
        });
      } catch (error) {
        showMessage('error', 'Invalid file format or corrupted data');
        errorHandler.logError('Data import failed', error);
      } finally {
        setImporting(false);
        event.target.value = '';
      }
    };
    
    reader.onerror = () => {
      showMessage('error', 'Failed to read file');
      setImporting(false);
      event.target.value = '';
    };
    
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
      try {
        // In a real application, this would reset the database
        localStorage.clear();
        showMessage('success', 'Data reset completed! Page will reload.');
        errorHandler.logInfo('Data reset completed');
        setTimeout(() => window.location.reload(), 1500);
      } catch (error) {
        showMessage('error', 'Failed to reset data');
        errorHandler.logError('Data reset failed', error);
      }
    }
  };

  return (
    <div className="bg-white/95 dark:bg-gray-900/50 border border-gray-200 dark:border-yellow-500/30 rounded-lg p-6 shadow-lg dark:shadow-2xl transition-colors duration-300">
      <div className="flex items-center mb-4">
        <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
        <h3 className="text-lg font-bold text-yellow-600 dark:text-yellow-400 font-mono transition-colors duration-300">
          Data Management
        </h3>
      </div>
      
      <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-500/30 rounded-lg">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          <strong>Note:</strong> This is a demo component. In production, data management would be handled through secure API endpoints with proper authentication and validation.
        </p>
      </div>
      
      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/30'
            : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30'
        } transition-colors duration-300`}>
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleExport}
            className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
            aria-label="Export data as JSON file"
          >
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </button>

          <label className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>{importing ? 'Importing...' : 'Import Data'}</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              disabled={importing}
              className="hidden"
              aria-label="Import data from JSON file"
            />
          </label>

          <button
            onClick={handleReset}
            className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
            aria-label="Reset all data to defaults"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Data</span>
          </button>
        </div>

        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1 transition-colors duration-300">
          <p><strong>Export:</strong> Download portfolio data as JSON backup</p>
          <p><strong>Import:</strong> Restore data from JSON backup file (max 10MB)</p>
          <p><strong>Reset:</strong> Clear all data and restore defaults</p>
        </div>
      </div>
    </div>
  );
};