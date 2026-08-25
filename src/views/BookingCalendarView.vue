<template>
  <div class="min-h-screen px-4 py-8 md:py-12">
    <div class="max-w-5xl mx-auto">

      <div class="flex items-center justify-between mb-6">
        <router-link to="/" class="text-indigo-600 font-bold text-sm">&larr; Home</router-link>
        <h1 class="text-xl md:text-2xl font-bold text-slate-800">Bookings &amp; Calendar</h1>
        <span class="w-12"></span>
      </div>

      <div class="grid lg:grid-cols-2 gap-6 items-start">

        <!-- ===== BOOKING FORM (admin only) ===== -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 md:p-6 space-y-5">
          <h2 class="font-bold text-slate-800">Record a Booking</h2>

          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Guest Name</label>
              <input v-model="form.name" class="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-400 outline-none">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Guest Phone</label>
              <input v-model="form.phone" class="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-400 outline-none">
            </div>
          </div>

          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Service / Room Name</label>
              <input v-model="form.roomName" placeholder="e.g. Room 1, Parking Space 1" class="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-400 outline-none">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
              <select v-model="form.roomType" class="w-full p-2 border border-slate-300 rounded bg-white focus:ring-2 focus:ring-indigo-400 outline-none">
                <option v-for="t in SERVICE_TYPES" :key="t.value" :value="t.value">{{ t.label }}</option>
              </select>
            </div>
          </div>

          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Check-In Date</label>
              <input :type="dateInputType" v-model="form.start" class="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-400 outline-none">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Check-Out Date</label>
              <input :type="dateInputType" v-model="form.end" :min="form.start" class="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-400 outline-none">
            </div>
          </div>

          <ItemizedBreakdown :form="form" />

          <div class="border-t border-slate-200 pt-4">
            <label class="flex items-center gap-2 cursor-pointer mb-1">
              <input type="checkbox" v-model="form.isManualCash" class="w-5 h-5 accent-indigo-600">
              <span class="font-bold text-sm text-slate-800">Payment Method: Cash</span>
            </label>
            <p class="text-xs text-slate-500 ml-7">Checked = <span class="font-bold">Cash</span> • Unchecked = <span class="font-bold">Online Banking</span>.</p>
          </div>

          <p v-if="error" class="text-red-500 text-sm font-bold">{{ error }}</p>
          <p v-if="success" class="text-emerald-600 text-sm font-bold">{{ success }}</p>

          <button @click="submit" :disabled="saving"
            class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow disabled:opacity-50 transition">
            {{ saving ? 'Saving…' : 'Add Booking' }}
          </button>
        </div>

        <!-- ===== CALENDAR ===== -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 md:p-6">
          <div class="flex items-center justify-between mb-4">
            <button @click="changeMonth(-1)" class="px-3 py-1 rounded hover:bg-slate-100 text-slate-600 font-bold">&larr;</button>
            <h2 class="font-bold text-slate-800">{{ monthLabel }}</h2>
            <button @click="changeMonth(1)" class="px-3 py-1 rounded hover:bg-slate-100 text-slate-600 font-bold">&rarr;</button>
          </div>

          <div class="flex items-center gap-4 mb-3 text-xs text-slate-500">
            <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-sm bg-blue-200 inline-block"></span> Room</span>
            <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-sm bg-yellow-200 inline-block"></span> Parking</span>
            <span class="ml-auto italic">Tap a booking to invoice it</span>
          </div>

          <div class="overflow-x-auto">
            <div class="min-w-[560px]">
              <div class="grid grid-cols-7 gap-1 mb-1">
                <div v-for="d in ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']" :key="d" class="text-center text-[11px] font-bold text-slate-400 py-1">{{ d }}</div>
              </div>
              <div class="grid grid-cols-7 gap-1">
                <div v-for="(cell, idx) in monthCells" :key="idx"
                     class="h-24 border border-slate-100 rounded p-1 relative"
                     :class="cell.inMonth ? 'bg-white' : 'bg-slate-50'">
                  <template v-if="cell.date">
                    <span class="text-[11px] font-bold"
                          :class="cell.isToday ? 'text-indigo-600' : 'text-slate-400'">{{ cell.day }}</span>
                    <div class="space-y-1 mt-1 overflow-y-auto max-h-[68px]">
                      <button v-for="bk in cell.bookings" :key="bk.id"
                              @click="openInvoice(bk.id)"
                              :title="`${bk.name} — ${bk.roomName} (tap to invoice)`"
                              :class="bk.roomType === 'parking' ? 'bg-yellow-200 text-yellow-900 hover:bg-yellow-300' : 'bg-blue-200 text-blue-900 hover:bg-blue-300'"
                              class="block w-full text-left text-[10px] px-1 py-0.5 rounded truncate transition cursor-pointer">
                        {{ bk.name || bk.roomName }}
                      </button>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>

          <p v-if="loadingBookings" class="text-xs text-slate-400 mt-3">Loading bookings…</p>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { COLLECTION, SERVICE_TYPES } from '../config';
import ItemizedBreakdown from '../components/ItemizedBreakdown.vue';

const router = useRouter();

// ---------- form ----------
const form = reactive({
  name: '', phone: '',
  roomName: '', roomType: 'room',
  start: '', end: '',
  serviceCost: 0, extraCosts: [],
  isManualCash: true
});
const dateInputType = computed(() => form.roomType === 'parking' ? 'datetime-local' : 'date');

const saving = ref(false);
const error = ref('');
const success = ref('');

const submit = async () => {
  error.value = ''; success.value = '';
  if (!form.name || !form.roomName || !form.start || !form.end) {
    error.value = 'Please fill in guest name, service name, and both dates.';
    return;
  }
  if (new Date(form.end) < new Date(form.start)) {
    error.value = 'Check-out cannot be before check-in.';
    return;
  }
  saving.value = true;
  try {
    const cleanedExtras = form.extraCosts
      .map(e => ({ name: (e.name || '').trim(), amount: Number(e.amount) || 0 }))
      .filter(e => e.name !== '');
    const grandTotal = (Number(form.serviceCost) || 0) + cleanedExtras.reduce((s, e) => s + e.amount, 0);

    await addDoc(collection(db, COLLECTION), {
      name: form.name,
      phone: form.phone,
      email: null,
      roomName: form.roomName,
      roomType: form.roomType,
      plateNumber: null,
      start: Timestamp.fromDate(new Date(form.start)),
      end: Timestamp.fromDate(new Date(form.end)),
      serviceCost: Number(form.serviceCost) || 0,
      extraCosts: cleanedExtras,
      totalPrice: grandTotal,
      isManualCash: form.isManualCash,
      status: 'confirmed',        // reservation default (no payment step in prototype)
      adminName: null, adminPhone: null, adminSignatureUrl: null,
      source: 'booking',
      invoiceGenerated: false,
      createdAt: Timestamp.now()
    });

    success.value = 'Booking added to the calendar.';
    // reset
    Object.assign(form, { name: '', phone: '', roomName: '', roomType: 'room', start: '', end: '', serviceCost: 0, extraCosts: [], isManualCash: true });
    await loadBookings();
  } catch (e) {
    console.error(e);
    error.value = 'Error saving booking: ' + e.message;
  } finally {
    saving.value = false;
  }
};

// ---------- calendar ----------
const bookings = ref([]);
const loadingBookings = ref(true);
const cursor = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1));

const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const loadBookings = async () => {
  loadingBookings.value = true;
  try {
    const snap = await getDocs(collection(db, COLLECTION));
    bookings.value = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error('Error loading bookings:', e);
  } finally {
    loadingBookings.value = false;
  }
};

const monthLabel = computed(() =>
  cursor.value.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
);

const changeMonth = (delta) => {
  cursor.value = new Date(cursor.value.getFullYear(), cursor.value.getMonth() + delta, 1);
};

const bookingsForDate = (date) => {
  const target = ymd(date);
  const out = [];
  bookings.value.forEach(b => {
    if (b.status === 'cancelled') return;
    if (!b.start?.toDate || !b.end?.toDate) return;
    const s = ymd(b.start.toDate());
    const e = ymd(b.end.toDate());
    if (target >= s && target <= e) {
      out.push({ id: b.id, name: b.name, roomName: b.roomName, roomType: b.roomType });
    }
  });
  return out;
};

const monthCells = computed(() => {
  const year = cursor.value.getFullYear();
  const month = cursor.value.getMonth();
  const first = new Date(year, month, 1);
  const startWeekday = first.getDay();           // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = ymd(new Date());

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push({ date: null });
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    cells.push({
      date,
      day,
      inMonth: true,
      isToday: ymd(date) === todayStr,
      bookings: bookingsForDate(date)
    });
  }
  // pad to complete the last week
  while (cells.length % 7 !== 0) cells.push({ date: null });
  return cells;
});

const openInvoice = (id) => router.push(`/manual-invoice/${id}`);

onMounted(loadBookings);
</script>
