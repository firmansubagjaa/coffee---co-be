import { supabase } from "../../utils/supabase";

export const StorageService = {
  async uploadFile(file: File, path: string) {
    const { data, error } = await supabase.storage
      .from("images")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from("images")
      .getPublicUrl(path);

    return publicUrlData.publicUrl;
  },

  async uploadFiles(files: File[], folder: string = "general") {
    const uploadPromises = files.map(async (file) => {
      const uniqueName = `${folder}/${crypto.randomUUID()}-${file.name}`;
      return this.uploadFile(file, uniqueName);
    });

    return Promise.all(uploadPromises);
  },
};
