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
      <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 no-underline text-sm"><HiArrowLeft /> Back to Home</Link>
      <h1 className="text-3xl font-bold text-white mb-8">Contact Us</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info */}
        <div className="space-y-4">
          {[
            { icon: HiMail, title: 'Email', info: 'finallykabilan@gmail.com', sub: 'We reply within 24 hours' },
            { icon: HiPhone, title: 'Phone', info: '+91 88832 80816', sub: 'Mon-Sat, 9AM-6PM IST' },
            { icon: HiLocationMarker, title: 'Address', info: 'Nagapattinam, TamilNadu, India', sub: 'We reply within 24 hours' },
          ].map((c, i) => (
            <div key={i} className="glass rounded-xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(108,99,255,0.05))' }}>
                <c.icon className="text-primary text-lg" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">{c.title}</h3>
                <p className="text-gray-300 text-sm">{c.info}</p>
                <p className="text-gray-500 text-xs">{c.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          {sent ? (
            <div className="glass-strong rounded-xl p-10 text-center animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                <HiCheck className="text-success text-3xl" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Message Sent!</h2>
              <p className="text-gray-400 mb-6">We've sent a confirmation to your email. Our team will get back to you within 24 hours.</p>
              <button onClick={() => setSent(false)} className="btn-secondary">Send Another Message</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="glass-strong rounded-xl p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Name *</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" placeholder="Your name" required />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Email *</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input-field" placeholder="you@example.com" required />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Subject *</label>
                <input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="input-field" placeholder="How can we help?" required />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Message *</label>
                <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="input-field" rows="5" placeholder="Tell us more..." required />
              </div>
              <button type="submit" disabled={loading} className="btn-primary px-8 py-3 flex items-center gap-2 disabled:opacity-50">
                <HiPaperAirplane /> {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
