import { Link } from 'react-router-dom';
import { HiMail, HiPhone, HiLocationMarker } from 'react-icons/hi';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="mt-20" style={{ background: 'rgba(10, 10, 30, 0.8)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-black text-white" style={{ background: 'linear-gradient(135deg, #6C63FF, #FF6584)' }}>I</div>
              <span className="text-xl font-bold gradient-text">Dudez_Shop</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">Your premium destination for quality products. Shop the latest trends with confidence and style.</p>
            <div className="flex gap-3">
              {[FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 no-underline" style={{ background: 'rgba(255,255,255,0.06)' }} onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(135deg, #6C63FF, #FF6584)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}>
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h3>
            <div className="flex flex-col gap-2">
              {[{ to: '/', label: 'Home' }, { to: '/products', label: 'Products' }, { to: '/cart', label: 'Cart' }, { to: '/orders', label: 'Orders' }, { to: '/profile', label: 'My Account' }].map(l => (
                <Link key={l.to} to={l.to} className="text-gray-400 hover:text-primary text-sm transition-colors no-underline">{l.label}</Link>
              ))}
            </div>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Policies</h3>
            <div className="flex flex-col gap-2">
              {[{ to: '/terms', label: 'Terms & Conditions' }, { to: '/privacy', label: 'Privacy Policy' }, { to: '/return-policy', label: 'Return Policy' }, { to: '/contact', label: 'Contact Us' }].map(l => (
                <Link key={l.to} to={l.to} className="text-gray-400 hover:text-primary text-sm transition-colors no-underline">{l.label}</Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact Us</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-gray-400 text-sm"><HiMail className="text-primary" /> finallykabilan@gmail.com</div>
              <div className="flex items-center gap-2 text-gray-400 text-sm"><HiPhone className="text-primary" /> +91 88832 80816</div>
              <div className="flex items-center gap-2 text-gray-400 text-sm"><HiLocationMarker className="text-primary" />  Nagapattinam, TamilNadu, India</div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} Dudez_Shop. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="text-gray-500 text-xs">Secure Payments</span>
            <span className="text-gray-500 text-xs">|</span>
            <span className="text-gray-500 text-xs">7-Day Returns</span>
            <span className="text-gray-500 text-xs">|</span>
            <span className="text-gray-500 text-xs">Free Shipping</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
