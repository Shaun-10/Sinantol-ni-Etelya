export default function InputField({
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  error
}) {
  return (
    <div className="mb-3 w-full">
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-transparent bg-[#d9ddd6] px-3 py-2 text-sm text-[#1f2d23] outline-none transition focus:border-[#1c5d2a]"
      />
      {error ? <p className="mt-1 text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
