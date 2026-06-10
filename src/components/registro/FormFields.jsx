import { AlertCircle } from 'lucide-react';

export function FormField({ label, required, hint, error, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-neutral-700 mb-1.5">
        {label} {required && <span className="text-inbody-red">*</span>}
      </label>
      {children}
      {hint && !error && <div className="mt-1 text-[11px] text-neutral-500 leading-relaxed">{hint}</div>}
      {error && (
        <div className="mt-1 flex items-start gap-1 text-[11px] text-inbody-red">
          <AlertCircle className="w-2.5 h-2.5 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

export function TextInput({ value, onChange, placeholder, maxLength, error, type, ...rest }) {
  return (
    <input
      type={type || 'text'}
      value={value || ''}
      onChange={function (e) { onChange(e.target.value); }}
      placeholder={placeholder}
      maxLength={maxLength}
      className={
        'w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm transition-all outline-none ' +
        (error ? 'border-inbody-red/40 focus:ring-2 focus:ring-inbody-red/20' :
        'border-neutral-200 focus:border-inbody-red/40 focus:ring-2 focus:ring-inbody-red/20')
      }
      {...rest}
    />
  );
}

export function TextArea({ value, onChange, placeholder, maxLength, rows, error }) {
  return (
    <textarea
      value={value || ''}
      onChange={function (e) { onChange(e.target.value); }}
      placeholder={placeholder}
      maxLength={maxLength}
      rows={rows || 3}
      className={
        'w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm transition-all outline-none resize-none ' +
        (error ? 'border-inbody-red/40 focus:ring-2 focus:ring-inbody-red/20' :
        'border-neutral-200 focus:border-inbody-red/40 focus:ring-2 focus:ring-inbody-red/20')
      }
    />
  );
}

export function Select({ value, onChange, placeholder, options, error }) {
  return (
    <select
      value={value || ''}
      onChange={function (e) { onChange(e.target.value); }}
      className={
        'w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm transition-all outline-none cursor-pointer ' +
        (error ? 'border-inbody-red/40 focus:ring-2 focus:ring-inbody-red/20' :
        'border-neutral-200 focus:border-inbody-red/40 focus:ring-2 focus:ring-inbody-red/20')
      }
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(function (opt) {
        return <option key={opt.value} value={opt.value}>{opt.label}</option>;
      })}
    </select>
  );
}

export function PhoneInput({ value, onChange, error }) {
  return (
    <div className="flex gap-2">
      <div className="flex-shrink-0 px-3 py-2.5 bg-neutral-100 border border-neutral-200 rounded-xl text-sm text-neutral-600">+52</div>
      <input
        type="tel"
        value={value || ''}
        onChange={function (e) {
          const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
          onChange(cleaned);
        }}
        placeholder="55 1234 5678"
        className={
          'flex-1 px-3.5 py-2.5 bg-white border rounded-xl text-sm transition-all outline-none ' +
          (error ? 'border-inbody-red/40 focus:ring-2 focus:ring-inbody-red/20' :
          'border-neutral-200 focus:border-inbody-red/40 focus:ring-2 focus:ring-inbody-red/20')
        }
      />
    </div>
  );
}

export function Checkbox({ checked, onChange, children, error }) {
  return (
    <label className="flex items-start gap-2.5 cursor-pointer group">
      <input
        type="checkbox"
        checked={!!checked}
        onChange={function (e) { onChange(e.target.checked); }}
        className="mt-0.5 w-4 h-4 accent-inbody-red flex-shrink-0"
      />
      <span className={'text-xs leading-relaxed ' + (error ? 'text-inbody-red' : 'text-neutral-700')}>
        {children}
      </span>
    </label>
  );
}
