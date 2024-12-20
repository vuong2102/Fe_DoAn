import React, {  useEffect, useState } from 'react';
import {useLocation, useParams, useNavigate } from 'react-router-dom';
import AdminHeader from "../AdminHeader/admin-header.jsx";
import { FaSave, FaTrash, FaEye,FaSearch, FaFilter, FaSort, FaEdit} from 'react-icons/fa';
import { MdOutlineInbox, MdOutlineCancel } from "react-icons/md";
import { getOrdersAdmin, updateOrderAdmin } from '../../../services/order-service.js';
import { showNotification, notificationTypes, NotificationList } from '../../Notification/NotificationService.jsx';
import NotificationHandler from '../../Notification/notification-handle.jsx';



const  ManageOrderComplete = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const [orders, setOrders] = useState([]);
  const [showViewPopup, setShowViewPopup] = useState(false);
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const { currentPage: paramCurrentPage, ordersPerPage: paramOrdersPerPage } = useParams();
  const [notifications, setNotifications] = useState([]);
  const [filterOrderStatus, setFilterOrderStatus] = useState(queryParams.get('orderStatus') || '');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState(queryParams.get('paymentStatus') || '');
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showConfirmPopupMulti, setShowConfirmPopupMulti] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const ordersPerPage = parseInt(paramOrdersPerPage) || 8; // Số lượng người dùng trên mỗi trang
  const currentPage = parseInt(paramCurrentPage) || 1;
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [productInStock, setProductInStock] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const sortedOrders = React.useMemo(() => {
    let sortableOrders = [...orders];
    if (sortConfig !== null) {
      sortableOrders.sort((a, b) => {
        const orderA = a.order[sortConfig.key];
        const orderB = b.order[sortConfig.key];
  
        if (orderA < orderB) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (orderA > orderB) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableOrders;
  }, [orders, sortConfig]);
  
  const requestSort = key => {
    let direction = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  


  useEffect(() => {
    const queryParams = new URLSearchParams();
    if (filterOrderStatus) queryParams.set('orderStatus', filterOrderStatus);
    if (filterPaymentStatus) queryParams.set('paymentStatus', filterPaymentStatus);
    window.history.replaceState(null, '', `/admin/manage-order-complete/${currentPage}/${ordersPerPage}?${queryParams.toString()}`);
  }, [ filterOrderStatus, filterPaymentStatus, currentPage, ordersPerPage]);


useEffect(() => {
  const fetchOrders = async () => {
    try {
        const result2 = await getOrdersAdmin(1, ordersPerPage * totalPages, filterOrderStatus, filterPaymentStatus, true);
        if (result2.success) {
          const filteredOrders = result2.data.orders;

          setTotalPages(Math.ceil(result2.data.total / ordersPerPage));

          // Áp dụng phân trang và cập nhật `setOrders`
          const pagedOrders = filteredOrders.slice((currentPage - 1) * ordersPerPage, currentPage * ordersPerPage);
          setOrders(pagedOrders);
      } else {
        console.error('Failed to fetch filtered orders:', result2.message);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  fetchOrders();
}, [filterPaymentStatus, filterOrderStatus, ordersPerPage, totalPages, currentPage]);



  useEffect(() => {
    setOrders(allOrders.slice((currentPage - 1) * ordersPerPage, currentPage * ordersPerPage));
  }, [currentPage, allOrders, ordersPerPage]);


  const handlePageChange = (page) => {
    const queryParams = new URLSearchParams();
    if (filterOrderStatus) queryParams.set('orderStatus', filterOrderStatus); 
    if (filterPaymentStatus) queryParams.set('paymentStatus',filterPaymentStatus);

    navigate(`/admin/manage-order-complete/${page}/${ordersPerPage}?${queryParams.toString()}`);
  };


  const handleOrderStatusChange = (event) => {
    setFilterOrderStatus(event.target.value.trim());
    navigate(`/admin/manage-order-complete/1/${ordersPerPage}?${queryParams.toString()}`);
  };
  
  
  const handlePaymentStatusChange = (event) => {
    const newPaymentStatus = event.target.value.trim();
    setFilterPaymentStatus(newPaymentStatus);
    navigate(`/admin/manage-order-complete/1/${ordersPerPage}?${queryParams.toString()}`);
  };

  const handleViewOrder = (order) => {
    setCurrentOrder({
      ...order,
    });
    setShowViewPopup(true);
  };


  const handleSelectOrder = (id) => {
    if (selectedOrders.includes(id)) {
      setSelectedOrders(selectedOrders.filter(orderId => orderId !== id));
    } else {
      setSelectedOrders([...selectedOrders, id]);
    }
  };


  
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const time = date.toLocaleTimeString('vi-VN', { hour12: false });
    const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    return `${formattedDate} ${time}`;
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <AdminHeader />
      <div className="w-full p-4">
        <h1 className="text-4xl font-bold mb-8 mt-4 text-[#006532] text-center">Đơn hàng đã hoàn thành</h1>
    
        {/* Tìm kiếm và lọc */}
        <div className="flex items-center flex-col md:flex-row  mt-4 mb-3 px-6 py-3 bg-white rounded-lg  tablet:h-28">
          <div className="flex items-center  space-x-2 w-4/5 ">
            <div className='pr-4 mt-1 tablet:absolute tablet:mt-[148px] tablet:left-10 '>
            <input 
                    type="checkbox" 
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedOrders(sortedOrders.map(order => order.id));
                      } else {
                        setSelectedOrders([]);
                      }
                    }}
                   
                  />
              </div>
            <div className=' tablet:mt-36 tablet:left-16 tablet:absolute'>
            {selectedOrders.length > 0 && (
              <FaTrash 
                // onClick={handleDeleteSelectedOrders} 
                className='text-gray-400 hover:text-red-500  ' 
              />
            )}
          </div>
         
          </div>
       
          <div className="flex items-center space-x-2 w-2/5 tablet:w-full justify-end">
            <div className=" relative w-1/2">
              <select 
                value={filterOrderStatus} 
                onChange={handleOrderStatusChange} 
                className="border rounded-lg px-3 py-2 w-full appearance-none pr-8"
              >
                <option value="">Tất cả</option>
                <option value="Đã giao hàng">Đã giao hàng</option>
                <option value="Hủy đơn hàng">Hủy đơn hàng</option>
            
              </select>
              <FaFilter className="absolute top-3 right-2 text-gray-400" />
            </div>

            <div className="relative w-1/2">
              <select 
                value={filterPaymentStatus} 
                onChange={handlePaymentStatusChange} 
                className="border rounded-lg px-3 py-2 w-full appearance-none pr-8"
              >
                <option value="">Tất cả</option>
                <option value="Đã thanh toán">Đã thanh toán</option>
                <option value="Chưa thanh toán">Chưa thanh toán</option>
                <option value="Nợ">Nợ</option>
              </select>
              <FaFilter className="absolute top-3 right-2 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-lg rounded-lg overflow-hidden">
            <thead className="bg-[#006532] text-white">
              <tr>
              <th className="py-3 px-6 text-left">
                  {/*  */}
                  <MdOutlineInbox />
                </th>
                <th className="py-3 pr-3 text-left">STT </th> 
                <th className="py-3  text-left">Thời gian đặt hàng <FaSort  onClick={() => requestSort('createdAt')} /> </th> 
                <th className="py-3 pr-3  text-left">Khách hàng <FaSort className="inline ml-1 cursor-pointer" onClick={() => requestSort('lastName')}/></th>
                <th className="py-3 pr-3 text-left hidden sm:table-cell">Số điện thoại <FaSort className="inline ml-1 cursor-pointer" onClick={() => requestSort('phone')}/></th>
                <th className="py-3 pr-3 text-left hidden sm:table-cell">Tổng tiền <FaSort className="inline ml-1 cursor-pointer" onClick={() => requestSort('total_price')}/></th>
                <th className="py-3 pr-3 text-left hidden md:table-cell">Phương thức thanh toán <FaSort className="inline ml-1 cursor-pointer" onClick={() => requestSort('payment_method')}/></th>
                <th className="py-3 pr-3 text-left hidden lg:table-cell">Tình trạng đơn hàng <FaSort className="inline ml-1 cursor-pointer" onClick={() => requestSort('orderStatus')}/></th>
                <th className="py-3 pr-3 text-left hidden lg:table-cell">Tình trạng thanh toán <FaSort className="inline ml-1 cursor-pointer" onClick={() => requestSort('paymentStatus')}/></th>
                
                <th className="py-3 px-6 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedOrders.map((or, index) => (
                <tr key={index} className="border-b hover:bg-indigo-50">
                <td className="py-4 px-6">
                    <input 
                      type="checkbox" 
                      checked={selectedOrders.includes(or.order.id)} 
                      onChange={() => handleSelectOrder(or.order.id)} 
                    />
                  </td>
                  <td className="py-3 pr-3 text-left">{(currentPage - 1) * ordersPerPage + index + 1}</td>
                  <td className="py-3  w-1/6  text-left ">  {formatDateTime(or.order.createdAt)} </td>
                  <td className="py-3 text-left ">{or.order.user.firstName} {or.order.user.lastName}</td>
                  <td className="py-3 text-left hidden sm:table-cell">{or.order.location.phone}</td>
                  <td className="py-3 pr-3 text-left hidden sm:table-cell">{or.order.total_price}</td>
                  <td className="py-3 pr-3 text-left hidden md:table-cell">{or.order.payment_method}</td>
                  <td className="py-3 pr-3 text-left hidden lg:table-cell"><p
                  className={`text-center rounded-md ${
                    or.order.orderStatus == 'Đang kiểm hàng'
                      ? 'bg-[#F29339] text-white'
                      : or.order.orderStatus == 'Chờ giao hàng'
                      ? 'bg-[#84b2da] text-white'
                      : or.order.orderStatus == 'Đang vận chuyển'
                      ? 'bg-[#4175a2] text-white'
                      : or.order.orderStatus == 'Hủy đơn hàng'
                      ? 'bg-[#ad402a] text-white'
                      : or.order.orderStatus == 'Đã giao hàng'
                      ? 'bg-[#006532] text-white'
                      : 'bg-gray-300 text-black'
                  }`}
                >
                  {or.order.orderStatus}</p></td>
                  <td className="py-3 pr-3 text-left hidden lg:table-cell"><p
                  className={`text-center  rounded-md  ${
                    or.order.paymentStatus === 'Chưa thanh toán'
                      ? 'bg-[#F29339] text-white xl:w-40'
                      : or.order.paymentStatus === 'Nợ'
                      ? 'bg-[#af342b] text-white  xl:w-40'
                      : or.order.paymentStatus === 'Đã thanh toán'
                      ? 'bg-[#006532] text-white  xl:w-40'
                      : 'bg-gray-300 text-black'
                  }`}
                >{or.order.paymentStatus}</p></td>

               
                  <td className="py-3 pr-3">
                    <div className="flex space-x-4">
                      <button 
                        onClick={() => handleViewOrder(or)} 
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <FaEye size={18} />
                      </button>
                      {/* <button 
                        onClick={() => handleCancelOrder(or.order.orderId)} 
                        className="text-red-600 hover:text-red-700"
                      >
                        <MdOutlineCancel size={18} />
                      </button> */}
                      <button onClick={() => openUpdateModal(or)} className="text-[#006532] hover:text-[#005a2f]">
                      <FaEdit />
                    </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Popup hiển thị chi tiết đơn hàng */}
        {showViewPopup && currentOrder && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-8 mt-2 w-1/2 max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Chi tiết đơn hàng</h2>
            <p className="text-black"><strong>Nhân viên:</strong> {currentOrder.order.employee.lastName}</p>
            <p className="text-black"><strong>Khách hàng:</strong> {currentOrder.order.user.firstName} {currentOrder.order.user.lastName}</p>
            <p className="text-black"><strong>Địa chỉ:</strong> {currentOrder.order.location.address}</p>
            <p className="text-black"><strong>Số điện thoại:</strong> {currentOrder.order.location.phone}</p>
            <p className="text-black"><strong>Tổng tiền:</strong> {currentOrder.order.total_price}</p>
            <p className="text-black"><strong>Tình trạng đơn hàng:</strong> {currentOrder.order.orderStatus}</p>
            <p className="text-black"><strong>Phương thức thanh toán:</strong> {currentOrder.order.payment_method}</p>
            <p className="text-black"><strong>Tình trạng thanh toán:</strong> {currentOrder.order.paymentStatus}</p>
            <p className="text-black"><strong>Thời gian cập nhật:</strong> {currentOrder.order.updatedAt}</p>
            <p className="text-black"><strong>Thời gian đặt hàng:</strong> {currentOrder.order.createdAt}</p>
            <h3 className="text-xl font-bold mt-4">Sản phẩm</h3>
            <table className="min-w-full bg-white shadow-lg rounded-lg overflow-hidden mt-4">
              <thead className="bg-[#006532]">
                <tr>
                  <th className="py-2 px-4 text-left text-white">Tên sản phẩm</th>
                  <th className="py-2 px-4 text-left text-white">Giá bán</th>
                  <th className="py-2 px-4 text-left text-white">Số lượng khách đặt</th>
                </tr>
              </thead>
              <tbody>
                {currentOrder.order.products.map((product, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 px-4">{product.productName}</td>
                    <td className="py-2 px-4">{product.priceout}</td>
                    <td className="py-2 px-4">{product.quantityBuy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button 
              onClick={() => setShowViewPopup(false)} 
              className="mt-4 bg-[#006532] text-white py-2 px-4 rounded hover:bg-green-700"
            >
              Close
            </button>
          </div>
        </div>
      )}



        {/* Popup cập nhật đơn hàng */}
        {showModal && currentOrder && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-8 mt-2 w-1/2 max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl text-[#006532] font-bold mb-4">Cập nhật đơn hàng</h2>
            <p className="text-black"><strong>Nhân viên:</strong> {currentOrder.order.employee.lastName}</p>
            <p className="text-black"><strong>Khách hàng:</strong> {currentOrder.order.user.firstName} {currentOrder.order.user.lastName}</p>
            <p className="text-black"><strong>Địa chỉ:</strong> {currentOrder.order.location.address}</p>
            <p className="text-black"><strong>Số điện thoại:</strong> {currentOrder.order.location.phone}</p>
            <p className="text-black"><strong>Tổng tiền:</strong> {currentOrder.order.total_price}</p>
            <p className="text-black"><strong>Phương thức thanh toán:</strong> {currentOrder.order.payment_method}</p>
            <p className="text-black"><strong>Thời gian cập nhật:</strong>  {formatDateTime(currentOrder.order.createdAt)}</p>
            <p className="text-black"><strong>Thời gian đặt hàng:</strong>  {formatDateTime(currentOrder.order.createdAt)}</p>
            <h3 className="text-xl text-[#006532] font-bold mt-4">Sản phẩm</h3>
            <table className="min-w-full bg-white shadow-lg rounded-lg overflow-hidden mt-4">
              <thead className="bg-[#006532]">
                <tr>
                  <th className="py-2 px-4 text-left text-white">Tên sản phẩm</th>
                  <th className="py-2 px-4 text-left text-white">Giá bán</th>
                  <th className="py-2 px-4 text-left text-white">Số lượng khách đặt</th>
                  <th className="py-2 px-4 text-left text-white">Tình trạng trong kho</th>
                  <th className="py-2 px-4 text-left text-white">Số lượng còn thiếu</th>
                </tr>
              </thead>
              <tbody>
                {currentOrder.order.products.map((product, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 px-4">{product.productName}</td>
                    <td className="py-2 px-4">{product.priceout}</td>
                    <td className="py-2 px-4">{product.quantityBuy}</td>
                    <td className="py-2 px-4">{product.stockStatus}</td>
                    <td className="py-2 px-4">{product.missingQuantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex mt-6 space-x-4">
              <select
                defaultValue={currentOrder.order.orderStatus}
                onChange={(e) => setCurrentOrder({ ...currentOrder, status: e.target.value })}
                className="border rounded-lg px-4 py-2 w-full mb-4 border-green-500 bg-gray-100 hover:bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Tất cả</option>
                <option value="Đang kiểm hàng">Đang kiểm hàng</option>
                <option value="Chờ giao hàng">Chờ giao hàng</option>
                <option value="Đang vận chuyển">Đang vận chuyển</option>
                <option value="Đã giao hàng">Đã giao hàng</option>
                <option value="Hủy đơn hàng">Hủy đơn hàng</option>
              </select>
              <select
                defaultValue={currentOrder.order.paymentStatus}
                onChange={(e) => setCurrentOrder({ ...currentOrder, status: e.target.value })}
                className="border rounded-lg px-4 py-2 w-full mb-4 border-green-500 bg-gray-100 hover:bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Tất cả</option>
                <option value="Đã thanh toán">Đã thanh toán</option>
                <option value="Chưa thanh toán">Chưa thanh toán</option>
                <option value="Nợ">Nợ</option>
              </select>
            </div>
            <div className="flex justify-end mt-4">
              <button
                // onClick={() => handleSaveUpdate(currentOrder.status, currentOrder.paymentStatus)}
                className="bg-[#006532] text-white py-2 px-4 rounded hover:bg-green-700 transition-all"
              >
                Cập nhật
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-all ml-2"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

        <div className="flex justify-center mt-4">
        {/* Hiển thị các nút phân trang */}
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => handlePageChange(index + 1)}
            className={`mx-1 px-3 py-1 rounded ${index + 1 === currentPage ? 'bg-[#006532] text-white' : 'bg-gray-200 text-gray-800 hover:bg-blue-200'}`}
            disabled={index + 1 === currentPage} // Vô hiệu hóa nút hiện tại
          >
            {index + 1}
          </button>
        ))}
      </div>
      </div>
    </div>
  );
};

export default ManageOrderComplete;