'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/src/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog';
import { Input } from '@/src/components/ui/input';
import toast from 'react-hot-toast';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/dark.css';

interface User {
  id: string;
  name: string | null;
  email: string | null;

  isSubscribed: boolean;
  subscriptionStatus?: string;
  plan?: string;
  subscriptionStart?: string;
  subscriptionEnd?: string;

  businessName?: string | null;
  mobileNumber?: string | null;
  about?: string | null;
  businessAddress?: string | null;

  loginCount: number;
  createdAt: string;
}

export function UserTable({ users }: { users: User[] }) {
  const [filtered, setFiltered] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // 🔥 Check for expired subscriptions on load
  useEffect(() => {
    const now = new Date();
    const updatedUsers = users.map(u => {
      if (u.subscriptionEnd && new Date(u.subscriptionEnd) < now) {
        return { ...u, isSubscribed: false, subscriptionStatus: 'expired' };
      }
      return u;
    });
    setFiltered(updatedUsers);
  }, [users]);

  const formatDateTimeLocal = (date?: string) => {
    if (!date) return '';
    return new Date(date).toISOString().slice(0, 16);
  };

  const handleSearch = (term: string) => {
    const lower = term.toLowerCase();
    setSearch(term);

    setFiltered(prev =>
      prev.filter(
        u =>
          u.id.toLowerCase().includes(lower) ||
          u.name?.toLowerCase().includes(lower) ||
          u.email?.toLowerCase().includes(lower)
      )
    );
  };

  const handleChange = (id: string, field: keyof User, value: any) => {
    setFiltered(prev =>
      prev.map(u => (u.id === id ? { ...u, [field]: value } : u))
    );
  };

  const saveUser = async (user: User) => {
    try {
      const res = await fetch('/api/admin/users/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });

      if (res.ok) toast.success('Saved ✅');
      else toast.error('Failed ❌');
    } catch {
      toast.error('Server error ❌');
    }
  };

  const deleteUser = async () => {
    if (!selectedId) return;

    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedId }),
      });

      if (res.ok) {
        setFiltered(prev => prev.filter(u => u.id !== selectedId));
        toast.success('Deleted');
      }
    } catch {
      toast.error('Error');
    } finally {
      setOpen(false);
    }
  };

  return (
    <div className="space-y-6 w-full text-white bg-black min-h-screen">
      {/* Search */}
      <Input
        placeholder="Search..."
        value={search}
        onChange={e => handleSearch(e.target.value)}
        className="bg-black border border-white/20 text-white"
      />

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filtered.map(user => (
          <div key={user.id} className="bg-white/10 p-5 rounded-xl space-y-3">
            {/* Basic */}
            <p>ID: {user.id}</p>
            <p>Name: {user.name}</p>
            <p>Email: {user.email}</p>

            {/* Signup Date */}
            <p className="text-xs text-gray-400">
              Joined: {new Date(user.createdAt).toLocaleString()}
            </p>

            {/* Editable Fields */}
            <Input
              value={user.businessName || ''}
              onChange={e => handleChange(user.id, 'businessName', e.target.value)}
              placeholder="Business"
            />
            <Input
              value={user.mobileNumber || ''}
              onChange={e => handleChange(user.id, 'mobileNumber', e.target.value)}
              placeholder="Mobile"
            />
            <Input
              value={user.about || ''}
              onChange={e => handleChange(user.id, 'about', e.target.value)}
              placeholder="About"
            />

            {/* Subscription */}
            <div className="border-t pt-3 space-y-2">
              <select
                value={user.plan || 'monthly'}
                onChange={e => handleChange(user.id, 'plan', e.target.value)}
                className="w-full p-2 bg-black border"
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="lifetime">Lifetime</option>
              </select>

              <select
                value={user.subscriptionStatus || 'pending'}
                onChange={e =>
                  handleChange(user.id, 'subscriptionStatus', e.target.value)
                }
                className="w-full p-2 bg-black border"
              >
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <Flatpickr
                value={user.subscriptionStart || ''}
                options={{ enableTime: true, dateFormat: 'Y-m-d H:i' }}
                onChange={(date: Date[]) =>
                  handleChange(user.id, 'subscriptionStart', date[0]?.toISOString())
                }
                className="w-full p-2 bg-white border text-black"
                placeholder="Subscription Start Date"
              />

              <Flatpickr
                value={user.subscriptionEnd || ''}
                options={{ enableTime: true, dateFormat: 'Y-m-d H:i' }}
                onChange={(date: Date[]) =>
                  handleChange(user.id, 'subscriptionEnd', date[0]?.toISOString())
                }
                className="w-full p-2 bg-white border text-black"
                placeholder="Subscription End Date"
              />

              <p className="text-xs">
                Status: {user.subscriptionStatus || 'pending'}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <Button onClick={() => saveUser(user)}>Save</Button>

              <Button
                onClick={() => {
                  setSelectedId(user.id);
                  setOpen(true);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete?</DialogTitle>
          </DialogHeader>
          <Button onClick={deleteUser}>Confirm</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}