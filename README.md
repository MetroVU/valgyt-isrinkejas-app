# 🍕 Kur Valgom?

Svetainė skirta pasirinkti kur valgyti kartu su savo antrąja puse! Pasirinkite datą, pasirinkite 3 restoranus iš Bolt Food ir Wolt Kaune, ir sužinokite ar jūsų pasirinkimai sutampa!

## ✨ Funkcijos

- 📅 **Datos pasirinkimas** - Pasirinkite dieną kada norite valgyti
- 👥 **Du žmonės** - Kiekvienas pasirenka atskirai
- 🍽️ **3 restoranai** - Pasirinkite iki 3 mėgstamų vietų
- 📝 **Užsakymai** - Parašykite ką norėtumėte užsisakyti
- 🎯 **Sutapimų tikrinimas** - Automatiškai patikrina ar pasirinkimai sutampa
- 🎲 **Atsitiktinis pasirinkimas** - Jei nesutampa, galite išrinkti atsitiktinai
- 🎡 **Laimės ratas** - Sukite ratą ir leiskite likimui nuspręsti!

## 🚀 Paleidimas lokaliai

```bash
# Įdiegti priklausomybes
npm install

# Paleisti development serverį
npm run dev
```

Atsidarykite [http://localhost:3000](http://localhost:3000) naršyklėje.

## 📦 Deployment į Vercel

### Būdas 1: Per Vercel Dashboard

1. Sukurkite [Vercel](https://vercel.com) paskyrą
2. Įkelkite kodą į GitHub repository
3. Vercel Dashboard paspauskite "New Project"
4. Pasirinkite savo GitHub repository
5. Paspauskite "Deploy"

### Būdas 2: Per Vercel CLI

```bash
# Įdiegti Vercel CLI
npm install -g vercel

# Prisijungti
vercel login

# Deploy
vercel
```

### Būdas 3: Git integration

1. Push'inkite kodą į GitHub/GitLab/Bitbucket
2. Sujunkite repository su Vercel
3. Kiekvienas push automatiškai sukurs naują deployment

## 🏗️ Projekto struktūra

```
├── app/
│   ├── globals.css      # Globalūs stiliai
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Pagrindinis puslapis
├── components/
│   ├── DatePicker.tsx   # Datos pasirinkimas
│   ├── PersonSelector.tsx # Asmens pasirinkimas
│   ├── RestaurantCard.tsx # Restorano kortelė
│   ├── OrderInput.tsx   # Užsakymo įvedimas
│   ├── ResultsView.tsx  # Rezultatų rodymas
│   └── SpinWheel.tsx    # Laimės ratas
├── lib/
│   ├── data.ts          # Restoranų duomenys
│   └── storage.ts       # Local storage valdymas
└── ...config files
```

## 🍔 Restoranai

Svetainėje yra restoranai iš:
- **Bolt Food** - Čili Pica, Hesburger, KFC, Subway, Wok to Walk, ir kt.
- **Wolt** - McDonald's, Can Can Pizza, Manami, Grill London, Thai Cuisine, ir kt.

## 💡 Kaip naudoti

1. **Pasirinkite datą** - Kurią dieną norite valgyti?
2. **Pasirinkite kas esate** - "Aš" arba "Ji"
3. **Pasirinkite 3 restoranus** - Iš Bolt Food ir Wolt
4. **Parašykite ką norite** - Kiekvienai vietai galite įrašyti ką norėtumėte užsisakyti
5. **Pateikite pasirinkimą** - Palaukite kol kitas žmogus pasirenka
6. **Peržiūrėkite rezultatus**:
   - Jei yra 1 sutapimas - ta vieta automatiškai laimėjo!
   - Jei yra keli sutapimai - galite išrinkti iš jų
   - Jei nėra sutapimų - naudokite atsitiktinį pasirinkimą arba laimės ratą

## 🛠️ Technologijos

- [Next.js 14](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Local Storage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) - Duomenų saugojimas

## 📝 Pastabos

- Duomenys saugomi naršyklės Local Storage
- Kad abu žmonės galėtų dalyvauti, jie turi naudoti tą pačią naršyklę/įrenginį ARBA pasidalinti nuoroda
- Restoranų sąrašas yra pavyzdinis ir gali neatitikti tikrų Bolt Food/Wolt pasiūlymų

## 🎨 Pritaikymas

Norėdami pridėti daugiau restoranų, redaguokite `lib/data.ts` failą:

```typescript
{
  id: 'unique-id',
  name: 'Restorano Pavadinimas',
  platform: 'bolt' | 'wolt',
  cuisine: 'Virtuvės tipas',
  rating: 4.5,
  deliveryTime: '25-35 min',
  priceRange: '€€',
  image: '🍕' // emoji
}
```

---

Sukurta su ❤️ Kaune
