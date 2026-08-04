import { useState } from 'react';
import { HiUser, HiPhone, HiLocationMarker, HiSave, HiMail, HiShieldCheck } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || { street: '', city: '', state: '', zipCode: '', country: 'India' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({ name, phone, address });
      toast.success('Profile saved successfully!');
    } catch (err) {
      toast.error('Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Account Profile</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your personal information and default shipping address</p>
      </div>

      {/* Profile Avatar Card */}
      <div className="glass-strong rounded-3xl p-6 sm:p-8 mb-8 flex items-center gap-5 border border-white/10 shadow-2xl">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-xl" style={{ background: 'linear-gradient(135deg, #6366F1, #EC4899)' }}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">{user?.name}</h2>
          <p className="text-gray-300 text-sm flex items-center gap-1.5 mt-0.5"><HiMail className="text-indigo-400" /> {user?.email}</p>
          <span className="badge bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs mt-2 font-semibold">
            {user?.role === 'admin' ? 'Administrator' : 'Standard Customer'}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Details */}
        <div className="glass-strong rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 tracking-tight">
            <HiUser className="text-indigo-400" /> Personal Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Full Name</label>
              <input value={name} onChange={e => setName(e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Email Address</label>
              <input value={user?.email} className="input-field opacity-60 cursor-not-allowed" disabled />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1">
                <HiPhone className="text-indigo-400" /> Mobile Contact
              </label>
              <input value={phone} onChange={e => setPhone(e.target.value)} className="input-field" placeholder="+91 98765 43210" />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="glass-strong rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 tracking-tight">
            <HiLocationMarker className="text-pink-400" /> Default Shipping Address
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Street Address</label>
              <input value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })} className="input-field" placeholder="123 Street Name, Apartment" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">City</label>
              <input value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">State</label>
              <input value={address.state} onChange={e => setAddress({ ...address, state: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">ZIP / Postal Code</label>
              <input value={address.zipCode} onChange={e => setAddress({ ...address, zipCode: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Country</label>
              <input value={address.country} onChange={e => setAddress({ ...address, country: e.target.value })} className="input-field" />
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary px-8 py-3.5 flex items-center gap-2 text-sm disabled:opacity-50 font-bold">
          <HiSave className="text-lg" /> {loading ? 'Saving Updates...' : 'Save Profile Changes'}
        </button>
      </form>
    </div>
  );
}
