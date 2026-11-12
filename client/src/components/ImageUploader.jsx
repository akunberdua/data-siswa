import React, { useState, useRef } from 'react';
import { Camera, Upload, Trash2, Eye, CheckCircle2, AlertCircle } from 'lucide-react';
import { compressImage } from '../services/api';

export default function ImageUploader({ value, onChange, label = 'Foto Terbaru Rumah' }) {
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState('');
  const [previewModal, setPreviewModal] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar (JPG, PNG, atau WEBP)');
      return;
    }

    try {
      setError('');
      setCompressing(true);
      // Kompres otomatis gambar agar cepat disimpan & hemat database
      const compressedBase64 = await compressImage(file, 1200, 900, 0.75);
      onChange(compressedBase64);
    } catch (err) {
      console.error('Error compressing image:', err);
      setError('Gagal memproses gambar. Silakan coba gambar lain.');
    } finally {
      setCompressing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div className="form-group">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <label className="form-label" style={{ margin: 0 }}>
          {label} <span style={{ color: 'var(--danger)' }}>*</span>
        </label>
        {value && (
          <span className="badge badge-success">
            <CheckCircle2 size={13} /> Foto Siap
          </span>
        )}
      </div>

      {error && (
        <div className="alert alert-danger" style={{ padding: '0.5rem 0.75rem', marginBottom: '0.75rem' }}>
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {value ? (
        <div>
          <div className="image-preview-wrapper">
            <img src={value} alt="Preview Rumah" />
            <div
              style={{
                position: 'absolute',
                bottom: '12px',
                right: '12px',
                display: 'flex',
                gap: '8px',
                background: 'rgba(0,0,0,0.6)',
                padding: '6px 10px',
                borderRadius: '8px',
                backdropFilter: 'blur(4px)',
              }}
            >
              <button
                type="button"
                onClick={() => setPreviewModal(true)}
                className="btn btn-sm btn-secondary"
                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
              >
                <Eye size={14} /> Perbesar
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-sm btn-primary"
                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
              >
                <Upload size={14} /> Ganti
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="btn btn-sm btn-danger"
                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
              >
                <Trash2 size={14} /> Hapus
              </button>
            </div>
          </div>
          <div className="form-help">
            Foto tampak depan rumah berhasil diunggah. Klik "Ganti" bila ingin memperbarui foto.
          </div>
        </div>
      ) : (
        <div
          className="image-upload-zone"
          onClick={() => fileInputRef.current?.click()}
        >
          {compressing ? (
            <div style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>
                Sedang memproses & mengoptimalkan foto...
              </div>
            </div>
          ) : (
            <>
              <div
                style={{
                  width: '3.5rem',
                  height: '3.5rem',
                  borderRadius: '50%',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.75rem',
                }}
              >
                <Camera size={26} />
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.25rem' }}>
                Klik untuk Memilih atau Mengambil Foto Rumah
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', maxWidth: '340px' }}>
                Unggah foto tampak depan rumah terbaru (memperlihatkan kondisi atap, dinding, dan pintu).
              </div>
              <div
                className="btn btn-sm btn-outline-primary"
                style={{ marginTop: '0.875rem' }}
              >
                <Upload size={14} /> Pilih File Gambar
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Modal Zoom Foto */}
      {previewModal && (
        <div className="modal-overlay" onClick={() => setPreviewModal(false)}>
          <div
            className="modal-container"
            style={{ maxWidth: '720px', background: '#000', padding: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ position: 'relative' }}>
              <img
                src={value}
                alt="Foto Rumah Full"
                style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain', display: 'block' }}
              />
              <button
                type="button"
                onClick={() => setPreviewModal(false)}
                className="btn btn-danger btn-sm"
                style={{ position: 'absolute', top: '12px', right: '12px' }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
