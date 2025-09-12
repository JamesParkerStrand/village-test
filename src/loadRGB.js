export async function loadRGBMap(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";

        img.onload = () => {
            try {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);

                const imageData = ctx.getImageData(0, 0, img.width, img.height).data;
                const rgbMap = [];

                // Loop over height (rows)
                for (let y = 0; y < img.height; y++) {
                    rgbMap[y] = []; // init row
                    // Loop over width (columns)
                    for (let x = 0; x < img.width; x++) {
                        const i = (y * img.width + x) * 4;
                        const r = imageData[i];
                        const g = imageData[i + 1];
                        const b = imageData[i + 2];
                        rgbMap[y][x] = [r, g, b]; // ✅ correct indexing
                    }
                }
                resolve(rgbMap);
            } catch (err) {
                reject(err);
            }
        };

        img.onerror = (err) => reject(new Error("Failed to load image: " + src));
        img.src = src;
    });
}