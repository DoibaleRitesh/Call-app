import React, { useState } from 'react';
import { ANDROID_PROJECT_FILES } from '../androidCode/projectFiles';
import { AndroidFile } from '../types';
import {
  Code2,
  Download,
  Copy,
  Check,
  FolderTree,
  FileCode,
  FileText,
  Settings,
  Shield,
  Phone,
  Database,
  X,
  Sparkles
} from 'lucide-react';
import JSZip from 'jszip';

interface CodebaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark?: boolean;
}

export const CodebaseModal: React.FC<CodebaseModalProps> = ({
  isOpen,
  onClose,
  isDark = false,
}) => {
  const [selectedFile, setSelectedFile] = useState<AndroidFile>(ANDROID_PROJECT_FILES[3]); // Manifest by default
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!selectedFile) return;
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setDownloading(true);
      const zip = new JSZip();

      for (const file of ANDROID_PROJECT_FILES) {
        zip.file(file.path, file.content);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Call_PrivateCall_India_Android_Studio.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to create ZIP', err);
    } finally {
      setDownloading(false);
    }
  };

  const filteredFiles =
    activeCategory === 'all'
      ? ANDROID_PROJECT_FILES
      : ANDROID_PROJECT_FILES.filter((f) => f.category === activeCategory);

  return (
    <div
      id="codebase-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200"
    >
      <div
        className={`w-full max-w-5xl h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-colors border ${
          isDark
            ? 'bg-zinc-950 border-zinc-800 text-zinc-100'
            : 'bg-white border-zinc-200 text-zinc-900'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-semibold">Android Studio Project Source Code</h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                  Ready to Build
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Kotlin 2.0 • Jetpack Compose • Material 3 • Room • TelecomManager • CNAP
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              id="download-android-zip-btn"
              onClick={handleDownloadZip}
              disabled={downloading}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-semibold text-xs flex items-center space-x-2 shadow-md shadow-emerald-600/20 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? 'Packaging ZIP...' : 'Download Project (.ZIP)'}</span>
            </button>

            <button
              type="button"
              id="close-codebase-btn"
              onClick={onClose}
              className="p-2 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Sidebar (File Tree) + Main Viewer */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-72 border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-zinc-50/30 dark:bg-zinc-900/30">
            {/* Category Filter Pills */}
            <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap gap-1.5 text-[11px]">
              {['all', 'manifest', 'gradle', 'room', 'telephony', 'security', 'domain', 'test', 'docs'].map(
                (cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-2 py-0.5 rounded-md font-medium capitalize transition-colors ${
                      activeCategory === cat
                        ? 'bg-sky-600 text-white'
                        : 'bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                    }`}
                  >
                    {cat}
                  </button>
                )
              )}
            </div>

            {/* File List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredFiles.map((file) => {
                const isSelected = selectedFile?.path === file.path;
                return (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left px-3 py-2 rounded-xl flex items-center space-x-2.5 text-xs font-mono transition-all ${
                      isSelected
                        ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300 font-semibold ring-1 ring-sky-500/30'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                    }`}
                  >
                    {file.category === 'manifest' && <FileText className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                    {file.category === 'gradle' && <Settings className="w-3.5 h-3.5 text-indigo-500 shrink-0" />}
                    {file.category === 'room' && <Database className="w-3.5 h-3.5 text-teal-500 shrink-0" />}
                    {file.category === 'telephony' && <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                    {file.category === 'security' && <Shield className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                    {file.category === 'domain' && <FileCode className="w-3.5 h-3.5 text-sky-500 shrink-0" />}
                    {file.category === 'test' && <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0" />}
                    {file.category === 'docs' && <FileText className="w-3.5 h-3.5 text-zinc-400 shrink-0" />}

                    <span className="truncate">{file.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Code Viewer Panel */}
          <div className="flex-1 flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden">
            {/* File Path & Copy Toolbar */}
            <div className="px-5 py-2.5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
              <span className="text-xs font-mono text-zinc-400">{selectedFile?.path}</span>

              <button
                type="button"
                id="copy-code-file-btn"
                onClick={handleCopy}
                className="flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy File'}</span>
              </button>
            </div>

            {/* Code Display */}
            <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed select-text">
              <pre className="text-zinc-200">
                <code>{selectedFile?.content}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
