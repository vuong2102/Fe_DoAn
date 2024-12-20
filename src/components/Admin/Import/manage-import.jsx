import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import AdminHeader from "../AdminHeader/admin-header.jsx";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaEye, FaSort } from 'react-icons/fa';
import { MdOutlineInbox } from "react-icons/md";
import { getImportPrs, deleteImportPr, updateImportPr, createImportPr } from '../../../services/import-product-service.js';
import { showNotification, notificationTypes, NotificationList } from '../../Notification/NotificationService.jsx';
import NotificationHandler from '../../Notification/notification-handle.jsx';
import { getUserId, getToken } from '../../../util/auth-local.js';
import { fetchProducts } from '../../../services/product-service.js';

const Modal = ({ children, showModal, setShowModal }) => (
  showModal ? (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
        {children}
        <button onClick={() => setShowModal(false)} className="mt-4 ml-3 bg-red-600 text-white px-4 py-2 rounded">Close</button>
      </div>
    </div>
  ) : null
);

const ManageImport = () => {
  const { currentPage: paramCurrentPage, importPrsPerPage: paramImportPrsPerPage } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const [importPrs, setImportPrs] = useState([]);
  const [allImportPrs, setAllImportPrs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [currentImportPr, setCurrentImportPr] = useState({
    total_amount: '',
    user_id: '',
    importProducts: [{ product_id: '', quantity: '', price_in: '' }]
  });
  
  const [selectedImportPrs, setSelectedImportPrs] = useState([]);
  const [showViewPopup, setShowViewPopup] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const importPrsPerPage = parseInt(paramImportPrsPerPage) || 4; 
  const currentPage = parseInt(paramCurrentPage) || 1;
  const [totalPages, setTotalPages] = useState(1);
  const [locations, setLocations] = useState({});
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [importPrToDelete, setImportPrToDelete] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showConfirmPopupMulti, setShowConfirmPopupMulti] = useState(false);
  const [productList, setProductList] = useState([]);


  useEffect(() => {
    const fetchImportPrs = async () => {
      const fetchedImportPrs = [];
      let page = 1;
      let totalImportPrs = 0;
      try {
        do {
          const result = await getImportPrs(page, importPrsPerPage);
          if (result.success) {
            fetchedImportPrs.push(...result.data.list);
            totalImportPrs = result.data.total;
            page++;
          } else {
            throw new Error(result.message);
          }
        } while (fetchedImportPrs.length < totalImportPrs);

        setAllImportPrs(fetchedImportPrs);
        setTotalPages(Math.ceil(totalImportPrs / importPrsPerPage));
        setImportPrs(fetchedImportPrs.slice((currentPage - 1) * importPrsPerPage, currentPage * importPrsPerPage));
      } catch (error) {
        console.error('Failed to fetch importPrs:', error);
        sessionStorage.setItem('notification', JSON.stringify({
          message: 'Lỗi trong quá trình xử lý!',
          type: notificationTypes.ERROR
        }));
      }
    };

    fetchImportPrs();
  }, [currentPage, importPrsPerPage]);

  const sortedImportPrs = React.useMemo(() => {
    let sortableImportPrs = [...importPrs];
    if (sortConfig.key) {
      sortableImportPrs.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableImportPrs;
  }, [importPrs, sortConfig]);

  const requestSort = key => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handlePageChange = (page) => {
    const queryParams = new URLSearchParams();
    navigate(`/admin/manage-import/${page}/${importPrsPerPage}?${queryParams.toString()}`);
  };

  useEffect(() => {
    const getProducts = async () => {
      try {
        const productsData = await fetchProducts(1, 10); // Kiểm tra API có dữ liệu trả về
        setProductList(productsData.products || []); // Đảm bảo là mảng
        console.log(productList);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
  
    getProducts();
  }, []);
  
  
  const openAddModal = () => {
    setCurrentImportPr({  
        total_amount: '',
        user_id: '',
        importProducts: [{product_id: '', quantity: '', price_in: '' }] });
        setShowAddPopup(true);
  };
  const handleAddProductField = () => {
    if (!currentImportPr.importProducts) {
      setCurrentImportPr({
        ...currentImportPr,
        importProducts: [{ product_id: '', quantity: '', price_in: '' }]
      });
    } else {
      setCurrentImportPr({
        ...currentImportPr,
        importProducts: [
          ...currentImportPr.importProducts,
          { product_id: '', quantity: '', price_in: '' }
        ]
      });
    }
  };
  
  const handleDeleteProductField = (index) => {
    const updatedProducts = currentImportPr.importProducts.filter((_, i) => i !== index);
    setCurrentImportPr({ ...currentImportPr, importProducts: updatedProducts });
  };


  const handleSaveImportPr = async () => {
    try {
      // Chuẩn bị dữ liệu importPrData
      const userId = getUserId();
      const importPrData = {
        totalAmount: parseFloat(currentImportPr.total_amount),  // Chuyển sang số
        user_id: userId,  // user_id trong API của bạn
        products: currentImportPr.importProducts.map(product => ({
          product_id: product.product_id,
          quantity: product.quantity,
          price_in: product.price_in,
        }))
      };
  
      // Kiểm tra dữ liệu trước khi gửi
      console.log('ImportPrData:', importPrData);
      await createImportPr(importPrData);
    } catch (error) {
      console.error('Error in handleSaveImportPr:', error);
    }
  };
  
  
  
  
  const handleDeleteImportPr = async (importPrId) => {
    try {
      const adminID = getUserId();
      console.log(adminID)
      await Promise.all([
        deleteImportPr(adminID, importPrId),
        // deleteLocationImportPr(adminID,importPrId)
      ]);

      sessionStorage.setItem('notification', JSON.stringify({
        message: 'Xóa đơn nhập hàng thành công!',
        type: notificationTypes.SUCCESS
      }));
      window.location.reload();
    } catch (error) {
      console.error('Failed to delete importPr or importPr location:', error);
  
      sessionStorage.setItem('notification', JSON.stringify({
        message: 'Xóa không thành công.',
        type: notificationTypes.ERROR
      }));
      window.location.reload();
    }
  };
  
  
  const handleDeleteSelectedImportPrs = async () => {
    try {
      const adminID = getUserId(); 
      await Promise.all(
        selectedImportPrs.map(importPrId => 
          Promise.all([
            deleteImportPr(adminID, importPrId),
            // deleteLocationImportPr(adminID, importPrId)
          ])
        )
      );
  
      sessionStorage.setItem('notification', JSON.stringify({
        message: 'Xóa đơn nhập hàng thành công!',
        type: notificationTypes.SUCCESS
      }));
      window.location.reload();
    } catch (error) {
      console.error('Failed to delete selected importPrs or their locations:', error);
  
      sessionStorage.setItem('notification', JSON.stringify({
        message: 'Xóa không thành công.',
        type: notificationTypes.ERROR
      }));
      window.location.reload(); 
    }
  };
  
  
//   const handleDeleteClick = (importPrId) => {
//     setImportPrToDelete(importPrId);
//     setShowConfirmPopup(true);
//   };

  const confirmDelete = () => {
    handleDeleteImportPr(importPrToDelete);
    setShowConfirmPopup(false);
  };

  const cancelDelete = () => {
    setShowConfirmPopup(false);
    setImportPrToDelete(null);
  };

//   const handleMultiDeleteClick = () => {
//     setShowConfirmPopupMulti(true);
//   };

  const confirmMultiDelete = () => {
    handleDeleteSelectedImportPrs();
    setShowConfirmPopupMulti(false);
  };

  const cancelMultiDelete = () => {
    setShowConfirmPopupMulti(false);
  };


//   const handleSelectImportPr = (id) => {
//     if (selectedImportPrs.includes(id)) {
//       setSelectedImportPrs(selectedImportPrs.filter(importPrId => importPrId !== id));
//     } else {
//       setSelectedImportPrs([...selectedImportPrs, id]);
//     }
//   };

  const handleViewImportPr = (importPr) => {
    setCurrentImportPr({
      ...importPr,
    });
    setShowViewPopup(true);
  };


  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="fixed z-50 space-y-3">
        <NotificationList notifications={notifications} />
      </div>
      <NotificationHandler setNotifications={setNotifications} />
      <AdminHeader />
      {showAddPopup && (
  <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
    <div className="relative bg-white rounded-lg p-8 w-11/12 md:w-3/4 lg:w-1/2 max-h-full overflow-y-auto">
     
      <h2 className="text-2xl font-bold mb-4">Thêm đơn nhập hàng</h2>
      <div className="flex flex-wrap -mx-2 mb-4">
       
        <div className="w-full md:w-1/2 px-2 mb-4">
          <label className="block mb-2">Tổng số lượng:</label>
          <input
            type="number"
            value={currentImportPr.total_amount}
            onChange={(e) => setCurrentImportPr({ ...currentImportPr, total_amount: e.target.value })}
            className="border rounded-lg px-4 py-2 w-full"
          />
        </div>
       
      </div>
      <h3 className="text-xl font-bold mt-4 mb-4">Sản phẩm</h3>
            {currentImportPr.importProducts.map((product, index) => (
        <div key={index} className="flex flex-wrap -mx-2 mb-4">
            <div className="w-full md:w-1/2 px-2 mb-4">
            <label className="block mb-2">Tên sản phẩm:</label>
            <select
                value={product.product_id || ''} // Ensure that `product.product_id` is being accessed properly
                onChange={(e) => {
                const updatedProducts = currentImportPr.importProducts.map((p, i) =>
                    i === index ? { ...p, product_id: e.target.value } : p
                );
                setCurrentImportPr({ ...currentImportPr, importProducts: updatedProducts });
                }}
                className="border rounded-lg px-4 py-2 w-full"
            >
                <option value="">Chọn sản phẩm</option>
                {productList.map((product) => (
                <option key={product.id} value={product.id}>
                    {product.name}
                </option>
                ))}
            </select>
            </div>

            <div className="w-full md:w-1/2 px-2 mb-4">
            <label className="block mb-2">Số lượng:</label>
            <input
                type="number"
                value={product.quantity}
                onChange={(e) => {
                const updatedProducts = currentImportPr.importProducts.map((p, i) =>
                    i === index ? { ...p, quantity: e.target.value } : p
                );
                setCurrentImportPr({ ...currentImportPr, importProducts: updatedProducts });
                }}
                className="border rounded-lg px-4 py-2 w-full"
            />
            </div>

            <div className="w-full md:w-1/2 px-2 mb-4">
            <label className="block mb-2">Giá nhập:</label>
            <input
                type="number"
                value={product.price_in}
                onChange={(e) => {
                const updatedProducts = currentImportPr.importProducts.map((p, i) =>
                    i === index ? { ...p, price_in: e.target.value } : p
                );
                setCurrentImportPr({ ...currentImportPr, importProducts: updatedProducts });
                }}
                className="border rounded-lg px-4 py-2 w-full"
            />
            </div>
            <div className="w-full md:w-1/2 px-2 mb-4">
            <label className="block mb-2"></label>
            <button
                onClick={() => handleDeleteProductField(index)} // Thêm index vào đây
                className=" text-white px-4 py-2 rounded-lg  mt-6"
                >
                <FaTrash className='text-red-600 hover:text-[#bcc3bf] text-2xl'/> {/* Hiển thị biểu tượng xóa */}
            </button>

            </div>
        </div>
        ))}

      <button
        onClick={handleAddProductField}
        className="bg-[#006532] text-white px-4 py-2 rounded-lg hover:bg-[#004f29] mb-4"
      >
        Thêm sản phẩm
      </button>
      <div className="flex justify-end space-x-4">
        <button
          onClick={ handleSaveImportPr}
          className="bg-[#006532] text-white px-4 py-2 rounded-lg hover:bg-[#004f29]"
        >
          Lưu
        </button>
        <button
          onClick={() => setShowAddPopup(false)}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Hủy
        </button>
      </div>
    </div>
  </div>
)}
      <div className="lg:mx-12 p-4">
        <h1 className="text-4xl font-bold mb-8 mt-4 text-[#006532] text-start">Quản lý đơn nhập hàng</h1>

        {/* Thanh tìm kiếm và bộ lọc */}
        <div className="flex items-center flex-col md:flex-row  mt-4 mb-3 px-6 py-3 bg-white border-2 rounded-lg shadow-custom-slate">
        <div className="flex items-center space-x-2 w-1/5 ">
          <div className='pr-4 mt-1 tablet:absolute tablet:mt-[148px] tablet:left-10 '>
            <input 
                    type="checkbox" 
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedImportPrs(sortedImportPrs.map(importPr => importPr.id));
                      } else {
                        setSelectedImportPrs([]);
                      }
                    }}
                   
                  />

          </div>
          <div className=' tablet:mt-36 tablet:left-16 tablet:absolute'>
            {selectedImportPrs.length > 0 && (
              <FaTrash 
                // onClick={handleMultiDeleteClick} 
                className='text-gray-400 hover:text-red-500  ' 
              />
            )}
          </div>
        </div>
        </div>

        <div className="overflow-x-auto shadow-custom-slate">
          <table className="min-w-full bg-white shadow-lg rounded-lg overflow-hidden">
            <thead className="bg-[#006532] text-white">
              <tr>
                <th className="py-3 pl-6 pr-3 text-left">
                  {/*  */}
                  <MdOutlineInbox />
                </th>
                <th className="py-3 text-left">STT </th> 
                <th className="py-3 px-6 text-left">Ngày tạo <FaSort className="inline ml-1 cursor-pointer" onClick={() => requestSort('createdAt')}/></th>
                <th className="py-3 px-6 text-left">Tổng số tiền <FaSort className="inline ml-1 cursor-pointer" onClick={() => requestSort('total_amount')}/></th>
                <th className="py-3 px-6 text-left">Tên nhân viên <FaSort className="inline ml-1 cursor-pointer" onClick={() => requestSort('employee_id')}/></th>
                <th className="py-3 px-6 text-left">Hành động</th>
              </tr>
            </thead>
            <tbody>
            {sortedImportPrs.length === 0 ? (
            <tr>
              <td colSpan="11" className="py-4 text-center">No importPrs found.</td>
            </tr>
          ) : (
            sortedImportPrs.map((importPr, index) => (
              <tr key={importPr.id} className="border-b hover:bg-[#e0f7e0]">
                <td className="py-4 pl-6 pr-3">
                  <input
                    type="checkbox"
                    checked={selectedImportPrs.includes(importPr.id)}
                    // onChange={() => handleSelectImportPr(importPr.id)}
                  />
                </td>
                <td className="py-3">{(currentPage - 1) * importPrsPerPage + index + 1}</td>
                <td className="py-3 px-6 w-1/6 hidden xl:table-cell "> {(() => {
                    const date = new Date(importPr.createdAt);
                    const time = date.toLocaleTimeString('vi-VN', { hour12: false });
                    const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
                    return `${time} ${formattedDate}`;
                  })()}</td>
                  <td className="py-4 px-6">{importPr.total_amount}</td>
                  <td className="py-4 px-6">{importPr.employee_id}</td>
                <td className="py-3 px-6">
                  <div className="flex space-x-4">
                    <button onClick={() => handleViewImportPr(importPr)} className="text-blue-600 hover:text-blue-700">
                      <FaEye size={18} />
                    </button>
                    {/* <button onClick={() => openUpdateModal(importPr)} className="text-[#006532] hover:text-[#005a2f]">
                      <FaEdit />
                    </button> */}
                    {/* <button onClick={() => handleDeleteClick(importPr.id)} className="text-gray-400 hover:text-red-500">
                      <FaTrash />
                    </button> */}
                  </div>
                </td>
              </tr>
            ))
          )}
            </tbody>
          </table>
        </div>
        {showViewPopup && currentImportPr && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white rounded-lg p-8 w-1/2">
              <h2 className="text-2xl font-bold mb-4">Chi tiết đơn nhập</h2>
              <div className="mb-4">
                <p><strong>ID:</strong> {currentImportPr.id}</p>
                <p><strong>Tổng số tiền:</strong> {currentImportPr.total_amount}</p>
                <p><strong>Tên nhân viên:</strong> {currentImportPr.employee_name}</p>
                <p><strong>Ngày tạo:</strong> {currentImportPr.createdAt}</p>
                <h3 className="text-xl font-bold mt-4">Sản phẩm</h3>
                <table className="min-w-full bg-white shadow-lg rounded-lg overflow-hidden mt-4">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="py-2 px-4 text-left">Tên sản phẩm</th>
                      <th className="py-2 px-4 text-left">Số lượng</th>
                      <th className="py-2 px-4 text-left">Giá nhập</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentImportPr.importProducts.map((product, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2 px-4">{product.id}</td>
                        <td className="py-2 px-4">{product.quantity}</td>
                        <td className="py-2 px-4">{product.price_in}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button onClick={() => setShowViewPopup(false)} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700">Đóng</button>
            </div>
          </div>
        )}
        {showConfirmPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-xl mb-4">Bạn có chắc chắn muốn xóa đơn nhập hàng này?</h2>
            <div className="flex justify-end">
              <button onClick={cancelDelete} className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded mr-2">
                Hủy
              </button>
              <button onClick={confirmDelete} className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded">
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
      {showConfirmPopupMulti && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-xl mb-4">Bạn có chắc chắn muốn xóa các đơn nhập hàng này?</h2>
            <div className="flex justify-end">
              <button onClick={cancelMultiDelete} className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded mr-2">
                Hủy
              </button>
              <button onClick={confirmMultiDelete} className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded">
                Xóa
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
        <div className="flex justify-end mt-6">
         
          <button
        onClick={openAddModal}
        className="fixed bottom-4 right-4 bg-[#006532] hover:bg-[#005a2f] text-white p-4 rounded-full shadow-lg flex items-center justify-center"
      >
        <FaPlus size={24} /> {/* Icon nút */}
      </button>
        </div>
      </div>
      
    </div>
  );
};

export default ManageImport;