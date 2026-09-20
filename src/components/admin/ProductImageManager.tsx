import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Trash2, 
  X, 
  Check, 
  AlertCircle, 
  ImageIcon, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Eye,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { 
  validateImageFile, 
  optimizeAndEncodeImage, 
  DEFAULT_EPI_PLACEHOLDER,
  OptimizedImageResult,
  MAX_FILE_SIZE_BYTES
} from '../../services/imageStorage';
import { getSafeErrorMessage } from '../../utils/error';

export interface PresetImage {
  label: string;
  url: string;
}

interface ProductImageManagerProps {
  currentImage: string;
  productName: string;
  presetImages: PresetImage[];
  onImageChanged: (newImageUrl: string, optimizedResult?: OptimizedImageResult | null) => void;
  onImageRemoved: () => void;
  isSubmitting?: boolean;
}

export const ProductImageManager: React.FC<ProductImageManagerProps> = ({
  currentImage,
  productName,
  presetImages,
  onImageChanged,
  onImageRemoved,
  isSubmitting = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Selected file details
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [pendingDetails, setPendingDetails] = useState<{
    name: string;
    sizeFormatted: string;
    format: string;
    width?: number;
    height?: number;
  } | null>(null);

  // Cache buster for current image display
  const [previewError, setPreviewError] = useState(false);

  // Reset internal states when currentImage changes externally
  useEffect(() => {
    setPreviewError(false);
  }, [currentImage]);

  // Clean up object URL when unmounting or changing preview
  useEffect(() => {
    return () => {
      if (pendingPreview && pendingPreview.startsWith('blob:')) {
        URL.revokeObjectURL(pendingPreview);
      }
    };
  }, [pendingPreview]);

  // Trigger file input dialog
  const handleOpenFileDialog = () => {
    setErrorMessage(null);
    setShowRemoveConfirm(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // Format bytes for human display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Handle file selection from input
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setErrorMessage(null);
    setIsProcessing(true);

    try {
      // 1. Rigorous validation
      const validation = await validateImageFile(file);
      if (!validation.valid) {
        setErrorMessage(validation.error || 'Ficheiro de imagem inválido.');
        setIsProcessing(false);
        return;
      }

      // 2. Immediate preview generation
      const tempPreviewUrl = URL.createObjectURL(file);
      setPendingFile(file);
      setPendingPreview(tempPreviewUrl);
      setIsRemoved(false);
      setShowRemoveConfirm(false);

      setPendingDetails({
        name: file.name,
        sizeFormatted: formatFileSize(file.size),
        format: file.type.replace('image/', '').toUpperCase(),
        width: validation.width,
        height: validation.height,
      });

      // 3. Process & optimize in the background for instant saving readiness
      const optimized = await optimizeAndEncodeImage(file, 1000, 1000, 0.85);

      // 4. Try uploading directly to server for permanent versioned URL
      let finalUrl = optimized.dataUrl;
      try {
        const cleanName = (productName || file.name).toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30);
        const res = await fetch('/api/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: cleanName,
            dataUrl: optimized.dataUrl,
            fileName: file.name,
          }),
        });

        if (res.ok) {
          const json = await res.json();
          if (json && json.url) {
            finalUrl = json.url;
          }
        }
      } catch (uploadErr) {
        console.warn('Upload direto falhou, continuando com dataUrl otimizada:', uploadErr);
      }

      // Pass the versioned server URL or optimized dataUrl up to parent
      onImageChanged(finalUrl, { ...optimized, dataUrl: finalUrl });
    } catch (err: any) {
      console.error('Erro ao processar imagem:', err);
      setErrorMessage(
        getSafeErrorMessage(
          err,
          'Ocorreu um erro ao processar a imagem. Certifique-se de que é um ficheiro JPG, PNG ou WEBP válido.'
        )
      );
      handleCancelNewImage();
    } finally {
      setIsProcessing(false);
    }
  };

  // Cancel new selected image
  const handleCancelNewImage = () => {
    if (pendingPreview && pendingPreview.startsWith('blob:')) {
      URL.revokeObjectURL(pendingPreview);
    }
    setPendingFile(null);
    setPendingPreview(null);
    setPendingDetails(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Revert parent form to currentImage
    onImageChanged(currentImage, null);
  };

  // Confirm image removal
  const handleConfirmRemove = () => {
    handleCancelNewImage();
    setIsRemoved(true);
    setShowRemoveConfirm(false);
    onImageRemoved();
  };

  // Undo image removal
  const handleUndoRemove = () => {
    setIsRemoved(false);
    setShowRemoveConfirm(false);
    onImageChanged(currentImage, null);
  };

  // Manual URL or Preset selection from advanced options
  const handleSelectPreset = (url: string) => {
    handleCancelNewImage();
    setIsRemoved(false);
    // Assegura query string de versionamento para cache busting em presets
    const versionedUrl = url.includes('?v=') ? url : `${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}`;
    onImageChanged(versionedUrl, null);
  };

  // Determine current active image for preview
  const displayImage = isRemoved 
    ? DEFAULT_EPI_PLACEHOLDER 
    : (currentImage || DEFAULT_EPI_PLACEHOLDER);

  return (
    <div className="space-y-4 bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-800">
      {/* Hidden native file input with strictly accepted formats */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
        id="product-image-file-input"
        disabled={isProcessing || isSubmitting}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-amber-400" />
          <label className="text-xs sm:text-sm font-bold text-slate-200">
            Fotografia / Imagem do EPI
          </label>
        </div>
        <span className="text-[11px] text-slate-400">
          Formatos: JPG, JPEG, PNG, WEBP (Máx. 8 MB)
        </span>
      </div>

      {/* Error message alert */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-300 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="font-bold text-red-200 block mb-0.5">Erro na seleção da imagem:</strong>
            <span>{getSafeErrorMessage(errorMessage)}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-white p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Loading state indicator */}
      {isProcessing && (
        <div className="p-4 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center gap-3 text-xs text-amber-300 animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
          <span>A carregar, validar e otimizar imagem para a loja...</span>
        </div>
      )}

      {/* Grid: Preview Cards and Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* SECTION 1: IMAGEM ATUAL */}
        <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                Imagem Atual
              </span>
              {isRemoved ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 border border-red-500/30">
                  Removida (Pendente)
                </span>
              ) : currentImage ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Check className="w-2.5 h-2.5" />
                  Ativa no Catálogo
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                  Sem Imagem
                </span>
              )}
            </div>

            {/* Current Image Box */}
            <div className="relative w-full h-44 rounded-xl bg-white p-2 border border-slate-700 flex items-center justify-center overflow-hidden shadow-inner group">
              <img
                src={previewError ? DEFAULT_EPI_PLACEHOLDER : displayImage}
                alt={productName || 'EPI'}
                className={`max-h-full max-w-full object-contain transition-transform duration-300 ${
                  isRemoved ? 'opacity-40 grayscale' : 'group-hover:scale-105'
                }`}
                onError={() => setPreviewError(true)}
              />

              {isRemoved && (
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center p-3 text-center">
                  <Trash2 className="w-6 h-6 text-red-400 mb-1" />
                  <span className="text-xs font-bold text-white">Imagem será removida</span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    O produto ficará com o ícone padrão ao gravar.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons for current image */}
          <div className="mt-3.5 pt-3 border-t border-slate-800/80">
            {showRemoveConfirm ? (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/60 space-y-2">
                <div className="text-xs font-bold text-red-200">
                  Confirmar remoção da imagem do produto?
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleConfirmRemove}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Sim, Remover
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRemoveConfirm(false)}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : isRemoved ? (
              <button
                type="button"
                onClick={handleUndoRemove}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Desfazer Remoção</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="admin-alterar-imagem-btn"
                  onClick={handleOpenFileDialog}
                  disabled={isProcessing || isSubmitting}
                  className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Alterar Imagem</span>
                </button>

                {currentImage && currentImage !== DEFAULT_EPI_PLACEHOLDER && (
                  <button
                    type="button"
                    id="admin-remover-imagem-btn"
                    onClick={() => setShowRemoveConfirm(true)}
                    disabled={isProcessing || isSubmitting}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 text-xs font-bold border border-slate-700 hover:border-red-500/40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    title="Remover imagem atual"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Remover</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: NOVA IMAGEM SELECIONADA (ou estado de espera) */}
        <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Nova Imagem Selecionada
              </span>
              {pendingPreview ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-400 border border-amber-400/30 flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  Pronta para Guardar
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-500 border border-slate-700/60">
                  Nenhuma Nova Seleção
                </span>
              )}
            </div>

            {/* New Image Box or Placeholder */}
            {pendingPreview ? (
              <div>
                <div className="relative w-full h-44 rounded-xl bg-white p-2 border-2 border-amber-400/60 flex items-center justify-center overflow-hidden shadow-md">
                  <img
                    src={pendingPreview}
                    alt="Pré-visualização da nova imagem"
                    className="max-h-full max-w-full object-contain"
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-xs text-[10px] font-mono text-amber-400 border border-slate-700">
                    {pendingDetails?.format || 'WEBP'}
                  </div>
                </div>

                {/* File details */}
                {pendingDetails && (
                  <div className="mt-2.5 p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1 truncate max-w-[200px]" title={pendingDetails.name}>
                        <FileText className="w-3 h-3 text-amber-400 flex-shrink-0" />
                        <span className="truncate">{pendingDetails.name}</span>
                      </span>
                      <span className="font-mono text-amber-400 font-bold flex-shrink-0">
                        {pendingDetails.sizeFormatted}
                      </span>
                    </div>
                    {pendingDetails.width && pendingDetails.height && (
                      <div className="text-[10px] text-slate-500">
                        Resolução original: {pendingDetails.width} × {pendingDetails.height} px (otimizada para o catálogo)
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div 
                onClick={handleOpenFileDialog}
                className="w-full h-44 rounded-xl border-2 border-dashed border-slate-700/80 hover:border-amber-400/60 bg-slate-950/40 hover:bg-slate-950/70 transition-all flex flex-col items-center justify-center p-4 text-center cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-slate-800 group-hover:bg-amber-400/20 text-slate-400 group-hover:text-amber-400 flex items-center justify-center mb-2 transition-colors">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">
                  Clique para selecionar nova imagem
                </span>
                <span className="text-[11px] text-slate-500 mt-1 max-w-[220px]">
                  Ficheiros do computador ou câmara do telemóvel
                </span>
              </div>
            )}
          </div>

          {/* Action buttons for new image */}
          <div className="mt-3.5 pt-3 border-t border-slate-800/80">
            {pendingPreview ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCancelNewImage}
                    disabled={isProcessing || isSubmitting}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancelar Seleção</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenFileDialog}
                    disabled={isProcessing || isSubmitting}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold border border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Escolher outro ficheiro"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Substituir</span>
                  </button>
                </div>
                <div className="text-[11px] text-center text-amber-400/90 font-medium">
                  ✓ Para confirmar, clique em "Guardar Alterações" no fim do formulário.
                </div>
              </div>
            ) : (
              <div className="text-[11px] text-slate-500 text-center py-1">
                A imagem atual será mantida se nenhuma nova foto for escolhida.
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Advanced Options Accordion (Manual URL / Catalog Presets) */}
      <div className="pt-2 border-t border-slate-800/60">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1.5 transition-colors cursor-pointer py-1"
        >
          {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          <span className="font-semibold">
            Opções Avançadas (URL manual do produto ou galeria de presets)
          </span>
        </button>

        {showAdvanced && (
          <div className="mt-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 animate-in fade-in duration-200">
            {/* Manual URL input */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Caminho / URL da Imagem (Avançado)
              </label>
              <input
                type="text"
                value={currentImage}
                onChange={(e) => {
                  handleCancelNewImage();
                  setIsRemoved(false);
                  onImageChanged(e.target.value, null);
                }}
                placeholder="/products/prod_capacete.jpg ou https://..."
                className="w-full text-xs font-mono px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Presets Gallery */}
            <div>
              <div className="text-[11px] font-bold text-slate-400 mb-1.5">
                Ou selecionar uma imagem da galeria padrão de EPIs:
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
                {presetImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(img.url)}
                    className={`p-1 rounded-lg border flex-shrink-0 transition-all cursor-pointer ${
                      currentImage === img.url && !pendingPreview && !isRemoved
                        ? 'border-amber-400 bg-amber-400/20 shadow-sm'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                    title={img.label}
                  >
                    <div className="w-9 h-9 bg-white rounded flex items-center justify-center p-0.5">
                      <img src={img.url} alt={img.label} className="w-full h-full object-contain" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
