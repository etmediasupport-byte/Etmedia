/**
 * Utility to optimize and compress image files client-side before uploading.
 * Resizes large images (e.g. from camera/phone) down to optimal dimensions
 * and compresses them so base64 payloads and database records are tiny (<80KB).
 */
export function compressImageFile(
  file: File,
  maxDimension = 1200,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve) => {
    // If not an image, fallback to raw read
    if (!file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const rawData = e.target?.result as string;
      if (!rawData) {
        resolve("");
        return;
      }

      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Resize proportionally if exceeds max dimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          // Fill white background for transparent PNG converted to JPEG
          if (file.type === "image/png" && quality < 1) {
            ctx.drawImage(img, 0, 0, width, height);
            // If PNG, keep PNG if small or toDataURL
            try {
              const pngData = canvas.toDataURL("image/png");
              // If png is under 150KB, keep transparent PNG
              if (pngData.length < 200000) {
                resolve(pngData);
                return;
              }
            } catch (e) {}
          }
          
          try {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL("image/jpeg", quality);
            resolve(compressed);
          } catch (e) {
            resolve(rawData);
          }
        } else {
          resolve(rawData);
        }
      };

      img.onerror = () => resolve(rawData);
      img.src = rawData;
    };

    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}
