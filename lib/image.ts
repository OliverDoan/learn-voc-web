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

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Crop hình vuông ở giữa
  const side = Math.min(img.width, img.height);
  const sx = (img.width - side) / 2;
  const sy = (img.height - side) / 2;
  ctx.drawImage(img, sx, sy, side, side, 0, 0, AVATAR_SIZE, AVATAR_SIZE);

  return canvas.toDataURL("image/jpeg", 0.85);
}

// Chiều rộng tối đa của ảnh minh hoạ truyện sau khi crop.
// 1920px đủ nét khi xem full-screen trên màn Retina (mật độ điểm ảnh 2x);
// ảnh nhỏ hơn giữ nguyên (không phóng to). Không hạ xuống 1024 kẻo bị mờ.
export const STORY_IMAGE_MAX_WIDTH = 1920;

const ACCEPTED_TYPES_LABEL = "JPG, PNG, WEBP hoặc GIF";

/**
 * Vùng crop tính theo pixel trên ảnh gốc.
 */
export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Đọc & kiểm tra file ảnh, trả về data URL gốc để đưa vào công cụ crop.
 * Không resize ở bước này — giữ độ phân giải gốc để crop cho nét.
 */
export async function readImageFileForCrop(file: File): Promise<string> {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    throw new Error(`Chỉ chấp nhận ảnh ${ACCEPTED_TYPES_LABEL}`);
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Ảnh quá lớn (tối đa 5MB)");
  }
  return readFileAsDataUrl(file);
}

/**
 * Crop ảnh theo vùng `crop` (pixel trên ảnh gốc), sau đó resize sao cho
 * chiều rộng không vượt quá `maxWidth`. Trả về data URL JPEG để lưu DB.
 * Dùng cho ảnh minh hoạ truyện chêm sau khi người dùng chọn khung crop.
 */
export async function cropImageToDataUrl(
  src: string,
  crop: CropRect,
  maxWidth: number = STORY_IMAGE_MAX_WIDTH,
): Promise<string> {
  const img = await loadImage(src);

  // Giới hạn vùng crop nằm trọn trong ảnh (tránh lỗi làm tròn ra ngoài biên).
  const sx = Math.max(0, Math.min(crop.x, img.width));
  const sy = Math.max(0, Math.min(crop.y, img.height));
  const sw = Math.max(1, Math.min(crop.width, img.width - sx));
  const sh = Math.max(1, Math.min(crop.height, img.height - sy));

  const scale = Math.min(1, maxWidth / sw);
  const outW = Math.max(1, Math.round(sw * scale));
  const outH = Math.max(1, Math.round(sh * scale));

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Trình duyệt không hỗ trợ xử lý ảnh");
  }

  // Khử răng cưa chất lượng cao để ảnh sau resize sắc nét, không bị nhoè.
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);
  // Chất lượng JPEG 0.92: nét hơn 0.85 mà dung lượng vẫn hợp lý.
  return canvas.toDataURL("image/jpeg", 0.92);
}

/**
 * Đọc file ảnh và trả về data URL GIỮ NGUYÊN toàn bộ ảnh (không cắt),
 * chỉ resize về bề rộng tối đa cho nhẹ DB. Dùng cho cập nhật ảnh truyện hàng loạt.
 */
export async function fileToStoryImageDataUrl(file: File): Promise<string> {
  const src = await readImageFileForCrop(file);
  const img = await loadImage(src);
  return cropImageToDataUrl(src, { x: 0, y: 0, width: img.width, height: img.height });
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
