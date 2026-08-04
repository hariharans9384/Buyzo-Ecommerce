import { useState } from 'react';
import { HiUser, HiPhone, HiLocationMarker, HiSave } from 'react-icons/hi';
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
      toast.success('Profile updated!');
    } catch (err) { toast.error('Update failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      <h1 className="text-3xl font-bold text-white mb-8">My Profile</h1>

      {/* Profile Header */}
      <div className="glass-strong rounded-2xl p-6 mb-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white" style={{ background: 'linear-gradient(135deg, #6C63FF, #FF6584)' }}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{user?.name}</h2>
          <p className="text-gray-400 text-sm">{user?.email}</p>
          <span className="badge bg-primary/20 text-primary text-xs mt-1">{user?.role === 'admin' ? 'Admin' : 'Customer'}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Info */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><HiUser className="text-primary" /> Personal Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Full Name</label>
              <input value={name} onChange={e => setName(e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Email</label>
              <input value={user?.email} className="input-field opacity-60" disabled />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-gray-300 mb-1 flex items-center gap-1"><HiPhone className="text-primary" /> Phone</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} className="input-field" placeholder="+91 98765 43210" />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><HiLocationMarker className="text-primary" /> Address</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm text-gray-300 mb-1">Street Address</label>
              <input value={address.street} onChange={e => setAddress({...address, street: e.target.value})} className="input-field" placeholder="123 Main St" />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">City</label>
              <input value={address.city} onChange={e => setAddress({...address, city: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">State</label>
              <input value={address.state} onChange={e => setAddress({...address, state: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">ZIP Code</label>
              <input value={address.zipCode} onChange={e => setAddress({...address, zipCode: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Country</label>
              <input value={address.country} onChange={e => setAddress({...address, country: e.target.value})} className="input-field" />
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary px-8 py-3 flex items-center gap-2 disabled:opacity-50"><HiSave /> {loading ? 'Saving...' : 'Save Changes'}</button>
      </form>
    </div>
  );
}
