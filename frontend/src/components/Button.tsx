import React from 'react'

const Button = ({ children, loading = false }: React.PropsWithChildren<{loading?: boolean}>) => {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex w-full justify-center btn btn-primary"
    >
      {loading && <span className="loading loading-spinner"></span>}
      {children}
    </button>
  );
}

export default Button