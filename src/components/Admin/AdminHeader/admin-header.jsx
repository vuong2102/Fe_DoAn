import React, { useContext, useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { IoMenu, IoClose, IoNotificationsOutline } from "react-icons/io5";
import { RiArrowDropUpLine,RiArrowDropDownLine } from "react-icons/ri";
import img from "../../../../public/images/Crops organic farm.png";
import { NotificationContext } from "../../Notification/NotificationProvider.jsx";
import { ref, update } from "firebase/database";
import { database } from "../../../services/firebase-config.js";

export const markAllNotificationsAsRead = async (notifications) => {
  const updates = {};
  notifications.forEach(([key, notification]) => {
    if (!notification.isRead) {
      updates[`notificationAdmins/${key}/isRead`] = true;
    }
  });
  try {
    if (Object.keys(updates).length > 0) {
      await update(ref(database), updates);
      console.log("All notifications marked as read.");
    } else {
      console.log("No unread notifications to update.");
    }
  } catch (error) {
    console.error("Error updating notifications:", error);
  }
};

function HeaderAdmin() {
  const { notifications } = useContext(NotificationContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [allRead, setAllRead] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const unreadCount = notifications.filter(
    ([key, notification]) => notification.isRead === false,
  ).length;
  const [isHovered, setIsHovered] = useState(false); // Trạng thái để kiểm tra hover
  
  const [isOrderManagementOpen, setIsOrderManagementOpen] = useState(false);

  const toggleOrderManagement = () => {
    setIsOrderManagementOpen(!isOrderManagementOpen);
  };

  const handleSeeMore = () => {
    setIsExpanded(true);
  };
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  const handleMarkAllAsRead = () => {
    markAllNotificationsAsRead(notifications)
      .then(() => {
        setAllRead(true);
      })
      .catch((error) => {
        console.error("Error updating notifications:", error);
      });
  };

  const checkAllRead = () => {
    return unreadCount === 0;
  };

  const handlePopupMouseEnter = () => {
    setIsHovered(true);
  };

  const handlePopupMouseLeave = () => {
    setIsHovered(false);
    setIsPopupOpen(false);
  };

  useEffect(() => {
    setAllRead(checkAllRead());
  }, [notifications]);

  
  return (
    <div className="shadow-lg sticky top-0 z-50 flex bg-[#225a3e] px-12 py-3 shadow-custom-dark">
      {/* Logo */}
      {/*<a href="/home-page" className="absolute right-[70px] -mt-1">
        <img
          src={img}
          className="fadeInUp h-[85px] w-20 rounded-[0_20px_20px_20px] border-2 border-[#006633] bg-white p-1 shadow-custom-dark transition-all duration-500 ease-in-out hover:rounded-[20px_20px_0_20px] md:h-[95px] md:w-[90px] md:border-0"
          alt="Logo"
        />
      </a>*/}
      <div className="left-10 -mt-5 flex items-center pt-6">
        <button id="bar" className="px-4" onClick={toggleMenu}>
          {isMenuOpen ? (
            <IoClose
              className="h-[35px] w-[35px] text-white"
              aria-hidden="true"
            />
          ) : (
            <IoMenu
              className="h-[40px] w-[30px] text-white"
              aria-hidden="true"
            />
          )}
        </button>
      </div>
      <button
        className="relative ml-auto mt-1 flex items-center"
        onClick={togglePopup}
      >
        <IoNotificationsOutline className="h-[25px] w-[25px] text-[#006532] text-white" />
        {unreadCount > 0 && (
          <span className="absolute bottom-1 left-3.5 right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popup Notification */}
      {isPopupOpen && (
        <div
          className="shadow-lg absolute right-8 top-14 z-50 h-[600px] w-[400px] rounded-md bg-white p-0 pb-3"
          onMouseEnter={handlePopupMouseEnter}
          onMouseLeave={handlePopupMouseLeave}
        >
          <div className="flex items-center justify-between p-4">
            <h3 className="flex-grow text-center text-2xl font-semibold text-[#225a3e]">
              Thông báo
            </h3>
            {unreadCount > 0 && (
              <label className="group relative cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 appearance-none rounded-md border-2 border-[#225a3e] transition-all duration-200 checked:border-[#225a3e] checked:bg-[#225a3e]"
                  checked={allRead}
                  onChange={handleMarkAllAsRead}
                />
                <span className="w-400 h-100 absolute left-0 top-0 flex items-center justify-center bg-white text-sm text-black opacity-0 transition-opacity duration-300 group-hover:bg-gray-200 group-hover:opacity-100">
                  Đánh dấu tất cả là đã đọc
                </span>
              </label>
            )}
          </div>

          {/* Phần thông báo cuộn */}
          <div
            className={`transition-all duration-300 ${
              isExpanded ? "overflow-auto" : "overflow-hidden"
            } h-[calc(100%-100px)]`}
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#d3d3d3 #f1f1f1",
            }}
          >
            {notifications.length > 0 ? (
              notifications
                .sort(
                  (a, b) => new Date(b[1].createdAt) - new Date(a[1].createdAt),
                )
                .map(([key, notification], index) => (
                  <div
                    key={index}
                    className={`${notification.isRead ? "bg-white" : "bg-[#d3f8e2]"}`}
                  >
                    <div className="border-b border-gray-300 pb-1 pl-3 pr-3 pt-2">
                      <h4 className="pb-1 font-semibold text-[#225a3e]">
                        {notification.notificationType || "Không có tiêu đề"}
                      </h4>
                      <p className="mb-0.5 text-sm text-[#225a3e]">
                        {notification.message || "Không có nội dung"}
                      </p>
                      <p className="text-right text-sm text-gray-400">
                        {notification.createdAt
                          ? new Date(notification.createdAt).toLocaleString(
                              "vi-VN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              },
                            )
                          : "Không có thời gian"}
                      </p>
                    </div>
                    {index !== notifications.length - 1 && <hr />}
                  </div>
                ))
            ) : (
              <p className="text-center text-gray-500">
                Không có thông báo nào.
              </p>
            )}
          </div>

          {/* Nút "Xem thêm" */}
          <div className="mb-2 mt-4 flex justify-center">
            {!isExpanded && (
              <button
                onClick={handleSeeMore}
                className="font-semibold text-[#225a3e] hover:text-[#006532]"
              >
                Xem thêm
              </button>
            )}
          </div>
        </div>
      )}

      {/* Sidebar Menu */}

      <div
        className={`shadow-lg fixed left-0 top-[63px] z-50 h-full w-[250px] transform border-r-2 border-[#006532] bg-white transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo in Sidebar */}
        <a
          href="/home-page"
          className="block border-b-2 border-[#006532] bg-white p-6"
        >
          <img
            src={img}
            className="mx-auto h-auto w-24 rounded-[0_30px_30px_30px]"
            alt="Logo"
          />
        </a>

        {/* Navigation Links */}
        <ul className="flex flex-col items-start font-semibold text-[#006532]">
          <li className="w-full border-b border-[#006532] px-6 py-4 transition-colors duration-300 hover:bg-[#80c9a4] hover:text-white">
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                isActive
                  ? "border-l-4 border-[#006532] pl-2 text-[#006532]"
                  : "text-[#006532] hover:text-white"
              }
            >
              Thống Kê
            </NavLink>
          </li>
          <li className="w-full border-b border-[#006532] px-6 py-4 transition-colors duration-300 hover:bg-[#80c9a4] hover:text-white">
            <NavLink
              to="/admin/manage-user/1/8"
              className={({ isActive }) =>
                isActive
                  ? "border-l-4 border-[#006532] pl-2 text-[#006532]"
                  : "text-[#006532] hover:text-white"
              }
            >
              Quản lý người dùng
            </NavLink>
          </li>
          <li className="w-full border-b border-[#006532] px-6 py-4 transition-colors duration-300 hover:bg-[#80c9a4] hover:text-white">
            <NavLink
              to="/admin/manage-category"
              className={({ isActive }) =>
                isActive
                  ? "border-l-4 border-[#006532] pl-2 text-[#006532]"
                  : "text-[#006532] hover:text-white"
              }
            >
              Quản lý danh mục
            </NavLink>
          </li>
          <li className="w-full border-b border-[#006532] px-6 py-4 transition-colors duration-300 hover:bg-[#80c9a4] hover:text-white">
            <NavLink
              to="/admin/manage-product/1/10"
              className={({ isActive }) =>
                isActive
                  ? "border-l-4 border-[#006532] pl-2 text-[#006532]"
                  : "text-[#006532] hover:text-white"
              }
            >
              Quản lý sản phẩm
            </NavLink>
          </li>
          <li className="w-full border-b border-[#006532] px-6 py-4 transition-colors duration-300 hover:bg-[#80c9a4] hover:text-white">
            <NavLink
              to="/admin/manage-import/1/4"
              className={({ isActive }) =>
                isActive
                  ? "border-l-4 border-[#006532] pl-2 text-[#006532]"
                  : "text-[#006532] hover:text-white"
              }
            >
              Quản lý đơn nhập hàng
            </NavLink>
          </li>
          <li className="w-full border-b border-[#006532] px-6 py-4 transition-colors duration-300 hover:bg-[#80c9a4] hover:text-white cursor-pointer">
        <div
          onClick={toggleOrderManagement}
          className="flex items-center justify-between"
        >
          <span>Quản lý đơn hàng</span>
          <span>{isOrderManagementOpen ? <RiArrowDropDownLine className="text-3xl"/> : <RiArrowDropUpLine  className="text-3xl"/>}</span>
        </div>
        {isOrderManagementOpen && (
          <ul className="pl-9 mt-2 bg-[#80c9a4] -mx-6 border-t border-[#006532]">
            <li className="w-full border-b border-[#407259]  py-3 transition-colors duration-300 hover:underline ">
              <NavLink
                to="/admin/manage-order/1/4?"
                className={({ isActive }) =>
                  isActive
                    ? "border-l-4 border-[#006532] pl-2 text-[#006532] font-semibold"
                    : "text-[#006532]"
                }
              >
                Quản lý đơn đặt hàng
              </NavLink>
            </li>
            <li className="w-full py-3 -mb-4 transition-colors duration-300 hover:underline hover:text-[#006532]">
              <NavLink
                to="/admin/manage-order-complete/1/2"
                className={({ isActive }) =>
                  isActive
                    ? "border-l-4 border-[#006532] pl-2 text-[#006532] font-semibold"
                    : "text-[#006532] "
                }
              >
                Đơn hàng đã hoàn thành
              </NavLink>
            </li>
          </ul>
        )}
      </li>
          <li className="w-full border-b border-[#006532] px-6 py-4 transition-colors duration-300 hover:bg-[#80c9a4] hover:text-white">
            <NavLink
              to="/admin/manage-supplier/1/4"
              className={({ isActive }) =>
                isActive
                  ? "border-l-4 border-[#006532] pl-2 text-[#006532]"
                  : "text-[#006532] hover:text-white"
              }
            >
              Quản lý nhà cung cấp
            </NavLink>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default HeaderAdmin;
