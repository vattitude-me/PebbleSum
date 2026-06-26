"use client";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}

export default function Logo({ size = "md", showTagline = false }: LogoProps) {
  const sizeClasses = {
    sm: "logo--sm",
    md: "logo--md",
    lg: "logo--lg",
  };

  return (
    <div className={`logo ${sizeClasses[size]}`}>
      <img src="/assets/icons/icon-pebble-wave.png" alt="PebbleSum" className="logo__icon" />
      <div className="logo__text">
        <span className="logo__word-pebble">Pebble</span>
        <span className="logo__word-sum">Sum</span>
      </div>
      {showTagline && (
        <p className="logo__tagline">Small Steps. Daily Practice.<br />Big Math Success.</p>
      )}
    </div>
  );
}
