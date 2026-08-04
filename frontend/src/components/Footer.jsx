// import { Link } from 'react-router-dom';
// import { HiMail, HiPhone, HiLocationMarker, HiShieldCheck, HiTruck, HiRefresh } from 'react-icons/hi';
// import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

// function Footer() {
//   return (
//     <footer className="mt-24 border-t border-white/10 relative overflow-hidden bg-slate-950/80 backdrop-blur-2xl">

//       <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

//           <div>
//             <div className="flex items-center gap-3 mb-5">
//               <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xl text-dark shadow-lg" style={{ background: 'linear-gradient(135deg, #D4AF37, #E29578)' }}>
//                 D
//               </div>
//               <span className="text-xl font-extrabold tracking-tight text-white">Buyzo</span>
//             </div>
//             <p className="text-gray-400 text-sm leading-relaxed mb-6">
//               Your ultimate destination for premium tech gear, wearables, audio equipment, and urban lifestyle products.
//             </p>
//             <div className="flex gap-2.5">
//               {[
//                 { Icon: FaFacebookF, href: '#' },
//                 { Icon: FaTwitter, href: '#' },
//                 { Icon: FaInstagram, href: '#' },
//                 { Icon: FaLinkedinIn, href: '#' }
//               ].map(({ Icon, href }, i) => (
//                 <a
//                   key={i}
//                   href={href}
//                   className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-dark hover:bg-primary hover:border-primary border border-white/10 transition-all duration-300 no-underline shadow-sm"
//                 >
//                   <Icon size={14} />
//                 </a>
//               ))}
//             </div>
//           </div>


//           <div>
//             <h3 className="text-white font-bold mb-4 text-xs uppercase tracking-wider text-primary">Quick Navigation</h3>
//             <div className="flex flex-col gap-2.5">
//               {[
//                 { to: '/', label: 'Home Page' },
//                 { to: '/products', label: 'All Products Catalog' },
//                 { to: '/cart', label: 'Shopping Cart' },
//                 { to: '/orders', label: 'Order History & Tracking' },
//                 { to: '/profile', label: 'User Account' }
//               ].map((l) => (
//                 <Link key={l.to} to={l.to} className="text-gray-400 hover:text-primary-light text-sm transition-colors no-underline font-medium">
//                   {l.label}
//                 </Link>
//               ))}
//             </div>
//           </div>


//           <div>
//             <h3 className="text-white font-bold mb-4 text-xs uppercase tracking-wider text-secondary">Help & Support</h3>
//             <div className="flex flex-col gap-2.5">
//               {[
//                 { to: '/terms', label: 'Terms & Conditions' },
//                 { to: '/privacy', label: 'Privacy Policy' },
//                 { to: '/return-policy', label: 'Returns & Refund Policy' },
//                 { to: '/contact', label: 'Contact Support' }
//               ].map((l) => (
//                 <Link key={l.to} to={l.to} className="text-gray-400 hover:text-secondary text-sm transition-colors no-underline font-medium">
//                   {l.label}
//                 </Link>
//               ))}
//             </div>
//           </div>


//           <div>
//             <h3 className="text-white font-bold mb-4 text-xs uppercase tracking-wider text-accent">Direct Contact</h3>
//             <div className="flex flex-col gap-3">
//               <div className="flex items-center gap-3 text-gray-300 text-sm">
//                 <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
//                   <HiMail className="text-base" />
//                 </div>
//                 <span className="text-xs sm:text-sm">Buyzocontact@gmail.com</span>
//               </div>
//               <div className="flex items-center gap-3 text-gray-300 text-sm">
//                 <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent flex-shrink-0">
//                   <HiPhone className="text-base" />
//                 </div>
//                 <span className="text-xs sm:text-sm">+91 9384304685</span>
//               </div>
//               <div className="flex items-center gap-3 text-gray-300 text-sm">
//                 <div className="w-8 h-8 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary flex-shrink-0">
//                   <HiLocationMarker className="text-base" />
//                 </div>
//                 <span className="text-xs sm:text-sm">Mayiladuthurai, TamilNadu, India</span>
//               </div>
//             </div>
//           </div>

//         </div>


//         <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
//           <p className="text-gray-400 text-xs">
//             &copy; {new Date().getFullYear()} <span className="text-white font-semibold">Buyzo</span>. All rights reserved. .
//           </p>
//           <div className="flex items-center gap-4 text-xs text-gray-400">
//             <span className="flex items-center gap-1.5"><HiShieldCheck className="text-primary text-sm" /> Term of Service</span>
//             <span>•</span>
//             <span className="flex items-center gap-1.5"><HiRefresh className="text-secondary text-sm" /> 7-Day Replacement</span>
//             <span>•</span>
//             <span className="flex items-center gap-1.5"><HiTruck className="text-accent text-sm" /> Express Courier</span>
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// }

// export default Footer;
import { Link } from 'react-router-dom';
import { HiMail, HiPhone, HiLocationMarker, HiShieldCheck, HiTruck, HiRefresh } from 'react-icons/hi';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10 relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-black backdrop-blur-2xl">

      <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[28rem] h-[28rem] bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          <div>
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-lg"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)' }}
              >
                B
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">Buyzo</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Discover trend-first fashion, premium accessories, lifestyle essentials, and everyday picks curated for modern shoppers.
            </p>
            <div className="flex gap-2.5">
              {[
                { Icon: FaFacebookF, href: '#' },
                { Icon: FaTwitter, href: '#' },
                { Icon: FaInstagram, href: '#' },
                { Icon: FaLinkedinIn, href: '#' }
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-pink-500 hover:border-pink-500 border border-white/10 transition-all duration-300 no-underline shadow-sm"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4 text-xs uppercase tracking-wider text-pink-400">Shop</h3>
            <div className="flex flex-col gap-2.5">
              {[
                { to: '/', label: 'New Arrivals' },
                { to: '/products', label: 'Best Sellers' },
                { to: '/cart', label: 'Bag & Checkout' },
                { to: '/orders', label: 'Track Your Orders' },
                { to: '/profile', label: 'My Account' }
              ].map((l) => (
                <Link key={l.to} to={l.to} className="text-gray-400 hover:text-pink-300 text-sm transition-colors no-underline font-medium">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4 text-xs uppercase tracking-wider text-violet-400">Customer Care</h3>
            <div className="flex flex-col gap-2.5">
              {[
                { to: '/terms', label: 'Terms of Use' },
                { to: '/privacy', label: 'Privacy & Security' },
                { to: '/return-policy', label: 'Easy Returns & Refunds' },
                { to: '/contact', label: 'Help Center' }
              ].map((l) => (
                <Link key={l.to} to={l.to} className="text-gray-400 hover:text-violet-300 text-sm transition-colors no-underline font-medium">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4 text-xs uppercase tracking-wider text-cyan-400">Get in Touch</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-gray-300 text-sm">
                <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 flex-shrink-0">
                  <HiMail className="text-base" />
                </div>
                <span className="text-xs sm:text-sm">hello@buyzo.com</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300 text-sm">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 flex-shrink-0">
                  <HiPhone className="text-base" />
                </div>
                <span className="text-xs sm:text-sm">+91 93843 04685</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300 text-sm">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 flex-shrink-0">
                  <HiLocationMarker className="text-base" />
                </div>
                <span className="text-xs sm:text-sm">Mayiladuthurai, Tamil Nadu, India</span>
              </div>
            </div>
          </div>

        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-xs">
            &copy; {new Date().getFullYear()} <span className="text-white font-semibold">Buyzo</span>. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1.5"><HiShieldCheck className="text-pink-400 text-sm" /> Secure Payments</span>
            <span>-</span>
            <span className="flex items-center gap-1.5"><HiRefresh className="text-violet-400 text-sm" /> Hassle-Free Returns</span>
            <span>-</span>
            <span className="flex items-center gap-1.5"><HiTruck className="text-cyan-400 text-sm" /> Fast Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
