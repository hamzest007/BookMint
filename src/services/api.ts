import { API_BASE_URL } from '../config/backend';

// Reactotron for debugging
const tron = (console as any).tron;

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async get(endpoint: string) {
    if (tron) {
      tron.log('API GET', { endpoint });
    }
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    const result = await this.handleResponse(response);
    if (tron) {
      tron.log('API GET Response', { endpoint, status: response.status });
    }
    return result;
  }

  async post(endpoint: string, data: any) {
    if (tron) {
      tron.log('API POST', { endpoint, data });
    }
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    const result = await this.handleResponse(response);
    if (tron) {
      tron.log('API POST Response', { endpoint, status: response.status });
    }
    return result;
  }

  async put(endpoint: string, data: any) {
    if (tron) {
      tron.log('API PUT', { endpoint, data });
    }
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    const result = await this.handleResponse(response);
    if (tron) {
      tron.log('API PUT Response', { endpoint, status: response.status });
    }
    return result;
  }

  async delete(endpoint: string) {
    if (tron) {
      tron.log('API DELETE', { endpoint });
    }
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    const result = await this.handleResponse(response);
    if (tron) {
      tron.log('API DELETE Response', { endpoint, status: response.status });
    }
    return result;
  }

  async upload(endpoint: string, file: any, additionalData: any = {}) {
    if (tron) {
      tron.log('Starting file upload', { fileName: file.name, fileType: file.type, fileUri: file.uri });
    }

    const formData = new FormData();

    // React Native requires specific format for file uploads
    const fileToUpload = {
      uri: file.uri,
      type: file.type || 'application/pdf',
      name: file.name || 'upload.pdf',
    };

    formData.append('file', fileToUpload as any);

    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    if (tron) {
      tron.log('FormData prepared', { file: fileToUpload, additionalData });
    }

    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    if (tron) {
      tron.log('Making upload request', { endpoint, hasAuth: !!this.token });
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (tron) {
        tron.log('Upload response received', { status: response.status, statusText: response.statusText });
      }

      const result = await this.handleResponse(response);

      if (tron) {
        tron.log('Upload successful', { result });
      }

      return result;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        if (tron) {
          tron.error('Upload timeout - request took too long');
        }
        throw new Error('Upload timeout - request took too long');
      }

      if (tron) {
        tron.error('Upload failed', error);
      }
      throw error;
    }
  }

  private async handleResponse(response: Response) {
    const data = await response.json();

    if (!response.ok) {
      if (tron) {
        tron.error('API Error', { status: response.status, data });
      }
      throw new Error(data.error || 'API request failed');
    }

    return data;
  }
}

export const apiService = new ApiService();