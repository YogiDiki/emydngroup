@echo off
echo.
echo ========================================
echo     🚀 Push Cepat ke GitHub + Vercel
echo ========================================
echo.

REM Add & Commit ke GitHub
git add .
git commit -m "Quick update %date% %time%"
git push origin main

echo.
echo ========================================
echo     🔄 Deploy Otomatis ke Vercel
echo ========================================
echo.

REM Deploy otomatis ke Vercel (silent mode)
vercel --prod --yes

echo.
echo ========================================
echo     ✅ Selesai! Cek di: https://emydngroup.vercel.app
echo ========================================
pause
