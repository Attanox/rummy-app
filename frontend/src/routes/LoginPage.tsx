import React from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { useLogin } from '../api/authApi';
import Alert from '../components/Alert';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuthStore } from '../store/authStore';

const DEFAULTS = {
  username: 'Demo',
  password: 'password',
};

const LoginPage = () => {
  const [username, setUsername] = React.useState(DEFAULTS.username);
  const [password, setPassword] = React.useState(DEFAULTS.password);
  const { mutateAsync: login, isPending, isError } = useLogin();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ body: { password, username } });
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  );

  console.log('isAuthenticated', isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to={'/'} />;
  }

  return (
    <>
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="text-6xl text-center">🃏</div>
        <h2 className="mt-5 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Username"
            onChange={(e) => setUsername(e.target.value)}
            placeholder="John Doe"
            value={username}
          />

          <Input
            label="Password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            type="password"
          />

          {isError && <Alert message="Login failed" type={'error'} />}

          <Button type="submit" loading={isPending}>
            Sign in
          </Button>
        </form>

        <p className="mt-10 text-center text-sm/6 text-gray-500">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-semibold text-accent hover:text-underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </>
  );
};

export default LoginPage;
