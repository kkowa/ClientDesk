import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { MAX_IMAGE_SIZE_MB } from "@/src/lib/validation/comment";
import type { CommentImage } from "@/src/types/comment";

const MAX_IMAGE_SIZE = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const COMMENT_IMAGE_FOLDER = "clientdesk/comments";

export class CommentImageUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CommentImageUploadError";
  }
}

function getCloudinaryConfig() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
    process.env;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new CommentImageUploadError(
      "Image uploads aren't configured. Please contact support.",
    );
  }

  return {
    cloudName: CLOUDINARY_CLOUD_NAME,
    apiKey: CLOUDINARY_API_KEY,
    apiSecret: CLOUDINARY_API_SECRET,
  };
}

function signParameters(
  parameters: Record<string, string>,
  apiSecret: string,
): string {
  const payload = Object.entries(parameters)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return createHash("sha1")
    .update(`${payload}${apiSecret}`)
    .digest("hex");
}

async function validateImage(file: File): Promise<void> {
  if (file.size > MAX_IMAGE_SIZE) {
    throw new CommentImageUploadError(`Images must be ${MAX_IMAGE_SIZE_MB} MB or smaller`);
  }

  if (!IMAGE_TYPES.has(file.type)) {
    throw new CommentImageUploadError("Choose a JPEG, PNG, or WebP image");
  }

  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const isPng =
    header.length >= 8 &&
    header[0] === 0x89 &&
    header[1] === 0x50 &&
    header[2] === 0x4e &&
    header[3] === 0x47 &&
    header[4] === 0x0d &&
    header[5] === 0x0a &&
    header[6] === 0x1a &&
    header[7] === 0x0a;
  const isJpeg =
    header.length >= 3 &&
    header[0] === 0xff &&
    header[1] === 0xd8 &&
    header[2] === 0xff;
  const isWebp =
    header.length >= 12 &&
    String.fromCharCode(...header.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...header.slice(8, 12)) === "WEBP";

  if (
    (file.type === "image/jpeg" && !isJpeg) ||
    (file.type === "image/png" && !isPng) ||
    (file.type === "image/webp" && !isWebp)
  ) {
    throw new CommentImageUploadError("The selected file is not a valid image");
  }
}

export async function uploadCommentImage(file: File): Promise<CommentImage> {
  await validateImage(file);

  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const publicId = `${COMMENT_IMAGE_FOLDER}/${randomUUID()}`;
  const parameters = { public_id: publicId, timestamp };
  const signature = signParameters(parameters, apiSecret);
  const body = new FormData();

  body.set("file", file);
  body.set("api_key", apiKey);
  body.set("timestamp", timestamp);
  body.set("public_id", publicId);
  body.set("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body },
  );
  const result: unknown = await response.json();

  if (!response.ok) {
    console.error("Cloudinary image upload failed:", response.status, result);
    throw new CommentImageUploadError(
      "Image upload failed. Please try again.",
    );
  }

  if (typeof result !== "object" || result === null) {
    throw new CommentImageUploadError(
      "Image upload failed. Please try again.",
    );
  }

  const uploaded = result as Record<string, unknown>;
  if (
    typeof uploaded.public_id !== "string" ||
    typeof uploaded.secure_url !== "string" ||
    uploaded.public_id !== publicId
  ) {
    throw new CommentImageUploadError(
      "Image upload failed. Please try again.",
    );
  }

  return {
    publicId: uploaded.public_id,
    secureUrl: uploaded.secure_url,
  };
}

export async function deleteCommentImage(publicId: string): Promise<void> {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const parameters = { public_id: publicId, timestamp };
  const body = new FormData();

  body.set("api_key", apiKey);
  body.set("timestamp", timestamp);
  body.set("public_id", publicId);
  body.set("signature", signParameters(parameters, apiSecret));

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
    { method: "POST", body },
  );
  const result: unknown = await response.json();

  if (
    !response.ok ||
    typeof result !== "object" ||
    result === null ||
    !("result" in result) ||
    result.result !== "ok"
  ) {
    throw new Error("Cloudinary image cleanup failed");
  }
}
