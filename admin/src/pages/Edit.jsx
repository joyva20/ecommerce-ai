import { useState, useEffect } from "react";
import { assets } from "../assets/assets";
import { toast } from "react-toastify";
import axios from "axios";
import { backendURL } from "../App";

const Edit = ({ token, productId, onClose, onUpdated }) => {
  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Men");
  const [subCategory, setSubCategory] = useState("Top Wear");
  const [bestseller, setBestSeller] = useState(false);
  const [sizes, setSizes] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.post(
          `${backendURL}/api/product/single`,
          { productId }
        );
        if (response.data.success) {
          const p = response.data.product;
          setName(p.name);
          setDescription(p.description);
          setPrice(p.price);
          setCategory(p.category);
          setSubCategory(p.subCategory);
          setBestSeller(p.bestseller || p.bestSeller || false);
          setSizes(p.sizes || []);
          setImage1(p.image[0] || false);
          setImage2(p.image[1] || false);
          setImage3(p.image[2] || false);
          setImage4(p.image[3] || false);
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        toast.error(error.message);
      }
    };
    fetchProduct();
  }, [productId]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("bestseller", bestseller);
      formData.append("sizes", JSON.stringify(sizes));
      if (image1 && typeof image1 !== "string") formData.append("image1", image1);
      if (image2 && typeof image2 !== "string") formData.append("image2", image2);
      if (image3 && typeof image3 !== "string") formData.append("image3", image3);
      if (image4 && typeof image4 !== "string") formData.append("image4", image4);
      formData.append("id", productId);
      const response = await axios.post(
        backendURL + "/api/product/edit",
        formData,
        { headers: { token } },
      );
      if (response.data.success) {
        toast.success(response.data.message || "Edit produk berhasil!");
        onUpdated && onUpdated();
        onClose && onClose();
      } else {
        toast.error(response.data.message || "Gagal edit produk");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const currency = "Rp ";
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl relative flex flex-col md:flex-row gap-8 items-stretch">
        <button type="button" onClick={onClose} className="absolute top-2 right-2 text-2xl px-2 py-1 bg-gray-200 rounded-full hover:bg-gray-300">×</button>
        {/* Left: Image upload */}
        <div className="flex flex-col gap-2 items-center md:w-1/3 w-full">
          <p className="mb-2 font-semibold">Upload Image</p>
          <div className="flex flex-row md:flex-col gap-2 w-full items-center">
            {[1,2,3,4].map((num) => (
              <label key={num} htmlFor={`image${num}`} className="cursor-pointer">
                <img
                  className="w-20 h-20 object-cover border border-gray-200 rounded"
                  src={(() => {
                    const img = [image1, image2, image3, image4][num-1];
                    return !img
                      ? assets.upload_area
                      : typeof img === "string"
                        ? img
                        : URL.createObjectURL(img);
                  })()}
                  alt="Upload"
                />
                <input
                  onChange={(e) => [setImage1, setImage2, setImage3, setImage4][num-1](e.target.files[0])}
                  type="file"
                  name={`image${num}`}
                  id={`image${num}`}
                  hidden
                />
              </label>
            ))}
          </div>
        </div>
        {/* Right: Form fields */}
        <form
          onSubmit={onSubmitHandler}
          className="flex-1 flex flex-col gap-3 justify-between"
        >
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <p className="mb-2">Product Name</p>
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                className="w-full px-3 py-2 border rounded"
                type="text"
                placeholder="Product Name"
                required
              />
            </div>
            <div className="flex-1">
              <p className="mb-2">Product Description</p>
              <textarea
                onChange={(e) => setDescription(e.target.value)}
                value={description}
                className="w-full px-3 py-2 border rounded min-h-[40px]"
                type="text"
                placeholder="Write Content here"
                required
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:gap-8">
            <div>
              <p className="mb-2">Product Category</p>
              <select
                onChange={(e) => setCategory(e.target.value)}
                value={category}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Kids">Kids</option>
              </select>
            </div>
            <div>
              <p className="mb-2">Sub category</p>
              <select
                onChange={(e) => setSubCategory(e.target.value)}
                value={subCategory}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="Top Wear">Top Wear</option>
                <option value="Bottom Wear">Bottom Wear</option>
                <option value="Top & Bottom Wear">Top & Bottom Wear</option>
              </select>
            </div>
            <div>
              <p className="mb-2">Product Price</p>
              <div className="flex items-center gap-2">
                <span>{currency}</span>
                <input
                  onChange={(e) => setPrice(e.target.value)}
                  value={price < 0 ? 0 : price}
                  min={0}
                  max={999_999}
                  className="w-full px-3 py-2 border rounded"
                  type="number"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
          </div>
          <div>
            <p className="mb-2">Product Sizes</p>
            <div className="flex gap-3">
              <div onClick={() => setSizes((prev) => prev.includes("No Size") ? prev.filter((item) => item !== "No Size") : ["No Size"])}>
                <p className={`${sizes.includes("No Size") ? "bg-pink-100 shadow-[inset_0px_0px_3px_.25px_#c4b5bd]" : "bg-slate-200"} px-3 py-1 cursor-pointer rounded`}> No Size </p>
              </div>
              {["S","M","L","XL","XXL"].map((sz) => (
                <div key={sz} onClick={() => setSizes((prev) => {
                  const filteredPrev = prev.filter(item => item !== "No Size");
                  return filteredPrev.includes(sz) ? filteredPrev.filter((item) => item !== sz) : [...filteredPrev, sz];
                })}>
                  <p className={`${sizes.includes(sz) ? "bg-pink-100 shadow-[inset_0px_0px_3px_.25px_#c4b5bd]" : "bg-slate-200"} px-3 py-1 cursor-pointer rounded`}> {sz} </p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <input
              onChange={() => setBestSeller((prev) => !prev)}
              checked={bestseller}
              type="checkbox"
              name="bestseller"
              id="bestseller"
            />
            <label className="cursor-pointer" htmlFor="bestseller">
              Add to bestseller
            </label>
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800">SAVE</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Edit;
