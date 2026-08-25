<template>
  <div class="min-h-screen flex flex-col items-center justify-center px-6 py-16">
    <div class="text-center mb-10">
      <img :src="logo" alt="Seroja Corner" class="h-24 w-24 object-contain mx-auto mb-4">
      <h1 class="text-2xl md:text-3xl font-bold text-slate-800">{{ businessConfig.name }}</h1>
      <p class="text-slate-500 mt-1">Admin Tools</p>
    </div>

    <div class="grid gap-4 w-full max-w-md">
      <router-link
        to="/booking"
        class="group bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-indigo-300 transition flex items-center gap-4">
        <span class="text-3xl">📅</span>
        <span>
          <span class="block font-bold text-slate-800 group-hover:text-indigo-600">Bookings &amp; Calendar</span>
          <span class="block text-sm text-slate-500">Record a booking and view the schedule</span>
        </span>
      </router-link>

      <router-link
        to="/manual-invoice"
        class="group bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-indigo-300 transition flex items-center gap-4">
        <span class="text-3xl">🧾</span>
        <span>
          <span class="block font-bold text-slate-800 group-hover:text-indigo-600">New Manual Invoice</span>
          <span class="block text-sm text-slate-500">Generate an official receipt</span>
        </span>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import logo from '../assets/SerojaCornerLogo.png';
import { businessConfig } from '../config';
</script>
