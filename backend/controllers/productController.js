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
      bestseller,
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
        bestseller: bestseller === "true" || bestseller === true,
        sizes: typeof sizes === "string" ? JSON.parse(sizes) : sizes,
        image: imagesURL,
      },
      { new: true }
    );
    res.json({ success: true, message: "Product updated successfully", product: updated });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};
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
    const recommended = await productModel.find({
      $or: [
        { category: baseProduct.category },
        { subCategory: baseProduct.subCategory }
      ],
      _id: { $ne: productId }
    }).limit(10);
    res.json({ success: true, recommended });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};
import orderModel from "../models/orderModel.js";
// Rekomendasi berdasarkan riwayat checkout user
const recommendOnCheckout = async (req, res) => {
  try {
    const { userId } = req.body;
    // Cari semua order user
    const orders = await orderModel.find({ userID: userId });
    if (!orders.length) {
      return res.json({ success: false, message: "No orders found for user" });
    }
    // Ambil semua productId dari items yang pernah dibeli
    const boughtProductIds = orders.flatMap(order => order.items.map(item => item._id));
    // Ambil kategori/subKategori dari produk yang pernah dibeli
    const boughtProducts = await productModel.find({ _id: { $in: boughtProductIds } });
    const categories = [...new Set(boughtProducts.map(p => p.category))];
    const subCategories = [...new Set(boughtProducts.map(p => p.subCategory))];
    // Rekomendasikan produk dengan kategori/subKategori yang sama, tapi belum dibeli
    const recommended = await productModel.find({
      $or: [
        { category: { $in: categories } },
        { subCategory: { $in: subCategories } }
      ],
      _id: { $nin: boughtProductIds }
    }).limit(10);
    res.json({ success: true, recommended });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};
import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";
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
      bestseller,
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
      bestseller: bestseller === "true" ? true : false,
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
    // Fetching all documents from the productModel collection and storing them
    //  in the products variable
    const products = await productModel.find({});
    res.json({ success: true, products });
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

export { addProduct, listProducts, removeProduct, getSingleProduct, recommendProducts, recommendOnCheckout, editProduct };
