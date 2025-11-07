// File: generate-surah-json.js
import fs from "fs";
import fetch from "node-fetch";

const BASE_URL = "https://equran.id/api/v2/surat";

async function getAllSurah() {
  console.log("⏳ Mengambil daftar surah dari Equran.id...");
  const response = await fetch(BASE_URL);
  const data = await response.json();

  if (!data || !data.data) throw new Error("Gagal mengambil daftar surah");

  const surahList = data.data;
  const allSurahData = [];

  for (const surah of surahList) {
    try {
      const detailRes = await fetch(`${BASE_URL}/${surah.nomor}`);
      const detailData = await detailRes.json();

      const s = detailData.data;
      console.log(`✅ ${s.nomor}. ${s.namaLatin} (${s.jumlahAyat} ayat)`);

      const formatted = {
        number: s.nomor,
        name: s.nama,
        name_latin: s.namaLatin,
        number_of_ayahs: s.jumlahAyat,
        meaning: s.arti,
        description: s.deskripsi || "",
        audio_file: `${String(s.nomor).padStart(3, "0")}.mp3`,
        thumbnail: `${String(s.nomor).padStart(3, "0")}.jpg`,
        ayahs: s.ayat.map((a) => ({
          number: a.nomorAyat,
          arabic: a.teksArab,
          latin: a.teksLatin,
          translation: a.teksIndonesia,
        })),
      };

      allSurahData.push(formatted);
    } catch (err) {
      console.warn(`⚠️  Surah ${surah.nomor} gagal diambil, lanjut...`);
    }
  }

  const output = { surahs: allSurahData };
  fs.writeFileSync("./data/surah.json", JSON.stringify(output, null, 2));
  console.log("📘 File 'data/surah.json' berhasil dibuat dari Equran.id!");
}

getAllSurah().catch((err) => console.error("❌ Terjadi kesalahan:", err));
