import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../Header/header";
import Footer from "../Footer/footer";
import { PiCheckCircle } from "react-icons/pi";

const OrderSuccess = () => {
  const location = useLocation();
  const { orderResponse } = location.state || {}; // Lấy response từ state

  console.log("orderres", orderResponse);
  if (!orderResponse) {
    // Nếu không có dữ liệu, điều hướng ngược lại
    navigate("/");
    // return null;
  }

  const navigate = useNavigate();

  const handleBackToShop = () => {
    navigate("/"); // Đường dẫn đến trang chính
  };

  const handleViewOrderDetails = () => {
    navigate("/order-details"); // Đường dẫn đến chi tiết đơn hàng
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <Header />
      <div className="container mx-auto flex-grow p-6 text-center md:p-12">
        <div className="shadow-lg rounded-lg border border-gray-200 bg-white p-8">
          <div className="mb-6 flex justify-center text-green-600">
            <PiCheckCircle size={64} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            Thanh toán thành công!
          </h2>
          <p className="mt-4 text-gray-600">
            Cảm ơn bạn đã mua hàng! Đơn hàng của bạn đã được đặt và đang được xử
            lý. Chúng tôi sẽ thông báo cho bạn khi nó sẵn sàng để giao hàng.
          </p>

          <div className="mt-8 flex flex-col justify-center space-y-4 md:flex-row md:space-x-4 md:space-y-0">
            <button
              onClick={handleBackToShop}
              className="shadow-md rounded-md bg-[#006532] px-6 py-2 text-white transition hover:bg-[#006532ca]"
            >
              Tiếp tục mua
            </button>
            <button
              onClick={handleViewOrderDetails}
              className="shadow-md rounded-md border-2 border-[#006532] px-6 py-2 text-[#006532] transition hover:bg-[#006532] hover:text-white"
            >
              Xem chi tiết đặt hàng
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderSuccess;
