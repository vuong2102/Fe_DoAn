import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getUserOrders, getDetailOrder } from "../../services/order-service";
import Header from '../Header/header';
import Footer from '../Footer/footer';

const OrderHistory = () => {
  const { userId } = useParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1); // Quản lý trang hiện tại
  const [selectedOrder, setSelectedOrder] = useState(null); // Lưu chi tiết đơn hàng
  const [detailLoading, setDetailLoading] = useState(false); // Trạng thái tải chi tiết
  const limit = 5; // Số đơn hàng mỗi trang

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await getUserOrders(userId, page, limit); // Gọi API với page và limit
        setOrders(data || []); // Gán danh sách đơn hàng trả về
      } catch (err) {
        console.error(err);
        setError("Không thể tải lịch sử đơn hàng.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId, page]);

  const fetchOrderDetail = async (orderId) => {
    try {
      setDetailLoading(true);
      const data = await getDetailOrder(orderId); // Gọi API lấy chi tiết đơn hàng
      setSelectedOrder(data); // Lưu chi tiết đơn hàng vào state
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết đơn hàng:", err);
      setError("Không thể lấy chi tiết đơn hàng.");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleNextPage = () => setPage((prev) => prev + 1);
  const handlePrevPage = () => setPage((prev) => (prev > 1 ? prev - 1 : 1));
  const closeOrderDetail = () => setSelectedOrder(null);

  if (loading) {
    return <div className="text-center mt-10">Đang tải...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-10">{error}</div>;
  }

  return (
    <>
      <Header />
      <div className="p-6 max-w-4xl mx-auto mt-12">
        <h1 className="text-2xl font-semibold mb-4 text-[#006532]">
          Lịch sử đơn hàng
        </h1>
        {orders.length === 0 ? (
          <p className="text-gray-500">Bạn chưa có đơn hàng nào.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="border border-[#006532] rounded-lg p-4 shadow-sm hover:shadow-md"
              >
                <p className="text-lg font-medium text-[#006532]">
                  Mã đơn hàng: <span className="font-bold">{order.id}</span>
                </p>
                <p>Ngày đặt: {new Date(order.createdAt).toLocaleDateString()}</p>
                <p>Trạng thái: {order.orderStatus}</p>
                <p>
                  Tổng tiền:{" "}
                  <span className="font-semibold text-[#006532]">
                    {order.total_price.toLocaleString()} VNĐ
                  </span>
                </p>
                <button
                  onClick={() => fetchOrderDetail(order.id)}
                  className="mt-2 px-4 py-2 bg-[#006532] text-white rounded-md hover:bg-opacity-90"
                >
                  Xem chi tiết
                </button>
              </div>
            ))}
          </div>
        )}
    
        {/* Pagination */}
        <div className="flex justify-between items-center mt-16">
          <button
            className="px-4 py-2 bg-[#006532] text-white rounded-md hover:bg-opacity-90"
            onClick={handlePrevPage}
            disabled={page === 1}
          >
            Trang trước
          </button>
          <span>Trang {page}</span>
          <button
            className="px-4 py-2 bg-[#006532] text-white rounded-md hover:bg-opacity-90"
            onClick={handleNextPage}
            disabled={orders.length < limit}
          >
            Trang sau
          </button>
        </div>
    
        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full border-2 border-[#006532]">
              <h2 className="text-xl font-semibold mb-4 text-[#006532]">
                Chi tiết đơn hàng {selectedOrder.id}
              </h2>
              <p>Ngày đặt: {new Date(selectedOrder.createdAt).toLocaleString()}</p>
              <p>Trạng thái: {selectedOrder.orderStatus}</p>
              <p>
                Tổng tiền:{" "}
                <span className="font-semibold text-[#006532]">
                  {selectedOrder.total_price.toLocaleString()} VNĐ
                </span>
              </p>
              <h3 className="mt-4 font-medium text-[#006532]">Danh sách sản phẩm:</h3>
              <ul className="list-disc pl-5">
                {selectedOrder.items.map((item) => (
                  <li key={item.product_id}>
                    {item.product_name} - {item.quantity} x{" "}
                    {item.unit_price.toLocaleString()} VNĐ
                  </li>
                ))}
              </ul>
              <button
                onClick={closeOrderDetail}
                className="mt-4 px-4 py-2 bg-[#006532] text-white rounded-md hover:bg-opacity-90"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default OrderHistory;
