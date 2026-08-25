<template>
  <div class="bg-slate-50 p-4 rounded-xl border border-slate-200">
    <h3 class="text-sm font-bold text-slate-800 mb-3">Itemized Payment Breakdown</h3>

    <!-- Base service cost -->
    <div class="mb-3">
      <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Base Service Cost (RM)</label>
      <input
        type="number"
        v-model.number="form.serviceCost"
        class="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-400 outline-none">
    </div>

    <!-- Extended services (optional, up to MAX; amounts may be negative for discounts) -->
    <div class="border-t border-slate-200 pt-3 mb-3">
      <div class="flex justify-between items-center mb-2">
        <label class="block text-xs font-bold text-slate-500 uppercase">Extended Services (Optional)</label>
        <span class="text-xs font-mono text-slate-400">{{ form.extraCosts.length }} / {{ MAX_EXTRA_SERVICES }}</span>
      </div>

      <div v-for="(extra, index) in form.extraCosts" :key="index" class="flex gap-2 mb-2 items-center">
        <input
          v-model="extra.name"
          placeholder="Service name (e.g. Late Checkout, Discount)"
          class="flex-1 min-w-0 p-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-indigo-400 outline-none">
        <input
          type="number"
          v-model.number="extra.amount"
          placeholder="RM"
          class="w-24 shrink-0 p-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-indigo-400 outline-none">
        <button
          @click="removeExtra(index)"
          type="button"
          class="text-red-500 hover:text-red-700 font-bold px-1 text-xl leading-none shrink-0"
          title="Remove service">&times;</button>
      </div>

      <button
        @click="addExtra"
        type="button"
        :disabled="form.extraCosts.length >= MAX_EXTRA_SERVICES"
        class="text-xs font-bold text-indigo-600 hover:underline disabled:opacity-40 disabled:cursor-not-allowed disabled:no-underline mt-1">
        + Add Service
      </button>
      <p v-if="form.extraCosts.length >= MAX_EXTRA_SERVICES" class="text-xs text-amber-600 mt-1">
        Maximum of {{ MAX_EXTRA_SERVICES }} extended services reached.
      </p>
    </div>

    <!-- Grand total -->
    <div class="flex justify-between items-center border-t border-slate-200 pt-3">
      <span class="font-bold text-slate-600">Grand Total:</span>
      <span class="text-2xl font-bold text-emerald-600">RM {{ grandTotal }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { MAX_EXTRA_SERVICES } from '../config';

// The parent passes its reactive `form` object; we read/mutate serviceCost and
// extraCosts on it directly so both forms share identical behaviour.
const props = defineProps({
  form: { type: Object, required: true }
});

const grandTotal = computed(() => {
  const base = Number(props.form.serviceCost) || 0;
  const extras = props.form.extraCosts.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  return base + extras;
});

const addExtra = () => {
  if (props.form.extraCosts.length >= MAX_EXTRA_SERVICES) return;
  props.form.extraCosts.push({ name: '', amount: 0 });
};

const removeExtra = (index) => {
  props.form.extraCosts.splice(index, 1);
};

// Helper the parent can import if it wants the same total (kept simple: parent
// recomputes on submit).
defineExpose({ grandTotal });
</script>
