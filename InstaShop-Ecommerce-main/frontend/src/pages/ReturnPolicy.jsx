import { HiArrowLeft, HiRefresh, HiClock, HiCheckCircle, HiXCircle } from 'react-icons/hi';
import { Link } from 'react-router-dom';

export default function ReturnPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fadeIn">
      <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 no-underline text-sm"><HiArrowLeft /> Back to Home</Link>
      <h1 className="text-3xl font-bold text-white mb-8">Return Policy</h1>
      <div className="glass rounded-xl p-8 space-y-6 text-gray-300 text-sm leading-relaxed">
        {/* Highlight */}
        <div className="rounded-xl p-5 text-center" style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(0,217,166,0.1))', border: '1px solid rgba(108,99,255,0.2)' }}>
          <HiRefresh className="text-4xl text-primary mx-auto mb-2" />
          <h2 className="text-xl font-bold text-white mb-1">7-Day Easy Returns</h2>
          <p className="text-gray-300">We offer a hassle-free 7-day return window on all purchases.</p>
        </div>

        <section><h2 className="text-xl font-semibold text-white mb-3">Return Eligibility</h2>
          <ul className="space-y-2">
            <li className="flex items-start gap-2"><HiCheckCircle className="text-success mt-0.5 flex-shrink-0" /> Products can be returned within <strong className="text-white">7 days</strong> from the date of purchase.</li>
            <li className="flex items-start gap-2"><HiCheckCircle className="text-success mt-0.5 flex-shrink-0" /> Item must be unused, in original packaging, with all tags attached.</li>
            <li className="flex items-start gap-2"><HiCheckCircle className="text-success mt-0.5 flex-shrink-0" /> A valid reason must be provided when requesting a return.</li>
          </ul>
        </section>

        <section><h2 className="text-xl font-semibold text-white mb-3">How to Request a Return</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3"><span className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">1</span><p>Go to your <Link to="/orders" className="text-primary no-underline">Orders</Link> page and find the order you wish to return.</p></div>
            <div className="flex items-start gap-3"><span className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">2</span><p>Click "Request Return" and provide a reason for the return.</p></div>
            <div className="flex items-start gap-3"><span className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">3</span><p>Our team will review your request within 48 hours.</p></div>
            <div className="flex items-start gap-3"><span className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">4</span><p>Once approved, a full refund will be processed to your original payment method within 5-7 business days.</p></div>
          </div>
        </section>

        <section><h2 className="text-xl font-semibold text-white mb-3">Non-Returnable Items</h2>
          <ul className="space-y-2">
            <li className="flex items-start gap-2"><HiXCircle className="text-error mt-0.5 flex-shrink-0" /> Items purchased more than 7 days ago.</li>
            <li className="flex items-start gap-2"><HiXCircle className="text-error mt-0.5 flex-shrink-0" /> Used, damaged, or items without original packaging.</li>
            <li className="flex items-start gap-2"><HiXCircle className="text-error mt-0.5 flex-shrink-0" /> Items marked as "Final Sale" or "Non-Returnable".</li>
          </ul>
        </section>

        <p className="text-gray-500 text-xs pt-4 border-t border-white/10">Last updated: March 2026</p>
      </div>
    </div>
  );
}
