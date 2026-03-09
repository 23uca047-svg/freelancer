import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

const IMAGE_COMPRESS_THRESHOLD_BYTES = 450 * 1024;
const IMAGE_MAX_DIMENSION = 1600;

function sanitizeFileName(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function mapUploadError(error) {
  const code = error?.code || "";

  if (code === "storage/retry-limit-exceeded") {
    return new Error("Upload failed after multiple retries. Check your internet and Firebase Storage bucket settings.");
  }

  if (code === "storage/unauthorized") {
    return new Error("You do not have permission to upload this file.");
  }

  if (code === "storage/unknown") {
    return new Error("Upload failed due to a Storage configuration/network issue. Verify Firebase Storage bucket settings.");
  }

  return error;
}

function withReplacedExtension(fileName, extension) {
  const lastDot = fileName.lastIndexOf(".");
  if (lastDot < 0) {
    return `${fileName}${extension}`;
  }
  return `${fileName.slice(0, lastDot)}${extension}`;
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

async function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Unable to read image file."));
    };

    image.src = objectUrl;
  });
}

async function maybeOptimizeImage(file) {
  if (!file.type.startsWith("image/")) {
    return file;
  }

  const shouldOptimize = file.size > IMAGE_COMPRESS_THRESHOLD_BYTES;
  if (!shouldOptimize) {
    return file;
  }

  const image = await loadImageFromFile(file);
  const longestEdge = Math.max(image.width, image.height);
  const scale = longestEdge > IMAGE_MAX_DIMENSION ? IMAGE_MAX_DIMENSION / longestEdge : 1;

  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");

  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    return file;
  }

  context.drawImage(image, 0, 0, width, height);

  const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
  const outputQuality = outputType === "image/png" ? undefined : 0.82;
  const blob = await canvasToBlob(canvas, outputType, outputQuality);

  if (!blob || blob.size >= file.size * 0.95) {
    return file;
  }

  const updatedName = outputType === "image/jpeg"
    ? withReplacedExtension(file.name, ".jpg")
    : withReplacedExtension(file.name, ".png");

  return new File([blob], updatedName, {
    type: outputType,
    lastModified: Date.now(),
  });
}

export async function uploadFileToStorage({
  storage,
  directory,
  file,
  timeoutMs = 0,
  stallTimeoutMs = 0,
  metadata = {},
  onProgress,
  optimizeImage = true,
}) {
  if (!storage) {
    throw new Error("Storage is not configured.");
  }

  if (!file) {
    throw new Error("No file selected for upload.");
  }

  const finalFile = optimizeImage ? await maybeOptimizeImage(file) : file;
  const safeName = sanitizeFileName(finalFile.name);
  const storagePath = `${directory}/${Date.now()}_${safeName}`;
  const fileRef = ref(storage, storagePath);
  const uploadTask = uploadBytesResumable(fileRef, finalFile, {
    ...metadata,
    contentType: metadata.contentType || finalFile.type || "application/octet-stream",
  });

  if (typeof onProgress === "function") {
    onProgress(1);
  }

  return new Promise((resolve, reject) => {
    let settled = false;

    const safeReject = (error) => {
      if (settled) return;
      settled = true;
      reject(error);
    };

    const safeResolve = (value) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    const overallTimer = timeoutMs > 0
      ? window.setTimeout(() => {
          uploadTask.cancel();
          safeReject(new Error("Upload timed out. Please try again."));
        }, timeoutMs)
      : null;

    let stallTimer = stallTimeoutMs > 0
      ? window.setTimeout(() => {
          uploadTask.cancel();
          safeReject(new Error("Upload stalled due to a slow network. Please retry."));
        }, stallTimeoutMs)
      : null;

    const resetStallTimer = () => {
      if (stallTimeoutMs <= 0) return;
      window.clearTimeout(stallTimer);
      stallTimer = window.setTimeout(() => {
        uploadTask.cancel();
        safeReject(new Error("Upload stalled due to a slow network. Please retry."));
      }, stallTimeoutMs);
    };

    const clearTimers = () => {
      if (overallTimer) window.clearTimeout(overallTimer);
      if (stallTimer) window.clearTimeout(stallTimer);
    };

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        resetStallTimer();
        if (typeof onProgress === "function" && snapshot.totalBytes > 0) {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          onProgress(progress);
        }
      },
      (error) => {
        clearTimers();
        if (error?.code === "storage/canceled") {
          safeReject(new Error("Upload was canceled. Please retry."));
          return;
        }
        safeReject(mapUploadError(error));
      },
      async () => {
        try {
          clearTimers();
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          safeResolve(downloadURL);
        } catch (error) {
          safeReject(error);
        }
      }
    );
  });
}
