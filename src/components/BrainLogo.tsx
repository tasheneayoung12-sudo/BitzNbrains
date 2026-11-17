interface BrainLogoProps {
  logoUrl?: string;
  logoAlt?: string;
  size?: 'sm' | 'lg';
  className?: string;
}

export function BrainLogo({ logoUrl, logoAlt, size = 'lg', className = '' }: BrainLogoProps) {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={logoAlt || 'Bits & Brains Collective logo'}
        referrerPolicy="no-referrer"
        className={
          size === 'sm'
            ? `h-10 w-10 rounded-xl object-contain border-2 border-[#0E1033] bg-white ${className}`
            : `h-48 w-48 sm:h-56 sm:w-56 object-contain ${className}`
        }
      />
    );
  }

  if (size === 'sm') {
    return (
      <span
        className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-[#0E1033] bg-white p-0.5 ${className}`}
        aria-hidden="true"
      >
        <svg viewBox="0 0 120 120" className="h-8 w-8" fill="none">
          {/* Graduation Cap */}
          <path d="M60 10L20 26L60 40L100 26L60 10Z" fill="#0E1033" />
          <path d="M36 33V46C36 46 47 52 60 52C73 52 84 46 84 46V33L60 42L36 33Z" fill="#0E1033" />
          <path d="M90 29V46" stroke="#FF2E93" strokeWidth="4" strokeLinecap="round" />
          <rect x="86" y="45" width="8" height="12" rx="3" fill="#FF2E93" />
          {/* Left Blue Brain Hemisphere */}
          <path
            d="M59 46C42 46 28 54 27 68C19 72 17 85 24 94C25 104 36 111 48 110C52 114 56 114 59 112V46Z"
            fill="#1F4BFF"
          />
          <path d="M48 60L38 70M38 70L34 86" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="48" cy="60" r="4" fill="#1F4BFF" stroke="#FFFFFF" strokeWidth="3" />
          <circle cx="34" cy="86" r="4" fill="#1F4BFF" stroke="#FFFFFF" strokeWidth="3" />
          {/* Right Pink-Outlined Brain Hemisphere */}
          <path
            d="M61 46C78 46 92 54 93 68C101 72 103 85 96 94C95 104 84 111 72 110C68 114 64 114 61 112V46Z"
            fill="#FFFFFF"
            stroke="#FF2E93"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          {/* Glasses & Smile */}
          <rect x="31" y="70" width="24" height="17" rx="6" fill="#FFFFFF" stroke="#0E1033" strokeWidth="4.5" />
          <rect x="65" y="70" width="24" height="17" rx="6" fill="#FFFFFF" stroke="#0E1033" strokeWidth="4.5" />
          <path d="M55 77H65" stroke="#0E1033" strokeWidth="4.5" />
          <path d="M38 80C40 76 45 76 47 80" stroke="#0E1033" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M72 80C74 76 79 76 81 80" stroke="#0E1033" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M52 96C56 101 64 101 68 96" stroke="#0E1033" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </span>
    );
  }

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 260 230"
        className="h-48 w-56 sm:h-56 sm:w-64"
        role="img"
        aria-label={logoAlt || 'Bits & Brains Collective floating brain logo wearing a graduation cap and glasses'}
        fill="none"
      >
        {/* Playful Pink Burst Lines (Left) */}
        <path d="M24 72L42 82" stroke="#FF2E93" strokeWidth="6" strokeLinecap="round" />
        <path d="M16 94L37 97" stroke="#FF2E93" strokeWidth="6" strokeLinecap="round" />
        <path d="M25 116L41 112" stroke="#FF2E93" strokeWidth="6" strokeLinecap="round" />

        {/* Playful Blue Burst Lines (Right) */}
        <path d="M234 94L217 104" stroke="#1F4BFF" strokeWidth="6" strokeLinecap="round" />
        <path d="M242 115L221 118" stroke="#1F4BFF" strokeWidth="6" strokeLinecap="round" />
        <path d="M235 135L218 131" stroke="#1F4BFF" strokeWidth="6" strokeLinecap="round" />

        {/* Graduation Cap (Navy with Pink Tassel) */}
        <g transform="rotate(-4 130 52)">
          <path
            d="M130 14L62 41L130 66L198 41L130 14Z"
            fill="#0E1033"
            stroke="#0E1033"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path
            d="M88 53V73C99 67 114 64 130 64C146 64 161 67 172 73V53L130 69L88 53Z"
            fill="#0E1033"
          />
          {/* Tassel Cord & Tassel */}
          <path d="M180 46V74" stroke="#FF2E93" strokeWidth="5" strokeLinecap="round" />
          <circle cx="180" cy="76" r="5" fill="#FF2E93" />
          <path
            d="M174 79H186L189 98C189 101 185 103 180 103C175 103 171 101 171 98L174 79Z"
            fill="#FF2E93"
          />
        </g>

        {/* Left Hemisphere: Solid Electric Blue with White Circuit Traces */}
        <path
          d="M128 73C112 69 94 74 86 87C71 88 58 99 58 115C46 123 44 142 54 155C50 172 60 190 77 194C84 206 101 211 113 203C119 208 125 208 128 205V73Z"
          fill="#1F4BFF"
        />
        {/* White Circuit Lines & Terminals */}
        <path
          d="M111 96L98 110H85"
          stroke="#FFFFFF"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="114" cy="93" r="6" fill="#1F4BFF" stroke="#FFFFFF" strokeWidth="4.5" />
        <circle cx="80" cy="110" r="6" fill="#1F4BFF" stroke="#FFFFFF" strokeWidth="4.5" />

        <path
          d="M106 123L92 123"
          stroke="#FFFFFF"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <circle cx="87" cy="123" r="5.5" fill="#1F4BFF" stroke="#FFFFFF" strokeWidth="4.5" />

        <path
          d="M90 154H75L66 167"
          stroke="#FFFFFF"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="64" cy="171" r="6" fill="#1F4BFF" stroke="#FFFFFF" strokeWidth="4.5" />

        <path
          d="M108 164L98 182"
          stroke="#FFFFFF"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <circle cx="95" cy="187" r="6" fill="#1F4BFF" stroke="#FFFFFF" strokeWidth="4.5" />

        {/* Right Hemisphere: White Fill with Hot Pink Brain Outline & Folds */}
        <path
          d="M132 73C148 69 166 74 174 87C189 88 202 99 202 115C214 123 216 142 206 155C210 172 200 190 183 194C176 206 159 211 147 203C141 208 135 208 132 205V73Z"
          fill="#FFFFFF"
          stroke="#FF2E93"
          strokeWidth="7"
          strokeLinejoin="round"
        />
        {/* Pink Brain Folds */}
        <path
          d="M153 84C144 92 145 106 156 112"
          stroke="#FF2E93"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M178 96C166 102 162 114 168 124"
          stroke="#FF2E93"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M196 130C184 134 178 145 184 156"
          stroke="#FF2E93"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M180 168C171 174 162 174 156 168"
          stroke="#FF2E93"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Center White Backing Behind Glasses & Smile */}
        <rect x="74" y="122" width="112" height="58" rx="22" fill="#FFFFFF" />

        {/* Navy Glasses */}
        <path
          d="M72 128H121C124 128 125 130 125 133V144C125 154 117 161 106 161H91C80 161 72 154 72 144V128Z"
          fill="#FFFFFF"
          stroke="#0E1033"
          strokeWidth="7"
          strokeLinejoin="round"
        />
        <path
          d="M139 128H188V144C188 154 180 161 169 161H154C143 161 135 154 135 144V133C135 130 136 128 139 128Z"
          fill="#FFFFFF"
          stroke="#0E1033"
          strokeWidth="7"
          strokeLinejoin="round"
        />
        {/* Glasses Bridge & Temples */}
        <path d="M123 134C127 131 133 131 137 134" stroke="#0E1033" strokeWidth="7" strokeLinecap="round" />
        <path d="M67 132H74" stroke="#0E1033" strokeWidth="7" strokeLinecap="round" />
        <path d="M186 132H193" stroke="#0E1033" strokeWidth="7" strokeLinecap="round" />

        {/* Happy Curved Eyes */}
        <path
          d="M90 147C93 139 103 139 106 147"
          stroke="#0E1033"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M154 147C157 139 167 139 170 147"
          stroke="#0E1033"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Cute Smile */}
        <path
          d="M117 168C123 177 137 177 143 168"
          stroke="#0E1033"
          strokeWidth="6.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
