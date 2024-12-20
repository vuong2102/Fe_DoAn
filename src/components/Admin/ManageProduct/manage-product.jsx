import AdminHeader from "../AdminHeader/admin-header.jsx";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaTrash, FaEdit, FaPlus } from 'react-icons/fa';
import { uploadImage } from '../../../services/image-service.js';
import { fetchProducts, searchProducts, addProduct, editProduct, deleteProduct } from '../../../services/product-service.js';
import { getCategory } from "../../../services/category-service.js";

const ManageProduct = () => {
  const { currentPage: pageParam, productsPerPage: perPageParam } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [form, setForm] = useState({
    id: "",
    name: "",
    priceout: "",
    category_id: "",
    supplier_id: "",
    url_images: "",
    description: "",
    stockQuantity: "",
    weight: "",
    expire_date: ""
  });
  const [filterCategory, setFilterCategory] = useState("");
  const [category, setCategory] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchQuery, setSearchQuery] = useState({
    name: "",
    category: "",
  });
  const [searchMode, setSearchMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [totalProducts, setTotalProducts] = useState();
  const currentPage = parseInt(pageParam) || 1;
  const productsPerPage = parseInt(perPageParam) || 8;

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await getCategory(1, 20);
  
        setCategory(response.data.data);
      } catch (error) {
        console.log(error);
      }
    };
    loadCategories();
  });

  useEffect(() => {
    const loadProducts = async () => {
      try {
        if (!searchMode) {
          const { products: productsData, totalProducts } = await fetchProducts(
            currentPage,
            productsPerPage
          );
          setProducts(productsData || []);
          setFilteredProducts(productsData || []);
          setTotalProducts(totalProducts);
        }
      } catch (error) {
        console.error("Error loading products:", error);
      }
    };
    loadProducts();
  }, [currentPage, productsPerPage, searchMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formattedForm = {
        ...form,
        expire_date: form.expire_date
          ? new Date(form.expire_date).toISOString().split("T")[0]
          : ""
      };

      // Upload hình ảnh nếu có
      if (form.url_images) {
        const uploadResult = await uploadImage(form.url_images); // Gọi service upload
        formattedForm.url_images = uploadResult.imageUrl; // Gán URL từ API trả về
      }

      if (editMode) {
        // Chế độ chỉnh sửa
        await editProduct(editId, formattedForm);
        window.location.reload();
        setProducts(
          products.map((product) =>
            product.id === editId ? { ...formattedForm, id: editId } : product
          )
        );
        setEditMode(false);
        setEditId(null);
      } else {
        // Chế độ thêm sản phẩm mới
        const newProduct = await addProduct(formattedForm);
        setProducts([...products, newProduct]);
      }

      // Reset form và đóng modal
      setForm({
        id: "",
        name: "",
        priceout: "",
        category_id: "",
        supplier_id: "",
        url_images: "",
        description: "",
        stockQuantity: "",
        weight: "",
        expire_date: ""
      });
      setIsModalOpen(false);
      handleFilter(filterCategory);
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const handleFilter = (categoryId) => {
    setFilterCategory(categoryId);
    if (categoryId) {
      setFilteredProducts(products.filter((product) => product.category_id === categoryId));
    } else {
      setFilteredProducts(products);
    }
  };
  const handleImageChange = (e) => {
    setForm({ ...form, url_images: e.target.files[0] });
  };

  useEffect(() => {
    const filters = {
      ...(searchQuery.name && { name: searchQuery.name }),
      ...(searchQuery.category && { category: searchQuery.category }),
    };

    const fetchFilteredProducts = async () => {
      try {
        const { products: searchedProducts, totalProducts } = await searchProducts(
          currentPage,
          productsPerPage,
          filters
        );
        setFilteredProducts(searchedProducts || []);
        setTotalProducts(totalProducts);
      } catch (error) {
        console.error("Error searching products:", error);
      }
    };

    fetchFilteredProducts();
  }, [searchQuery.name, searchQuery.category, currentPage]);

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      window.location.reload();
      setProducts(products.filter((product) => product.id !== id));
      handleFilter(filterCategory);
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleEdit = (id) => {
    const product = products.find((product) => product.id === id);
    setForm({
      id: product.id,
      name: product.name,
      priceout: product.priceout,
      category_id: product.category_id,
      supplier_id: product.supplier_id,
      url_images: product.url_images,
      description: product.description,
      stockQuantity: product.stockQuantity,
      weight: product.weight,
      expire_date: product.expire_date
    });
    setEditMode(true);
    setEditId(id);
    setIsModalOpen(true);
  };

  const handlePageChange = (page) => {
    navigate(`/manage-product/${page}/${productsPerPage}`);
  };

  const totalPages = Math.ceil(totalProducts / productsPerPage);

  return (
    <>
      <AdminHeader />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4 text-[#225a3e]">Quản lý sản phẩm</h1>

        <div className="p-4 bg-white shadow-md rounded-md mb-4">
          <h2 className="text-xl font-bold mb-4">Tìm kiếm sản phẩm</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-medium">Tên sản phẩm</label>
              <input
                type="text"
                value={searchQuery.name}
                onChange={(e) => setSearchQuery({ ...searchQuery, name: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Nhập tên sản phẩm"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">Danh mục</label>
              <select
                value={filterCategory}
                onChange={(e) => handleFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Tất cả danh mục</option>
              {category.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
              </select>
            </div>
          </div>
        </div>
        {/* Product List */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-[#225a3e]">Danh sách sản phẩm</h2>
          <table className="table-auto w-full text-left border-collapse border border-gray-300">
            <thead className="bg-[#225a3e] text-white">
              <tr>
                <th className="border px-4 py-2">STT</th>
                <th className="border px-4 py-2">Tên sản phẩm</th>
                <th className="border px-4 py-2">Giá</th>
                <th className="border px-4 py-2">Danh mục</th>
                <th className="border px-4 py-2">Mô tả</th>
                <th className="border px-4 py-2">Số lượng trong kho</th>
                <th className="border px-4 py-2">Khối lượng</th>
                <th className="border px-4 py-2">Hình ảnh</th>
                <th className="border px-4 py-2">Ngày hết hạn</th>
                <th className="border px-4 py-2">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product, index) => (
                  <tr key={product.id} className="border-t">
                    <td className="border px-4 py-2">{index + 1}</td>
                    <td className="border px-4 py-2">{product.name}</td>
                    <td className="border px-4 py-2">{product.priceout}</td>
                    <td className="border px-4 py-2">
                      {category.find((cat) => cat.id === product.category_id)?.name || "Không rõ"}
                    </td>
                    <td className="border px-4 py-2">{product.description}</td>
                    <td className="border px-4 py-2">{product.stockQuantity}</td>
                    <td className="border px-4 py-2">{product.weight}</td>
                    <td className="border px-4 py-2 text-center">
                      <img
                        src={product.url_images}
                        alt={product.name}
                        className="h-12 mx-auto"
                      />
                    </td>
                    <td className="border px-4 py-2">
                      {new Date(product.expire_date).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-2 flex justify-center space-x-2">
                      <button
                        onClick={() => handleEdit(product.id)}
                        className="text-[#225a3e] hover:text-green-700"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center py-4">
                    Không có sản phẩm nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>


        {/* Floating Add Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-4 right-4 bg-[#225a3e] text-white p-4 rounded-full shadow-lg"
        >
          <FaPlus />
        </button>

        {/* Product Form Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded shadow-lg w-1/3">
              <h2 className="text-xl font-bold mb-4">
                {editMode ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}
              </h2>
              <form onSubmit={handleSubmit}>
                {/* Form Fields */}
                {[
                  { label: 'Tên sản phẩm', field: 'name', type: 'text' },
                  { label: 'Giá', field: 'priceout', type: 'number' },
                  { label: 'Mô tả', field: 'description', type: 'text' },
                  { label: 'Số lượng trong kho', field: 'stockQuantity', type: 'number' },
                  { label: 'Khối lượng', field: 'weight', type: 'number' },
                  { label: 'Ngày hết hạn', field: 'expire_date', type: 'date' },
                ].map(({ label, field, type }, index) => (
                  <div className="mb-4" key={index}>
                    <label className="block text-gray-700">{label}</label>
                    <input
                      type={type}
                      value={form[field] || ''}
                      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded focus:border-[#225a3e]"
                      required={field !== 'supplier'} // Set 'required' if field is not optional
                    />
                  </div>
                ))}

                {/* Input for image upload */}
                <div className="mb-4">
                  <label className="block text-gray-700">Hình ảnh</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}  // Xử lý sự kiện chọn ảnh
                    className="w-full p-2 border border-gray-300 rounded focus:border-[#225a3e]"
                  />
                </div>

                <button type="submit" className="bg-[#225a3e] text-white p-2 rounded">
                  {editMode ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditMode(false);
                    setForm({ name: '', priceout: '', description: '', stockQuantity: '', weight: '', expire_date: '', url_images: '' });
                  }}
                  className="bg-gray-500 text-white p-2 ml-2 rounded"
                >
                  Hủy
                </button>
              </form>
            </div>
          </div>
        )}
        <div className="mt-4 flex justify-center">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              className={`mx-1 rounded px-3 py-1 ${
                index + 1 === currentPage
                  ? "bg-[#006532] text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-blue-200"
              }`}
              disabled={index + 1 === currentPage}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default ManageProduct;
