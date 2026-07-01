
import { useState } from "react";
import { motion } from "framer-motion";
import { FiUpload, FiX, FiPlus, FiImage } from "react-icons/fi";

export default function ImageUpload({ min, max, value = [], onChange }) {
  const [isDragging, setIsDragging] = useState(false);

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
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const imageFiles = files.filter(file => file.type.startsWith("image/"));
    const newImages = imageFiles.map(file => URL.createObjectURL(file));
    const updated = [...value, ...newImages].slice(0, max);
    onChange(updated);
  };

  const removeImage = (index) => {
    const updated = value.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
          isDragging 
            ? "border-brand bg-brand-soft" 
            : "border-line hover:border-ink-2"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <FiImage className="w-12 h-12 mx-auto text-muted mb-3" />
        <h4 className="font-semibold mb-1">Drag & Drop Images</h4>
        <p className="text-muted text-sm mb-4">
          {value.length} / {max} Uploaded
          {value.length < min && (
            <span className="text-red-500 ml-2">(Minimum {min} required)</span>
          )}
        </p>
        <label className="btn-primary cursor-pointer">
          <FiUpload className="w-4 h-4" />
          <span>Browse Files</span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(Array.from(e.target.files))}
            disabled={value.length >= max}
          />
        </label>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {value.map((image, index) => (
          <motion.div
            key={index}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative aspect-square rounded-xl overflow-hidden card-soft"
          >
            <img
              src={image}
              alt={`Upload ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => removeImage(index)}
              className="absolute top-2 right-2 bg-black/70 text-white p-1.5 rounded-full hover:bg-black transition-colors"
            >
              <FiX className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
