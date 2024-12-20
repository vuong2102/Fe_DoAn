import React, { useEffect, useState } from "react";
import AdminHeader from "../AdminHeader/admin-header.jsx";
import { FaPlus, FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import {
  createCategory,
  deleteCategories,
  deleteCategory,
  getQueryCategory,
  updateCategory,
} from "../../../services/category-service.js";

import { PER_PAGE } from "../../../constants/per-page.js";

const Modal = ({ children, showModal, setShowModal }) =>
  showModal ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="shadow-lg rounded-lg bg-white p-6">
        {children}
        <button
          onClick={() => setShowModal(false)}
          className="ml-4 mt-4 rounded bg-red-500 px-4 py-2 text-white"
        >
          Close
        </button>
      </div>
    </div>
  ) : null;

const ManageCategory = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({
    name: "",
    image: "",
    banner: "",
    description: "",
    status: "Áp dụng",
  });
  const [editingCategory, setEditingCategory] = useState(null);
  const [expandedDescription, setExpandedDescription] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);

  const [params, setParams] = useState({
    limit: PER_PAGE,
    page: 1,
    total: 0,
    name: "",
    status: "",
  });

  // Hàm gọi API để lấy danh mục
  const getQueryCategoryOnPage = async () => {
    try {
      const response = await getQueryCategory(
        params.page,
        params.limit,
        params.name,
        params.status,
      );

      if (response.success) {
        setCategories(response.data.data); // Cập nhật dữ liệu danh mục
        if (response.data.total !== params.total) {
          setParams((prev) => ({
            ...prev,
            total: response.data.total,
          }));
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getQueryCategoryOnPage();
  }, [params.page, params.limit, showModal, params.name, params.status]);

  const handlePageChange = (page) => {
    setParams((prev) => ({ ...prev, page: page }));
  };

  const handleSearch = (e) => {
    setParams((prev) => ({
      ...prev,
      name: e.target.value.trim(),
      page: 1,
    }));
  };

  const handleFilter = (e) => {
    setParams((prev) => ({
      ...prev,
      status: e.target.value.trim(),
      page: 1,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCategory({ ...newCategory, [name]: value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files.length > 0) {
      setNewCategory({ ...newCategory, [name]: URL.createObjectURL(files[0]) });
    }
  };

  const addCategory = async (categoryData) => {
    categoryData.status = "Áp dụng";
    const response = await createCategory(categoryData);
    if (response.success) {
      setCategories([...categories, response.data]);
      setShowModal(false);
    }
  };

  const handleAddCategory = () => {
    addCategory(newCategory);
    setNewCategory({
      name: "",
      image: "",
      banner: "",
      description: "",
      status: "Áp dụng",
    });
  };

  const deleteOneCategory = async (id) => {
    const response = await deleteCategory(id);
    if (response.success) {
      setCategories(categories.filter((category) => category.id !== id));
    }
  };

  const handleDeleteCategory = (id) => {
    deleteOneCategory(id);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setNewCategory(category);
    setShowModal(true);
  };

  const updateOneCategory = async (categoryData) => {
    const response = await updateCategory(categoryData);
    if (response.success) {
      // Cập nhật danh sách categories
      setCategories((prevCategories) =>
        prevCategories.map((category) =>
          category.id === editingCategory.id ? response.data : category,
        ),
      );
      setEditingCategory(null);
      setShowModal(false); // Đóng modal sau khi cập nhật thành công
    } else {
      console.error("Failed to update category:", response.message);
    }
  };

  const handleUpdateCategory = () => {
    updateOneCategory(newCategory);
    setNewCategory({
      name: "",
      image: "",
      banner: "",
      description: "",
      status: "Áp dụng",
    });
  };

  const toggleDescription = (id) => {
    setExpandedDescription((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };
  const handleSelectCategory = (id) => {
    if (selectedCategories.includes(id)) {
      setSelectedCategories(
        selectedCategories.filter((cateId) => cateId !== id),
      );
    } else {
      setSelectedCategories([...selectedCategories, id]);
    }
  };

  const deleteSelectedCategories = async () => {
    try {
      await Promise.all(selectedCategories.map((id) => deleteCategories(id)));
      setCategories(
        categories.filter(
          (category) => !selectedCategories.includes(category.id),
        ),
      );
      setSelectedCategories([]);
    } catch (error) {
      console.error("Error deleting selected categories:", error);
    }
  };

  const handleDeleteSelectedCategories = () => {
    deleteSelectedCategories();
  };

  // Hàm lọc danh sách categories
  const filteredCategories = categories.filter((category) => {
    if (!category.name) return false;

    const matchesSearch = category.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus
      ? category.status === filterStatus
      : true;

    return matchesSearch && matchesStatus;
  });

  const renderPagination = () => {
    if (params.total < PER_PAGE) return null;
    const totalPages = Math.ceil(params.total / PER_PAGE);
    return (
      <div>
        {[...Array(totalPages)].map((_, index) => (
          <a
            key={index + 1}
            data-page={index + 1}
            className={`mx-1 rounded px-3 py-1 ${
              index + 1 === params.page
                ? "bg-[#006532] text-white"
                : "bg-gray-200 text-gray-800 hover:bg-blue-200"
            }`}
            onClick={() => handlePageChange(index + 1)}
          >
            {index + 1}
          </a>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminHeader />
      <div className="p-4 lg:mx-12">
        <h1 className="mb-8 mt-4 text-center text-4xl font-bold text-[#006532]">
          Manage Categories
        </h1>

        <Modal showModal={showModal} setShowModal={setShowModal}>
          <h2 className="mb-4 text-2xl font-semibold text-[#006532]">
            {editingCategory ? "Update Category" : "Add New Category"}
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <input
              type="text"
              name="name"
              value={newCategory.name}
              onChange={handleInputChange}
              placeholder="Category Name"
              className="rounded border p-2"
            />
            <input
              type="file"
              name="image"
              onChange={handleFileChange}
              className="rounded border p-2"
            />
            <input
              type="text"
              name="banner"
              value={newCategory.banner}
              onChange={handleInputChange}
              placeholder="Category Banner"
              className="rounded border p-2"
            />
            <input
              type="text"
              name="description"
              value={newCategory.description}
              onChange={handleInputChange}
              placeholder="Category Description"
              className="rounded border p-2"
            />
            <select
              name="status"
              value={newCategory.status}
              onChange={handleInputChange}
              className="rounded border p-2"
            >
              <option value={"Áp dụng"}>Áp dụng</option>
              <option value={"Không áp dụng"}>Không áp dụng</option>
            </select>
          </div>
          <button
            onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
            className="shadow mt-4 rounded bg-[#006532] px-4 py-2 text-white hover:bg-[#005a2f]"
          >
            {editingCategory ? "Update Category" : "Add Category"}
          </button>
        </Modal>

        {/* Thanh tìm kiếm và lọc */}
        <div className="mb-3 mt-4 flex flex-col items-center rounded-lg bg-white px-6 py-3 md:flex-row">
          <div className="flex w-1/5 items-center space-x-2">
            <div className="mt-1 pr-4 tablet:absolute tablet:left-10 tablet:mt-[148px]">
              <input
                type="checkbox"
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedCategories(
                      categories.map((category) => category.id),
                    );
                  } else {
                    setSelectedCategories([]);
                  }
                }}
              />
            </div>
            <div className="tablet:absolute tablet:left-16 tablet:mt-36">
              {selectedCategories.length > 0 && (
                <FaTrash
                  onClick={handleDeleteSelectedCategories}
                  className="text-gray-400 hover:text-red-500"
                />
              )}
            </div>
          </div>
          <div className="mb-2 flex w-full items-center space-x-2 md:mb-0 md:w-2/5">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search by name"
                onInput={handleSearch}
                className="w-full rounded-lg border border-[#00653287] px-4 py-2"
              />
              <FaSearch className="absolute right-4 top-3 text-gray-400" />
            </div>
          </div>
          <div className="flex w-2/5 items-center justify-end space-x-2 tablet:w-full">
            <select
              onChange={handleFilter}
              className="rounded border border-[#00653287] p-2"
            >
              <option value="">Tất cả</option>
              <option value="Áp dụng">Áp dụng</option>
              <option value="Không áp dụng">Không áp dụng</option>
            </select>
          </div>
        </div>

        <div>
          <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className="shadow-md rounded-lg border border-t-4 border-[#e0e0e0] border-t-[#006532] bg-white p-6 transition-shadow duration-300 ease-in-out hover:shadow-custom-dark"
              >
                <h3 className="mb-2 text-xl font-semibold text-[#006532]">
                  {category.name}
                </h3>
                <p className="mb-2 text-gray-600">
                  <strong>Avatar:</strong>{" "}
                  <img
                    src={category.image}
                    alt={category.name}
                    className="h-16 w-16 rounded"
                  />
                </p>
                <p className="mb-2 text-gray-600">
                  <strong>Banner:</strong> {category.banner}
                </p>
                <p className="mb-2 text-gray-600">
                  <strong>Description:</strong>
                  <span className="block">
                    {expandedDescription[category.id]
                      ? category.description
                      : `${category.description.substring(0, 100)}...`}
                  </span>
                  <button
                    onClick={() => toggleDescription(category.id)}
                    className="text-[#006532] transition-colors duration-300 hover:text-[#005a2f]"
                  >
                    {expandedDescription[category.id]
                      ? "Show Less"
                      : "Show More"}
                  </button>
                </p>

                <p className="mb-2 text-gray-600">
                  <strong>Status:</strong>{" "}
                  {category.status === "Áp dụng" ? "Áp dụng" : "Không áp dụng"}
                </p>
                <div className="mt-4 flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => handleSelectCategory(category.id)}
                    className="mt-[2px] size-[14px]"
                  />
                  <button
                    onClick={() => handleEditCategory(category)}
                    className="rounded py-1 pl-1 text-[#006532] hover:text-[#56bb89]"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="rounded py-1 pl-1 text-red-700 hover:text-red-500"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nút phân trang */}
        <div className="mt-4 flex justify-center">{renderPagination()}</div>

        <button
          onClick={() => {
            setNewCategory({
              name: "",
              image: "",
              banner: "",
              description: "",
              status: "Áp dụng",
            });
            setEditingCategory(null);
            setShowModal(true);
          }}
          className="shadow-lg fixed bottom-10 right-10 rounded-full bg-[#006532] p-4 text-white transition-colors duration-300 hover:bg-[#4d9d75]"
        >
          <FaPlus size={24} />
        </button>
      </div>
    </div>
  );
};

export default ManageCategory;
