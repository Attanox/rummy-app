import React from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { useRegister } from '../api/authApi';
import Alert from '../components/Alert';
import Button from '../components/Button';
import Input from '../components/Input';
import { useAuthStore } from '../store/authStore';

const DEFAULTS = {
  username: 'Demo',
  password: 'password',
};

const RegisterPage = () => {
  const [username, setUsername] = React.useState(DEFAULTS.username);
  const [password, setPassword] = React.useState(DEFAULTS.password);
  const { mutateAsync: register, isPending, isError } = useRegister();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register({ body: { password, username } });
      navigate('/');
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  );

  if (isAuthenticated) {
    return <Navigate to={'/'} />;
  }

  return (
    <>
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="text-6xl text-center">🃏</div>
        <h2 className="mt-5 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
          Sign up to play
        </h2>
        ¡
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form
          onSubmit={handleSubmit}
          method="post"
          className="space-y-6"
        >
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

          {isError && (
            <Alert message="Registration failed" type={'error'} />
          )}

          <Button type="submit" loading={isPending}>
            Sign up
          </Button>
        </form>

        <p className="mt-10 text-center text-sm/6 text-gray-500">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-accent hover:text-underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </>
  );
};

export default RegisterPage;
