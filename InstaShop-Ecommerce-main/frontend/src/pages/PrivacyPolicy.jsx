import { HiArrowLeft } from 'react-icons/hi';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fadeIn">
      <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 no-underline text-sm"><HiArrowLeft /> Back to Home</Link>
      <h1 className="text-3xl font-bold text-white mb-8">Privacy Policy</h1>
      <div className="glass rounded-xl p-8 space-y-6 text-gray-300 text-sm leading-relaxed">
        <section><h2 className="text-xl font-semibold text-white mb-3">Information We Collect</h2><p>We collect information you provide directly: name, email, phone number, shipping address, and payment information. We also collect usage data such as pages visited, time spent on site, and device information.</p></section>
        <section><h2 className="text-xl font-semibold text-white mb-3">How We Use Your Information</h2><p>Your information is used to process orders, provide customer support, send order updates, personalize your experience, and improve our services. We will never sell your personal data to third parties.</p></section>
        <section><h2 className="text-xl font-semibold text-white mb-3">Data Security</h2><p>We implement industry-standard security measures including encryption (SSL/TLS), secure password hashing (bcrypt), and JWT-based authentication to protect your data. Payment processing is handled securely through Razorpay.</p></section>
        <section><h2 className="text-xl font-semibold text-white mb-3">Cookies</h2><p>We use essential cookies and local storage for authentication tokens. We do not use tracking cookies or share data with advertising networks.</p></section>
        <section><h2 className="text-xl font-semibold text-white mb-3">Your Rights</h2><p>You have the right to access, update, or delete your personal information at any time through your profile settings. You may also contact us to request a complete data export or deletion.</p></section>
        <section><h2 className="text-xl font-semibold text-white mb-3">Contact</h2><p>For privacy-related inquiries, contact us at privacy@dudez_shop.com.</p></section>
        <p className="text-gray-500 text-xs pt-4 border-t border-white/10">Last updated: March 2026</p>
      </div>
    </div>
  );
}
