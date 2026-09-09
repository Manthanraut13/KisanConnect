import { Link } from 'react-router-dom';
import KisanLogo from '../components/brand/KisanLogo';

const Icon = ({ name }) => <span className="material-symbols" aria-hidden="true">{name}</span>;

const PORTALS = [
  {
    to: '/marketplace',
    label: 'Consumer Procurement',
    desc: 'Buy quality-graded farm produce sourced straight from origin, with custody-tracked delivery.',
    icon: 'shopping_basket',
    tone: 'bg-primary text-on-primary',
  },
  {
    to: '/register',
    label: 'Farmer Portal',
    desc: 'Profile your farm, list harvests, get AI demand forecasts and settle payouts in escrow.',
    icon: 'styler',
    tone: 'bg-secondary-container text-on-secondary-container',
  },
  {
    to: '/login',
    label: 'Logistics & Custody',
    desc: 'Dispatch, telematics and delivery commands for the driver fleet across every district.',
    icon: 'local_shipping',
    tone: 'bg-tertiary-container text-on-tertiary-container',
  },
  {
    to: '/login',
    label: 'Platform Governance',
    desc: 'Users, orders, grievances and analytics — the admin command center for the ecosystem.',
    icon: 'admin_panel_settings',
    tone: 'bg-surface-container text-on-surface-variant',
  },
];

const STEPS = [
  { icon: 'storefront', title: 'Browse Fresh Produce', desc: 'Browse farmer listings, filter by category, grade and price, and compare transparently.' },
  { icon: 'verified', title: 'Quality-Graded Lots', desc: 'Every lot carries a quality grade and origin trace, so you know exactly what you buy.' },
  { icon: 'delivery_dining', title: 'Tracked Delivery', desc: 'Dispatch is custody-tracked through the fleet. Follow your order at every step.' },
];

const FEATURES = [
  { icon: 'phishing', title: 'No Middlemen', desc: 'Farmers sell directly. Better prices for buyers, more earnings for growers.' },
  { icon: 'insights', title: 'AI-Powered Pricing', desc: 'Demand forecasts and price advisory based on market trends and weather.' },
  { icon: 'qr_code_2', title: 'Traceability', desc: 'Every batch traceable from farm gate to your doorstep.' },
  { icon: 'savings', title: 'Escrow Settlement', desc: 'Farmer payouts are escrow-protected until delivery is confirmed.' },
];

const Home = () => {
  return (
    <div className="min-h-screen bg-surface">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-container to-tertiary-container">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-surface-lowest/10" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full bg-on-primary/10" />
        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <KisanLogo size={52} className="bg-surface-lowest/20 ring-1 ring-surface-lowest/40 rounded-2xl p-1.5" />
            <span className="text-left leading-tight">
              <span className="block text-2xl font-bold tracking-tight text-on-primary-container">Kisan Connect</span>
              <span className="block text-[0.65rem] font-medium tracking-[0.22em] uppercase text-on-primary-container/75">Commodity Logistics</span>
            </span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold leading-[1.05] tracking-tight text-on-primary-container max-w-3xl mx-auto">
            One ecosystem, farm to shelf.
          </h1>
          <p className="mt-5 text-lg sm:text-xl font-light text-on-primary-container/85 max-w-2xl mx-auto">
            Trade fresh farm produce, track custody through dispatch, and run every portal —
            farmer, consumer, logistics and governance — from a single trusted platform.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-3.5 bg-on-primary-container text-primary rounded-full font-semibold text-base hover:bg-surface-lowest transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              to="/marketplace"
              className="px-8 py-3.5 rounded-full ring-1 ring-inset ring-on-primary-container/50 text-on-primary-container font-semibold text-base hover:bg-on-primary/10 transition-colors"
            >
              Browse Marketplace
            </Link>
          </div>
        </div>
      </section>

      {/* Portal cards */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-3xl font-bold tracking-tight text-on-surface text-center mb-3">One platform. Four portals.</h2>
        <p className="text-on-surface-variant text-center mb-10">Pick your workspace and continue to your portal.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PORTALS.map((p) => (
            <Link
              key={p.label}
              to={p.to}
              className="group rounded-3xl bg-surface-lowest ring-1 ring-outline-variant/60 shadow-card p-6 hover:shadow-card-hover hover:-translate-y-[3px] transition-all"
            >
              <span className={`inline-flex h-12 w-12 rounded-2xl items-center justify-center mb-4 ${p.tone} group-hover:scale-110 transition-transform`}>
                <Icon name={p.icon} />
              </span>
              <h3 className="text-lg font-bold tracking-tight text-on-surface mb-1.5">{p.label}</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">{p.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                Enter portal <Icon name="arrow_forward" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-surface-low py-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight text-on-surface text-center mb-10">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((s, i) => (
              <div key={s.title} className="text-center px-4">
                <div className="relative mx-auto w-16 h-16 bg-surface-container rounded-2xl flex items-center justify-center text-primary mb-4">
                  <Icon name={s.icon} />
                  <span className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-primary text-on-primary text-sm font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-xl font-bold tracking-tight text-on-surface mb-2">{s.title}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-3xl font-bold tracking-tight text-on-surface text-center mb-10">Why Kisan Connect?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-3xl bg-surface-lowest ring-1 ring-outline-variant/60 shadow-card p-6">
              <span className="inline-flex h-11 w-11 rounded-xl bg-primary-container/15 text-primary items-center justify-center mb-4">
                <Icon name={f.icon} />
              </span>
              <h3 className="text-base font-bold tracking-tight text-on-surface mb-1.5">{f.title}</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-on-primary mb-3">Ready to start?</h2>
          <p className="text-on-primary/85 text-lg mb-8">Join the ecosystem — fresh produce, fair prices, trusted logistics.</p>
          <Link
            to="/register"
            className="inline-block px-8 py-3.5 bg-on-primary text-primary rounded-full font-semibold text-base hover:bg-on-primary-container transition-colors"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-on-surface text-on-primary/85 py-12">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <KisanLogo size={32} />
                <span className="text-xl font-bold tracking-tight text-on-primary">Kisan Connect</span>
              </div>
              <p className="text-sm text-on-primary/70">
                Direct farm-to-consumer marketplace with custody-tracked logistics. Empowering farmers, serving consumers.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-on-primary mb-4">For Consumers</h4>
              <ul className="space-y-2 text-sm text-on-primary/70">
                <li><Link to="/register" className="hover:text-on-primary">Sign Up</Link></li>
                <li><Link to="/login" className="hover:text-on-primary">Login</Link></li>
                <li><Link to="/marketplace" className="hover:text-on-primary">Browse Market</Link></li>
                <li><Link to="/orders" className="hover:text-on-primary">Track Orders</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-on-primary mb-4">Portals</h4>
              <ul className="space-y-2 text-sm text-on-primary/70">
                <li><Link to="/register" className="hover:text-on-primary">Farmer Portal</Link></li>
                <li><Link to="/marketplace" className="hover:text-on-primary">Consumer Market</Link></li>
                <li><Link to="/login" className="hover:text-on-primary">Driver Dispatch</Link></li>
                <li><Link to="/support" className="hover:text-on-primary">Support Center</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-on-primary mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-on-primary/70">
                <li>support@kisanconnect.in</li>
                <li>WhatsApp: +91 98765 43210</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-on-primary/15 mt-8 pt-8 text-center text-sm text-on-primary/60">
            <p>© 2026 Kisan Connect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;