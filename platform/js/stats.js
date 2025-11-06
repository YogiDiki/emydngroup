// stats.js — Statistik Mingguan Ibadah Emydn Langit

function renderWeeklyStats() {
  const history = emydnData.getHistory();
  const container = document.getElementById('weekly-stats');

  if (!container) return;

  if (history.length === 0) {
    container.innerHTML = '<p class="text-gray-400 text-center mt-4">Belum ada data ibadah tersimpan.</p>';
    return;
  }

  let html = `
    <table class="w-full mt-4 border border-gray-700 text-sm text-center">
      <thead class="bg-gray-800 text-gray-200">
        <tr>
          <th class="p-2 border border-gray-700">Tanggal</th>
          <th class="p-2 border border-gray-700">Shalat</th>
          <th class="p-2 border border-gray-700">Ngaji</th>
          <th class="p-2 border border-gray-700">Dzikir</th>
          <th class="p-2 border border-gray-700">Sedekah</th>
          <th class="p-2 border border-gray-700">Puasa</th>
        </tr>
      </thead>
      <tbody class="bg-gray-900 text-gray-300">
  `;

  history.forEach(day => {
    const h = day.habits || {};
    html += `
      <tr>
        <td class="border border-gray-700 p-2">${day.date}</td>
        <td class="border border-gray-700 p-2">${h.shalat ? '✅' : '❌'}</td>
        <td class="border border-gray-700 p-2">${h.ngaji ? '✅' : '❌'}</td>
        <td class="border border-gray-700 p-2">${h.dzikir ? '✅' : '❌'}</td>
        <td class="border border-gray-700 p-2">${h.sedekah ? '✅' : '❌'}</td>
        <td class="border border-gray-700 p-2">${h.puasa ? '✅' : '❌'}</td>
      </tr>
    `;
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}

// Jalankan setelah halaman load
document.addEventListener('DOMContentLoaded', renderWeeklyStats);
