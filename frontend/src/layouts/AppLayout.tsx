import React from 'react';
import { useAuthStore } from '../store/authStore';
import { useLogout } from '../api/authApi';
import { Outlet, useNavigate } from 'react-router';
import Button from '../components/Button';

const AppLayout = () => {
  const user = useAuthStore((state) => state.user);
  const { mutateAsync: logout } = useLogout();

  const navigate = useNavigate();

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await logout({});
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="navbar bg-base-100 shadow-sm">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl">daisyUI</a>
        </div>
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-circle avatar"
          >
            <div className="w-10 rounded-full">
              <img
                src={`https://ui-avatars.com/api/?name=${
                  user?.username || 'User'
                }`}
                alt="Profile"
              />
            </div>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
          >
            <li className="w-full">
              <Button size="btn-xs" variant="btn-error" onClick={handleLogout}>
                Logout
              </Button>
            </li>
          </ul>
        </div>
      </div>

      <Outlet />
    </div>
  );
};

export default AppLayout;
