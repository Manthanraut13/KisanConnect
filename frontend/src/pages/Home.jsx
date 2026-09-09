import { Link } from 'react-router-dom';
import KisanLogo from '../components/brand/KisanLogo';

const Icon = ({ name, className = '' }) => (
  <span className={`material-symbols ${className}`} aria-hidden="true">{name}</span>
);

const TICKER_ITEMS = [
  { icon: 'eco', color: 'text-primary', text: <><strong>Green Valley Farm</strong>: Harvest batch #T-992 (4.2t Heirloom Tomatoes) logged @ 4.0°C • Lab verified</> },
  { icon: 'local_shipping', color: 'text-tertiary', text: <><strong>Carrier Sprinter-12</strong>: Docked at North Metro Terminal • Cold-chain seal tamper-proof</> },
  { icon: 'verified', color: 'text-secondary', text: <><strong>MultiSig Vault-7</strong>: Settled $14,720.00 to Artisan Organics Coop upon automated weighbridge ping</> },
  { icon: 'sensors', color: 'text-primary', text: <><strong>Midwest Silo 04</strong>: Relative humidity 13.1%, protein benchmark 14.8% (Target: ≥14.0%)</> },
];

const PORTALS = [
  {
    to: '/register',
    label: 'Farmer & Cooperative Portal',
    desc: 'Precision harvest tracking, soil moisture telemetry, instant B2B listing creation, and automated milestone-based escrow payouts.',
    icon: 'agriculture',
    badge: 'Grower Mesh',
    badgeBg: 'bg-primary/10',
    badgeText: 'text-primary',
    hoverBorder: 'hover:border-primary',
    hoverText: 'group-hover:text-primary',
    btnHover: 'hover:bg-primary hover:text-on-primary',
    kpi: { label: 'Live Coop Velocity', value: '1,420 Active Batches', sub: '$38.4k Avg Farm MTD Settlement', subColor: 'text-primary' },
    tags: ['Micro-climate sensors', 'Growth phase logs', 'USDA audit ready'],
  },
  {
    to: '/marketplace',
    label: 'Consumer & Wholesale Procurement',
    desc: 'Direct field-to-fork marketplace for retailers, commercial distributors, and grocers with verified crop freshness certificates.',
    icon: 'storefront',
    badge: 'Wholesale Spot',
    badgeBg: 'bg-secondary/10',
    badgeText: 'text-secondary',
    hoverBorder: 'hover:border-secondary',
    hoverText: 'group-hover:text-secondary',
    btnHover: 'hover:bg-secondary hover:text-on-secondary',
    kpi: { label: 'Spot Liquidity Pool', value: '14,820 kg Spot Ready', sub: '6 Verified Lots in 25-mi Radius', subColor: 'text-secondary' },
    tags: ['<24h harvest guarantee', 'Purity certificate', 'Dynamic crate contracts'],
  },
  {
    to: '/login',
    label: 'Fleet Telematics & Dispatch Command',
    desc: 'Live cellular GPS telematics, continuous cold-chain compliance logging (4.0°C baseline), and automated multi-depot weigh manifests.',
    icon: 'local_shipping',
    badge: 'Fleet Telemetry',
    badgeBg: 'bg-tertiary/10',
    badgeText: 'text-tertiary',
    hoverBorder: 'hover:border-tertiary',
    hoverText: 'group-hover:text-tertiary',
    btnHover: 'hover:bg-tertiary hover:text-on-tertiary',
    kpi: { label: 'Network En Route', value: '14 Vehicles Active', sub: '99.8% Reefer Temp Strict Compliance', subColor: 'text-tertiary' },
    tags: ['MQTT Reefer probes', 'eBL bill-of-lading', 'Dynamic intermodal'],
  },
  {
    to: '/login',
    label: 'Platform Governance & Escrow Audit',
    desc: 'Financial clearing reconciliation, chemical purity validation, smart contract multisig governance, and microservice cluster health.',
    icon: 'shield',
    badge: 'Custody Audit',
    badgeBg: 'bg-inverse-surface/10',
    badgeText: 'text-inverse-surface',
    hoverBorder: 'hover:border-primary',
    hoverText: 'group-hover:text-primary',
    btnHover: 'hover:bg-inverse-surface hover:text-inverse-on-surface',
    kpi: { label: 'Secured In Custody', value: '$412.5k In Escrow', sub: '14ms API Latency • 0 Unresolved', subColor: 'text-on-surface-variant' },
    tags: ['Multisig vaults', 'CFTC guidelines', 'Automated dispute triage'],
  },
];

const STEPS = [
  { num: 1, icon: 'potted_plant', title: 'Soil & Cultivation', desc: 'Continuous IoT subsoil sensors record NPK balance, diurnal moisture variation, and organic compliance certificates before harvest tagging.', step: 'Step 01 • Origin', footer1: 'Telemetry: LoRaWAN', footer2: 'Verified Log', color: 'primary' },
  { num: 2, icon: 'science', title: 'Grading & Lab Assay', desc: 'Eurofins & USDA automated digital assays register zero pesticide residue, kernel density benchmarks, and moisture ceilings in under 4 minutes.', step: 'Step 02 • Verification', footer1: 'Grade: US No. 1 Extra', footer2: 'Hash Bonded', color: 'primary' },
  { num: 3, icon: 'thermostat', title: 'Reefer Cold Freight', desc: 'Active MQTT cell links transmit container temperature (3.8°C - 4.2°C) and GPS coordinates every 60 seconds with seal trip alarms.', step: 'Step 03 • Transit', footer1: 'Fleet: Intermodal Reefer', footer2: 'Seal Intact', color: 'tertiary' },
  { num: 4, icon: 'account_balance_wallet', title: 'Buyer Dock & Escrow', desc: 'Digital scale handshake triggers instant automated fund release from escrow straight to farmer cooperative accounts with zero broker cut.', step: 'Step 04 • Custody & Pay', footer1: 'Settlement: ACH / Instant', footer2: '100% Cleared', color: 'secondary' },
];

const LOTS = [
  { name: 'Hard Red Winter Wheat', batch: 'Batch #KC-2025-W11 • Class 1', coop: 'Prairie Valley Grain Coop', volume: '120.0 Tonnes', sub: '4,409 Bushels', quality: '14.2% Protein • 11.8% Moist', qualityIcon: 'verified', state: 'Terminal Silo 02', stateColor: 'tertiary', price: '$282.50', unit: '/t' },
  { name: 'Hydroponic Plum Tomatoes', batch: 'Batch #KC-2025-T92 • Vine Cut', coop: 'San Joaquin Greenhouses LLC', volume: '6,400 kg', sub: '640 Master Cartons', quality: 'USDA Organic • Brix 6.8', qualityIcon: 'eco', state: 'Harvested 3h Ago', stateColor: 'secondary', price: '$1.94', unit: '/kg' },
  { name: 'Hass Avocados (Export Grade)', batch: 'Batch #KC-2025-AV08 • Size 48', coop: 'Central Valley Orchards Collective', volume: '18.5 Tonnes', sub: '1,850 Lug Trays', quality: 'Dry Matter 25.2% • Cold 4.1°C', qualityIcon: 'verified', state: 'Reefer Fleet Unit 09', stateColor: 'tertiary', price: '$3,100.00', unit: '/t' },
];

const CAPABILITIES = [
  { icon: 'lock_clock', color: 'primary', title: 'Cryptographic Escrow Security', desc: 'Wholesale buyer capital is locked in non-custodial multi-signature smart vaults. Funds release strictly when dock weighbridges, assay certificates, and digital bills-of-lading provide verified cryptographic consensus.', footer: 'USDA CFTC Standard Compliant', footerIcon: 'check_circle' },
  { icon: 'sensors', color: 'tertiary', title: 'Precision Cold-Chain Telematics', desc: 'Industrial cellular MQTT sensors maintain constant heartbeat telemetry inside transport reefers. Any continuous 0.5°C breach beyond safe temperature boundaries automatically pauses settlement and alerts insurers.', footer: '0% Perishable Spoilage Target', footerIcon: 'ac_unit' },
  { icon: 'groups', color: 'secondary', title: 'Decentralized Cooperative Mesh', desc: 'Smallholder farms pool volume dynamically through algorithmic cooperative crates. This provides family farmers the pricing power and logistics scale of mega-corporations without giving up individual ownership.', footer: 'Direct Fair Trade Payouts', footerIcon: 'handshake' },
];

const Home = () => {
  return (
    <div className="min-h-screen bg-surface">
      {/* Live Ticker Strip */}
      <div className="w-full bg-surface-container-low border-b border-outline-variant/30 py-2 overflow-hidden select-none">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-10 flex items-center justify-between text-body-sm text-on-surface-variant gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex h-2 w-2 rounded-full bg-primary animate-ping" />
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold">Live Pipeline Stream</span>
          </div>
          <div className="relative w-full overflow-hidden flex items-center">
            <div className="flex items-center gap-8 whitespace-nowrap animate-[marquee_28s_linear_infinite]">
              {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
                <span key={i} className="inline-flex items-center gap-1.5">
                  <Icon name={item.icon} className={`${item.color} text-base`} />
                  {item.text}
                </span>
              ))}
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <span className="font-label-sm text-label-sm text-on-surface-variant">Telemetry Ping: <strong>14ms</strong></span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-surface py-8 md:py-12">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 flex flex-col items-start gap-4">
              {/* Eyebrow Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container shadow-sm border border-outline-variant/30">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
                </span>
                <span className="font-label-sm text-label-sm text-on-surface font-semibold tracking-wide">Unified Agri-Commerce Operating System</span>
                <span className="text-outline-variant font-label-sm">•</span>
                <span className="font-label-sm text-label-sm text-primary font-medium">Cluster US-Central-01 • Escrow Active</span>
              </div>

              {/* Headline */}
              <h1 className="font-display-lg text-display-lg md:text-[48px] md:leading-[54px] text-on-surface tracking-tight font-extrabold">
                Bridging Seed to Supermarket with <span className="text-primary underline decoration-primary/30 underline-offset-8">Traceable Intelligence</span> & Smart Escrow.
              </h1>

              {/* Subtitle */}
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
                A unified digital protocol interconnecting 3,200+ certified regional growers, bulk food cooperatives, cold-chain freight carriers, and institutional food distributors through real-time telemetry and automated settlement.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-1 w-full sm:w-auto">
                <Link to="/register" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg shadow-md hover:bg-primary-container transition-all hover:scale-[1.01] active:scale-[0.99]">
                  <span>Launch Portal Access</span>
                  <Icon name="arrow_forward" className="text-lg" />
                </Link>
                <a href="#market-preview" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-surface-container-lowest text-secondary font-label-lg text-label-lg shadow-sm border border-outline-variant/50 hover:bg-surface-container transition-all">
                  <Icon name="trending_up" className="text-lg" />
                  <span>Explore Live Spot Market</span>
                </a>
              </div>

              {/* Trust Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full pt-4 border-t border-outline-variant/30">
                <div className="flex flex-col">
                  <span className="font-data-metric text-headline-sm md:text-headline-md text-on-surface font-bold tracking-tight">$142.8M</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Escrow Volume</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-data-metric text-headline-sm md:text-headline-md text-primary font-bold tracking-tight">99.98%</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Service Uptime</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-data-metric text-headline-sm md:text-headline-md text-tertiary font-bold tracking-tight">100%</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Cold Monitored</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-data-metric text-headline-sm md:text-headline-md text-secondary font-bold tracking-tight">38.5 min</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Avg Dispatch</span>
                </div>
              </div>
            </div>

            {/* Right: Telemetry Visualizer Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative bg-surface-container-lowest rounded-2xl p-6 shadow-xl border border-outline-variant/40">
                <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
                  <div className="flex items-center gap-2">
                    <Icon name="radar" className="text-primary text-lg" />
                    <span className="font-headline-sm text-headline-sm text-on-surface">Transit Telemetry Matrix</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-label-sm font-label-sm bg-primary/10 text-primary font-medium">Node #418-Active</span>
                </div>
                <div className="py-4 flex flex-col gap-3">
                  {/* Image Placeholder */}
                  <div className="relative h-44 w-full rounded-xl overflow-hidden bg-surface-container-low flex items-center justify-center">
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 via-tertiary/10 to-secondary/20 flex items-center justify-center">
                      <Icon name="local_shipping" className="text-primary text-5xl opacity-40" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-on-surface/80 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-surface-bright">
                      <div className="flex flex-col">
                        <span className="font-label-sm text-label-sm opacity-80">Shipment Code #KC-8841-B</span>
                        <span className="font-headline-sm text-headline-sm font-bold">Midwest Grain • Lot #33</span>
                      </div>
                      <div className="text-right">
                        <span className="font-label-sm text-label-sm opacity-80">Reefer Temp</span>
                        <span className="font-headline-sm text-headline-sm font-bold text-primary-fixed">3.8°C • Target 4.0</span>
                      </div>
                    </div>
                  </div>

                  {/* Sensor Metrics */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-surface-container-low p-2.5 rounded-lg flex flex-col">
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Moisture</span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="font-headline-sm text-headline-sm font-bold text-on-surface">12.4%</span>
                        <span className="text-label-sm text-primary font-semibold">±0.2</span>
                      </div>
                      <svg className="w-full h-5 mt-1 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 100 20">
                        <path d="M0,15 Q25,8 50,12 T100,5" />
                      </svg>
                    </div>
                    <div className="bg-surface-container-low p-2.5 rounded-lg flex flex-col">
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Weight Verified</span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="font-headline-sm text-headline-sm font-bold text-on-surface">24.6t</span>
                        <span className="text-label-sm text-tertiary font-semibold">Scale-02</span>
                      </div>
                      <svg className="w-full h-5 mt-1 text-tertiary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 100 20">
                        <path d="M0,18 Q30,10 60,14 T100,8" />
                      </svg>
                    </div>
                    <div className="bg-surface-container-low p-2.5 rounded-lg flex flex-col">
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Escrow Status</span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="font-headline-sm text-headline-sm font-bold text-secondary">Secured</span>
                      </div>
                      <div className="w-full bg-outline-variant/30 h-1.5 rounded-full mt-2.5 overflow-hidden">
                        <div className="bg-secondary h-full rounded-full w-[85%]" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-3 flex items-center justify-between text-body-sm text-on-surface-variant border-t border-outline-variant/20">
                  <span className="flex items-center gap-1"><Icon name="lock" className="text-base text-primary" /> Multisig Vault 0x48f...92d</span>
                  <span className="text-primary font-label-md font-medium hover:underline inline-flex items-center gap-0.5 cursor-pointer">View Audit Log <Icon name="open_in_new" className="text-sm" /></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Four Role Gateway Portals */}
      <section className="w-full py-12 bg-surface-container-low/50">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-primary/10 text-primary font-label-sm text-label-sm uppercase tracking-wider font-bold">Role Gateways</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">Multi-Tenant Routing</span>
              </div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">Four Dedicated Infrastructure Portals</h2>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">Direct authenticated gateways tailored for agricultural producers, institutional wholesale buyers, fleet haulers, and escrow auditors.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {PORTALS.map((p) => (
              <Link key={p.label} to={p.to} className={`group relative bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between ${p.hoverBorder}`}>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-xl ${p.badgeBg} flex items-center justify-center ${p.badgeText} group-hover:scale-105 transition-transform`}>
                      <Icon name={p.icon} className="text-[28px]" />
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-label-sm font-label-sm ${p.badgeBg} ${p.badgeText} font-semibold`}>{p.badge}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className={`font-headline-sm text-headline-sm text-on-surface font-bold ${p.hoverText} transition-colors`}>{p.label}</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">{p.desc}</p>
                  </div>
                  <div className="bg-surface-container-low p-3 rounded-xl flex flex-col gap-1 border border-outline-variant/20">
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-medium">{p.kpi.label}</span>
                    <span className="font-headline-sm text-headline-sm font-bold text-on-surface">{p.kpi.value}</span>
                    <span className={`font-body-sm text-body-sm ${p.kpi.subColor} font-medium`}>{p.kpi.sub}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {p.tags.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant text-xs">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="pt-6">
                  <span className={`w-full inline-flex items-center justify-between px-4 py-2.5 rounded-lg bg-surface-container ${p.btnHover} text-on-surface font-label-lg text-label-lg transition-colors group/btn`}>
                    <span>Enter Portal</span>
                    <Icon name="arrow_forward" className="text-lg group-hover/btn:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Supply Chain Lifecycle */}
      <section className="w-full py-12 bg-surface border-y border-outline-variant/30">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-10">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm uppercase tracking-wider font-bold">End-to-End Traceability</span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold mt-2">Physical Commodity Custody Lifecycle</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">Every harvest batch is cryptographically bonded to IoT telemetry from soil probe readings through terminal dock release.</p>
          </div>
          <div className="relative w-full">
            <div className="hidden lg:block absolute top-1/2 left-10 right-10 h-1 bg-gradient-to-r from-primary via-tertiary to-secondary -translate-y-1/2 z-0 opacity-40" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
              {STEPS.map((s) => (
                <div key={s.num} className={`bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/50 shadow-sm flex flex-col gap-3 hover:border-${s.color} transition-colors`}>
                  <div className="flex items-center justify-between">
                    <span className={`w-8 h-8 rounded-full bg-${s.color} text-on-${s.color} flex items-center justify-center font-label-lg font-bold`}>{s.num}</span>
                    <Icon name={s.icon} className={`text-${s.color} text-2xl`} />
                  </div>
                  <div className="flex flex-col">
                    <span className={`font-label-sm text-label-sm text-${s.color} uppercase font-bold`}>{s.step}</span>
                    <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold">{s.title}</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{s.desc}</p>
                  </div>
                  <div className="mt-auto pt-2 border-t border-outline-variant/20 flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant">
                    <span>{s.footer1}</span>
                    <span className={`text-${s.color} font-semibold`}>{s.footer2}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Live Spot Market */}
      <section className="w-full py-12 bg-surface" id="market-preview">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
            <div>
              <span className="px-2.5 py-1 rounded bg-secondary/10 text-secondary font-label-sm text-label-sm uppercase tracking-wider font-bold">Spot Terminal</span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold mt-1">Live Spot Agricultural Lots</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Physical lots currently available for immediate dispatch or warehouse delivery.</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-medium">All Commodities</button>
              <button className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm">Grains & Pulses</button>
              <button className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm">Organic Perishables</button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-outline-variant/40 bg-surface-container-lowest shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container text-on-surface-variant font-label-md text-label-md uppercase tracking-wider border-b border-outline-variant/30">
                  <th className="py-3 px-4 font-semibold">Lot & Commodity</th>
                  <th className="py-3 px-4 font-semibold">Producer / Coop</th>
                  <th className="py-3 px-4 font-semibold">Volume (Net)</th>
                  <th className="py-3 px-4 font-semibold">Purity & Quality</th>
                  <th className="py-3 px-4 font-semibold">Transit State</th>
                  <th className="py-3 px-4 font-semibold">Unit Price</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 font-body-md text-body-md text-on-surface">
                {LOTS.map((lot) => (
                  <tr key={lot.name} className="hover:bg-surface-container-low/60 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-surface-container flex items-center justify-center">
                          <Icon name="inventory_2" className="text-on-surface-variant" />
                        </div>
                        <div>
                          <span className="font-headline-sm text-[15px] font-bold text-on-surface block">{lot.name}</span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant">{lot.batch}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-medium">{lot.coop}</td>
                    <td className="py-4 px-4">
                      <span className="font-bold">{lot.volume}</span>
                      <span className="block font-body-sm text-body-sm text-on-surface-variant">{lot.sub}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-label-sm font-semibold">
                        <Icon name={lot.qualityIcon} className="text-sm" /> {lot.quality}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-${lot.stateColor}/10 text-${lot.stateColor} font-label-sm font-medium`}>
                        <span className={`w-1.5 h-1.5 rounded-full bg-${lot.stateColor} animate-pulse`} /> {lot.state}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-on-surface">{lot.price}</span> <span className="text-body-sm text-on-surface-variant">{lot.unit}</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button className="px-3.5 py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-colors shadow-sm">Initiate Escrow</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Platform Capabilities */}
      <section className="w-full py-12 bg-surface-container-low/40">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-10">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm uppercase tracking-wider font-bold">Institutional Reliability</span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold mt-2">Zero-Counterparty Risk Architecture</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Built to handle high-stakes grain forward contracts and perishable deliveries with absolute physical and cryptographic certainty.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CAPABILITIES.map((c) => (
              <div key={c.title} className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-sm flex flex-col gap-3">
                <div className={`w-12 h-12 rounded-xl bg-${c.color}/10 text-${c.color} flex items-center justify-center`}>
                  <Icon name={c.icon} className="text-[28px]" />
                </div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">{c.title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">{c.desc}</p>
                <div className="mt-auto pt-2 flex items-center gap-2 text-primary font-label-md font-medium">
                  <span>{c.footer}</span>
                  <Icon name={c.footerIcon} className="text-base" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Network Health Bar */}
      <section className="w-full py-6 bg-surface border-t border-outline-variant/30">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
              </span>
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">Agri-Grid Protocol Network Engine</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">All Core Subsystems Fully Synchronized</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {['REST API: 99.99% (12ms)', 'Sharded ColdDB: Synced', 'MQTT Reefer Brokers: Active', 'Smart Escrow: Operational'].map((s) => (
                <div key={s} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest text-on-surface text-label-sm font-label-sm border border-outline-variant/30">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="w-full py-12 bg-surface-container-lowest border-t border-outline-variant/40">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-10 text-center">
          <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold mb-3">Join the Unified Agri-Grid</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-8">Create your portal node in under 2 minutes. Start trading, dispatching, or auditing with full custody-chain traceability.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg shadow-md hover:bg-primary-container transition-all">
              <span>Create Free Account</span>
              <Icon name="arrow_forward" className="text-lg" />
            </Link>
            <Link to="/marketplace" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg bg-surface-container-lowest text-on-surface font-label-lg text-label-lg shadow-sm border border-outline-variant/50 hover:bg-surface-container transition-all">
              <Icon name="shopping_cart" className="text-lg" />
              <span>Explore Marketplace</span>
            </Link>
          </div>
          <div className="mt-6 flex items-center justify-center gap-6 font-label-sm text-label-sm text-on-surface-variant">
            <span className="flex items-center gap-1"><Icon name="verified_user" className="text-base text-primary" /> FSA & CFTC Compliant</span>
            <span className="flex items-center gap-1"><Icon name="lock" className="text-base text-primary" /> 256-bit Encrypted</span>
            <span className="flex items-center gap-1"><Icon name="support_agent" className="text-base text-primary" /> 24/7 Support</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
