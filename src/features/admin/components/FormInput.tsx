type FormInputProps = {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  helpText?: string;
};

export default function FormInput({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
  minLength,
  helpText,
}: FormInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
        style={{ '--tw-ring-color': '#FA6978' } as React.CSSProperties}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
      />
      {helpText && <p className="text-sm text-gray-500 mt-1">{helpText}</p>}
    </div>
  );
}
