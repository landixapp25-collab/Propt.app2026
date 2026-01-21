interface LogoProps {
  size?: number;
  className?: string;
}

export default function Logo({ size = 32, className = '' }: LogoProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M 100 45 L 155 90 L 155 155 L 45 155 L 45 90 Z"
        fill="none"
        stroke="#5a9aa8"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="78"
        y="120"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="64"
        fontWeight="700"
        fill="#5a9aa8"
      >
        P
      </text>
      <rect x="85" y="138" width="30" height="17" rx="2" fill="#e85d75" />
    </svg>
  );
}
