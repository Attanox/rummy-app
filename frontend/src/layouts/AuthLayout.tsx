import { Outlet } from 'react-router';

function AuthLayout() {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="card w-96 bg-white shadow-xl p-6">
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
