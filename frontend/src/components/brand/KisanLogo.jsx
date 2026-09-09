// brand mark from kisanconnect_logo design (teal tile + white/orange leaf sprout)
export default function KisanLogo({ size = 36, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Kisan Connect logo"
    >
      <rect width="48" height="48" rx="14" fill="#2A9D8F" />
      <path
        d="M24 13v16"
        stroke="#FFFFFF"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M24 29c0-5.5 4.5-8 9-6.5-1-6-5.5-9.5-9-9.5"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 29c0-5.5-4.5-8-9-6.5 1-6 5.5-9.5 9-9.5"
        fill="none"
        stroke="#F4A261"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}