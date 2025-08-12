// Function for edit/update product
const editProduct = async (req, res) => {
  try {
    const {
      id,
      name,
      description,
      price,
      category,
      subCategory,
      sizes,
    } = req.body;
    // Ambil produk lama
    const oldProduct = await productModel.findById(id);
    if (!oldProduct) return res.json({ success: false, message: "Product not found" });

    // Handle gambar baru jika ada, update slot sesuai input, sisanya tetap
    let imagesURL = Array.isArray(oldProduct.image) ? [...oldProduct.image] : [];
    if (req.files && (req.files.image1 || req.files.image2 || req.files.image3 || req.files.image4)) {
      const { v2: cloudinary } = await import("cloudinary");
      const uploadAndReplace = async (idx, file) => {
        if (!file) return;
        try {
          let result = await cloudinary.uploader.upload(file.path, { resource_type: "image" });
          imagesURL[idx] = result.secure_url;
        } catch (error) {
          console.error("Error uploading image:", file.originalname, error);
          throw new Error(error.message || "Invalid image file");
        }
      };
      await uploadAndReplace(0, req.files.image1 && req.files.image1[0]);
      await uploadAndReplace(1, req.files.image2 && req.files.image2[0]);
      await uploadAndReplace(2, req.files.image3 && req.files.image3[0]);
      await uploadAndReplace(3, req.files.image4 && req.files.image4[0]);
    }

    // Update produk
    const updated = await productModel.findByIdAndUpdate(
      id,
      {
        name,
        description,
        price: Number(price),
        category,
        subCategory,
        sizes: typeof sizes === "string" ? JSON.parse(sizes) : sizes,
        image: imagesURL,
      },
      { new: true }
    );
    
    // Sync to recommendation service after update
    await syncToRecommendationService();
    
    res.json({ success: true, message: "Product updated successfully", product: updated });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};
// Import statements should be at the top
import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";
import orderModel from "../models/orderModel.js";
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ES modules equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Content-based filtering recommendation endpoint
// Example: recommend products with similar category or subCategory
const recommendProducts = async (req, res) => {
  try {
    const { productId } = req.body;
    const baseProduct = await productModel.findById(productId);
    if (!baseProduct) {
      return res.json({ success: false, message: "Product not found" });
    }
    // Find products with same category or subCategory (simple content-based)
    const candidates = await productModel.find({
      $or: [
        { category: baseProduct.category },
        { subCategory: baseProduct.subCategory }
      ],
      _id: { $ne: productId }
    }).limit(10);
    // Simple similarity score: +0.5 jika category sama, +0.5 jika subCategory sama
    const recommended = candidates.map(prod => {
      let score = 0;
      if (prod.category === baseProduct.category) score += 0.5;
      if (prod.subCategory === baseProduct.subCategory) score += 0.5;
      return { ...prod.toObject(), similarityScore: score };
    });
    // Log laporan JSON
    fs.writeFileSync(
      "./backend/recommendation_report.json",
      JSON.stringify({ type: "content-based", baseProduct: productId, recommended, time: new Date() }, null, 2)
    );
    res.json({ success: true, recommended });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Helper function to sync products to recommendation service
const syncToRecommendationService = async () => {
  try {
    // Get all products from MongoDB
    const products = await productModel.find({});
    
    // Transform to recommendation service format
    const transformedProducts = products.map(product => ({
      id: product._id.toString(),
      nama_pakaian: product.name,
      categories: product.category.toLowerCase(),
      type: product.subCategory.toLowerCase()
    }));
    
    // Send to recommendation service
    await axios.post('http://localhost:5001/sync/products', {
      products: transformedProducts
    }, {
      timeout: 5000
    });
    
    console.log(`✅ Synced ${transformedProducts.length} products to recommendation service`);
  } catch (error) {
    console.log(`⚠️ Could not sync to recommendation service: ${error.message}`);
    // Don't throw error, just log it
  }
};
// Function for add product
const addProduct = async (req, res) => {
  /* Creating a middleware using multer, so if we send any file as form data,
   then that file will be parsed by multer. Multer handles file uploads and
   makes them accessible in req.file or req.files depending on the upload method.
    [ℹ️] what is middleware?
        Middleware in the context of web development, especially in frameworks
        like Express.js, refers to functions that are executed in the middle of
        the request-response cycle. These functions have access to the request
        object (req), the response object (res), and the next middleware function
        in the application’s request-response cycle.
    */

  try {
    const {
      name,
      description,
      price,
      category,
      subCategory,
      sizes,
    } = req.body;
    // If the image is available in req.files then get the image
    const image1 = req.files.image1 && req.files.image1[0];
    const image2 = req.files.image2 && req.files.image2[0];
    const image3 = req.files.image3 && req.files.image3[0];
    const image4 = req.files.image4 && req.files.image4[0];

    const images = [image1, image2, image3, image4].filter(
      (item) => item !== undefined,
    );
    // console.log(`Images🖼️ : ${images}`);
    let imagesURL = await Promise.all(
      images.map(async (item) => {
        try {
          // Tidak ada validasi ekstensi, terima semua tipe file gambar
          let result = await cloudinary.uploader.upload(item.path, {
            resource_type: "image",
          });
          return result.secure_url;
        } catch (error) {
          console.error("Error uploading image:", item.originalname, error);
          throw new Error(error.message || "Invalid image file");
        }
      }),
    );

    // console.log(imagesURL);
    const productData = {
      name,
      description,
      price: Number(price),
      category,
      subCategory,
      sizes: JSON.parse(sizes),
      image: imagesURL,
      date: Date.now(),
    };
    // console.log(productData);
    const product = new productModel(productData);
    const validationError = product.validateSync();
    if (validationError) {
      console.error("Validation failed:", validationError);
    } else {
      await product.save();
      console.log("Product saved successfully");
      
      // Sync to recommendation service
      await syncToRecommendationService();
    }
    res.json({ success: true, message: "New product has been added." });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};
// Function to list product
const listProducts = async (req, res) => {
  try {
    // Check if this is a request for random products (latest-random endpoint)
    if (req.path === '/latest-random') {
      // Get random 10 products using MongoDB aggregation
      const products = await productModel.aggregate([
        { $sample: { size: 10 } }
      ]);
      res.json({ success: true, products });
    } else {
      // Fetching all documents from the productModel collection and storing them
      //  in the products variable
      const products = await productModel.find({});
      res.json({ success: true, products });
    }
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};
// Function for removing product
const removeProduct = async (req, res) => {
  try {
    // Await the deletion of a product document from the database by its
    // unique identifier (ID) provided in the request body
    await productModel.findByIdAndDelete(req.body.id);
    
    // Sync to recommendation service after deletion
    await syncToRecommendationService();
    
    res.json({ success: true, message: `Product has been removed` });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};
// Function for single product info
const getSingleProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await productModel.findById(productId);
    res.json({ success: true, product });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export { addProduct, listProducts, removeProduct, getSingleProduct, recommendProducts, editProduct };
