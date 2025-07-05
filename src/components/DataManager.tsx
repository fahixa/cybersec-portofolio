import React, { useState } from 'react';
import { Download, Upload, RefreshCw } from 'lucide-react';
import { localDB } from '../lib/localStorage';

export const DataManager: React.FC = () => {
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({type, text});
    setTimeout(() => setMessage(null), 3000);
  };

  const handleExport = () => {
    try {
      const data = localDB.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cybersec-portfolio-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showMessage('success', 'Data exported successfully!');
    } catch (error) {
      showMessage('error', 'Failed to export data');
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const jsonData = e.target?.result as string;
        const success = localDB.importData(jsonData);
        
        if (success) {
          showMessage('success', 'Data imported successfully! Page will reload.');
          setTimeout(() => window.location.reload(), 1500);
        } else {
          showMessage('error', 'Failed to import data');
        }
      } catch (error) {
        showMessage('error', 'Invalid file format');
      } finally {
        setImporting(false);
        event.target.value = '';
      }
    };
    
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all data to defaults? This cannot be undone.')) {
      localDB.clearDatabase();
      showMessage('success', 'Database reset successfully! Page will reload.');
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  return (
    <div className="bg-white/95 dark:bg-gray-900/50 border border-gray-200 dark:border-yellow-500/30 rounded-lg p-6 shadow-lg dark:shadow-2xl transition-colors duration-300">
      <h3 className="text-lg font-bold text-yellow-600 dark:text-yellow-400 font-mono mb-4 transition-colors duration-300">
        Data Management
      </h3>
      
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
            />
          </label>

          <button
            onClick={handleReset}
            className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset to Default</span>
          </button>
        </div>

        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1 transition-colors duration-300">
          <p><strong>Export:</strong> Download all your data as JSON backup</p>
          <p><strong>Import:</strong> Restore data from JSON backup file</p>
          <p><strong>Reset:</strong> Clear all data and restore defaults</p>
        </div>
      </div>
    </div>
  );
};