const Frontispiece = () => {
  return (
    <div className="lg:col-span-7 bg-surface-container-low p-8 lg:p-14 flex flex-col justify-between relative overflow-hidden">
      {/* Decorative ambient gradient circles */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-surface-container blur-3xl opacity-70 pointer-events-none"></div>
      <div className="absolute bottom-10 right-4 w-80 h-80 rounded-full bg-secondary-fixed blur-3xl opacity-30 pointer-events-none"></div>
      {/* Top Header / Meta Information */}
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-on-primary shadow-sm">
            <span className="material-symbols text-2xl">agriculture</span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline-lg text-headline-lg text-on-background tracking-tight">KisanConnect</span>
            <span className="font-label-sm text-label-sm text-outline tracking-wider uppercase">Unified Commerce &amp; Telematics</span>
          </div>
        </div>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl leading-relaxed">
          The unified agricultural supply chain and commerce operating system connecting growers, consumers, fleet operators, and governors.
        </p>
        {/* Value Prop Chips */}
        <div className="flex flex-wrap gap-2.5 mt-6">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-lowest text-primary shadow-sm">
            <span className="material-symbols text-base">verified</span>
            <span className="font-label-md text-label-md">Traceable Field-to-Fork</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-lowest text-secondary shadow-sm">
            <span className="material-symbols text-base">shield_with_heart</span>
            <span className="font-label-md text-label-md">Smart Escrow Contracts</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-lowest text-tertiary shadow-sm">
            <span className="material-symbols text-base">local_shipping</span>
            <span className="font-label-md text-label-md">Real-Time Fleet Telematics</span>
          </div>
        </div>
      </div>
      {/* Isometric Supply Chain Diagram (Inline SVG) */}
      <div className="relative z-10 my-8 flex items-center justify-center">
        <svg className="w-full max-w-2xl h-auto drop-shadow-sm select-none" fill="none" viewBox="0 0 760 420" xmlns="http://www.w3.org/2000/svg">
          {/* Background Grid Plane */}
          <g opacity="0.35">
            <path d="M70 210L380 40L690 210L380 380L70 210Z" fill="#E3EFFF" stroke="#BCC9C6" stroke-dasharray="4 4" strokeWidth="1.5"></path>
            <path d="M148 210L380 82L612 210L380 338L148 210Z" fill="#F7F9FF" stroke="#D4E4F8" strokeWidth="1.2"></path>
            <path d="M225 210L380 125L535 210L380 295L225 210Z" fill="#FFFFFF" fillOpacity="0.7"></path>
          </g>
          {/* Interconnection Flow Lines */}
          <path d="M210 240 L380 320 L550 240" stroke="#00685D" strokeDasharray="6 6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
          <path d="M210 240 L380 140 L550 240" stroke="#166289" strokeDasharray="4 4" strokeLinecap="round" strokeWidth="2"></path>
          {/* NODE 1: Precision Cultivation & Granary */}
          <g transform="translate(130, 160)">
            <path d="M80 0 L155 42 L80 84 L5 42 Z" fill="#E3EFFF"></path>
            <path d="M5 42 L80 84 L80 102 L5 60 Z" fill="#D4E4F8"></path>
            <path d="M80 84 L155 42 L155 60 L80 102 Z" fill="#CCDCE0"></path>
            <path d="M50 20 C50 14 74 14 74 20 L74 65 C74 71 50 71 50 65 Z" fill="#00685D"></path>
            <ellipse cx="62" cy="20" fill="#6FD8C8" rx="12" ry="5"></ellipse>
            <path d="M72 10 C72 4 96 4 96 10 L96 55 C96 61 72 61 72 55 Z" fill="#008376"></path>
            <ellipse cx="84" cy="10" fill="#8CF5E4" rx="12" ry="5"></ellipse>
            <path d="M98 48 Q115 57 132 48" stroke="#52B788" strokeLinecap="round" strokeWidth="3.5"></path>
            <path d="M90 56 Q107 65 124 56" stroke="#52B788" strokeLinecap="round" strokeWidth="3.5"></path>
            <path d="M82 64 Q99 73 116 64" stroke="#52B788" strokeLinecap="round" strokeWidth="3.5"></path>
            <circle cx="130" cy="35" fill="#E07A3B" r="4"></circle>
            <path d="M130 39 L130 52" stroke="#E07A3B" strokeWidth="1.5"></path>
            <rect className="shadow-sm" fill="#FFFFFF" height="24" rx="12" width="110" x="25" y="-22"></rect>
            <text fill="#0D1D2B" font-family="Google Sans, Plus Jakarta Sans, sans-serif" fontSize="11" fontWeight="600" textAnchor="middle" x="80" y="-7">FARMLAND IOT</text>
          </g>
          {/* NODE 2: Connected Fleet Telematics */}
          <g transform="translate(305, 245)">
            <path d="M75 0 L150 40 L75 80 L0 40 Z" fill="#DAEAFE"></path>
            <path d="M0 40 L75 80 L75 90 L0 50 Z" fill="#CCDCE0"></path>
            <path d="M75 80 L150 40 L150 50 L75 90 Z" fill="#BCC9C6"></path>
            <path d="M45 28 L100 0 L125 14 L70 42 Z" fill="#166289"></path>
            <path d="M45 28 L70 42 L70 58 L45 44 Z" fill="#004C6E"></path>
            <path d="M70 42 L125 14 L125 30 L70 58 Z" fill="#387BA4"></path>
            <path d="M30 42 L46 34 L56 39 L40 47 Z" fill="#9B4504"></path>
            <path d="M30 42 L40 47 L40 55 L30 50 Z" fill="#6E2F00"></path>
            <ellipse cx="50" cy="53" fill="#0D1D2B" rx="4" ry="5"></ellipse>
            <ellipse cx="64" cy="61" fill="#0D1D2B" rx="4" ry="5"></ellipse>
            <ellipse cx="112" cy="34" fill="#0D1D2B" rx="4" ry="5"></ellipse>
            <circle cx="85" cy="18" fill="#387BA4" fillOpacity="0.2" r="14"></circle>
            <circle cx="85" cy="18" fill="#166289" r="7"></circle>
            <circle cx="85" cy="18" fill="#FFFFFF" r="3"></circle>
            <rect className="shadow-sm" fill="#FFFFFF" height="24" rx="12" width="110" x="20" y="80"></rect>
            <text fill="#0D1D2B" font-family="Google Sans, Plus Jakarta Sans, sans-serif" fontSize="11" fontWeight="600" textAnchor="middle" x="75" y="95">FLEET TRANSIT</text>
          </g>
          {/* NODE 3: Fresh Produce Terminal */}
          <g transform="translate(480, 160)">
            <path d="M75 0 L150 42 L75 84 L0 42 Z" fill="#EDF4FF"></path>
            <path d="M0 42 L75 84 L75 96 L0 54 Z" fill="#D4E4F8"></path>
            <path d="M75 84 L150 42 L150 54 L75 96 Z" fill="#CCDCE0"></path>
            <path d="M40 32 L85 8 L125 30 L80 54 Z" fill="#FFFFFF"></path>
            <path d="M40 32 L80 54 L80 78 L40 56 Z" fill="#FE9251"></path>
            <path d="M80 54 L125 30 L125 54 L80 78 Z" fill="#9B4504"></path>
            <path d="M40 32 L85 8 L85 10 L40 34 Z" fill="#6E2F00"></path>
            <path d="M85 8 L125 30 L123 32 L85 10 Z" fill="#FFB68E"></path>
            <rect fill="#331200" height="14" width="8" x="52" y="52"></rect>
            <rect fill="#331200" height="14" width="8" x="65" y="58"></rect>
            <circle cx="115" cy="20" fill="#52B788" r="8"></circle>
            <path d="M112 20 L114 22 L118 18" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"></path>
            <rect className="shadow-sm" fill="#FFFFFF" height="24" rx="12" width="110" x="25" y="-22"></rect>
            <text fill="#0D1D2B" font-family="Google Sans, Plus Jakarta Sans, sans-serif" fontSize="11" fontWeight="600" textAnchor="middle" x="80" y="-7">TERMINAL &amp; HUB</text>
          </g>
          {/* NODE 4: Cloud Telemetry */}
          <g transform="translate(305, 45)">
            <path d="M75 0 L145 38 L75 76 L5 38 Z" fill="#FFFFFF" fillOpacity="0.95"></path>
            <path d="M5 38 L75 76 L75 80 L5 42 Z" fill="#D4E4F8"></path>
            <path d="M75 76 L145 38 L145 42 L75 80 Z" fill="#BCC9C6"></path>
            <path d="M30 40 L50 30 L70 38 L95 24 L120 32" stroke="#00685D" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
            <circle cx="50" cy="30" fill="#008376" r="3"></circle>
            <circle cx="95" cy="24" fill="#E07A3B" r="3"></circle>
            <circle cx="120" cy="32" fill="#52B788" r="3"></circle>
            <rect className="shadow-sm" fill="#FFFFFF" height="24" rx="12" width="110" x="20" y="-20"></rect>
            <text fill="#0D1D2B" font-family="Google Sans, Plus Jakarta Sans, sans-serif" fontSize="11" fontWeight="600" textAnchor="middle" x="75" y="-5">CLOUD LEDGER</text>
          </g>
        </svg>
      </div>
      {/* Footer Micro-Stats Row */}
      <div className="relative z-10 pt-6 border-t-0 flex flex-wrap items-center justify-between gap-4 text-on-surface-variant">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-primary animate-ping"></div>
          <span className="font-label-md text-label-md text-on-surface">Network Status: <strong className="text-primary font-semibold">Operational (99.98%)</strong></span>
        </div>
        <div className="flex items-center gap-6 font-caption-light text-caption-light">
          <span>Escrow Volume: <strong>$142.8M</strong></span>
          <span>Active Freight: <strong>2,419 T/Hr</strong></span>
          <span>Verified Acres: <strong>1.84M</strong></span>
        </div>
      </div>
    </div>
  );
};

export default Frontispiece;