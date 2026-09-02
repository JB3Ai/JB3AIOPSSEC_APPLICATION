import React from 'react';

interface JB3LogoProps {
  variant?: 'full' | 'monogram' | 'compact';
  theme?: 'dark' | 'light' | 'reversed';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const JB3Logo: React.FC<JB3LogoProps> = ({
  variant = 'full',
  theme = 'reversed',
  className = '',
  size = 'md',
}) => {
  // Brand colors from official specifications
  const darkNavy = '#0A1628';
  const metallicGold = '#C9A227';
  const nearBlack = '#0B0B0B';
  const white = '#FFFFFF';

  const isDarkBackground = theme === 'reversed' || theme === 'dark';
  const jbColor = isDarkBackground ? white : darkNavy;
  const shieldColor = isDarkBackground ? 'rgba(201, 162, 39, 0.4)' : darkNavy;

  const sizeClasses = {
    sm: 'h-7',
    md: 'h-9',
    lg: 'h-12',
    xl: 'h-16',
  };

  const monogramSize = {
    sm: { width: 30, height: 34 },
    md: { width: 38, height: 42 },
    lg: { width: 48, height: 54 },
    xl: { width: 64, height: 72 },
  }[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Geometric Monogram with Shield */}
      <div className="relative flex items-center justify-center flex-shrink-0">
        <svg
          width={monogramSize.width}
          height={monogramSize.height}
          viewBox="0 0 100 112"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-200"
        >
          {/* Subtle Shield Outline */}
          <path
            d="M50 4L10 20V52C10 82 50 108 50 108C50 108 90 82 90 52V20L50 4Z"
            stroke={metallicGold}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={isDarkBackground ? '#0A1628' : 'rgba(10, 22, 40, 0.05)'}
          />
          {/* Inner subtle shield fill/accent */}
          <path
            d="M50 10L16 24V52C16 78 50 100 50 100C50 100 84 78 84 52V24L50 10Z"
            fill="#060E1A"
            fillOpacity={isDarkBackground ? '0.7' : '0.05'}
          />

          {/* Monogram "J" */}
          <path
            d="M26 36H36V62C36 68 32 72 26 72C21 72 17 69 16 64L23 60C24 63 25 64 27 64C28.5 64 29.5 63 29.5 61V36Z"
            fill={jbColor}
          />

          {/* Monogram "B" */}
          <path
            d="M40 36H53C58 36 61 38.5 61 42.5C61 45.5 59.5 47.5 57 48.5C60.5 49.5 62.5 52 62.5 55.5C62.5 60 59 63 53 63H40V36ZM46.5 42V47.5H52.5C54.5 47.5 55.5 46.5 55.5 44.8C55.5 43 54.5 42 52.5 42H46.5ZM46.5 51.5V57H53C55 57 56.5 56 56.5 54.2C56.5 52.5 55 51.5 53 51.5H46.5Z"
            fill={jbColor}
          />

          {/* Monogram "3" in Metallic Gold (#C9A227) */}
          <path
            d="M66 36H82V42.5L74.5 50C78.5 50.5 82 53.5 82 58C82 63.5 77.5 67 71 67C65 67 61 63.5 60.5 58.5L67 57C67.5 59.5 69 61 71.5 61C73.8 61 75.5 59.5 75.5 57.5C75.5 55.2 73.8 54 71 54H68V48.5L74.5 42.5H66V36Z"
            fill={metallicGold}
          />
        </svg>
      </div>

      {/* Wordmark and Tagline */}
      {variant !== 'monogram' && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-tight text-white font-sans text-base sm:text-lg flex items-center">
              JB<span className="text-[#C9A227]">3</span>OPSSEC
            </span>
            <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-[#C9A227]"></span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 hidden sm:inline">
              OPERATIONAL SECURITY
            </span>
          </div>
          {variant === 'full' && (
            <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
              <span className="text-[#C9A227] font-semibold">GAUTENG, ZA</span>
              <span>•</span>
              <span>QDentiFi + PATROLVE2 CORE</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
