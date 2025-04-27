import React, { useState } from 'react';
import { Sparkles, Camera, Shirt, Plus, Trash2, X } from 'lucide-react';
import { useMotion } from '../contexts/MotionContext';
import { useDatabase } from '../contexts/DatabaseContext';
import { useApiKeyContext } from '../contexts/ApiKeyContext';
import { useCategories } from '../contexts/CategoriesContext';
import { generateComposition } from '../services/openai';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ParticleEffect from '../components/ui/ParticleEffect';

export default function Compositions() {
  const { Motion, pageTransition } = useMotion();
  const { wardrobeItems, profilePhotos, compositions, addComposition, deleteComposition, isLoading: isLoadingDb } =
    useDatabase();
  const { apiKey, quality } = useApiKeyContext();
  const { categories } = useCategories();

  /* --------------------------- états --------------------------- */
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [compositionName, setCompositionName] = useState('');
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  const [selectedByCat, setSelectedByCat] = useState<Record<string, number | null>>(
    () => categories.reduce((acc, c) => ({ ...acc, [c]: null }), {})
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedComposition, setSelectedComposition] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  /* --------------- sélection / désélection vêtement -------------- */
  const toggleWardrobe = (cat: string, id: number) => {
    setSelectedByCat((prev) => ({ ...prev, [cat]: prev[cat] === id ? null : id }));
  };

  /* -------------------- génération try-on ---------------------- */
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfileId || !compositionName) return;

    setIsGenerating(true);
    setError(null);

    try {
      const pose = profilePhotos?.find((p) => p.id === selectedProfileId);
      if (!pose) throw new Error('Pose not found');

      const images: string[] = [];
      const descs: string[] = [];
      const usedItemIds: number[] = [];

      categories.forEach((cat) => {
        const id = selectedByCat[cat];
        if (!id) return;
        const item = wardrobeItems?.find((w) => w.id === id);
        if (item) {
          images.push(item.packshotImage || item.originalImage);
          descs.push(item.name || item.description || cat);
          usedItemIds.push(id);
        }
      });

      if (images.length === 0) {
        setError('Select at least one wardrobe item.');
        setIsGenerating(false);
        return;
      }

      const b64 = await generateComposition(apiKey!, pose.image, images, descs, quality);
      const resultImage = `data:image/png;base64,${b64}`;

      await addComposition({
        name: compositionName,
        profilePhotoId: selectedProfileId,
        wardrobeItemIds: usedItemIds,
        resultImage
      });

      /* reset */
      setShowCreateForm(false);
      setCompositionName('');
      setSelectedProfileId(null);
      setSelectedByCat(categories.reduce((acc, c) => ({ ...acc, [c]: null }), {}));
    } catch {
      setError('Error generating composition. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  /* ---------------------- rendu loading ------------------------ */
  if (isLoadingDb) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  const hasData = (profilePhotos?.length ?? 0) > 0 && (wardrobeItems?.length ?? 0) > 0;

  return (
    <Motion.div
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      exit={pageTransition.exit}
      transition={pageTransition.transition}
      className="max-w-7xl mx-auto"
    >
      <ParticleEffect type="composition" active={isGenerating} />

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display text-4xl mb-2">Virtual Try-On</h1>
          <p className="text-gray-600">Create AI-powered virtual try-on compositions</p>
        </div>
        {hasData && (
          <button onClick={() => setShowCreateForm(true)} className="btn btn-primary">
            <Plus className="h-5 w-5" /> New Try-On
          </button>
        )}
      </div>

      {/* Modal */}
      {showCreateForm && (
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        >
          <div className="bg-white rounded-xl shadow-elegant max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-display text-2xl">Create Virtual Try-On</h2>
                <button onClick={() => setShowCreateForm(false)} className="text-gray-400 hover:text-gray-600">
                  <Plus className="h-5 w-5 rotate-45" />
                </button>
              </div>

              <form onSubmit={handleGenerate} className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Composition Name</label>
                  <input
                    className="input-field"
                    value={compositionName}
                    onChange={(e) => setCompositionName(e.target.value)}
                    placeholder="e.g., Summer Outfit"
                    required
                  />
                </div>

                {/* Pose */}
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Choose Pose</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {profilePhotos?.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedProfileId(p.id)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 ${
                          selectedProfileId === p.id
                            ? 'border-navy-500 ring-2 ring-navy-200'
                            : 'border-transparent hover:border-navy-200'
                        }`}
                      >
                        <img src={`data:image/jpeg;base64,${p.image}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Wardrobe par catégorie (uniquement si non vide) */}
                {categories.map((cat) => {
                  const items = wardrobeItems?.filter((w) => w.category === cat) || [];
                  if (items.length === 0) return null; // 👉 on masque la catégorie vide
                  return (
                    <div key={cat}>
                      <label className="block text-sm text-gray-600 mb-2">{cat}</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {items.map((w) => (
                          <button
                            key={w.id}
                            type="button"
                            onClick={() => toggleWardrobe(cat, w.id)}
                            className={`aspect-square rounded-lg overflow-hidden border-2 ${
                              selectedByCat[cat] === w.id
                                ? 'border-navy-500 ring-2 ring-navy-200'
                                : 'border-transparent hover:border-navy-200'
                            }`}
                          >
                            <img
                              src={`data:image/jpeg;base64,${w.packshotImage || w.originalImage}`}
                              alt={w.name}
                              className="w-full h-full object-contain"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {error && <p className="text-red-500 text-sm">{error}</p>}

                {/* Boutons */}
                <div className="flex justify-end space-x-4">
                  <button type="button" onClick={() => setShowCreateForm(false)} className="btn btn-secondary" disabled={isGenerating}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isGenerating || !selectedProfileId || !compositionName}
                  >
                    {isGenerating ? (
                      <>
                        <LoadingSpinner size="sm" text="" /> Generating…
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" /> Generate Try-On
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Motion.div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display text-xl">Delete Try-On</h3>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedComposition(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this try-on? This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedComposition(null);
                }}
                className="btn btn-secondary"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (selectedComposition) {
                    setIsDeleting(true);
                    try {
                      await deleteComposition(selectedComposition);
                      setShowDeleteConfirm(false);
                      setSelectedComposition(null);
                    } finally {
                      setIsDeleting(false);
                    }
                  }
                }}
                className="btn bg-red-600 hover:bg-red-700 text-white"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <LoadingSpinner size="sm" text="" /> Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </Motion.div>
        </Motion.div>
      )}

      {/* Liste compositions ou onboarding */}
      {hasData ? (
        compositions && compositions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {compositions?.map((c) => (
              <Motion.div 
                key={c.id} 
                className="card group relative cursor-pointer" 
                whileHover={{ y: -5 }}
                onClick={() => setFullscreenImage(c.resultImage)}
              >
                <div className="aspect-square rounded-lg overflow-hidden bg-ivory-100 mb-4">
                  <img 
                    src={c.resultImage} 
                    className="w-full h-[200%] object-cover object-top" 
                    alt={c.name}
                  />
                </div>
                <h3 className="font-medium mb-2">{c.name}</h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedComposition(c.id);
                    setShowDeleteConfirm(true);
                  }}
                  className="absolute top-2 right-2 bg-white/70 hover:bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </button>
              </Motion.div>
            ))}
          </div>
        ) : (
          <EmptyState onCreate={() => setShowCreateForm(true)} />
        )
      ) : (
        <Onboarding />
      )}
      
      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[70]"
          onClick={() => setFullscreenImage(null)}
        >
          <button
            onClick={() => setFullscreenImage(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white"
          >
            <X className="h-8 w-8" />
          </button>
          
          <Motion.img
            src={fullscreenImage}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </Motion.div>
      )}
    </Motion.div>
  );
}

/* ---------- petits composants utilitaires (inchangés) ---------- */

const EmptyState: React.FC<{ onCreate: () => void }> = ({ onCreate }) => (
  <div className="text-center py-12">
    <Sparkles className="h-12 w-12 mx-auto text-gold-300 mb-4" />
    <h2 className="font-display text-2xl mb-2">No Try-Ons Yet</h2>
    <p className="text-gray-600 mb-6">Create your first virtual try-on composition</p>
    <button onClick={onCreate} className="btn btn-primary">
      <Plus className="h-5 w-5" /> Create First Try-On
    </button>
  </div>
);

const Onboarding: React.FC = () => (
  <div className="bg-white rounded-xl shadow-elegant p-8 text-center">
    <h2 className="font-display text-2xl mb-4">Getting Started</h2>
    <p className="text-gray-600 mb-6">Before creating virtual try-ons, you'll need:</p>
    <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
      <OnboardCard
        icon={<Camera className="h-8 w-8 mx-auto text-navy-500 mb-3" />}
        title="Profile Photos"
        text="Add photos of yourself to use as base images"
        url="/profile-photos"
      />
      <OnboardCard
        icon={<Shirt className="h-8 w-8 mx-auto text-navy-500 mb-3" />}
        title="Wardrobe Items"
        text="Upload clothing items you want to try on"
        url="/wardrobe"
      />
    </div>
  </div>
);

const OnboardCard: React.FC<{ icon: React.ReactNode; title: string; text: string; url: string }> = ({
  icon,
  title,
  text,
  url
}) => (
  <div className="p-6 bg-ivory-50 rounded-lg">
    {icon}
    <h3 className="font-medium mb-2">{title}</h3>
    <p className="text-sm text-gray-500 mb-4">{text}</p>
    <button onClick={() => (window.location.href = url)} className="btn btn-secondary">
      <Plus className="h-4 w-4" /> Add
    </button>
  </div>
);