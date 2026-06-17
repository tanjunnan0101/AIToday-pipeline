import { randomUUID } from "node:crypto";

import { env, hasSupabaseStorageConfig } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export interface StorageUploadInput {
  path: string;
  fileName: string;
  contentType: string;
  file?: File;
}

export interface StorageProvider {
  upload(input: StorageUploadInput): Promise<{ objectPath: string; publicUrl: string }>;
}

function sanitizePathSegment(value: string) {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function buildObjectPath(path: string, fileName: string) {
  const normalizedPath = path.replace(/^\/+|\/+$/g, "");
  const safeName = sanitizePathSegment(fileName) || "upload";
  return `${normalizedPath}/${randomUUID()}-${safeName}`;
}

export async function resolveStorageObjectUrl(
  objectPath: string,
  options?: {
    expiresIn?: number;
    downloadFileName?: string;
  },
) {
  if (!objectPath) {
    return undefined;
  }

  if (!hasSupabaseStorageConfig()) {
    return `/uploads/${objectPath}`;
  }

  const supabase = createSupabaseAdminClient();
  const bucket = env.supabaseBucket!;
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(objectPath, options?.expiresIn ?? 60 * 10, {
      download: options?.downloadFileName,
    });

  if (error) {
    return undefined;
  }

  return data.signedUrl;
}

export const storageProvider: StorageProvider = {
  async upload(input) {
    const objectPath = buildObjectPath(input.path, input.fileName);

    if (!hasSupabaseStorageConfig()) {
      return {
        objectPath,
        publicUrl: `/uploads/${objectPath}`,
      };
    }

    if (!(input.file instanceof File) || input.file.size === 0) {
      throw new Error("A file payload is required for Supabase storage uploads.");
    }

    const supabase = createSupabaseAdminClient();
    const bucket = env.supabaseBucket!;
    const { error } = await supabase.storage.from(bucket).upload(objectPath, input.file, {
      contentType: input.contentType,
      upsert: false,
    });

    if (error) {
      throw new Error(`Supabase storage upload failed: ${error.message}`);
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);

    return {
      objectPath,
      publicUrl: data.publicUrl,
    };
  },
};
