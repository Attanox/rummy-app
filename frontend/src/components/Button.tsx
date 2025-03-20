import React from 'react'

interface IProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: 'btn-primary' | 'btn-secondary' | 'btn-error' | 'btn-success';
  size?: 'btn-sm' | 'btn-lg' | 'btn-xs' | 'btn-xl' | '';
}

const Button = ({
  children,
  loading = false,
  type = 'button',
  variant = 'btn-primary',
  size = '',
  ...rest
}: React.PropsWithChildren<IProps>) => {
  return (
    <button
      {...rest}
      type={type}
      disabled={loading}
      className={`flex w-full justify-center btn ${size} ${variant === 'btn-secondary' ? 'btn-outline' : ''} ${variant}`}
    >
      {loading && <span className="loading loading-spinner"></span>}
      {children}
    </button>
  );
};

export default Button