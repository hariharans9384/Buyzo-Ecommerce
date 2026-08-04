import { HiArrowLeft } from 'react-icons/hi';
import { Link } from 'react-router-dom';

export default function TermsConditions() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fadeIn">
      <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 no-underline text-sm"><HiArrowLeft /> Back to Home</Link>
      <h1 className="text-3xl font-bold text-white mb-8">Terms & Conditions</h1>
      <div className="glass rounded-xl p-8 space-y-6 text-gray-300 text-sm leading-relaxed">
        <section><h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2><p>By accessing and using Dudez_Shop, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p></section>
        <section><h2 className="text-xl font-semibold text-white mb-3">2. Use of Service</h2><p>You agree to use the service only for lawful purposes and in a way that does not infringe the rights of, restrict, or inhibit anyone else's use and enjoyment of the service. You are responsible for maintaining the confidentiality of your account information.</p></section>
        <section><h2 className="text-xl font-semibold text-white mb-3">3. Products & Pricing</h2><p>All product prices are listed in Indian Rupees (INR) and inclusive of applicable taxes. We reserve the right to modify prices without prior notice. Product availability is subject to stock levels.</p></section>
        <section><h2 className="text-xl font-semibold text-white mb-3">4. Orders & Payment</h2><p>Once an order is placed, it is considered a binding agreement to purchase. Payment is processed through Razorpay, a secure third-party payment gateway. We do not store your payment card details on our servers.</p></section>
        <section><h2 className="text-xl font-semibold text-white mb-3">5. Shipping & Delivery</h2><p>We aim to deliver orders within 5-7 business days. Delivery times may vary based on location and product availability. Shipping is free on all orders.</p></section>
        <section><h2 className="text-xl font-semibold text-white mb-3">6. Limitation of Liability</h2><p>Dudez_Shop shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.</p></section>
        <section><h2 className="text-xl font-semibold text-white mb-3">7. Changes to Terms</h2><p>We reserve the right to update these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.</p></section>
        <p className="text-gray-500 text-xs pt-4 border-t border-white/10">Last updated: March 2026</p>
      </div>
    </div>
  );
}
