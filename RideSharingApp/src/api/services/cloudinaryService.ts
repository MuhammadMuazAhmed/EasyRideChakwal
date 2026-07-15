import * as ImageManipulator from 'expo-image-manipulator';
import { env } from '@/config/env';

// Pure JavaScript implementation of SHA-1
function sha1(str: string): string {
  const utftxt = function (s: string) {
    s = s.replace(/\r\n/g, '\n');
    let txt = '';
    for (let n = 0; n < s.length; n++) {
      const c = s.charCodeAt(n);
      if (c < 128) {
        txt += String.fromCharCode(c);
      } else if (c > 127 && c < 2048) {
        txt += String.fromCharCode((c >> 6) | 192);
        txt += String.fromCharCode((c & 63) | 128);
      } else {
        txt += String.fromCharCode((c >> 12) | 224);
        txt += String.fromCharCode(((c >> 6) & 63) | 128);
        txt += String.fromCharCode((c & 63) | 128);
      }
    }
    return txt;
  };

  const str2blks = function (str: string) {
    const nblk = ((str.length + 8) >> 6) + 1;
    const blks = new Array(nblk * 16);
    for (let i = 0; i < nblk * 16; i++) blks[i] = 0;
    let i;
    for (i = 0; i < str.length; i++) {
      blks[i >> 2] |= str.charCodeAt(i) << (24 - (i & 3) * 8);
    }
    blks[i >> 2] |= 0x80 << (24 - (i & 3) * 8);
    blks[nblk * 16 - 1] = str.length * 8;
    return blks;
  };

  const safe_add = function (x: number, y: number) {
    const lsw = (x & 0xffff) + (y & 0xffff);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xffff);
  };

  const rol = function (num: number, cnt: number) {
    return (num << cnt) | (num >>> (32 - cnt));
  };

  const ft = function (t: number, b: number, c: number, d: number) {
    if (t < 20) return (b & c) | (~b & d);
    if (t < 40) return b ^ c ^ d;
    if (t < 60) return (b & c) | (b & d) | (c & d);
    return b ^ c ^ d;
  };

  const kt = function (t: number) {
    return t < 20 ? 1518500249 : t < 40 ? 1859775393 : t < 60 ? -1894007588 : -899497514;
  };

  const x = str2blks(utftxt(str));
  const w = new Array(80);
  let a = 1732584193;
  let b = -271733879;
  let c = -1732584194;
  let d = 271733878;
  let e = -1009589776;

  for (let i = 0; i < x.length; i += 16) {
    const olda = a;
    const oldb = b;
    const oldc = c;
    const oldd = d;
    const olde = e;

    for (let j = 0; j < 80; j++) {
      if (j < 16) w[j] = x[i + j];
      else w[j] = rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
      const t = safe_add(safe_add(rol(a, 5), ft(j, b, c, d)), safe_add(e, w[j] + kt(j)));
      e = d;
      d = c;
      c = rol(b, 30);
      b = a;
      a = t;
    }

    a = safe_add(a, olda);
    b = safe_add(b, oldb);
    c = safe_add(c, oldc);
    d = safe_add(d, oldd);
    e = safe_add(e, olde);
  }

  const hex = function (val: number) {
    let str = '';
    for (let i = 7; i >= 0; i--) {
      str += ((val >> (i * 4)) & 0x0f).toString(16);
    }
    return str;
  };

  return hex(a) + hex(b) + hex(c) + hex(d) + hex(e);
}

function generateSignature(params: Record<string, string | number>, apiSecret: string): string {
  const sortedKeys = Object.keys(params).sort();
  const serialized = sortedKeys.map((key) => `${key}=${params[key]}`).join('&');
  return sha1(serialized + apiSecret);
}

export interface CloudinaryUploadOptions {
  folder?: string;
  publicId?: string;
  compress?: boolean;
  onProgress?: (progress: number) => void;
}

export const CloudinaryService = {
  /**
   * Compresses an image to max width 1080px and 0.8 quality
   */
  async compressImage(uri: string): Promise<string> {
    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1080 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      return result.uri;
    } catch (err) {
      console.warn('Image compression failed, using original file URI:', err);
      return uri;
    }
  },

  /**
   * Uploads file to Cloudinary with progress tracking and optional compression.
   */
  async upload(uri: string, options: CloudinaryUploadOptions = {}): Promise<string> {
    let targetUri = uri;
    if (options.compress !== false) {
      targetUri = await this.compressImage(uri);
    }

    const cloudName = env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = env.EXPO_PUBLIC_CLOUDINARY_API_KEY;
    const apiSecret = env.EXPO_PUBLIC_CLOUDINARY_API_SECRET;
    const defaultFolder = env.EXPO_PUBLIC_CLOUDINARY_FOLDER;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('Cloudinary configuration is incomplete or missing in environment variables.');
    }

    const timestamp = Math.round(Date.now() / 1000);
    const folder = options.folder || defaultFolder;

    const signatureParams: Record<string, string | number> = {
      timestamp,
    };

    if (folder) {
      signatureParams.folder = folder;
    }
    if (options.publicId) {
      signatureParams.public_id = options.publicId;
    }

    const signature = generateSignature(signatureParams, apiSecret);

    const formData = new FormData();
    const filename = targetUri.split('/').pop() || 'upload.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    formData.append('file', {
      uri: targetUri,
      name: filename,
      type,
    } as any);

    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);

    if (folder) {
      formData.append('folder', folder);
    }
    if (options.publicId) {
      formData.append('public_id', options.publicId);
    }

    return new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);

      if (options.onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const pct = Math.round((event.loaded / event.total) * 100);
            options.onProgress?.(pct);
          }
        });
      }

      xhr.onload = () => {
        try {
          const response = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300 && response.secure_url) {
            resolve(response.secure_url);
          } else {
            reject(new Error(response.error?.message || `Cloudinary upload failed with status ${xhr.status}`));
          }
        } catch {
          reject(new Error('Failed to parse Cloudinary response'));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Cloudinary upload network error'));
      };

      xhr.send(formData);
    });
  },
};
