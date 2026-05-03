import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?:   string;
  error?:   string;
  required?: boolean;
  size?:    'md' | 'lg';
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  required,
  size = 'md',
  className,
  id,
  ...props
}, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className={cn('label', required && 'label-required')}
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={cn(
          'input',
          size === 'lg' && 'input-lg',
          error && 'input-error',
          className
        )}
        {...props}
      />
      {error && <p className="error-msg">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;