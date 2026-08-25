<template>
  <div class="min-h-screen bg-slate-100 p-4 md:p-8">

    <div v-if="loading" class="flex flex-col items-center justify-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      <p class="mt-4 text-slate-500">Loading Invoice…</p>
    </div>

    <div v-else-if="!booking" class="text-center text-red-500 mt-20">
      <h2 class="text-2xl font-bold">Invoice Not Found</h2>
      <p>The requested booking ID does not exist.</p>
      <router-link to="/" class="text-indigo-600 underline mt-4 block">Go Home</router-link>
    </div>

    <template v-else>
      <!-- ===== PRINTABLE INVOICE (captured to PDF) ===== -->
      <div ref="invoiceRef" class="max-w-3xl mx-auto bg-white p-6 md:p-10 shadow-lg rounded-xl relative overflow-hidden">

        <div v-if="booking.status === 'cancelled'" class="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 -rotate-45 z-0">
          <span class="text-8xl font-bold text-red-500 border-8 border-red-500 p-4 rounded-xl">CANCELLED</span>
        </div>

        <!-- Header -->
        <div class="flex flex-col-reverse sm:flex-row justify-between items-start gap-4 border-b pb-6 mb-6 relative z-10">
          <div>
            <h1 class="text-2xl md:text-3xl font-bold text-slate-800 uppercase">{{ invoiceTitle(booking.status) }}</h1>
            <p class="text-slate-500 mt-1">Receipt #{{ booking.id.substring(0, 8).toUpperCase() }}</p>
            <p class="text-xs text-slate-400">Date: {{ createdDate }}</p>
          </div>
          <div class="text-left sm:text-right flex flex-col items-start sm:items-end">
            <img :src="logo" alt="Seroja Corner Homestay" class="h-20 w-20 object-contain mb-2">
            <h2 class="text-lg md:text-xl font-bold text-indigo-600">{{ businessConfig.name }}</h2>
            <p class="text-sm text-slate-500">{{ businessConfig.location }}</p>
            <p class="text-sm text-slate-500" v-if="businessConfig.phone">Tel: {{ businessConfig.phone }}</p>
          </div>
        </div>

        <!-- Billed to / service -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 relative z-10">
          <div>
            <p class="text-xs font-bold text-slate-400 uppercase mb-1">Billed To</p>
            <p class="font-bold text-lg text-slate-800">{{ booking.name }}</p>
            <p class="text-slate-600">{{ booking.phone }}</p>
            <p class="text-slate-600">{{ booking.email || 'N/A' }}</p>
          </div>
          <div class="sm:text-right">
            <p class="text-xs font-bold text-slate-400 uppercase mb-2">Service Details</p>
            <p class="font-bold text-slate-800">{{ booking.roomName }}</p>
            <p v-if="booking.plateNumber" class="font-mono bg-yellow-100 inline-block px-2 rounded mt-0.5">Plate: {{ booking.plateNumber }}</p>
            <p class="text-slate-500 mt-0.5">{{ dateRange }}</p>
          </div>
        </div>

        <!-- Status -->
        <div class="bg-slate-50 border-y border-slate-200 py-3 px-4 mb-8 flex justify-between items-center relative z-10">
          <span class="font-bold text-slate-500 text-sm uppercase">Payment Status</span>
          <span class="font-bold px-3 py-1 rounded text-sm"
            :class="{
              'bg-indigo-100 text-indigo-800': booking.status === 'confirmed',
              'bg-green-100 text-green-800': booking.status === 'checked_in' || booking.status === 'checked_out',
              'bg-gray-200 text-gray-800': booking.status === 'cancelled'
            }">
            {{ statusLabel(booking.status).toUpperCase() }}
          </span>
        </div>

        <!-- Line items -->
        <table class="w-full mb-8 relative z-10">
          <thead class="bg-slate-100">
            <tr>
              <th class="text-left p-3 text-sm font-bold text-slate-600 rounded-l">Description</th>
              <th class="text-right p-3 text-sm font-bold text-slate-600 rounded-r">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="p-3 border-b border-slate-200">
                <span class="font-bold text-slate-800">{{ booking.roomName }}</span>
                <span class="text-slate-500 text-xs ml-1">({{ booking.roomType === 'room' ? 'Accommodation' : 'Parking' }})</span>
              </td>
              <td class="p-3 border-b border-slate-200 text-right font-bold text-slate-800">RM {{ booking.serviceCost }}</td>
            </tr>

            <template v-for="(extra, i) in (booking.extraCosts || [])" :key="'x-'+i">
              <tr v-if="extra.name">
                <td class="p-3 border-b border-slate-200">
                  <span class="font-bold text-slate-800">{{ extra.name }}</span>
                  <span class="text-slate-500 text-xs ml-1">(Extended Service)</span>
                </td>
                <td class="p-3 border-b border-slate-200 text-right font-bold"
                    :class="extra.amount < 0 ? 'text-emerald-600' : 'text-slate-800'">
                  {{ formatRM(extra.amount) }}
                </td>
              </tr>
            </template>
          </tbody>
        </table>

        <!-- Total -->
        <div class="flex justify-end mb-10 relative z-10">
          <div class="text-right">
            <p class="text-sm text-slate-500">Total Amount</p>
            <p class="text-3xl md:text-4xl font-bold text-indigo-600">RM {{ booking.totalPrice }}</p>
          </div>
        </div>

        <!-- Admin auth + payment method -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
          <div v-if="booking.adminSignatureUrl || booking.adminName">
            <p class="text-xs font-bold text-slate-400 uppercase mb-2">Authorized By (Admin)</p>
            <img v-if="booking.adminSignatureUrl" :src="booking.adminSignatureUrl" class="h-20 object-contain border border-slate-200 rounded p-2 bg-white" alt="Admin Signature">
            <p class="text-[10px] text-slate-400 mt-1">
              {{ booking.adminName }}<span v-if="booking.adminName && booking.adminPhone"> | </span>{{ booking.adminPhone }}
            </p>
          </div>

          <div class="flex flex-col justify-center">
            <p class="text-xs font-bold text-slate-400 uppercase mb-2">Payment Method</p>
            <p v-if="booking.isManualCash" class="font-bold text-emerald-600 text-lg">CASH (Manual Collection)</p>
            <p v-else class="font-bold text-blue-600 text-lg">ONLINE BANKING</p>
          </div>
        </div>

        <div class="border-t pt-6 mt-10 text-center text-slate-400 text-xs relative z-10">
          <p>Thank you for choosing us! We hope you have a pleasant stay.</p>
          <p class="mt-1">This is a computer-generated receipt and requires no physical signature.</p>
        </div>
      </div>
      <!-- ===== /PRINTABLE INVOICE ===== -->

      <!-- Actions (never part of the PDF) -->
      <div class="max-w-3xl mx-auto mt-6 flex flex-wrap justify-center gap-3">
        <button @click="generatePdf" :disabled="generating"
          class="bg-indigo-600 text-white px-6 py-2 rounded shadow hover:bg-indigo-700 font-bold transition disabled:opacity-50">
          {{ generating ? 'Generating…' : '📄 Generate PDF' }}
        </button>
        <router-link to="/booking" class="bg-slate-200 text-slate-700 px-6 py-2 rounded shadow hover:bg-slate-300 font-bold transition">
          Calendar
        </router-link>
        <router-link to="/" class="bg-slate-200 text-slate-700 px-6 py-2 rounded shadow hover:bg-slate-300 font-bold transition">
          Home
        </router-link>
      </div>
      <p class="max-w-3xl mx-auto mt-3 text-center text-xs text-slate-400">
        The PDF opens in a new tab — from there you can print, save, or share it.
      </p>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { doc, getDoc } from 'firebase/firestore';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import { db } from '../firebase';
import { COLLECTION, businessConfig, statusLabel, invoiceTitle } from '../config';
import logo from '../assets/SerojaCornerLogo.png';

const route = useRoute();
const booking = ref(null);
const loading = ref(true);
const generating = ref(false);
const invoiceRef = ref(null);

const formatRM = (v) => {
  const n = Number(v) || 0;
  return n < 0 ? `- RM ${Math.abs(n)}` : `RM ${n}`;
};

const fmtDate = (ts) => ts?.toDate ? ts.toDate().toLocaleDateString() : 'N/A';
const createdDate = computed(() => booking.value?.createdAt ? fmtDate(booking.value.createdAt) : new Date().toLocaleDateString());
const dateRange = computed(() => booking.value ? `${fmtDate(booking.value.start)} - ${fmtDate(booking.value.end)}` : '');

onMounted(async () => {
  try {
    const snap = await getDoc(doc(db, COLLECTION, route.params.id));
    if (snap.exists()) booking.value = { id: snap.id, ...snap.data() };
  } catch (e) {
    console.error('Error loading invoice:', e);
  } finally {
    loading.value = false;
  }
});

const generatePdf = async () => {
  const el = invoiceRef.value;
  if (!el || !booking.value) return;
  generating.value = true;

  // Force a consistent desktop-width capture regardless of the device viewport,
  // so the PDF looks identical on phone and desktop.
  const prevWidth = el.style.width;
  el.style.width = '800px';

  const filename = `invoice-${booking.value.id.substring(0, 8).toUpperCase()}.pdf`;

  try {
    // html2canvas-pro understands Tailwind v4's oklch() colours (the original
    // html2canvas does not, which caused the "unsupported color function" error).
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      windowWidth: 820
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();

    const imgW = pageW;
    const imgH = (canvas.height * imgW) / canvas.width;

    // Tile the tall invoice image across as many A4 pages as needed.
    let heightLeft = imgH;
    let position = 0;
    pdf.addImage(imgData, 'JPEG', 0, position, imgW, imgH);
    heightLeft -= pageH;
    while (heightLeft > 0) {
      position -= pageH;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgW, imgH);
      heightLeft -= pageH;
    }

    const url = URL.createObjectURL(pdf.output('blob'));
    const win = window.open(url, '_blank');
    // If a popup blocker stops the new tab, fall back to a direct download.
    if (!win) {
      const a = document.createElement('a');
      a.href = url; a.download = filename; a.click();
    }
  } catch (e) {
    console.error(e);
    alert('Could not generate PDF: ' + e.message);
  } finally {
    el.style.width = prevWidth;
    generating.value = false;
  }
};
</script>