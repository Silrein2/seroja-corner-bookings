<template>
  <div class="min-h-screen px-4 py-8 md:py-12">
    <div class="max-w-2xl mx-auto">

      <div class="flex items-center justify-between mb-6">
        <router-link to="/" class="text-indigo-600 font-bold text-sm">&larr; Home</router-link>
        <h1 class="text-xl md:text-2xl font-bold text-slate-800">
          {{ isEdit ? 'Finalize Invoice' : 'New Manual Invoice' }}
        </h1>
        <span class="w-12"></span>
      </div>

      <div v-if="loading" class="text-center text-slate-500 py-20">Loading booking…</div>

      <div v-else class="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 md:p-8 space-y-6">

        <p v-if="isEdit" class="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg p-3">
          Pre-filled from a calendar booking. Everything below is editable — add the admin
          signature and generate to finalize this booking as an official invoice.
        </p>

        <!-- Guest details -->
        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Guest Name</label>
            <input v-model="form.name" class="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-400 outline-none">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Guest Phone</label>
            <input v-model="form.phone" class="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-400 outline-none">
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Guest Email <span class="normal-case font-normal text-slate-400">(optional)</span></label>
          <input v-model="form.email" class="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-400 outline-none">
        </div>

        <!-- Service -->
        <div class="grid md:grid-cols-2 gap-4">
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

        <div v-if="form.roomType === 'parking'">
          <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Vehicle Plate Number <span class="normal-case font-normal text-slate-400">(optional)</span></label>
          <input v-model="form.plateNumber" placeholder="e.g. VJE 1234" class="w-full p-2 border border-yellow-300 bg-yellow-50 rounded focus:ring-2 focus:ring-indigo-400 outline-none">
        </div>

        <!-- Dates -->
        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Check-In Date</label>
            <input :type="dateInputType" v-model="form.start" class="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-400 outline-none">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Check-Out Date</label>
            <input :type="dateInputType" v-model="form.end" :min="form.start" class="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-400 outline-none">
          </div>
        </div>

        <!-- Itemized breakdown -->
        <ItemizedBreakdown :form="form" />

        <!-- Payment method -->
        <div class="border-t border-slate-200 pt-4">
          <label class="flex items-center gap-2 cursor-pointer mb-1">
            <input type="checkbox" v-model="form.isManualCash" class="w-5 h-5 accent-indigo-600">
            <span class="font-bold text-sm text-slate-800">Payment Method: Cash</span>
          </label>
          <p class="text-xs text-slate-500 ml-7">
            Checked = <span class="font-bold">Cash</span> &nbsp;•&nbsp; Unchecked = <span class="font-bold">Online Banking</span>. This is printed on the invoice.
          </p>
        </div>

        <!-- Payment status -->
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Payment Status</label>
          <select v-model="form.status" class="w-full p-2 border border-slate-300 rounded bg-white focus:ring-2 focus:ring-indigo-400 outline-none">
            <option v-for="s in PAYMENT_STATUSES" :key="s.value" :value="s.value">{{ s.label }}</option>
          </select>
        </div>

        <!-- Admin authorization (always visible) -->
        <div class="border-t border-slate-200 pt-4">
          <h3 class="text-sm font-bold text-slate-800 mb-3">Admin Authorization</h3>
          <div class="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div class="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Admin Name</label>
                <input v-model="form.adminName" class="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-400 outline-none">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Admin Phone</label>
                <input v-model="form.adminPhone" class="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-400 outline-none">
              </div>
            </div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Admin Signature</label>
            <div class="border-2 border-dashed border-slate-300 rounded-lg h-56 relative bg-white">
              <canvas ref="canvasRef" class="w-full h-full cursor-crosshair touch-none"></canvas>
            </div>
            <button @click="clearSig" type="button" class="text-xs text-red-500 mt-2 underline">Clear Signature</button>
          </div>
        </div>

        <p v-if="error" class="text-red-500 text-sm font-bold">{{ error }}</p>

        <button
          @click="submit"
          :disabled="saving"
          class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow disabled:opacity-50 transition">
          {{ saving ? 'Generating…' : 'Generate Official Invoice' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { doc, getDoc, addDoc, updateDoc, collection, Timestamp } from 'firebase/firestore';
import SignaturePad from 'signature_pad';
import { db } from '../firebase';
import { COLLECTION, SERVICE_TYPES, PAYMENT_STATUSES } from '../config';
import ItemizedBreakdown from '../components/ItemizedBreakdown.vue';

const route = useRoute();
const router = useRouter();

const isEdit = computed(() => !!route.params.id);
const loading = ref(false);
const saving = ref(false);
const error = ref('');

const canvasRef = ref(null);
let sigPad = null;

const form = reactive({
  name: '', phone: '', email: '',
  roomName: '', roomType: 'room', plateNumber: '',
  start: '', end: '',
  serviceCost: 0, extraCosts: [],
  isManualCash: true,
  status: 'checked_out',
  adminName: '', adminPhone: ''
});

const dateInputType = computed(() => form.roomType === 'parking' ? 'datetime-local' : 'date');

// --- date helpers ---
const toInputValue = (jsDate, withTime) => {
  const d = new Date(jsDate);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return withTime ? local.toISOString().slice(0, 16) : local.toISOString().slice(0, 10);
};

const initSignature = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ratio = Math.max(window.devicePixelRatio || 1, 1);
  canvas.width = canvas.offsetWidth * ratio;
  canvas.height = canvas.offsetHeight * ratio;
  canvas.getContext('2d').scale(ratio, ratio);
  sigPad = new SignaturePad(canvas, { backgroundColor: 'rgb(255,255,255)' });
};

const clearSig = () => sigPad && sigPad.clear();

onMounted(async () => {
  // Prefill from an existing booking if editing (calendar click)
  if (isEdit.value) {
    loading.value = true;
    try {
      const snap = await getDoc(doc(db, COLLECTION, route.params.id));
      if (snap.exists()) {
        const b = snap.data();
        form.name = b.name || '';
        form.phone = b.phone || '';
        form.email = b.email || '';
        form.roomName = b.roomName || '';
        form.roomType = b.roomType || 'room';
        form.plateNumber = b.plateNumber || '';
        const withTime = form.roomType === 'parking';
        if (b.start?.toDate) form.start = toInputValue(b.start.toDate(), withTime);
        if (b.end?.toDate) form.end = toInputValue(b.end.toDate(), withTime);
        form.serviceCost = b.serviceCost ?? 0;
        form.extraCosts = Array.isArray(b.extraCosts)
          ? b.extraCosts.map(e => ({ name: e.name || '', amount: Number(e.amount) || 0 }))
          : [];
        form.isManualCash = typeof b.isManualCash === 'boolean' ? b.isManualCash : true;
        // If a booking status was one of ours, reuse it; otherwise default.
        form.status = ['checked_out', 'checked_in', 'confirmed'].includes(b.status) ? b.status : 'checked_out';
        // Signature intentionally left blank for the admin to sign.
      } else {
        error.value = 'Booking not found. You can still create a new invoice.';
      }
    } catch (e) {
      console.error(e);
      error.value = 'Could not load the booking.';
    } finally {
      loading.value = false;
    }
  }
  await nextTick();
  setTimeout(initSignature, 50);
});

const submit = async () => {
  error.value = '';
  if (!form.name || !form.start || !form.end) {
    error.value = 'Please fill in guest name, check-in and check-out dates.';
    return;
  }
  if (new Date(form.end) < new Date(form.start)) {
    error.value = 'Check-out cannot be before check-in.';
    return;
  }

  saving.value = true;
  try {
    // Signature -> inline data URL (no Firebase Storage needed)
    const adminSignatureUrl = (sigPad && !sigPad.isEmpty()) ? sigPad.toDataURL('image/png') : null;

    const cleanedExtras = form.extraCosts
      .map(e => ({ name: (e.name || '').trim(), amount: Number(e.amount) || 0 }))
      .filter(e => e.name !== '');
    const extrasTotal = cleanedExtras.reduce((s, e) => s + e.amount, 0);
    const grandTotal = (Number(form.serviceCost) || 0) + extrasTotal;

    const payload = {
      name: form.name,
      phone: form.phone,
      email: form.email || null,
      roomName: form.roomName,
      roomType: form.roomType,
      plateNumber: form.roomType === 'parking' ? (form.plateNumber || null) : null,
      start: Timestamp.fromDate(new Date(form.start)),
      end: Timestamp.fromDate(new Date(form.end)),
      serviceCost: Number(form.serviceCost) || 0,
      extraCosts: cleanedExtras,
      totalPrice: grandTotal,
      isManualCash: form.isManualCash,
      status: form.status,
      adminName: form.adminName || null,
      adminPhone: form.adminPhone || null,
      adminSignatureUrl,
      source: 'manual',
      invoiceGenerated: true
    };

    let id = route.params.id;
    if (isEdit.value && id) {
      await updateDoc(doc(db, COLLECTION, id), payload);
    } else {
      payload.createdAt = Timestamp.now();
      const ref = await addDoc(collection(db, COLLECTION), payload);
      id = ref.id;
    }
    router.push(`/invoice/${id}`);
  } catch (e) {
    console.error(e);
    error.value = 'Error saving invoice: ' + e.message;
  } finally {
    saving.value = false;
  }
};
</script>
