import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiArrowLeft, HiMail, HiPhone, HiLocationMarker, HiPaperAirplane, HiCheck } from 'react-icons/hi';
import API from '../utils/api';
import toast from 'react-hot-toast';

export default function ContactUs() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/contact', form);
      toast.success('Message sent! Check your email for confirmation.');
      setForm({ name: '', email: '', subject: '', message: '' });
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fadeIn">
      <Link to="/" className="flex items-center gap-2 text-gray-300 hover:text-white mb-6 bg-white/5 px-4 py-2 rounded-xl border border-white/10 transition no-underline text-xs font-semibold w-fit">
        <HiArrowLeft /> Back to Home
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Contact Support</h1>
        <p className="text-gray-400 text-sm mt-1">Have a question or need order assistance? We're here to help!</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info Side Cards */}
        <div className="space-y-4">
          {[
            { icon: HiMail, title: 'Customer Support Email', info: 'finallykabilan@gmail.com', sub: '24/7 Response Time' },
            { icon: HiPhone, title: 'Direct Helpline', info: '+91 88832 80816', sub: 'Mon-Sat, 9AM-6PM IST' },
            { icon: HiLocationMarker, title: 'Head Office Location', info: 'Nagapattinam, TamilNadu, India', sub: 'Regional Dispatch Hub' },
          ].map((c, i) => (
            <div key={i} className="glass-strong rounded-3xl p-6 flex items-start gap-4 border border-white/10 shadow-lg">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <c.icon className="text-xl" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">{c.title}</h3>
                <p className="text-gray-200 text-xs sm:text-sm font-medium mt-0.5">{c.info}</p>
                <p className="text-gray-400 text-[11px] mt-0.5">{c.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Form Container */}
        <div className="lg:col-span-2">
          {sent ? (
            <div className="glass-strong rounded-3xl p-12 text-center animate-fadeIn border border-white/10 shadow-2xl">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6 text-emerald-400">
                <HiCheck className="text-4xl" />
              </div>
              <h2 className="text-2xl font-extrabold text-white mb-2">Message Delivered!</h2>
              <p className="text-gray-300 text-sm mb-8 max-w-md mx-auto">
                We have received your message. A confirmation email has been dispatched to your inbox.
              </p>
              <button onClick={() => setSent(false)} className="btn-secondary px-6 py-3 rounded-xl text-sm font-semibold">
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="glass-strong rounded-3xl p-6 sm:p-8 space-y-5 border border-white/10 shadow-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Your Name *</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="John Doe" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Email Address *</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-field" placeholder="you@example.com" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Subject *</label>
                <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="input-field" placeholder="Order Inquiry / Product Question" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Detailed Message *</label>
                <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="input-field" rows="5" placeholder="How can our support team assist you today?" required />
              </div>
              <button type="submit" disabled={loading} className="btn-primary px-8 py-3.5 flex items-center justify-center gap-2 text-sm disabled:opacity-50 font-bold">
                <HiPaperAirplane className="text-base" /> {loading ? 'Sending Message...' : 'Submit Inquiry'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
