import React from "react";
import Header from "../Header/header";
import Footer from "../Footer/footer";
import { useCart } from "../../Context/CartContext";

const OrderDetails = () => {
  const {
    carts,
    setCarts,
    selectedCartItems,
    clearSelectedCartItems,
    totalQuantity,
    setTotalQuantity,
  } = useCart();

  console.log("selectedCartItems", selectedCartItems);

  // Dữ liệu mẫu về đơn hàng
  const orderDetails = {
    orderId: "12345",
    orderDate: "07-11-2024",
    customerName: "John Doe",
    shippingAddress: "123 Main Street, City, Country",
    phone: "0123456789",
    paymentMethod: "Cash on Delivery",
    deliveryStatus: "Pending",
    products: [
      {
        id: 1,
        name: "Orange Printed Tshirt",
        quantity: 2,
        price: 78.0,
        size: "M",
        imgSrc: "./images/product/262.png",
      },
      {
        id: 2,
        name: "Orange Printed Tshirt",
        quantity: 1,
        price: 78.0,
        size: "L",
        imgSrc: "./images/product/264.png",
      },
      {
        id: 3,
        name: "Orange Printed Tshirt",
        quantity: 3,
        price: 78.0,
        size: "S",
        imgSrc: "./images/product/266.png",
      },
    ],
  };

  // Tính tổng tiền đơn hàng
  const calculateTotal = () => {
    try {
      const subtotal = orderDetails.products.reduce(
        (total, product) => total + product.price * product.quantity,
        0,
      );
      const deliveryFee = 35.0;
      return subtotal + deliveryFee;
    } catch (error) {
      console.error("Error calculating total:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <div className="container mx-auto p-6 md:p-12">
        <div className="shadow-lg rounded-lg border border-gray-200 bg-white p-8 md:p-16">
          <h2 className="mb-6 text-3xl font-bold text-[#006532]">
            Order Details
          </h2>

          {/* Thông tin đơn hàng */}
          <div className="mb-8">
            <p className="text-lg text-gray-700">
              Id đặt hàng:{" "}
              <span className="font-semibold">{orderDetails.orderId}</span>
            </p>
            <p className="text-lg text-gray-700">
              Ngày đặt hàng:{" "}
              <span className="font-semibold">{orderDetails.orderDate}</span>
            </p>
            <p className="text-lg text-gray-700">
              Họ và tên:{" "}
              <span className="font-semibold">{orderDetails.customerName}</span>
            </p>
            <p className="text-lg text-gray-700">
              Địa chỉ:{" "}
              <span className="font-semibold">
                {orderDetails.shippingAddress}
              </span>
            </p>
            <p className="text-lg text-gray-700">
              Số điện thoại:{" "}
              <span className="font-semibold">{orderDetails.phone}</span>
            </p>
            <p className="text-lg text-gray-700">
              Phương thức thanh toán:{" "}
              <span className="font-semibold">
                {orderDetails.paymentMethod}
              </span>
            </p>
            <p className="text-lg text-gray-700">
              Trạng thái giao hàng:{" "}
              <span className="font-semibold">
                {orderDetails.deliveryStatus}
              </span>
            </p>
          </div>

          {/* Danh sách sản phẩm */}
          <h3 className="mb-4 text-2xl font-semibold text-gray-800">
            Products
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {orderDetails.products.map((product) => (
              <div
                key={product.id}
                className="shadow-lg flex items-center space-x-4 rounded-lg border border-gray-200 bg-white p-4"
              >
                <img
                  src={product.imgSrc}
                  alt={product.name}
                  className="h-24 w-24 rounded-lg"
                />
                <div>
                  <h4 className="text-lg font-semibold text-[#006532]">
                    {product.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    Quantity: {product.quantity}
                  </p>
                  <p className="text-sm text-gray-500">Size: {product.size}</p>
                  <p className="text-sm font-medium text-gray-700">
                    Price: ${product.price}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Tóm tắt thanh toán */}
          <div className="shadow-lg mt-6 rounded-lg border border-gray-200 bg-white p-4">
            <div className="mb-2 flex items-center justify-between border-b pb-2 text-gray-700">
              <span>Tổng phụ</span>
              <span>
                {orderDetails.products
                  .reduce(
                    (total, product) =>
                      total + product.price * product.quantity,
                    0,
                  )
                  .toFixed(2)}
                đ
              </span>
            </div>
            <div className="mb-2 flex items-center justify-between border-b pb-2 text-gray-700">
              <span>Phí giao hàng</span>
              <span>0đ</span>
            </div>
            <div className="flex items-center justify-between text-lg font-semibold text-[#006532]">
              <span>Tổng cộng</span>
              <span>{calculateTotal().toFixed(2)}đ</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default OrderDetails;
