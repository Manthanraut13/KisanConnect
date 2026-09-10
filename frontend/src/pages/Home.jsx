import { Link } from 'react-router-dom';

const Icon = ({ name, className = '' }) => (
  <span className={`material-symbols ${className}`} aria-hidden="true">{name}</span>
);

const TICKER_ITEMS = [
  { icon: 'agriculture', color: 'text-primary', text: <><strong>Smart India Hackathon 2026</strong> • Problem Statement SIH26033</> },
  { icon: 'storefront', color: 'text-secondary', text: <><strong>20 crops</strong> • Tomato, Onion, Rice, Wheat, Maize, Chilli, Banana, Mango and more</> },
  { icon: 'location_on', color: 'text-tertiary', text: <><strong>10 districts</strong> across 8 states • Nashik, Pune, Amritsar, Coimbatore, Mysuru, Indore and more</> },
  { icon: 'query_stats', color: 'text-primary', text: <><strong>Agmarknet price data</strong> • Jan 2024 – Aug 2026, ~180,000 rows</> },
];

const PORTALS = [
  {
    to: '/register',
    label: 'Farmer & FPO Portal',
    desc: 'Register, list produce with photo, quantity and harvest date, get an AI-suggested fair price, and sell directly — no middlemen.',
    icon: 'agriculture',
    badge: 'Farmer',
    badgeBg: 'bg-primary/10',
    badgeText: 'text-primary',
    hoverBorder: 'hover:border-primary',
    hoverText: 'group-hover:text-primary',
    btnHover: 'hover:bg-primary hover:text-on-primary',
    kpi: { label: 'What you get', value: 'Fair price, direct sale', sub: 'AI price suggestion at listing time', subColor: 'text-primary' },
    tags: ['Produce listing', 'AI price advisory', 'Escrow-protected payout'],
  },
  {
    to: '/marketplace',
    label: 'Consumer & Bulk Buyer Portal',
    desc: 'Browse fresh produce from verified farmers, filter by crop and location, order retail or bulk, and track delivery to your doorstep.',
    icon: 'storefront',
    badge: 'Buyer',
    badgeBg: 'bg-secondary/10',
    badgeText: 'text-secondary',
    hoverBorder: 'hover:border-secondary',
    hoverText: 'group-hover:text-secondary',
    btnHover: 'hover:bg-secondary hover:text-on-secondary',
    kpi: { label: 'What you get', value: 'Fresh produce, lower price', sub: 'Flat ₹30 delivery, no GST markup', subColor: 'text-secondary' },
    tags: ['Browse & filter', 'Bulk order requests', 'Order tracking'],
  },
  {
    to: '/login',
    label: 'Logistics Partner Portal',
    desc: 'Get AI-clustered, route-optimized delivery assignments, navigate with the driver app, and earn 80% of every delivery charge.',
    icon: 'local_shipping',
    badge: 'Logistics',
    badgeBg: 'bg-tertiary/10',
    badgeText: 'text-tertiary',
    hoverBorder: 'hover:border-tertiary',
    hoverText: 'group-hover:text-tertiary',
    btnHover: 'hover:bg-tertiary hover:text-on-tertiary',
    kpi: { label: 'What you get', value: 'Optimised routes', sub: 'K-Means clustering + greedy TSP routing', subColor: 'text-tertiary' },
    tags: ['Route optimization', 'Proof of delivery', '80% delivery earnings'],
  },
  {
    to: '/login',
    label: 'Admin & Governance Portal',
    desc: 'Manage users, listings and orders, review analytics, and resolve farmer and buyer grievances within a 48-hour SLA.',
    icon: 'shield',
    badge: 'Admin',
    badgeBg: 'bg-inverse-surface/10',
    badgeText: 'text-inverse-surface',
    hoverBorder: 'hover:border-primary',
    hoverText: 'group-hover:text-primary',
    btnHover: 'hover:bg-inverse-surface hover:text-inverse-on-surface',
    kpi: { label: 'What you get', value: 'Full platform control', sub: 'Grievance redressal with 48-hour SLA', subColor: 'text-on-surface-variant' },
    tags: ['User management', 'Order analytics', 'Grievance redressal'],
  },
];

const STEPS = [
  { num: 1, icon: 'potted_plant', title: 'Farmer Lists Produce', desc: 'A farmer or FPO registers, uploads produce photos, and sets quantity, price, harvest date and location. The AI suggests a fair price based on Agmarknet market data.', step: 'Step 01', footer1: 'Role: Farmer / FPO', footer2: 'AI price aid', color: 'primary' },
  { num: 2, icon: 'shopping_basket', title: 'Buyer Places Order', desc: 'Consumers browse and order retail; bulk buyers post requirements with quantity and delivery date. AI matches bulk requests to suitable FPOs and farmers.', step: 'Step 02', footer1: 'Role: Consumer / Bulk Buyer', footer2: 'Direct connection', color: 'secondary' },
  { num: 3, icon: 'local_shipping', title: 'Route-Optimized Delivery', desc: 'Orders are clustered by pin code, an optimal route is generated, and the nearest logistics partner is assigned. Deliveries are tracked until proof of delivery is captured.', step: 'Step 03', footer1: 'Role: Logistics Partner', footer2: 'AI routing', color: 'tertiary' },
  { num: 4, icon: 'account_balance_wallet', title: 'Payment Is Released', desc: 'Payment via Razorpay is held until delivery is confirmed, then released directly to the farmer. The farmer keeps the full price — no broker cuts.', step: 'Step 04', footer1: 'Razorpay secure', footer2: 'Escrow hold', color: 'primary' },
];

const CROPS = ['Tomato', 'Onion', 'Potato', 'Rice', 'Wheat', 'Maize', 'Chilli', 'Turmeric', 'Banana', 'Mango', 'Brinjal', 'Cabbage', 'Cauliflower', 'Garlic', 'Ginger', 'Groundnut', 'Soyabean', 'Coconut', 'Sugarcane', 'Cotton'];

const DISTRICTS = ['Nashik', 'Pune', 'Amritsar', 'Ludhiana', 'Coimbatore', 'Mysuru', 'Guntur', 'Jaipur', 'Indore', 'Varanasi'];

const CAPABILITIES = [
  { icon: 'query_stats', color: 'primary', title: 'AI Demand Forecasting', desc: 'Prophet-based demand prediction for 20 crops across 10 districts, run daily for all 200 combinations. Helps farmers grow the right crops at the right time.', footer: '200 combinations daily', footerIcon: 'calendar_month' },
  { icon: 'alt_route', color: 'tertiary', title: 'AI Route Optimization', desc: 'Orders are clustered by pin code using K-Means, routed with a greedy TSP solver over Haversine distance, and assigned to the nearest available logistics partner.', footer: 'Kicks in above 5 orders', footerIcon: 'route' },
  { icon: 'support_agent', color: 'secondary', title: 'Kisan Mitra — AI Chatbot', desc: 'A Hindi and English chatbot powered by Groq (LLaMA 3.1 8B) answers farmer, consumer and logistics queries — with voice navigation planned via Bhashini.', footer: 'Hindi + English', footerIcon: 'translate' },
];

const STACK = ['React 18 + Vite', 'Node.js + Express', 'PostgreSQL (Supabase)', 'Redis (Upstash)', 'AI Service (Python + Prophet)', 'Razorpay Payments'];

const Home = () => {
  return (
    <div className="min-h-screen bg-surface">
      {/* Platform Facts Strip */}
      <div className="w-full bg-surface-container-low border-b border-outline-variant/30 py-2 overflow-hidden select-none">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-10 flex items-center justify-between text-body-sm text-on-surface-variant gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex h-2 w-2 rounded-full bg-primary animate-ping" />
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold">Platform Facts</span>
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
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-surface py-8 md:py-12">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 flex flex-col items-start gap-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container shadow-sm border border-outline-variant/30">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
                </span>
                <span className="font-label-sm text-label-sm text-on-surface font-semibold tracking-wide">Smart India Hackathon 2026</span>
                <span className="text-outline-variant font-label-sm">•</span>
                <span className="font-label-sm text-label-sm text-primary font-medium">PS ID: SIH26033</span>
              </div>

              <h1 className="font-display-lg text-display-lg md:text-[48px] md:leading-[54px] text-on-surface tracking-tight font-extrabold">
                Khet Se Ghar Tak — direct from <span className="text-primary underline decoration-primary/30 underline-offset-8">farm to your table</span>.
              </h1>

              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
                An AI-powered digital marketplace that connects farmers and Farmer Producer Organizations directly with consumers and bulk buyers — eliminating the 10–12 layers of middlemen that take 70–85% of what you pay.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-1 w-full sm:w-auto">
                <Link to="/register" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg shadow-md hover:bg-primary-container transition-all hover:scale-[1.01] active:scale-[0.99]">
                  <span>Get Started Free</span>
                  <Icon name="arrow_forward" className="text-lg" />
                </Link>
                <a href="#coverage" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-surface-container-lowest text-secondary font-label-lg text-label-lg shadow-sm border border-outline-variant/50 hover:bg-surface-container transition-all">
                  <Icon name="trending_up" className="text-lg" />
                  <span>Explore Live Mandi Coverage</span>
                </a>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full pt-4 border-t border-outline-variant/30">
                <div className="flex flex-col">
                  <span className="font-data-metric text-headline-sm md:text-headline-md text-on-surface font-bold tracking-tight">86%</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Small & marginal farmers in India</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-data-metric text-headline-sm md:text-headline-md text-primary font-bold tracking-tight">15–30%</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Farmer share of consumer price today</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-data-metric text-headline-sm md:text-headline-md text-tertiary font-bold tracking-tight">10–12</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Layers of middlemen removed</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-data-metric text-headline-sm md:text-headline-md text-secondary font-bold tracking-tight">16–18%</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Produce lost to inefficient logistics</span>
                </div>
              </div>
            </div>

            {/* AI Intelligence Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative bg-surface-container-lowest rounded-2xl p-6 shadow-xl border border-outline-variant/40">
                <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
                  <div className="flex items-center gap-2">
                    <Icon name="query_stats" className="text-primary text-lg" />
                    <span className="font-headline-sm text-headline-sm text-on-surface">AI Price &amp; Demand Intelligence</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-label-sm font-label-sm bg-primary/10 text-primary font-medium">Agmarknet</span>
                </div>
                <div className="py-4 flex flex-col gap-3">
                  <div className="relative h-44 w-full rounded-xl overflow-hidden bg-surface-container-low flex items-center justify-center">
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 via-tertiary/10 to-secondary/20 flex items-center justify-center flex-col gap-2">
                      <Icon name="monitoring" className="text-primary text-5xl opacity-40" />
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Daily forecast pipeline</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-surface-container-low p-2.5 rounded-lg flex flex-col">
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Crops covered</span>
                      <div className="mt-0.5">
                        <span className="font-headline-sm text-headline-sm font-bold text-on-surface">20</span>
                      </div>
                      <span className="text-label-sm text-primary font-semibold mt-1">20 crop types</span>
                    </div>
                    <div className="bg-surface-container-low p-2.5 rounded-lg flex flex-col">
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Districts</span>
                      <div className="mt-0.5">
                        <span className="font-headline-sm text-headline-sm font-bold text-on-surface">10</span>
                      </div>
                      <span className="text-label-sm text-tertiary font-semibold mt-1">across 8 states</span>
                    </div>
                    <div className="bg-surface-container-low p-2.5 rounded-lg flex flex-col">
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Forecast window</span>
                      <div className="mt-0.5">
                        <span className="font-headline-sm text-headline-sm font-bold text-secondary">7-day</span>
                      </div>
                      <span className="text-label-sm text-secondary font-semibold mt-1">Prophet model</span>
                    </div>
                  </div>
                </div>
                <div className="pt-3 flex items-center justify-between text-body-sm text-on-surface-variant border-t border-outline-variant/20">
                  <span className="flex items-center gap-1"><Icon name="dataset" className="text-base text-primary" /> Gov. mandi price source</span>
                  <span className="text-primary font-label-md font-medium hover:underline inline-flex items-center gap-0.5 cursor-pointer">Price method <Icon name="open_in_new" className="text-sm" /></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Four Role Portals */}
      <section className="w-full py-12 bg-surface-container-low/50">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-primary/10 text-primary font-label-sm text-label-sm uppercase tracking-wider font-bold">Role Portals</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">One platform, four roles</span>
              </div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">Built for Every Stakeholder</h2>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">Dedicated entry points for farmers, buyers, logistics partners, and platform admins — each with the tools their workflow needs.</p>
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

      {/* How It Works */}
      <section className="w-full py-12 bg-surface border-y border-outline-variant/30">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-10">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm uppercase tracking-wider font-bold">How It Works</span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold mt-2">From Listing to Direct Payment</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">Four simple steps that take produce from a farmer's harvest to your table — and the full price back to the farmer.</p>
          </div>
          <div className="relative w-full">
            <div className="hidden lg:block absolute top-1/2 left-10 right-10 h-1 bg-gradient-to-r from-primary via-tertiary to-secondary -translate-y-1/2 z-0 opacity-40" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
              {STEPS.map((s) => (
                <div key={s.num} className={`bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/50 shadow-sm flex flex-col gap-3 ${s.color === 'primary' ? 'hover:border-primary' : s.color === 'tertiary' ? 'hover:border-tertiary' : 'hover:border-secondary'} transition-colors`}>
                  <div className="flex items-center justify-between">
                    <span className={`${s.color === 'primary' ? 'bg-primary text-on-primary' : s.color === 'tertiary' ? 'bg-tertiary text-on-tertiary' : 'bg-secondary text-on-secondary'} w-8 h-8 rounded-full flex items-center justify-center font-label-lg font-bold`}>{s.num}</span>
                    <Icon name={s.icon} className={`${s.color === 'primary' ? 'text-primary' : s.color === 'tertiary' ? 'text-tertiary' : 'text-secondary'} text-2xl`} />
                  </div>
                  <div className="flex flex-col">
                    <span className={`${s.color === 'primary' ? 'text-primary' : s.color === 'tertiary' ? 'text-tertiary' : 'text-secondary'} font-label-sm text-label-sm uppercase font-bold`}>{s.step}</span>
                    <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold">{s.title}</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{s.desc}</p>
                  </div>
                  <div className="mt-auto pt-2 border-t border-outline-variant/20 flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant">
                    <span>{s.footer1}</span>
                    <span className={`${s.color === 'primary' ? 'text-primary' : s.color === 'tertiary' ? 'text-tertiary' : 'text-secondary'} font-semibold`}>{s.footer2}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mandi Coverage */}
      <section className="w-full py-12 bg-surface" id="coverage">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
            <div>
              <span className="px-2.5 py-1 rounded bg-secondary/10 text-secondary font-label-sm text-label-sm uppercase tracking-wider font-bold">Live Mandi Coverage</span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold mt-1">20 Crops Tracked Across 10 Districts</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Price and demand intelligence sourced from Agmarknet, the Government of India mandi price system.</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-outline-variant/40 bg-surface-container-lowest shadow-sm">
            <div className="p-6">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Commodities covered</span>
              <div className="flex flex-wrap gap-2 mt-3">
                {CROPS.map((c) => (
                  <span key={c} className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md border border-outline-variant/30">{c}</span>
                ))}
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold block mt-6">Mandi districts</span>
              <div className="flex flex-wrap gap-2 mt-3">
                {DISTRICTS.map((d) => (
                  <span key={d} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-label-md text-label-md">
                    <Icon name="location_on" className="text-base" /> {d}
                  </span>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-outline-variant/20 flex flex-wrap items-center gap-4 text-body-sm text-on-surface-variant">
                <span className="flex items-center gap-1.5"><Icon name="verified" className="text-primary text-base" /> Govt. of India data source</span>
                <span className="flex items-center gap-1.5"><Icon name="sync" className="text-tertiary text-base" /> Daily forecast updates</span>
                <span className="flex items-center gap-1.5"><Icon name="payments" className="text-secondary text-base" /> Prices in ₹ per quintal</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Capabilities */}
      <section className="w-full py-12 bg-surface-container-low/40">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-10">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm uppercase tracking-wider font-bold">AI-Powered Platform</span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold mt-2">Intelligence Built Into Every Step</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">From price advice at listing time to route planning at dispatch, AI works quietly in the background to get everyone a better deal.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CAPABILITIES.map((c) => (
              <div key={c.title} className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-sm flex flex-col gap-3">
                <div className={`${c.color === 'primary' ? 'bg-primary/10 text-primary' : c.color === 'tertiary' ? 'bg-tertiary/10 text-tertiary' : 'bg-secondary/10 text-secondary'} w-12 h-12 rounded-xl flex items-center justify-center`}>
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

      {/* Tech Stack */}
      <section className="w-full py-6 bg-surface border-t border-outline-variant/30">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
              </span>
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">Technology Stack</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Open-source, free-tier friendly</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {STACK.map((s) => (
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
          <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold mb-3">Join the direct farm-to-market movement</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-8">Create your account in under two minutes. Whether you farm, buy in bulk, or deliver — take the middlemen out of your trade.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg shadow-md hover:bg-primary-container transition-all">
              <span>Create Free Account</span>
              <Icon name="arrow_forward" className="text-lg" />
            </Link>
            <Link to="/marketplace" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg bg-surface-container-lowest text-on-surface font-label-lg text-label-lg shadow-sm border border-outline-variant/50 hover:bg-surface-container transition-all">
              <Icon name="shopping_cart" className="text-lg" />
              <span>Browse Marketplace</span>
            </Link>
          </div>
          <div className="mt-6 flex items-center justify-center gap-6 font-label-sm text-label-sm text-on-surface-variant">
            <span className="flex items-center gap-1"><Icon name="agriculture" className="text-base text-primary" /> Ministry: Consumer Affairs (DoCA)</span>
            <span className="flex items-center gap-1"><Icon name="verified_user" className="text-base text-primary" /> Aadhaar OTP verification</span>
            <span className="flex items-center gap-1"><Icon name="translate" className="text-base text-primary" /> हिंदी + English</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;