import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { contentService } from '../../services/contentService';
import {
  UploadCloud,
  FileArchive,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  Layers,
  FileText,
  HelpCircle,
  Download,
  ArrowRight,
  FolderTree,
} from 'lucide-react';

const ZipUploaderModal = ({ isOpen, onClose, onSuccess, technologies = [] }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedTechId, setSelectedTechId] = useState(technologies[0]?.id || 'new');
  const [newTechName, setNewTechName] = useState('');

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.toLowerCase().endsWith('.zip')) {
        setFile(droppedFile);
        setError('');
      } else {
        setError('Please drop a valid .zip archive file.');
      }
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      if (selected.name.toLowerCase().endsWith('.zip')) {
        setFile(selected);
        setError('');
      } else {
        setError('Please select a valid .zip archive file.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select or drop a .zip archive first.');
      return;
    }

    if (selectedTechId === 'new' && !newTechName.trim()) {
      setError('Please enter a name for the new technology course track.');
      return;
    }

    setUploading(true);
    setError('');
    setUploadProgress(10);
    setCurrentStage('Uploading course archive to server...');

    const formData = new FormData();
    formData.append('zip_file', file);

    if (selectedTechId !== 'new') {
      formData.append('technology_id', selectedTechId);
    } else {
      formData.append('new_tech_name', newTechName.trim());
    }

    try {
      const res = await contentService.uploadCourseZip(formData, (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          const mbLoaded = (progressEvent.loaded / (1024 * 1024)).toFixed(1);
          const mbTotal = (progressEvent.total / (1024 * 1024)).toFixed(1);

          if (percentCompleted < 100) {
            setUploadProgress(Math.min(85, Math.round(percentCompleted * 0.85)));
            setCurrentStage(`Uploading archive (${mbLoaded} MB / ${mbTotal} MB - ${percentCompleted}%)...`);
          } else {
            setUploadProgress(90);
            setCurrentStage('Archive received! Server is unpacking, creating modules, notes & quizzes...');
          }
        }
      });

      setUploadProgress(100);
      setCurrentStage('Ingestion complete!');
      setResult(res);

      if (onSuccess) {
        onSuccess(res);
      }
    } catch (err) {
      console.error('ZIP Upload error:', err);
      let msg = 'Failed to process course ZIP. Please check file contents.';
      if (err.response?.status === 413) {
        msg = 'The ZIP file exceeds the maximum allowed upload size on the server (100 MB).';
      } else if (err.response?.data?.error) {
        msg = err.response.data.error;
      } else if (err.message && err.message.includes('timeout')) {
        msg = 'Upload timed out. The server is still processing large files. Please refresh in a moment.';
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError('');
    setUploadProgress(0);
    setCurrentStage('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-sage/40 overflow-hidden my-8 animate-fadeIn">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-forest-dark to-forest text-ivory flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-forest-dark flex items-center justify-center font-bold shadow-sm">
              <FileArchive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">1-Click ZIP Course Ingestion</h2>
              <p className="text-xs text-amber-200/90 font-medium">
                Auto-converts Word, PDFs, Jupyter Notebooks & practice sets into a live course
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={uploading}
            className="p-1.5 rounded-xl hover:bg-forest/50 text-sage hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-7 space-y-5">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!result ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Technology Selector */}
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1.5 uppercase tracking-wider">
                  Target Technology Track
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                  <select
                    value={selectedTechId}
                    onChange={(e) => setSelectedTechId(e.target.value)}
                    disabled={uploading}
                    className="w-full px-3.5 py-2.5 bg-ivory/60 border border-sage/60 rounded-xl text-xs sm:text-sm font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-forest"
                  >
                    {technologies.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                    <option value="new">+ Create New Technology Track...</option>
                  </select>

                  {selectedTechId === 'new' && (
                    <input
                      type="text"
                      required
                      disabled={uploading}
                      placeholder="e.g. Next.js Masterclass"
                      value={newTechName}
                      onChange={(e) => setNewTechName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-sage/60 rounded-xl text-xs sm:text-sm font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-forest"
                    />
                  )}
                </div>
              </div>

              {/* Drag and Drop Box */}
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1.5 uppercase tracking-wider">
                  Course ZIP Archive
                </label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-forest bg-sage/20 scale-[0.99]'
                      : file
                      ? 'border-forest/60 bg-ivory/80'
                      : 'border-sage hover:border-forest/50 hover:bg-ivory/50 bg-lightgrey/30'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".zip"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={uploading}
                  />

                  {file ? (
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-forest text-ivory mx-auto flex items-center justify-center shadow-md">
                        <FileArchive className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-charcoal">{file.name}</p>
                      <p className="text-xs text-muted">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for ingestion
                      </p>
                      <span className="inline-block text-[11px] text-forest font-semibold underline mt-1">
                        Click to change file
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-sage/40 text-forest mx-auto flex items-center justify-center">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-charcoal">
                        Drag & drop course .zip file here, or <span className="text-forest underline">browse</span>
                      </p>
                      <p className="text-xs text-muted">
                        Includes Word docs, PDFs, Jupyter Notebooks, Markdown, and questions
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Supported Format Tags */}
              <div className="bg-ivory/60 p-3.5 rounded-2xl border border-sage/40">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-1.5">
                  Universal File Support:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800">
                    Word (.docx)
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-100 text-red-800">
                    PDF (.pdf)
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                    Notebooks (.ipynb)
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Markdown (.md)
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800">
                    Practice Quizzes (.txt)
                  </span>
                </div>
              </div>

              {/* Progress Indicator */}
              {uploading && (
                <div className="space-y-2 p-4 bg-forest/5 rounded-2xl border border-forest/20">
                  <div className="flex items-center justify-between text-xs font-bold text-forest-dark">
                    <span className="flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-500" />
                      <span>{currentStage}</span>
                    </span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-sage/30 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-forest h-full rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-sage/30">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={uploading}
                  className="px-4 py-2.5 border border-sage/60 rounded-xl text-xs font-semibold text-charcoal hover:bg-lightgrey transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !file}
                  className="px-6 py-2.5 bg-forest hover:bg-forest-dark text-ivory text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{uploading ? 'Processing Course...' : 'Extract & Ingest Course'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* Results View */
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center space-x-3">
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-green-900">
                    Course Ingestion Successful!
                  </h3>
                  <p className="text-xs text-green-800">
                    {result.technology?.name} is now live with interactive notes and quizzes.
                  </p>
                </div>
              </div>

              {/* Ingestion Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-ivory rounded-2xl border border-sage/40 text-center">
                  <FolderTree className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                  <div className="text-xl font-bold text-charcoal">{result.modules_created}</div>
                  <div className="text-[10px] text-muted font-semibold uppercase">Modules</div>
                </div>

                <div className="p-3.5 bg-ivory rounded-2xl border border-sage/40 text-center">
                  <FileText className="w-5 h-5 text-teal-600 mx-auto mb-1" />
                  <div className="text-xl font-bold text-charcoal">{result.notes_created}</div>
                  <div className="text-[10px] text-muted font-semibold uppercase">Notes</div>
                </div>

                <div className="p-3.5 bg-ivory rounded-2xl border border-sage/40 text-center">
                  <HelpCircle className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                  <div className="text-xl font-bold text-charcoal">{result.questions_created}</div>
                  <div className="text-[10px] text-muted font-semibold uppercase">Quiz MCQs</div>
                </div>

                <div className="p-3.5 bg-ivory rounded-2xl border border-sage/40 text-center">
                  <Download className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                  <div className="text-xl font-bold text-charcoal">{result.attached_files}</div>
                  <div className="text-[10px] text-muted font-semibold uppercase">Files Attached</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-sage/30">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2.5 border border-sage/60 rounded-xl text-xs font-semibold text-charcoal hover:bg-lightgrey"
                >
                  Upload Another Course
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 bg-ivory border border-sage/60 hover:bg-sage/20 text-forest text-xs font-semibold rounded-xl"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate(`/technologies/${result.technology?.slug}`);
                    }}
                    className="px-5 py-2.5 bg-forest hover:bg-forest-dark text-ivory text-xs font-bold rounded-xl shadow-md flex items-center space-x-1.5"
                  >
                    <span>Preview Student View</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ZipUploaderModal;
