// Tiện ích xử lý ảnh phía client cho avatar.
// Resize ảnh về kích thước vuông tối đa và trả về data URL (base64) để lưu DB.

export const AVATAR_SIZE = 256;
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB ảnh gốc

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * Đọc file ảnh, crop về hình vuông (center) và resize về AVATAR_SIZE.
 * Trả về data URL JPEG để lưu trực tiếp vào DB.
 */
export async function fileToAvatarDataUrl(file: File): Promise<string> {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    throw new Error("Chỉ chấp nhận ảnh JPG, PNG, WEBP hoặc GIF");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Ảnh quá lớn (tối đa 5MB)");
  }

  const dataUrl = await readFileAsDataUrl(file);
  const img = await loadImage(dataUrl);

  const canvas = document.createElement("canvas");
  canvas.width = AVATAR_SIZE;
  canvas.height = AVATAR_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Trình duyệt không hỗ trợ xử lý ảnh");
  }

  // Crop hình vuông ở giữa
  const side = Math.min(img.width, img.height);
  const sx = (img.width - side) / 2;
  const sy = (img.height - side) / 2;
  ctx.drawImage(img, sx, sy, side, side, 0, 0, AVATAR_SIZE, AVATAR_SIZE);

  return canvas.toDataURL("image/jpeg", 0.85);
}

// Kích thước tối đa cho ảnh minh hoạ truyện (giữ tỉ lệ, resize theo chiều rộng).
export const STORY_IMAGE_MAX_WIDTH = 1024;
export const STORY_IMAGE_MAX_HEIGHT = 1024;

/**
 * Đọc file ảnh, resize giữ tỉ lệ sao cho không vượt quá kích thước tối đa
 * (không crop) và trả về data URL JPEG để lưu trực tiếp vào DB.
 * Dùng cho ảnh minh hoạ của truyện chêm.
 */
export async function fileToStoryImageDataUrl(file: File): Promise<string> {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    throw new Error("Chỉ chấp nhận ảnh JPG, PNG, WEBP hoặc GIF");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Ảnh quá lớn (tối đa 5MB)");
  }

  const dataUrl = await readFileAsDataUrl(file);
  const img = await loadImage(dataUrl);

  // Tính tỉ lệ thu nhỏ để vừa khung tối đa (không phóng to ảnh nhỏ).
  const scale = Math.min(
    1,
    STORY_IMAGE_MAX_WIDTH / img.width,
    STORY_IMAGE_MAX_HEIGHT / img.height,
  );
  const width = Math.round(img.width * scale);
  const height = Math.round(img.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Trình duyệt không hỗ trợ xử lý ảnh");
  }

  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.82);
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Không đọc được file ảnh"));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("File ảnh không hợp lệ"));
    img.src = src;
  });
}
