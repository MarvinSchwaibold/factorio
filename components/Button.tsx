"use client";

import { useState } from "react";

const SPRING_EXTREME = "linear(0, 0.0033, 0.0136, 0.0304, 0.0536, 0.0838, 0.121 1.52%, 0.217 2.09%, 0.3145 2.56%, 0.4371 3.1%, 0.8869 4.89%, 1.0525, 1.1989 6.28%, 1.314, 1.4037 7.53%, 1.4387, 1.4679, 1.4912, 1.5085, 1.52, 1.5258 9.34%, 1.5264, 1.523, 1.5159, 1.5046, 1.4898, 1.4709 10.93%, 1.4201 11.51%, 1.368 12.01%, 1.3021 12.56%, 1.0578 14.41%, 0.9688, 0.8913 15.82%, 0.8306 16.46%, 0.786, 0.7534 17.65%, 0.7415, 0.7325, 0.7264, 0.7232 18.83%, 0.7228, 0.7244 19.35%, 0.7339 19.88%, 0.7519 20.43%, 0.7786 21.01%, 0.8065 21.52%, 0.8413 22.07%, 0.9699 23.92%, 1.0162, 1.0571 25.32%, 1.089 25.97%, 1.1126, 1.1298, 1.1407, 1.1457 28.31%, 1.1452, 1.1404 29.36%, 1.1311 29.91%, 1.1169 30.51%, 1.084 31.56%, 0.9913 34.14%, 0.97 34.82%, 0.9532 35.47%, 0.9409, 0.9319, 0.926, 0.9233 37.79%, 0.9251 38.7%, 0.934 39.68%, 0.9509 40.8%, 0.9998 43.37%, 1.0196 44.59%, 1.0282 45.28%, 1.0344, 1.0385, 1.0403 47.27%, 1.0395 48.2%, 1.0348 49.18%, 1.0259 50.3%, 1.0002 52.86%, 0.9898 54.08%, 0.982 55.41%, 0.9788 56.72%, 0.9792 57.67%, 0.9817 58.7%, 1.0053 63.56%, 1.0094 64.87%, 1.0111 66.16%, 1.0096 68.2%, 0.9973 73.01%, 0.9942 75.56%, 0.9949 77.7%, 1.0013 82.46%, 1.003 84.91%, 0.9985 93.97%, 0.9998 100%)";

const STYLE_ID = "artifact-button-styles";

function ensureStyles() {
  if (typeof document === "undefined") return;
  var existing = document.getElementById(STYLE_ID);
  if (existing) existing.remove();

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .artifact-btn {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: #fff;
      font-size: 0.75rem;
      font-weight: 400;
      letter-spacing: -0.01em;
      line-height: 1.1;
      border: none;
      background: transparent;
      cursor: pointer;
      white-space: nowrap;
      outline: none;
      padding: 0 16px;
      height: 40px;
      border-radius: 1rem;
    }
    @supports (corner-shape: superellipse(1.5)) {
      .artifact-btn {
        border-radius: 1.5rem;
        corner-shape: superellipse(1.5);
      }
    }
    .artifact-btn::before {
      content: "";
      position: absolute;
      inset: 0;
      border: 1px solid transparent;
      border-radius: 0.875rem;
      background:
        linear-gradient(180deg, #0f1315 0%, #0f1315 80%, #2a3133 96%) border-box,
        conic-gradient(
          from 180deg at 50% 50%,
          #58595a 0deg,
          #2c2e2f 45.91deg,
          #52585b 215.15deg,
          #c2cfd4 230.43deg,
          #1c1f20 252.47deg,
          #1c1f20 311.2deg,
          #58595a 360deg
        ) border-box;
      box-shadow:
        0 0 0 1px #0f1315 inset,
        3px 5px 2px -5px #fff inset,
        1px 1.5px 0 0 rgba(15, 19, 21, 0.75) inset,
        0 4px 0.25px -2px #fbfbfb inset,
        1px 1px 3px 3px #131718 inset,
        0 -3px 1px 0 rgba(15, 19, 21, 0.5) inset,
        2px -2px 3px 0 rgba(11, 54, 72, 0.75) inset,
        0 -3px 3px 1px rgba(214, 221, 223, 0.1) inset;
      transition: transform 1500ms ${SPRING_EXTREME};
    }
    @supports (corner-shape: superellipse(1.5)) {
      .artifact-btn::before {
        border-radius: 1.275rem;
        corner-shape: superellipse(1.5);
      }
    }
    .artifact-btn:hover::before {
      transform: scaleX(1.05) scaleY(0.98);
    }
    .artifact-btn--wide:hover::before {
      transform: scaleX(1.01) scaleY(0.99);
    }
    .artifact-btn--xs {
      height: 28px;
      padding: 0 10px;
      gap: 4px;
      font-size: 0.6875rem;
    }
    .artifact-btn--sm {
      height: 32px;
      padding: 0 12px;
      gap: 6px;
    }
    .artifact-btn--lg {
      height: 40px;
      padding: 0 24px;
    }
    .artifact-btn > span {
      position: relative;
    }
    .artifact-btn:disabled {
      pointer-events: none;
      opacity: 0.5;
    }
  `;
  document.head.appendChild(style);
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "default" | "xs" | "sm" | "lg";
  wide?: boolean;
}

export function Button({
  children,
  size = "default",
  wide = false,
  className = "",
  ...props
}: ButtonProps) {
  const [mounted, setMounted] = useState(false);

  if (!mounted) {
    ensureStyles();
    setMounted(true);
  }

  const sizeClass = size === "xs" ? "artifact-btn--xs" : size === "sm" ? "artifact-btn--sm" : size === "lg" ? "artifact-btn--lg" : "";
  const wideClass = wide ? "artifact-btn--wide" : "";

  return (
    <button
      className={`artifact-btn ${sizeClass} ${wideClass} ${className}`.trim()}
      {...props}
    >
      <span>{children}</span>
    </button>
  );
}
