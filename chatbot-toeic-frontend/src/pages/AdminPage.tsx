import { Outlet, Link } from "react-router-dom";
import { useState } from "react";
import {
  FaUsers,
  FaClipboardList,
  FaBook,
  FaChartBar,
  FaChevronDown,
  FaChevronRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight
} from "react-icons/fa";
import "../styles/AdminPage.css";

export default function AdminPage() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
    setOpenMenu(null); // đóng menu con khi thu gọn
  };

  return (
    <div className="admin-page">
      <div className={`admin-container ${collapsed ? "collapsed" : ""}`}>
        {/* Sidebar */}
        <div className={`admin-sidebar ${collapsed ? "collapsed" : ""}`}>
          {/* ✅ NÚT THU GỌN / MỞ RỘNG */}
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {collapsed ? <FaAngleDoubleRight /> : <FaAngleDoubleLeft />}
          </button>

          {!collapsed && <h2 className="sidebar-title">Admin Panel</h2>}

          {/* Quản lý người dùng */}
          <div className="sidebar-item">
            <div className="sidebar-main" onClick={() => toggleMenu("users")}>
              <FaUsers />
              {!collapsed && (
                <>
                  <span>Quản lý người dùng</span>
                  {openMenu === "users" ? (
                    <FaChevronDown />
                  ) : (
                    <FaChevronRight />
                  )}
                </>
              )}
            </div>
            {!collapsed && openMenu === "users" && (
              <div className="sidebar-sub">
                <Link to="/admin/users">Danh sách</Link>
                <Link to="/admin/users/edit">Chỉnh sửa</Link>
              </div>
            )}
          </div>

          {/* Quản lý đề thi */}
          <div className="sidebar-item">
            <div className="sidebar-main" onClick={() => toggleMenu("tests")}>
              <FaClipboardList />
              {!collapsed && (
                <>
                  <span>Quản lý đề thi</span>
                  {openMenu === "tests" ? (
                    <FaChevronDown />
                  ) : (
                    <FaChevronRight />
                  )}
                </>
              )}
            </div>
            {!collapsed && openMenu === "tests" && (
              <div className="sidebar-sub">
                <Link to="/admin/tests">Danh sách đề</Link>
                <Link
                  to="/admin/tests/add"
                  state={{ mode: "add" }}
                >Thêm đề mới</Link>
              </div>
            )}
          </div>

          {/* Quản lý khóa học */}
          <div className="sidebar-item">
            <div
              className="sidebar-main"
              onClick={() => toggleMenu("courses")}
            >
              <FaBook />
              {!collapsed && (
                <>
                  <span>Quản lý khóa học</span>
                  {openMenu === "courses" ? (
                    <FaChevronDown />
                  ) : (
                    <FaChevronRight />
                  )}
                </>
              )}
            </div>
            {!collapsed && openMenu === "courses" && (
              <div className="sidebar-sub">
                <Link to="/admin/courses">Danh sách khóa học</Link>
                <Link to="/admin/courses/manage">Thêm / Sửa</Link>
              </div>
            )}
          </div>

          {/* Thống kê */}
          <div className="sidebar-item">
            <div className="sidebar-main">
              <FaChartBar />
              {!collapsed && (
                <Link to="/admin/stats" style={{ marginLeft: "8px" }}>
                  Thống kê nhanh
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
