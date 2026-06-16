export interface StorageUploadInput {
  path: string;
  fileName: string;
  contentType: string;
}

export interface StorageProvider {
  upload(input: StorageUploadInput): Promise<{ publicUrl: string }>;
}

export const demoStorageProvider: StorageProvider = {
  async upload(input) {
    return {
      publicUrl: `/uploads/${input.path}/${input.fileName}`,
    };
  },
};
