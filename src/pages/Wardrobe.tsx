import React, { useState, useRef } from 'react';
import { Upload, Plus, Trash2, Sparkles, RefreshCw, X } from 'lucide-react';
import { useMotion } from '../contexts/MotionContext';
import { useDatabase } from '../contexts/DatabaseContext';
import { useApiKeyContext } from '../contexts/ApiKeyContext';
import { useCategories } from '../contexts/CategoriesContext';
import { fileToBase64, resizeImage } from '../utils/imageUtils';
import { extractPackshot, analyzeItemMetadata } from '../services/openai';
import DragDropUpload from '../components/ui/DragDropUpload';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ParticleEffect from '../components/ui/ParticleEffect';

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4 MB

const Wardrobe: React.FC = () => {
  const { Motion, pageTransition } = useMotion();
  const { wardrobeItems, addWardrobeItem, updateWardrobeItem, deleteWardrobeItem, isLoading: isLoadingDb } =
    useDatabase();
  const { apiKey, quality } = useApiKeyContext();
  const { categories } = useCategories();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // UX state
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false); // 👈 nouvel état

  // Item detail state
  const [selectedItem, setSelectedItem] = useState<typeof wardrobeItems[0] | null>(null);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState<{
    name: string;
    category: string;
    description: string;
  } | null>(null);

  /* ------------------------------------------------------------------ */
  /* Image sélectionnée → redimensionnement + analyse IA                  */
  /* ------------------------------------------------------------------ */
  const handleFileSelect = async (fileOrEvent: File | React.ChangeEvent<HTMLInputElement>) => {
    const file = fileOrEvent instanceof File ? fileOrEvent : fileOrEvent.target.files?.[0];
    if (!file) return;

    // Validation mime & taille
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setUploadError('Please select a valid image file (JPEG, PNG, or WebP)');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setUploadError('File size must be less than 4 MB');
      return;
    }

    try {
      const resizedFile = await resizeImage(file, 1024, 1024);
      setSelectedFile(resizedFile);
      setPreviewUrl(URL.createObjectURL(resizedFile));
      setUploadError(null);

      // Analyse automatique (si clé API dispo)
      if (apiKey) {
        setIsAnalyzing(true);
        try {
          const base64 = await fileToBase64(resizedFile);
          const { name, category, description } = await analyzeItemMetadata(apiKey, base64, categories);
          setItemName(name);
          setSelectedCategory(category);
          setItemDescription(description);
        } catch (err) {
          console.error('Error analyzing metadata:', err);
        } finally {
          setIsAnalyzing(false);
        }
      }
    } catch (error) {
      setUploadError('Error processing image. Please try again.');
    }
  };

  /* ------------------------------------------------------------------ */
  /* Soumission du formulaire d'ajout                                   */
  /* ------------------------------------------------------------------ */
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !itemName || !selectedCategory) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const originalImage = await fileToBase64(selectedFile);
      const packshotImage = await extractPackshot(apiKey!, selectedFile, itemName, quality);

      await addWardrobeItem({
        name: itemName,
        category: selectedCategory,
        description: itemDescription,
        originalImage,
        packshotImage
      });

      /* Reset form */
      setShowUploadForm(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setItemName('');
      setItemDescription('');
      setSelectedCategory('');
    } catch (error) {
      setUploadError('Error uploading item. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /* Régénération d'un packshot                                         */
  /* ------------------------------------------------------------------ */
  const handleRegenerate = async () => {
    if (!selectedItem) return;

    setIsRegenerating(true);
    try {
      const imageBlob = await fetch(`data:image/jpeg;base64,${selectedItem.originalImage}`).then((r) => r.blob());
      const imageFile = new File([imageBlob], 'original.jpg', { type: 'image/jpeg' });

      const newPackshot = await extractPackshot(apiKey!, imageFile, selectedItem.name);

      await updateWardrobeItem(selectedItem.id!, {
        packshotImage: newPackshot,
        tokensUsed: (selectedItem.tokensUsed || 0) + 1
      });

      // Mise à jour locale :
      setSelectedItem({
        ...selectedItem,
        packshotImage: newPackshot,
        tokensUsed: (selectedItem.tokensUsed || 0) + 1
      });

      setShowRegenerateConfirm(false);
    } catch (error) {
      console.error('Error regenerating packshot:', error);
      setUploadError('Error regenerating packshot. Please try again.');
    } finally {
      setIsRegenerating(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /* Suppression d'un item                                              */
  /* ------------------------------------------------------------------ */
  const handleDelete = async () => {
    if (!selectedItem?.id) return;

    setIsDeleting(true);
    try {
      await deleteWardrobeItem(selectedItem.id);
      setSelectedItem(null);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting item:', error);
      setUploadError('Error deleting item. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /* Mise à jour d'un item                                              */
  /* ------------------------------------------------------------------ */
  const handleUpdate = async () => {
    if (!selectedItem?.id || !editedItem) return;

    try {
      await updateWardrobeItem(selectedItem.id, editedItem);
      setSelectedItem({ ...selectedItem, ...editedItem });
      setIsEditing(false);
      setEditedItem(null);
    } catch (error) {
      console.error('Error updating item:', error);
      setUploadError('Error updating item. Please try again.');
    }
  };

  /* ------------------------------------------------------------------ */
  /* Rendu                                                              */
  /* ------------------------------------------------------------------ */
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
      <ParticleEffect type="wardrobe" active={isUploading || isAnalyzing} />

      {/* Barre de titre */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display text-4xl mb-2">Your Wardrobe</h1>
          <p className="text-gray-600">Upload and manage your clothing items for virtual try-on</p>
        </div>

        <button onClick={() => setShowUploadForm(true)} className="btn btn-primary">
          <Plus className="h-5 w-5" /> Add Item
        </button>
      </div>

      {/* --------------------- Upload Form Modal ---------------------- */}
      {showUploadForm && (
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <div className="bg-white rounded-xl shadow-elegant max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* En-tête */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-display text-2xl">Add New Item</h2>
                <button onClick={() => setShowUploadForm(false)} className="text-gray-400 hover:text-gray-600">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>

              {/* Formulaire */}
              <form onSubmit={handleUpload} className="space-y-6">
                {/* Zone d'upload */}
                <DragDropUpload
                  onFileSelect={handleFileSelect}
                  preview={previewUrl}
                  error={uploadError}
                  maxSize={MAX_FILE_SIZE}
                />

                {/* Infos item */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm text-gray-600 mb-1">
                      Item Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      className="input-field"
                      placeholder="e.g., Blue Cotton Shirt"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm text-gray-600 mb-1">
                      Category
                    </label>
                    <select
                      id="category"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="input-field"
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm text-gray-600 mb-1">
                      Description (Optional)
                    </label>
                    <textarea
                      id="description"
                      value={itemDescription}
                      onChange={(e) => setItemDescription(e.target.value)}
                      className="input-field min-h-[100px]"
                      placeholder="Add any notes about the item..."
                    />
                  </div>
                </div>

                {uploadError && <p className="text-red-500 text-sm">{uploadError}</p>}

                {/* Boutons */}
                <div className="flex justify-end space-x-4">
                  <button type="button" onClick={() => setShowUploadForm(false)} className="btn btn-secondary" disabled={isUploading}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={
                      isUploading ||
                      isAnalyzing ||
                      !selectedFile ||
                      !itemName ||
                      !selectedCategory
                    }
                  >
                    {isUploading ? (
                      <>
                        <LoadingSpinner size="sm" text="" /> Processing…
                      </>
                    ) : isAnalyzing ? (
                      <>
                        <LoadingSpinner size="sm" text="" /> Analyzing…
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" /> Add to Wardrobe
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Motion.div>
      )}

      {/* --------------------- Grille des items ---------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wardrobeItems?.map((item) => (
          <button key={item.id} onClick={() => setSelectedItem(item)} className="text-left">
            <Motion.div className="card group" whileHover={{ y: -5 }}>
              <div className="relative aspect-square mb-4 overflow-hidden rounded-lg bg-ivory-100">
                <img
                  src={`data:image/jpeg;base64,${item.packshotImage || item.originalImage}`}
                  alt={item.name}
                  className="w-full h-full object-contain"
                />
              </div>

              <div>
                <h3 className="font-medium mb-1">{item.name}</h3>
                <p className="text-sm text-gray-500">{item.category}</p>
                {item.description && <p className="text-sm text-gray-600 mt-2">{item.description}</p>}
              </div>
            </Motion.div>
          </button>
        ))}
      </div>

      {/* --------------------- Item Detail Modal ---------------------- */}
      {selectedItem && (
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <Motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl shadow-elegant max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Name</label>
                        <input
                          type="text"
                          value={editedItem?.name || ''}
                          onChange={(e) => setEditedItem(prev => ({ ...prev!, name: e.target.value }))}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Category</label>
                        <select
                          value={editedItem?.category || ''}
                          onChange={(e) => setEditedItem(prev => ({ ...prev!, category: e.target.value }))}
                          className="input-field"
                        >
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2 className="font-display text-2xl mb-1">{selectedItem.name}</h2>
                      <p className="text-gray-500">{selectedItem.category}</p>
                    </>
                  )}
                </div>
                <button 
                  onClick={() => {
                    if (isEditing) {
                      setIsEditing(false);
                      setEditedItem(null);
                    } else {
                      setSelectedItem(null);
                    }
                  }} 
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="aspect-square mb-6 rounded-lg overflow-hidden bg-ivory-100">
                <img
                  src={`data:image/jpeg;base64,${selectedItem.packshotImage || selectedItem.originalImage}`}
                  alt={selectedItem.name}
                  className="w-full h-full object-contain"
                />
              </div>

              {isEditing ? (
                <div className="mb-6">
                  <label className="block text-sm text-gray-600 mb-1">Description</label>
                  <textarea
                    value={editedItem?.description || ''}
                    onChange={(e) => setEditedItem(prev => ({ ...prev!, description: e.target.value }))}
                    className="input-field min-h-[100px]"
                    placeholder="Add any notes about the item..."
                  />
                </div>
              ) : (
                selectedItem.description && <p className="text-gray-600 mb-6">{selectedItem.description}</p>
              )}

              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Tokens used: {selectedItem.tokensUsed || 1}</p>

                <div className="flex space-x-4">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditedItem(null);
                        }}
                        className="btn btn-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdate}
                        className="btn btn-primary"
                        disabled={!editedItem?.name || !editedItem?.category}
                      >
                        Save Changes
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="btn btn-secondary text-red-600 hover:bg-red-50"
                        disabled={isDeleting || isRegenerating}
                      >
                        <Trash2 className="h-4 w-4" /> Delete Item
                      </button>

                      <button
                        onClick={() => setShowRegenerateConfirm(true)}
                        className="btn btn-secondary"
                        disabled={isRegenerating || isDeleting}
                      >
                        <RefreshCw className={`h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} /> Regenerate Packshot
                      </button>

                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setEditedItem({
                            name: selectedItem.name,
                            category: selectedItem.category,
                            description: selectedItem.description || ''
                          });
                        }}
                        className="btn btn-primary"
                      >
                        Edit Item
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Motion.div>
        </Motion.div>
      )}

      {/* --------------------- Confirm modaux (regen / delete) ---------------------- */}
      {showRegenerateConfirm && (
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]"
        >
          <Motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl shadow-elegant max-w-md w-full p-6"
          >
            <h3 className="font-display text-xl mb-4">Confirm Regeneration</h3>
            <p className="text-gray-600 mb-6">
              Regenerating this packshot will use additional API tokens. Are you sure you want to continue?
            </p>

            <div className="flex justify-end space-x-4">
              <button onClick={() => setShowRegenerateConfirm(false)} className="btn btn-secondary" disabled={isRegenerating}>
                Cancel
              </button>
              <button onClick={handleRegenerate} className="btn btn-primary" disabled={isRegenerating}>
                {isRegenerating ? (
                  <>
                    <LoadingSpinner size="sm" text="" /> Regenerating…
                  </>
                ) : (
                  'Confirm'
                )}
              </button>
            </div>
          </Motion.div>
        </Motion.div>
      )}

      {showDeleteConfirm && (
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]"
        >
          <Motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl shadow-elegant max-w-md w-full p-6"
          >
            <h3 className="font-display text-xl mb-4">Delete Item</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this item? This action cannot be undone.</p>

            <div className="flex justify-end space-x-4">
              <button onClick={() => setShowDeleteConfirm(false)} className="btn btn-secondary" disabled={isDeleting}>
                Cancel
              </button>
              <button onClick={handleDelete} className="btn btn-primary bg-red-600 hover:bg-red-700" disabled={isDeleting}>
                {isDeleting ? (
                  <>
                    <LoadingSpinner size="sm" text="" /> Deleting…
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" /> Delete
                  </>
                )}
              </button>
            </div>
          </Motion.div>
        </Motion.div>
      )}

      {/* --------------------- Empty state ---------------------- */}
      {(!wardrobeItems || wardrobeItems.length === 0) && (
        <div className="text-center py-12">
          <Sparkles className="h-12 w-12 mx-auto text-gold-300 mb-4" />
          <h2 className="font-display text-2xl mb-2">Your Wardrobe is Empty</h2>
          <p className="text-gray-600 mb-6">Start by adding your first clothing item</p>
          <button onClick={() => setShowUploadForm(true)} className="btn btn-primary">
            <Plus className="h-5 w-5" /> Add First Item
          </button>
        </div>
      )}
    </Motion.div>
  );
};

export default Wardrobe;