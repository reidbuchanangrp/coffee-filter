interface CFLogoProps {
  className?: string;
  size?: number;
}

export function CFLogo({ className = "", size = 28 }: CFLogoProps) {
  return (
    <svg
      width={size}
      height={size * 1.3}
      viewBox="0 0 40 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Coffee bean shape */}
      <ellipse cx="20" cy="26" rx="18" ry="24" fill="#1a1a1a" />

      {/* Center crease line */}
      <path
        d="M20 6 Q14 26 20 46"
        stroke="#3d3d3d"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />

      {/* C letter */}
      <text
        x="6"
        y="32"
        fontFamily="Georgia, serif"
        fontSize="18"
        fontWeight="bold"
        fill="white"
      >
        C
      </text>

      {/* F letter */}
      <text
        x="21"
        y="32"
        fontFamily="Georgia, serif"
        fontSize="18"
        fontWeight="bold"
        fill="white"
      >
        F
      </text>
    </svg>
  );
}
