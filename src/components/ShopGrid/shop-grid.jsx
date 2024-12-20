import React, { useEffect, useState } from "react";
import { PER_PAGE } from "../../constants/per-page";
import { createCart, getCarts, updateCart } from "../../services/cart-service";
import { getProducts, getQueryProducts } from "../../services/product-service";
import Header from "../Header/header";
import Footer from "../Footer/footer";
import { Link, useNavigate } from "react-router-dom";
import { PiShoppingCart } from "react-icons/pi";
import { getCategory } from "../../services/category-service";
import { getUserId } from "../../util/auth-local";
import img from "../../../public/images/banner/image-4.jpg";
import {
  NotificationList,
  notificationTypes,
  showNotification,
} from "../Notification/NotificationService";
import { useCart } from "../../Context/CartContext";
const ShopGrid = () => {
  const navigate = useNavigate();

  const [params, setParams] = useState({
    limit: PER_PAGE,
    page: 1,
    total: 0,
    name: "",
    category_id: "",
  });

  const [category, setCategory] = useState([]);

  const [products, setProducts] = useState([]);

  const {
    carts,
    setCarts,
    totalQuantity,
    setTotalCost,
    setTotalQuantity,
    fetchCarts,
  } = useCart();

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    getProductsOnPage();
    getCategoryOnPage();
  }, []);

  useEffect(() => {
    getQueryProductsOnPage();
  }, [params.name, params.category_id, params.page]);

  const getCategoryOnPage = async () => {
    try {
      const response = await getCategory(1, 20);

      setCategory(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getProductsOnPage = async () => {
    try {
      const response = await getProducts(params.page, params.limit);
      setProducts(response.data.products);

      if (response.data.total !== params.total) {
        setParams((prev) => ({
          ...prev,
          total: response.data.total,
        }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getQueryProductsOnPage = async () => {
    try {
      const response = await getQueryProducts(
        params.page,
        params.limit,
        params.name,
        params.category_id,
      );

      setProducts(response.data.products);

      if (response.data.total !== params.total) {
        setParams((prev) => ({
          ...prev,
          total: response.data.total,
        }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handlePageChange = (page) => {
    setParams((prev) => ({ ...prev, page: page }));
  };

  const handleAddToCart = async (productId) => {
    const product = products.find((prod) => prod.id === productId);
    const cartIndex = carts.findIndex((cart) => cart.product_id === product.id);

    let userId = getUserId();

    try {
      if (cartIndex !== -1) {
        // Nếu sản phẩm đã tồn tại trong giỏ hàng
        await updateCart({
          ...carts[cartIndex],
          quantity: carts[cartIndex].quantity + 1,
        });
      } else {
        // Nếu sản phẩm chưa tồn tại
        await createCart({
          product_id: product.id,
          quantity: 1,
          user_id: userId,
        });
        setTotalQuantity((prev) => prev + 1); // Cập nhật ngay lập tức
      }

      showNotification(
        "Sản phẩm đã được thêm vào giỏ hàng!",
        notificationTypes.SUCCESS,
        setNotifications,
      );

      let userIdd = getUserId();
      if (userIdd) {
        const response = await getCarts();
        const cartData = response.data.data.cart;
        setCarts(cartData);

        const cost = cartData.reduce(
          (total, item) => total + item.quantity * item.product.priceout,
          0,
        );
        setTotalCost(cost);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      showNotification(
        "Thêm sản phẩm vào giỏ hàng thất bại!",
        notificationTypes.ERROR,
        setNotifications,
      );
    }
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
      category_id: e.target.value.trim(),
      page: 1,
    }));
  };

  const renderProducts = () => {
    if (products.length === 0) return;

    return products.map((product) => (
      <div
        key={product.id}
        onClick={() => navigate(`/product-detail/${product.id}`)}
        className="pro ease relative m-4 w-1/5 min-w-[250px] cursor-pointer rounded-2xl border border-[#cce7d0] bg-white p-3 shadow-[20px_20px_30px_rgba(0,0,0,0.02)] transition duration-200 hover:shadow-[20px_20px_30px_rgba(0,0,0,0.06)]"
      >
        <img
          src={product.url_images}
          alt={product.name}
          className="w-full rounded-xl"
        />
        <div className="des pt-3 text-start">
          <span className="text-[13px] text-[#1a1a1a]">
            {product.category.name}
          </span>
          <h5 className="pt-2 text-[15px] font-semibold text-[#006532]">
            {product.name}
          </h5>
          <h5 className="pt-2 text-[13px] text-[#1a1a1a]">
            Bao: {product.weight}kg
          </h5>
          <h4 className="flex pt-2 text-[16px] font-semibold text-[#006532]">
            <p className="mr-1 mt-[2px] text-sm font-normal underline">đ</p>
            {new Intl.NumberFormat("vi-VN").format(product.priceout)}
          </h4>
        </div>
        <a
          href="#"
          className="cart absolute bottom-5 right-2 -mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-[#cce7d0] bg-[#e8f6ea] font-medium leading-10 text-[#006532]"
        >
          <Link to="">
            <PiShoppingCart
              data-id={product.id}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleAddToCart(product.id);
              }}
            />
          </Link>
        </a>
      </div>
    ));
  };

  const renderPagination = () => {
    if (params.total < PER_PAGE) return null;

    const totalPages = Math.ceil(params.total / PER_PAGE);
    return (
      <div id="pagination" className="section-p1">
        {[...Array(totalPages)].map((_, index) => (
          <a
            key={index + 1}
            data-page={index + 1}
            className={`page ${
              params.page === index + 1
                ? "active bg-[#088178] text-white"
                : "bg-gray-200"
            } mx-1 rounded p-2`}
            onClick={() => handlePageChange(index + 1)}
          >
            {index + 1}
          </a>
        ))}
      </div>
    );
  };

  return (
    <div>
      <Header />
      {/* Hiển thị các thông báo */}
      <NotificationList notifications={notifications} />
      <section
        id="page-header"
        className="h-[47vh]"
        style={{
          backgroundImage: `url(${img})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="flex h-full w-full flex-col items-center justify-center bg-[rgba(8,28,14,0.50)] text-center">
          <h2 className="text-2xl font-bold text-white">Cám........</h2>
          <p className="text-white"></p>
          <a href="#" className="to-top">
            <i className="fas fa-chevron-up"></i>
          </a>
        </div>
      </section>

      <section id="newsletter" className="section-p1 section-m1">
        <div className="flex flex-wrap items-center justify-between bg-[#006532] bg-[url(src/assets/images/b14.png)] bg-[20%_30%] bg-no-repeat p-4">
          <div className="relative w-1/3">
            <select
              onChange={handleFilter}
              className="h-[3.125rem] w-full rounded border border-transparent px-5 text-[14px]"
            >
              <option value="">Tất cả</option>
              {category.map((cate) => (
                <option key={cate.id} value={cate.id}>
                  {cate.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form flex w-1/3">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              id="search"
              onInput={handleSearch}
              className="h-[3.125rem] w-full rounded border border-transparent px-5 text-[14px]"
            />
          </div>
        </div>
      </section>

      <section id="product1" className="section-p1 px-[80px] py-[40px]">
        <div
          className="pro-container flex flex-wrap justify-between pt-[20px] tablet:justify-center"
          id="product-render"
        >
          {renderProducts()}
        </div>
      </section>

      <section
        id="pagination"
        className="section-p1 flex justify-center space-x-2"
      >
        <div className="mb-4 mt-2 flex justify-center">
          {renderPagination()}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ShopGrid;
