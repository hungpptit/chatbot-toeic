import axios from 'axios';

const UPLOAD_BASE_URL = 'http://localhost:8080/api/upload';

export interface UploadResponse {
  success: boolean;
  type: 'image' | 'audio' | 'video';
  url: string;
  publicId: string;
  size: number;
  format: string;
  duration?: number; // Only for audio/video
}

/**
 * Upload image file to Cloudinary via backend
 */
export const uploadImageAPI = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post<UploadResponse>(
      `${UPLOAD_BASE_URL}/image`,
      formData,
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (response.data.success) {
      console.log('✅ Image uploaded:', response.data.url);
      return response.data.url;
    } else {
      throw new Error('Upload failed');
    }
  } catch (error) {
    console.error('❌ Error uploading image:', error);
    throw error;
  }
};

/**
 * Upload audio file to Cloudinary via backend
 */
export const uploadAudioAPI = async (file: File): Promise<{ url: string; duration?: number }> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post<UploadResponse>(
      `${UPLOAD_BASE_URL}/audio`,
      formData,
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (response.data.success) {
      console.log('✅ Audio uploaded:', response.data.url);
      console.log('⏱️ Duration:', response.data.duration);
      return {
        url: response.data.url,
        duration: response.data.duration
      };
    } else {
      throw new Error('Upload failed');
    }
  } catch (error) {
    console.error('❌ Error uploading audio:', error);
    throw error;
  }
};

/**
 * Delete file from Cloudinary
 */
export const deleteFileAPI = async (
  publicId: string,
  resourceType: 'image' | 'video' = 'image'
): Promise<void> => {
  try {
    await axios.delete(
      `${UPLOAD_BASE_URL}/delete/${publicId}?resourceType=${resourceType}`,
      {
        withCredentials: true,
      }
    );
    console.log('✅ File deleted:', publicId);
  } catch (error) {
    console.error('❌ Error deleting file:', error);
    throw error;
  }
};

/**
 * Upload file based on type (auto-detect)
 */
export const uploadFileAPI = async (
  file: File,
  type: 'image' | 'audio' | 'video'
): Promise<string | { url: string; duration?: number }> => {
  if (type === 'audio' || type === 'video') {
    return uploadAudioAPI(file);
  } else {
    return uploadImageAPI(file);
  }
};

/**
 * Batch upload từ local paths (server-side processing)
 * @param testData - Test data JSON với audioPath và imagePath
 * @returns Test data với URLs thay thế paths
 */
export const batchUploadFromPathsAPI = async (testData: any): Promise<any> => {
  try {
    console.log('📤 Sending test data with paths to backend...');
    
    const response = await axios.post<{
      success: boolean;
      message: string;
      data?: any;
      invalidPaths?: string[];
    }>(
      `${UPLOAD_BASE_URL}/batch-from-paths`,
      testData,
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.success) {
      console.log('✅ Batch upload completed');
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Batch upload failed');
    }
  } catch (error: any) {
    console.error('❌ Batch upload error:', error);
    if (error.response?.data?.invalidPaths) {
      throw new Error(
        `Invalid paths found:\n${error.response.data.invalidPaths.join('\n')}`
      );
    }
    throw error;
  }
};

/**
 * Validate paths trước khi upload
 */
export const validatePathsAPI = async (testData: any): Promise<boolean> => {
  try {
    const response = await axios.post<{
      success: boolean;
      message: string;
      invalidPaths?: string[];
    }>(
      `${UPLOAD_BASE_URL}/validate-paths`,
      testData,
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.success;
  } catch (error: any) {
    if (error.response?.data?.invalidPaths) {
      console.error('❌ Invalid paths:', error.response.data.invalidPaths);
    }
    return false;
  }
};
