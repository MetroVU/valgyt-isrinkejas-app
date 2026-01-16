# 🍕 Kur Valgom?

Svetainė skirta pasirinkti kur valgyti kartu su savo antrąja puse. Pasirenkate datą, abu pasirenkate po 3 vietas iš Bolt Food/Wolt, ir sužinote ar jūsų pasirinkimai sutampa.

## ✨ Funkcijos

- 📅 Datos pasirinkimas
- 👥 Du žmonės (Aš/Ji)
- 🍽️ Iki 3 restoranų kiekvienam
- 📝 Ką norėtumėte užsisakyti kiekvienoje vietoje
- 🎯 Automatinis sutapimų skaičiavimas
- 🎲 Atsitiktinis pasirinkimas
- 🎡 Laimės ratas (animuotas)
- 🔑 6 simbolių sesijos kodas (sinchronizacija tarp įrenginių)
- ☁️ Sesijos saugomos Vercel Blob (JSON)

## 🚀 Paleidimas lokaliai

```bash
npm install
npm run dev
```

Atidarykite naršyklėje http://localhost:3000

## 📦 Deployment į Vercel

1. Sujunkite repo su Vercel (Dashboard → New Project)
2. Pridėkite aplinkos kintamąjį `BLOB_READ_WRITE_TOKEN`
3. Kiekvienas push į `main` automatiškai deploy'ina

### Aplinka

Projektui reikalingas `BLOB_READ_WRITE_TOKEN` (Vercel Blob RW token):
- Lokaliai: `.env.local` faile `BLOB_READ_WRITE_TOKEN=...`
- Vercel: Project Settings → Environment Variables

## 🏗️ Projekto struktūra

```
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── api/session/ (sesijos API)
├── components/
│   ├── DatePicker.tsx
│   ├── PersonSelector.tsx
│   ├── RestaurantCard.tsx
│   ├── ResultsView.tsx
│   └── SpinWheel.tsx
├── lib/
│   ├── data.ts
│   └── storage.ts
└── ...config files
```

## 💡 Kaip naudoti

1. Pasirinkite datą
2. Pasirinkite kas esate (Aš/Ji)
3. Pasirinkite iki 3 vietų ir parašykite ką norėtumėte
4. Pateikite pasirinkimą
5. Pasidalinkite sesijos kodu su kitu įrenginiu
6. Peržiūrėkite rezultatus:
   - 1 sutapimas → automatinis laimėtojas
   - Keli sutapimai → rinkitės iš sutapimų
   - Nėra sutapimų → atsitiktinis arba laimės ratas (iš abiejų pasirinkimų)

## 🛠️ Technologijos

- Next.js 16
- TypeScript
- Tailwind CSS
- Vercel Blob (sesijų saugojimas)

## 📝 Pastabos

- Sesijoms būtinas `BLOB_READ_WRITE_TOKEN`
- Sinchronizacijai naudojamas 6 simbolių kodas, nereikia nuorodų
- Restoranų sąrašas pavyzdinis

---

Sukurta su ❤️ Kaune
