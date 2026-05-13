import { useState } from 'react';

export function FormField({ label, required, error, hint, children }) {
  return (
    <div>
      {label && (
        <label className="block text-xs font-medium text-neutral-700 mb-1.5">
          {label}
          {required && <span className="text-inbody-red ml-1">*</span>}
        </label>
      )}
      {children}
      {error && (
        <div className="mt-1.5 text-[11px] text-inbody-red flex items-center gap-1">
          <span>⚠</span>
          {error}
        </div>
      )}
      {hint && !error && (
        <div className="mt-1.5 text-[11px] text-neutral-500 leading-relaxed">{hint}</div>
      )}
    </div>
  );
}

export function TextInput({ value, onChange, placeholder, type = 'text', maxLength, error }) {
  return (
    <input
      type={type}
      value={value || ''}
      onChange={function (e) {
        onChange(e.target.value);
      }}
      placeholder={placeholder}
      maxLength={maxLength}
      className={
        'w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm transition-all outline-none ' +
        (error
          ? 'border-inbody-red/40 focus:ring-2 focus:ring-inbody-red/20'
          : 'border-neutral-200 hover:border-neutral-300 focus:border-inbody-red/40 focus:ring-2 focus:ring-inbody-red/20')
      }
    />
  );
}

export function TextArea({ value, onChange, placeholder, maxLength, rows = 3, error }) {
  const charCount = (value || '').length;
  return (
    <div>
      <textarea
        value={value || ''}
        onChange={function (e) {
          onChange(e.target.value);
        }}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        className={
          'w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm transition-all outline-none resize-none ' +
          (error
            ? 'border-inbody-red/40 focus:ring-2 focus:ring-inbody-red/20'
            : 'border-neutral-200 hover:border-neutral-300 focus:border-inbody-red/40 focus:ring-2 focus:ring-inbody-red/20')
        }
      />
      {maxLength && (
        <div className="mt-1 text-[10px] text-neutral-400 text-right tabular-nums">
          {charCount} / {maxLength}
        </div>
      )}
    </div>
  );
}

export function Select({ value, onChange, options, placeholder, error }) {
  return (
    <select
      value={value || ''}
      onChange={function (e) {
        onChange(e.target.value);
      }}
      className={
        'w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm transition-all outline-none appearance-none cursor-pointer ' +
        (error
          ? 'border-inbody-red/40 focus:ring-2 focus:ring-inbody-red/20'
          : 'border-neutral-200 hover:border-neutral-300 focus:border-inbody-red/40 focus:ring-2 focus:ring-inbody-red/20')
      }
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238a8a8f' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'/%3e%3c/svg%3e\")",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 14px center',
        paddingRight: '36px',
      }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(function (opt) {
        return (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        );
      })}
    </select>
  );
}

export function PhoneInput({ value, onChange, placeholder = '55 1234 5678', error }) {
  function handleChange(rawValue) {
    // Solo dígitos
    const clean = rawValue.replace(/\D/g, '').slice(0, 10);
    onChange(clean);
  }

  function formatDisplay(val) {
    if (!val) return '';
    if (val.length <= 2) return val;
    if (val.length <= 6) return val.slice(0, 2) + ' ' + val.slice(2);
    return val.slice(0, 2) + ' ' + val.slice(2, 6) + ' ' + val.slice(6);
  }

  return (
    <div className="relative">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-neutral-400 font-medium pointer-events-none">
        +52
      </div>
      <input
        type="tel"
        inputMode="numeric"
        value={formatDisplay(value)}
        onChange={function (e) {
          handleChange(e.target.value);
        }}
        placeholder={placeholder}
        className={
          'w-full pl-14 pr-3.5 py-2.5 bg-white border rounded-xl text-sm transition-all outline-none ' +
          (error
            ? 'border-inbody-red/40 focus:ring-2 focus:ring-inbody-red/20'
            : 'border-neutral-200 hover:border-neutral-300 focus:border-inbody-red/40 focus:ring-2 focus:ring-inbody-red/20')
        }
      />
    </div>
  );
}
