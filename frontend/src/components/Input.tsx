import React from 'react'

const Input = ({
  label,
  onChange,
  placeholder,
  value,
  type = 'text'
}: {
  label: string;
  placeholder?: string;
  type?: 'text' | 'password';
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  value: string;
}) => {
  return (
    <fieldset className="fieldset">
      <legend className="fieldset-legend">{label}</legend>
      <input
        type={type}
        className="input text-primary"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </fieldset>
  );
};

export default Input