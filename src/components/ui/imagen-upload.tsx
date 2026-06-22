"use client";

import { ImageIcon, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type ImagenUploadProps = {
  defaultValue?: string | null;
  onUpload?: (url: string) => void;
};

export function ImagenUpload({ defaultValue, onUpload }: ImagenUploadProps) {
  const [preview, setPreview] = useState<string | null>(defaultValue ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState<string>(defaultValue ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Solo se permiten imágenes.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no puede superar los 5MB.");
      return;
    }

    setError(null);
    setUploading(true);
    setPreview(URL.createObjectURL(file));

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Debes estar autenticado para subir imágenes.");
        setPreview(defaultValue ?? null);
        return;
      }

      const rawExtension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const extension = /^[a-z0-9]{2,5}$/.test(rawExtension) ? rawExtension : "jpg";
      const path = `${user.id}/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("torneos")
        .upload(path, file, { contentType: file.type, upsert: false });

      if (uploadError) {
        setError("Error al subir la imagen. Intenta nuevamente.");
        setPreview(defaultValue ?? null);
        return;
      }

      const { data } = supabase.storage.from("torneos").getPublicUrl(path);
      setUrl(data.publicUrl);
      onUpload?.(data.publicUrl);
    } catch {
      setError("No se pudo preparar la subida. Intenta nuevamente.");
      setPreview(defaultValue ?? null);
    } finally {
      setUploading(false);
    }
  }

  function handleRemove() {
    setPreview(null);
    setUrl("");
    onUpload?.("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-zinc-700">Imagen del torneo</span>

      {preview ? (
        <div className="relative w-full overflow-hidden rounded-lg border border-zinc-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Vista previa de la imagen del torneo" className="h-48 w-full object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white transition hover:bg-black/80"
            aria-label="Quitar imagen del torneo"
          >
            <X size={14} />
          </button>
          {uploading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <span className="text-sm font-medium text-white">Subiendo…</span>
            </div>
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="ui-card-soft flex h-36 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-300 text-zinc-500 transition hover:border-[#36d6b7] hover:bg-zinc-50"
        >
          <ImageIcon size={24} />
          <span className="text-sm">Haz clic para subir una imagen</span>
          <span className="text-xs text-zinc-400">PNG, JPG, WEBP — máx. 5MB</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
        aria-label="Seleccionar imagen del torneo"
      />

      {error ? <span className="text-xs text-rose-600">{error}</span> : null}

      <input type="hidden" name="imagen_url" value={url} />
    </div>
  );
}
