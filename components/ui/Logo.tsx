'use client';

interface LogoProps {
  className?: string;
  onClick?: () => void;
}

export default function Logo({ className, onClick }: LogoProps) {
  return (
    <span
      className={`inline-flex items-baseline gap-0 font-heading font-bold text-2xl cursor-pointer select-none ${className ?? ''}`}
      onClick={onClick}
    >
      <span className="text-[#0B192C]">S</span>
      <span className="text-[#4B5563]">hop</span>
      <span className="text-[#FFD700]">K</span>
      <span className="text-[#4B5563]">in</span>
    </span>
  );
}
