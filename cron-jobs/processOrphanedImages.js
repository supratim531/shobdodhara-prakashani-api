import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Product from "../models/productModel.js";

const ONE_HOUR_MS = 60 * 60 * 1000; // 1 hour in milliseconds
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const processOrphanedImages = async () => {
  try {
    let totalDeletedFiles = 0;
    const activeImageUrls = new Set();
    const imageDirectories = ["book", "clothes"];

    // Get all active image URLs from products
    const products = await Product.find().select("bannerImage slideImages");

    products.forEach((product) => {
      if (product.bannerImage) {
        const fileName = path.basename(product.bannerImage);
        activeImageUrls.add(fileName);
      }

      product.slideImages?.forEach((imageUrl) => {
        const fileName = path.basename(imageUrl);
        activeImageUrls.add(fileName);
      });
    });

    // Process each image directory
    for (const category of imageDirectories) {
      const directoryPath = path.join(
        __dirname,
        "..",
        "public",
        "images",
        category,
      );

      if (!fs.existsSync(directoryPath)) continue;

      const files = fs.readdirSync(directoryPath);
      const currentTime = Date.now();

      for (const fileName of files) {
        const filePath = path.join(directoryPath, fileName);
        const fileStats = fs.statSync(filePath);
        const fileAge = currentTime - fileStats.mtime.getTime();

        // Only process files older than 1 hour and not referenced by any product
        if (fileAge > ONE_HOUR_MS && !activeImageUrls.has(fileName)) {
          fs.unlinkSync(filePath);
          totalDeletedFiles++;
        }
      }
    }

    if (totalDeletedFiles > 0) {
      console.log(`----- ${totalDeletedFiles} orphaned image(s) deleted -----`);
    }
  } catch (error) {
    console.error("Error processing orphaned images:", error.message);
  }
};

export default processOrphanedImages;
