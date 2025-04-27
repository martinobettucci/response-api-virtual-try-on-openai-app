import React, { useState, useRef } from 'react';
import { Upload, Plus, Trash2, Camera, User } from 'lucide-react';
import { useMotion } from '../contexts/MotionContext';
import { useDatabase } from '../contexts/DatabaseContext';
import { useApiKeyContext } from '../contexts/ApiKeyContext';
import { fileToBase64, resizeImage } from '../utils/imageUtils';
import { validateProfilePhoto } from '../services/openai';
import DragDropUpload from '../components/ui/DragDropUpload';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ParticleEffect from '../components/ui/ParticleEffect';

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB

const PHOTO_TYPES = [
  { id: 'face', label: 'Face Photo', description: 'Clear front view of your face' },
  { id: 'torso', label: 'Torso Photo', description: 'Shoulders to waist, front view' },
  { id: 'full-body', label: 'Full Body', description: 'Head to toe, standing straight' }
] as const;

const ProfilePhotos: React.FC = () => {
  const { Motion, pageTransition } = useMotion();
  const {
    profilePhotos,
    addProfilePhoto,
    deleteProfilePhoto,
    isLoading: isLoadingDb
  } = useDatabase();
  const { apiKey } = useApiKeyContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedType, setSelectedType] = useState<typeof PHOTO_TYPES[number]['id']>('face');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null); // 👈 état pour désactiver le bouton
  const [showForceUploadConfirm, setShowForceUploadConfirm] = useState(false);
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; reason: string } | null>(null);

  /* ------------------ gestion fichier ------------------ */
  const handleFileSelect = async (fileOrEvent: File | React.ChangeEvent<HTMLInputElement>) => {
    const file = fileOrEvent instanceof File ? fileOrEvent : fileOrEvent.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setUploadError('Please select a valid image file (JPEG, PNG, or WebP)');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setUploadError('File size must be less than 4MB');
      return;
    }

    try {
      const resized = await resizeImage(file, 1024, 1024);
      setSelectedFile(resized);
      setPreviewUrl(URL.createObjectURL(resized));
      setUploadError(null);
      setValidationMessage(null);
    } catch {
      setUploadError('Error processing image. Please try again.');
    }
  };

  /* ------------------ upload + validation --------------- */
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadError(null);
    setValidationMessage('Validating photo...');
    setValidationResult(null);

    try {
      const b64 = await fileToBase64(selectedFile);
      const validation = await validateProfilePhoto(apiKey!, b64, selectedType);
      setValidationResult(validation);
      
      if (!validation.isValid && !showForceUploadConfirm) {
        setUploadError(validation.reason);
        return;
      }

      setValidationMessage('Photo validated! Adding...');
      await addProfilePhoto({ type: selectedType, image: b64 });

      // reset form
      setShowUploadForm(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setSelectedType('face');
      setValidationMessage(null);
      setShowForceUploadConfirm(false);
    } catch {
      setUploadError('Error uploading photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  /* ------------------ rendu loading -------------------- */
  if (isLoadingDb) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Motion.div
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      exit={pageTransition.exit}
      transition={pageTransition.transition}
      className="max-w-7xl mx-auto"
    >
      <ParticleEffect type="profile" active={isUploading} />

      {/* header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display text-4xl mb-2">Profile Photos</h1>
          <p className="text-gray-600">Add photos of yourself for virtual try-on</p>
        </div>
        <button onClick={() => setShowUploadForm(true)} className="btn btn-primary">
          <Plus className="h-5 w-5" /> Add Photo
        </button>
      </div>

      {/* modal d'upload */}
      {showUploadForm && (
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        >
          <div className="bg-white rounded-xl shadow-elegant max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-display text-2xl">Add Profile Photo</h2>
                <button
                  onClick={() => setShowUploadForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleUpload} className="space-y-6">
                {/* type photo */}
                <div className="grid grid-cols-3 gap-4">
                  {PHOTO_TYPES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedType(t.id)}
                      className={`p-4 rounded-lg border-2 ${
                        selectedType === t.id ? 'border-navy-500 bg-navy-50' : 'border-gray-200 hover:border-navy-200'
                      }`}
                    >
                      <div className="text-center">
                        <User
                          className={`h-8 w-8 mx-auto mb-2 ${
                            selectedType === t.id ? 'text-navy-500' : 'text-gray-400'
                          }`}
                        />
                        <h3 className="font-medium text-sm mb-1">{t.label}</h3>
                        <p className="text-xs text-gray-500">{t.description}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Zone d'upload */}
                <DragDropUpload
                  onFileSelect={handleFileSelect}
                  preview={previewUrl}
                  error={uploadError}
                  maxSize={MAX_FILE_SIZE}
                />

                {validationMessage && (
                  <p className="text-sm text-navy-600 bg-navy-50 p-3 rounded-lg">{validationMessage}</p>
                )}
                {uploadError && (
                  <div className="space-y-3">
                    <p className="text-red-500 text-sm">{uploadError}</p>
                    {validationResult && !validationResult.isValid && !showForceUploadConfirm && (
                      <button
                        type="button"
                        onClick={() => setShowForceUploadConfirm(true)}
                        className="btn bg-red-100 hover:bg-red-200 text-red-700 text-sm w-full"
                      >
                        Force Upload Anyway
                      </button>
                    )}
                  </div>
                )}

                {/* boutons */}
                <div className="flex justify-end space-x-4">
                  <button onClick={() => setShowUploadForm(false)} type="button" className="btn btn-secondary" disabled={isUploading}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={isUploading || !selectedFile}>
                    {isUploading ? (
                      <>
                        <LoadingSpinner size="sm" text="" /> Validating...
                      </>
                    ) : (
                      <>
                        <Camera className="h-5 w-5" /> Upload & Validate
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Motion.div>
      )}
      
      {/* Force Upload Confirmation Modal */}
      {showForceUploadConfirm && (
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]"
        >
          <Motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl shadow-elegant max-w-md w-full p-6"
          >
            <h3 className="font-display text-xl mb-4">Warning: Photo Quality Issues</h3>
            <p className="text-gray-600 mb-4">
              Our AI system has identified potential issues with this photo that may affect the quality of virtual try-ons:
            </p>
            <p className="text-red-600 text-sm mb-6 bg-red-50 p-3 rounded-lg">
              {validationResult?.reason}
            </p>
            <p className="text-gray-600 mb-6">
              You can proceed with uploading, but the results may not be optimal. Are you sure you want to continue?
            </p>
            
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowForceUploadConfirm(false)}
                className="btn btn-secondary"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                className="btn bg-red-600 hover:bg-red-700 text-white"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <LoadingSpinner size="sm" text="" /> Uploading...
                  </>
                ) : (
                  'Force Upload'
                )}
              </button>
            </div>
          </Motion.div>
        </Motion.div>
      )}

      {/* grid des photos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PHOTO_TYPES.map((type) => {
          const typePhotos = profilePhotos?.filter((p) => p.type === type.id) || [];

          return (
            <Motion.div key={type.id} className="card" whileHover={{ y: -5 }}>
              <h2 className="font-display text-xl mb-4">{type.label}</h2>

              {typePhotos.length > 0 ? (
                <div className="space-y-4">
                  {typePhotos.map((photo) => (
                    <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden bg-ivory-100">
                      <img
                        src={`data:image/jpeg;base64,${photo.image}`}
                        alt={`${type.label} photo`}
                        className="w-full h-full object-cover"
                      />

                      {/* tiny trash */}
                      <button
                        onClick={async () => {
                          setDeletingId(photo.id);
                          await deleteProfilePhoto(photo.id);
                          setDeletingId(null);
                        }}
                        disabled={deletingId === photo.id}
                        className="absolute top-1 right-1 bg-white/70 hover:bg-white rounded-full p-1"
                      >
                        <Trash2 className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-ivory-50 rounded-lg">
                  <User className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600">No {type.label.toLowerCase()} added yet</p>
                  <button
                    onClick={() => {
                      setSelectedType(type.id);
                      setShowUploadForm(true);
                    }}
                    className="btn btn-secondary mt-4"
                  >
                    <Plus className="h-4 w-4" /> Add {type.label}
                  </button>
                </div>
              )}
            </Motion.div>
          );
        })}
      </div>
    </Motion.div>
  );
};

export default ProfilePhotos;