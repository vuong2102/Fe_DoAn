import React, { useEffect, useState } from "react";
import Header from "../Header/header.jsx";
import Footer from "../Footer/footer.jsx";
import { PiShoppingCart } from "react-icons/pi";
import { PiMinusBold, PiPlusBold } from "react-icons/pi";
import { useNavigate } from "react-router-dom";
import {
  NotificationList,
  notificationTypes,
  showNotification,
} from "../Notification/NotificationService.jsx";
import { useCart } from "../../Context/CartContext.jsx";
import { getUserId } from "../../util/auth-local.js";
import { getCarts, updateCart } from "../../services/cart-service.js";

const Cart = () => {
  const navigate = useNavigate();

  const {
    carts,
    setCarts,
    setTotalQuantity,

    deleteCartItem,
    updateSelectedCartItems,
    isLoading,
  } = useCart();

  const [selectedItems, setSelectedItems] = useState([]);

  const [totalCost, setTotalCost] = useState(0);

  const [notifications, setNotifications] = useState([]);

  const [selectAll, setSelectAll] = useState(false);

  const handleIncrease = async (cartId, currentQuantity) => {
    const cartIndex = carts.findIndex((cart) => cart.id === cartId);
    if (cartIndex !== -1) {
      try {
        await updateCart({
          ...carts[cartIndex],
          quantity: currentQuantity + 1,
        });
      } catch (error) {
        console.error("Error updating cart quantity:", error);
      }
    }

    const response = await getCarts();
    const cartData = response.data.data.cart;
    setCarts(cartData);

    const cost = cartData.reduce(
      (total, item) => total + item.quantity * item.product.priceout,
      0,
    );
    setTotalCost(cost);
    showNotification(
      "Tăng số lượng thành công!",
      notificationTypes.INFO,
      setNotifications,
    );
  };

  const handleDecrease = async (cartId, currentQuantity) => {
    if (currentQuantity > 1) {
      const newQuantity = currentQuantity > 1 ? currentQuantity - 1 : 1;

      const cartIndex = carts.findIndex((cart) => cart.id === cartId);
      if (cartIndex !== -1) {
        try {
          await updateCart({
            ...carts[cartIndex],
            quantity: newQuantity,
          });
        } catch (error) {
          console.error("Error updating cart quantity:", error);
        }
      }

      const response = await getCarts();
      const cartData = response.data.data.cart;
      setCarts(cartData);

      const cost = cartData.reduce(
        (total, item) => total + item.quantity * item.product.priceout,
        0,
      );
      setTotalCost(cost);
      showNotification(
        "Giảm số lượng thành công!",
        notificationTypes.INFO,
        setNotifications,
      );
    }
  };

  const handleDeleteCart = async (cartId) => {
    await deleteCartItem(cartId);
    setTotalQuantity((prev) => prev - 1);
    const response = await getCarts();
    const cartData = response.data.data.cart;
    setCarts(cartData);

    const cost = cartData.reduce(
      (total, item) => total + item.quantity * item.product.priceout,
      0,
    );
    setTotalCost(cost);
    showNotification(
      "Sản phẩm đã được xóa khỏi giỏ hàng!",
      notificationTypes.WARNING,
      setNotifications,
    );
  };

  const handleNavigate = () => {
    if (selectedItems.length === 0) {
      showNotification(
        "Vui lòng chọn ít nhất một sản phẩm để thanh toán!",
        notificationTypes.WARNING,
        setNotifications,
      );
    } else {
      const selectedCarts = carts.filter((cart) =>
        selectedItems.includes(cart.id),
      );
      updateSelectedCartItems(selectedCarts); // Cập nhật Context

      navigate("/checkout"); // Điều hướng sang trang Checkout
    }
  };

  const handleSelectCartItem = (cartId) => {
    setSelectedItems((prev) =>
      prev.includes(cartId)
        ? prev.filter((id) => id !== cartId)
        : [...prev, cartId],
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      // Bỏ chọn tất cả
      setSelectedItems([]);
    } else {
      // Chọn tất cả
      const allIds = carts.map((cart) => cart.id);
      setSelectedItems(allIds);
    }
    setSelectAll(!selectAll);
  };

  useEffect(() => {
    // const getDataCarts = async () => {
    //   let userIdd = getUserId();
    //   if (userIdd) {
    //     const response = await getCarts();
    //     const cartData = response.data.data.cart;
    //     setCarts(cartData);
    //   }
    // };
    // Tính tổng tiền của các sản phẩm được chọn
    const cost = carts
      .filter((cart) => selectedItems.includes(cart.id)) // Lọc sản phẩm được chọn
      .reduce(
        (total, item) => total + item.quantity * item.product.priceout,
        0,
      );
    setTotalCost(cost);
    // getDataCarts();
  }, [selectedItems, carts]);

  if (isLoading) {
    return <div>Loading...</div>; // Khi đang tải, chỉ hiển thị loading
  }

  useEffect(() => {
    // Đồng bộ trạng thái "Chọn tất cả" với danh sách selectedItems
    setSelectAll(selectedItems.length === carts.length && carts.length > 0);
  }, [selectedItems, carts]);

  return (
    <>
      {isLoading ? (
        "Loading..."
      ) : (
        <div>
          <Header />
          {/* Hiển thị các thông báo */}
          <NotificationList notifications={notifications} />
          <section
            id="page-header"
            className="h-52"
            style={{
              backgroundImage: `url("images/banner/chk1.jpg")`,
              backgroundPosition: "center",
              backgroundSize: "cover",
            }}
          >
            <div className="flex h-full w-full flex-col items-center justify-center bg-[rgba(8,28,14,0.79)] text-center">
              <h2 className="text-2xl font-bold text-white">
                GIỎ HÀNG CỦA BẠN
              </h2>
              <p className="text-white"></p>
              <a href="#" className="to-top">
                <i className="fas fa-chevron-up"></i>
              </a>
            </div>
          </section>

          {carts.length > 0 ? (
            <div className="small-container shadow-lg bg-white p-4 md:p-12 lg:px-32 xl:px-52">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="w-1/4 rounded-tl-md bg-[#006532] p-2 pl-6 text-left font-normal text-white md:w-1/3">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th className="w-1/4 bg-[#006532] p-2 text-left font-normal text-white">
                      Sản phẩm
                    </th>

                    <th className="w-1/4 bg-[#006532] py-2 pl-8 text-left font-normal text-white">
                      Số lượng
                    </th>
                    <th className="w-1/4 rounded-tr-md bg-[#006532] py-2 pr-6 text-end font-normal text-white">
                      Số tiền
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Sample Product Row */}
                  {carts.map((cart) => (
                    <tr key={cart.id} className="border-t-2 border-[#00653294]">
                      <td className="mx-2 w-2/5 p-2 md:w-2/3">
                        <div className="cart-info flex flex-wrap items-center">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(cart.id)}
                            onChange={() => handleSelectCartItem(cart.id)}
                          />
                          <img
                            src={cart.product.url_images}
                            alt="Image"
                            className="mr-3 h-[80px] md:h-[120px]"
                          />

                          <div>
                            <p className="mb-[10px] font-semibold text-[#006532]">
                              {cart.product.name}
                            </p>
                            <small className="block">
                              Bao: {cart.product.weight}kg
                            </small>
                            <small className="block">
                              Đơn giá: {cart.product.priceout}đ
                            </small>
                            <button
                              onClick={() => handleDeleteCart(cart.id)}
                              className="text-xs text-[#006532] no-underline hover:text-red-500"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      </td>

                      <td className="w-1/6">
                        {/* <QuantityInput /> */}
                        <div className="product__details__quantity">
                          <div className="flex h-[48px] w-[140px] items-center rounded border-2 border-[#00653265] bg-white">
                            <button
                              className="ml-[18px] mr-1 text-base font-normal text-gray-600 hover:bg-gray-300 focus:outline-none"
                              onClick={() =>
                                handleDecrease(cart.id, cart.quantity)
                              }
                            >
                              <PiMinusBold />
                            </button>
                            <input
                              type="text"
                              value={cart.quantity}
                              readOnly
                              className="mr-1 w-16 border-0 text-center text-base font-normal text-gray-600 focus:outline-none"
                            />
                            <button
                              className="text-base font-normal text-gray-600 hover:bg-gray-300 focus:outline-none"
                              onClick={() =>
                                handleIncrease(cart.id, cart.quantity)
                              }
                            >
                              <PiPlusBold />
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="w-1/6 p-2 pr-5 text-right font-semibold text-[#006532]">
                        {cart.product.priceout * cart.quantity}đ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="total-price mt-4 flex justify-end">
                <table className="w-full max-w-xs border-t-4 border-[#006532]">
                  <tbody>
                    <tr>
                      <td className="px-2 pt-5 font-bold text-[#006532]">
                        Tổng thanh toán
                      </td>
                      <td className="px-2 pt-5 text-right font-bold text-[#006532]">
                        {totalCost}đ
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleNavigate}
                  className="w-[320px] rounded border-2 border-[#006532] bg-[#006532] px-4 py-2 text-white hover:bg-[#80c9a4] hover:text-[#006532]"
                >
                  Thanh toán
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-[#006532]">
              <PiShoppingCart className="mx-auto mb-4 text-6xl" />
              <p className="text-lg font-bold">Giỏ hàng của bạn đang trống</p>
              <button
                className="mt-4 rounded bg-[#006532] px-4 py-2 text-white hover:bg-[#004822]"
                onClick={() => navigate("/products")}
              >
                Mua ngay
              </button>
            </div>
          )}

          <section
            id="product1"
            className="mt-10 bg-[#f9f9f9] py-10 pt-10 text-center"
          >
            <div className="text-[46px] font-semibold leading-[54px] text-[#006532]">
              Newest Products
            </div>
            <div className="container mx-auto flex flex-wrap justify-evenly pt-5">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="pro ease relative m-4 w-1/5 min-w-[250px] cursor-pointer rounded-2xl border border-[#cce7d0] bg-white p-3 shadow-[20px_20px_30px_rgba(0,0,0,0.02)] transition duration-200 hover:shadow-[20px_20px_30px_rgba(0,0,0,0.06)]"
                >
                  <img
                    src="/images/products/262.png"
                    alt={`Product ${index + 1}`}
                    className="w-full rounded-xl"
                  />
                  <div className="des pt-3 text-start">
                    <span className="text-[13px] text-[#1a1a1a]">Adidas</span>
                    <h5 className="pt-2 text-[15px] font-semibold text-[#006532]">
                      Cotton shirts pure cotton
                    </h5>
                    <h5 className="pt-2 text-[13px] text-[#1a1a1a]">
                      Bao: 20kg
                    </h5>
                    <h4 className="flex pt-2 text-[16px] font-semibold text-[#006532]">
                      <p className="mr-1 mt-[2px] text-sm font-normal underline">
                        đ
                      </p>
                      78000
                    </h4>
                  </div>
                  <a
                    href="#"
                    className="cart absolute bottom-5 right-2 -mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-[#cce7d0] bg-[#e8f6ea] font-medium leading-10 text-[#006532]"
                  >
                    <PiShoppingCart />
                  </a>
                </div>
              ))}
            </div>
          </section>
          <Footer />
        </div>
      )}
    </>
  );
};

export default Cart;
