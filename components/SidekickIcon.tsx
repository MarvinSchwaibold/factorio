"use client";

interface SidekickIconProps {
  size?: number;
}

export function SidekickIcon({ size = 20 }: SidekickIconProps) {
  return (
    <img
      src="/sk.svg"
      alt=""
      width={size}
      height={size}
      style={{ display: "block", flexShrink: 0 }}
    />
  );
}
