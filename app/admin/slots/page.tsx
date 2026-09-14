'use client';

import React, { useState } from 'react';
import { GlassCard } from '@/components/common/GlassCard';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { MOCK_SLOTS } from '@/lib/mock-data/slots';
import { Slot } from '@/types';
import { 
  CalendarRange, 
  Plus, 
  Edit, 
  Ban, 
  Clock, 
  Users, 
  CheckCircle2, 
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function SlotManagementPage() {
  const [slots, setSlots] = useState<Slot[]>(MOCK_SLOTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSlotTime, setNewSlotTime] = useState('05:30 PM – 07:00 PM');
  const [newSlotCapacity, setNewSlotCapacity] = useState('20');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCreateSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const [start, end] = newSlotTime.split('–').map((s) => s.trim());
    const cap = parseInt(newSlotCapacity, 10) || 20;

    const created: Slot = {
      id: `slot-${Date.now()}`,
      centreId: 'centre-14',
      date: '2026-04-12',
      startTime: start || '05:30 PM',
      endTime: end || '07:00 PM',
      capacity: cap,
      booked: 0,
      available: cap,
      utilizationPercent: 0,
      status: 'available',
      delayMinutes: 0,
    };

    setSlots([...slots, created]);
    setIsModalOpen(false);
    showToast('New time slot added successfully!');
  };

  const handleToggleDisable = (slotId: string) => {
    setSlots(
      slots.map((s) => {
        if (s.id === slotId) {
          const newStatus = s.status === 'disabled' ? 'available' : 'disabled';
          return { ...s, status: newStatus };
        }
        return s;
      })
    );
    showToast('Slot status updated.');
  };

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CalendarRange className="w-4 h-4" />
            </span>
            <span className="text-xs uppercase font-bold text-emerald-400">
              Capacity Scheduling
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Time Slot & Quota Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure staggered arrival windows to maintain steady weighbridge throughput without queue backups.
          </p>
        </div>

        <Button
          size="md"
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create New Slot
        </Button>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-600 text-white shadow-xl flex items-center justify-between animate-in slide-in-from-top-2 text-xs font-bold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Slots Table */}
      <GlassCard variant="dark" className="p-6">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>Active Schedule Date: <strong>Today, 12 April 2026</strong></span>
          </div>
          <Badge variant="info" size="sm">
            Centre #14 (Hapur Central)
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <th className="py-2.5 px-3">Time Window</th>
                <th className="py-2.5 px-3">Capacity</th>
                <th className="py-2.5 px-3">Booked</th>
                <th className="py-2.5 px-3">Available</th>
                <th className="py-2.5 px-3">Utilization</th>
                <th className="py-2.5 px-3">Operational Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {slots.map((slot) => {
                const isFull = slot.status === 'full';
                const isDisabled = slot.status === 'disabled';
                return (
                  <tr key={slot.id} className="hover:bg-slate-800/60">
                    <td className="py-3 px-3 font-bold text-white text-sm">
                      {slot.startTime} – {slot.endTime}
                    </td>
                    <td className="py-3 px-3 font-mono">{slot.capacity} Farmers</td>
                    <td className="py-3 px-3 font-mono text-emerald-400">{slot.booked}</td>
                    <td className="py-3 px-3 font-mono text-slate-300">{slot.available}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              slot.utilizationPercent >= 90
                                ? 'bg-rose-500'
                                : slot.utilizationPercent >= 70
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${slot.utilizationPercent}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px]">{slot.utilizationPercent}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      {isDisabled ? (
                        <Badge variant="danger" size="sm">
                          Disabled
                        </Badge>
                      ) : isFull ? (
                        <Badge variant="warning" size="sm">
                          Full
                        </Badge>
                      ) : (
                        <Badge variant="success" size="sm">
                          Available
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleDisable(slot.id)}
                          className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                            isDisabled
                              ? 'bg-emerald-900/60 text-emerald-300 hover:bg-emerald-800'
                              : 'bg-rose-950/60 text-rose-300 hover:bg-rose-900'
                          }`}
                        >
                          {isDisabled ? 'Enable' : 'Disable'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Modal: Create Slot */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Procurement Slot"
      >
        <form onSubmit={handleCreateSlot} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Time Slot Window (e.g. 05:30 PM – 07:00 PM)
            </label>
            <input
              type="text"
              required
              value={newSlotTime}
              onChange={(e) => setNewSlotTime(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Farmer Truck Capacity Quota
            </label>
            <input
              type="number"
              required
              value={newSlotCapacity}
              onChange={(e) => setNewSlotCapacity(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit">
              Save Slot
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
