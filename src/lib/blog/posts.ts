// Rulio blog: SEO articles. Plain data so pages, sitemap and JSON-LD share one source.

export interface BlogSection {
  h2: string;
  paragraphs?: string[];
  list?: string[];
  ordered?: boolean;
  note?: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  date: string; // ISO, published
  updated?: string;
  readMinutes: number;
  category: string;
  intro: string;
  sections: BlogSection[];
  sources?: { title: string; url: string }[];
}

export const posts: BlogPost[] = [
  {
    slug: 'prava-olish-tartibi-2026',
    title: "Prava olish tartibi 2026: avtomaktabdan guvohnomagacha",
    description:
      "2026-yilda haydovchilik guvohnomasini olish bosqichma-bosqich: yosh talabi, avtomaktab, nazariy va amaliy imtihon, sertifikat va guvohnoma berilishi. 1-fevraldan nima o'zgardi.",
    keywords: ['prava olish tartibi 2026', 'haydovchilik guvohnomasi olish', 'prava olish', 'avtomaktab 2026', 'YIM imtihon'],
    date: '2026-11-02',
    readMinutes: 5,
    category: 'Prava olish',
    intro:
      "Haydovchilik guvohnomasi bir necha bosqichdan o'tib olinadi: o'qish, tibbiy ma'lumotnoma, ikkita imtihon va guvohnomani rasmiylashtirish. 2026-yildan boshlab nazariy qismni mustaqil o'qish mumkin bo'ldi. Quyida butun yo'lni tartib bilan yozdik.",
    sections: [
      {
        h2: '1. Yosh talabi',
        paragraphs: [
          "B toifasi (yengil avtomobil) uchun guvohnoma 18 yoshdan beriladi. Boshqa toifalar uchun yosh chegarasi farq qiladi.",
          "2026-yil 1-yanvardan moped va skuterlar uchun alohida A1 toifasi joriy qilindi. A, B, C yoki D toifali guvohnomasi borlar uchun A1 bo'yicha qo'shimcha o'qish talab qilinmaydi.",
        ],
      },
      {
        h2: "2. O'qish: nazariya mustaqil, amaliyot avtomaktabda",
        paragraphs: [
          "Vazirlar Mahkamasining 2025-yil 25-oktabrdagi 676-son qaroriga ko'ra, 2026-yil 1-fevraldan A va B toifalari bo'yicha nazariy qismni mustaqil, onlayn yoki oflayn o'qish mumkin.",
          "Amaliy mashg'ulotlar esa majburiy bo'lib qoladi va faqat davlat yoki xususiy avtomaktabda, instruktor bilan o'tiladi.",
        ],
        note: "Nazariyani mustaqil o'qiyotgan bo'lsangiz, Rulio'dagi 63 bilet va xatolar tahlili aynan shu bosqich uchun.",
      },
      {
        h2: '3. Tibbiy ma\'lumotnoma',
        paragraphs: [
          "Imtihonga hujjat topshirishda tibbiy ko'rikdan o'tganingizni tasdiqlovchi 083-shakl kerak bo'ladi. Uni oldindan oling, chunki usiz ariza qabul qilinmaydi.",
        ],
      },
      {
        h2: '4. Yagona imtihon markaziga (YIM) ariza',
        paragraphs: ['Arizani onlayn yoki markazning o\'zida topshirasiz. Odatda quyidagilar so\'raladi:'],
        list: ['ariza', 'pasport yoki ID-karta', '083-shakldagi tibbiy ma\'lumotnoma', "avtomaktabda amaliy o'qishni tugatganlik haqidagi ma'lumot"],
      },
      {
        h2: '5. Nazariy imtihon',
        paragraphs: [
          "Kompyuterda 20 ta savolga javob berasiz. B toifasi uchun kamida 18 ta to'g'ri javob kerak, ya'ni 2 tagacha xato qilish mumkin. A1 toifasi uchun 16 ta to'g'ri javob yetarli.",
          "Imtihon formati haqida batafsil alohida maqolamizda yozdik.",
        ],
      },
      {
        h2: '6. Amaliy imtihon',
        paragraphs: [
          "Nazariyadan o'tgach, amaliy imtihon topshiriladi: avtodromdagi mashqlar va shahar yo'llarida haydash. Ikkalasidan o'tganlarga sertifikat beriladi.",
        ],
      },
      {
        h2: '7. Guvohnomani olish',
        paragraphs: [
          "Sertifikat 1 yil davomida guvohnoma olish uchun asos bo'ladi. Guvohnomani YHXX bo'linmasi, Davlat xizmatlari markazi yoki my.gov.uz portali orqali rasmiylashtirasiz. Milliy guvohnoma 10 yil muddatga beriladi.",
        ],
        note: "Imtihon va guvohnoma uchun to'lov miqdorlari o'zgarib turadi. Ariza topshirishdan oldin amaldagi summani my.gov.uz yoki YIM'dan aniqlang.",
      },
    ],
    sources: [
      { title: 'Haydovchilik guvohnomasini olish tartibi — gov.uz', url: 'https://gov.uz/oz/advice/727/document/3388' },
      { title: "Avtomaktabda o'qish majburiy bo'lmaydi — Afisha.uz", url: 'https://www.afisha.uz/uz/gorod/2025/10/27/driving-schools' },
      { title: "YHXBB 2026-yildagi o'zgarishlarni tushuntirdi — Anhor.uz", url: 'https://anhor.uz/news/driver-training/' },
    ],
  },
  {
    slug: 'nazariy-imtihon-2026',
    title: "Nazariy imtihon 2026: 20 savol va 2 ta xato chegarasi",
    description:
      "Prava nazariy imtihoni qanday o'tadi: savollar soni, o'tish bali, qayta topshirish, A1 toifasi uchun farq va imtihon kuni yo'l qo'yiladigan xatolar.",
    keywords: ['nazariy imtihon', 'prava test 2026', 'prava imtihon savollari', 'nazariy imtihon necha savol', 'A1 toifa'],
    date: '2026-11-02',
    readMinutes: 4,
    category: 'Imtihon',
    intro:
      "Nazariy imtihon ko'pchilik uchun eng qo'rqinchli bosqich, garchi u aniq qoidalar bilan o'tsa ham. Formatni oldindan bilsangiz, imtihon kuni hech narsa sizni hayron qoldirmaydi.",
    sections: [
      {
        h2: 'Imtihon formati',
        list: [
          'Kompyuterda 20 ta savol, har birida bir nechta javob varianti',
          "B toifasi: kamida 18 ta to'g'ri javob, ya'ni 2 tagacha xato",
          "A1 toifasi (moped, skuter): kamida 16 ta to'g'ri javob",
          "Vaqt cheklangan: aniq vaqtni YIM'da yoki my.gov.uz'da tekshiring. Rulio'dagi imtihon rejimi 25 daqiqa bilan ishlaydi",
          "Birinchi urinishda o'tolmasangiz, 7 kundan keyin qayta topshirish mumkin (Kun.uz ma'lumotiga ko'ra)",
        ],
      },
      {
        h2: "Savollar nimalar haqida bo'ladi",
        paragraphs: [
          "Savollar Yo'l harakati qoidalari (YHQ)ning barcha bo'limlaridan tushadi: haydovchi va piyodalarning vazifalari, yo'l belgilari, yo'l chiziqlari, chorrahalardan o'tish, maxsus transport vositalari, YPX inspektorining ishoralari va birinchi tibbiy yordam.",
          "Rulio bazasidagi 1250 dan ortiq savolning eng katta qismi \"Umumiy qoidalar\" bo'limiga tegishli. Belgilar bo'yicha savollar esa har bir guruhdan (ogohlantiruvchi, taqiqlovchi, buyuruvchi va boshqalar) alohida beriladi.",
        ],
      },
      {
        h2: "Imtihon kuni ko'p uchraydigan xatolar",
        list: [
          "Savolni oxirigacha o'qimay javob berish: \"ruxsat etiladimi\" va \"taqiqlanadimi\" savollari aynan shunda adashtiradi",
          "Rasmdagi kichik belgini (masalan, qo'shimcha axborot taxtachasini) ko'rmay qolish",
          "Vaqtni bitta qiyin savolga sarflash: bilmagan savolni o'tkazib yuborib, oxirida qaytish yaxshiroq",
          "Biletni yodlab olish: imtihonda savollar aralash tushadi, shuning uchun qoidaning o'zini tushunish kerak",
        ],
      },
      {
        h2: 'Qanday mashq qilish kerak',
        paragraphs: [
          "Imtihon sharoitini takrorlash eng foydali usul: 20 savol, vaqt cheklovi va 2 ta xato chegarasi. Rulio'dagi imtihon rejimi aynan shunday ishlaydi. Har bir xatoingiz alohida ro'yxatga tushadi va izohi bilan ko'rsatiladi.",
        ],
      },
    ],
    sources: [
      { title: "YHXBB 2026-yildagi o'zgarishlarni tushuntirdi — Anhor.uz", url: 'https://anhor.uz/news/driver-training/' },
      { title: 'Haydovchilik imtihoni olinadigan markazdan reportaj — Kun.uz', url: 'https://kun.uz/news/2022/02/04/inson-omili-va-korrupsiyadan-xoli-haydovchilik-imtihoni-olinadigan-yangi-markazdan-reportaj' },
    ],
  },
  {
    slug: 'yaxlit-chiziq-yangi-qoida-2026',
    title: "Yaxlit chiziq: 1-noyabrdan nima o'zgardi (50 va 20 metr qoidasi)",
    description:
      "2026-yil 1-noyabrdan chorrahagacha 50 metr va qayrilish joyigacha 20 metr ichida 1.1 va 1.3 yaxlit chiziqni bosganlik uchun bayonnoma tuzilmaydi. Batafsil tushuntirish.",
    keywords: ['yaxlit chiziq', 'yaxlit chiziq jarima', 'yaxlit chiziq yangi qoida', '1.1 chiziq', 'yaxlit chiziq 50 metr'],
    date: '2026-11-02',
    readMinutes: 3,
    category: 'Yangiliklar',
    intro:
      "Vazirlar Mahkamasining 596-son qarori bilan 2026-yil 1-noyabrdan yaxlit chiziqni bosish bo'yicha qoidaga yengillik kiritildi. Lekin u hamma joyga emas, faqat ma'lum masofaga tegishli.",
    sections: [
      {
        h2: "Qaerda bayonnoma tuzilmaydi",
        list: [
          "Chorrahagacha 50 metr ichida",
          "Qayrilib olish joyigacha 20 metr ichida",
        ],
        paragraphs: [
          "Shu masofada yaxlit chiziqni bosganingiz uchun YPX inspektori bayonnoma tuzmaydi. Bu tirbandlikda qator almashish yoki burilishga tayyorlanishda haydovchilarga qulaylik uchun qilingan.",
        ],
      },
      {
        h2: 'Qaysi chiziqlarga tegishli',
        paragraphs: [
          "Yengillik faqat 1.1 (yaxlit chiziq) va 1.3 (qo'sh yaxlit chiziq) chiziqlariga tegishli. Boshqa yotiq chiziqlar bo'yicha qoidalar o'zgarmadi.",
        ],
      },
      {
        h2: 'Boshqa joylarda jarima saqlanadi',
        paragraphs: [
          "Chorraha va qayrilish joyidan uzoqda yaxlit chiziqni bosish yoki kesib o'tish avvalgidek qoidabuzarlik hisoblanadi. Ayniqsa quvib o'tish uchun yaxlit chiziqdan qarama-qarshi yo'lga chiqish xavfli va jazolanadi.",
        ],
        note: "Bu yangilik imtihon savollarida ham paydo bo'lishi mumkin. Rulio'da yangi qoidalar bo'yicha savollarni yeching.",
      },
    ],
  },
  {
    slug: 'eng-kop-xato-qilinadigan-savollar',
    title: "Imtihonda eng ko'p xato qilinadigan 5 mavzu",
    description:
      "Prava testida ko'pchilik yiqiladigan mavzular: chorrahada navbat, YPX inspektorining ishoralari, taqiqlovchi belgilar, tezlik cheklovlari va yo'l chiziqlari. Har biri bo'yicha qisqa tushuntirish.",
    keywords: ['prava test xatolari', 'biletlar javoblari', 'chorrahadan o\'tish qoidalari', 'YPX ishoralari', "yo'l belgilari test"],
    date: '2026-11-02',
    readMinutes: 5,
    category: 'Imtihon',
    intro:
      "Bir xil mavzulardagi savollar har yili ko'pchilikni imtihondan yiqitadi. Ularni oldindan bilib, mashq qilib olsangiz, 2 ta xato chegarasiga yetmaysiz.",
    sections: [
      {
        h2: '1. Chorrahada kim birinchi o\'tadi',
        paragraphs: [
          "Teng ahamiyatli yo'llar chorrahasida haydovchi o'ng tomondan yaqinlashayotgan transport vositasiga yo'l berishi shart. Tramvay esa, agar belgilar boshqacha tartib o'rnatmagan bo'lsa, rel'ssiz transportga nisbatan ustunlikka ega. Rasmli savollarda avval yo'lning ahamiyatini (asosiy yoki ikkinchi darajali), keyin yo'nalishlarni aniqlang.",
        ],
      },
      {
        h2: '2. YPX inspektorining ishoralari',
        paragraphs: [
          "Inspektor qo'lini tepaga ko'targanda barcha qatnashchilar uchun harakat taqiqlanadi. Lekin keskin tormoz bermasdan to'xtay olmaydigan haydovchi harakatni davom ettiradi, chorraha o'rtasida qotib qolmaslik kerak. Bu savolda ko'pchilik \"ruxsat etilmaydi\" deb xato qiladi.",
        ],
      },
      {
        h2: '3. Taqiqlovchi belgilar',
        paragraphs: [
          "3.1 \"Kirish taqiqlangan\" belgisi barcha transport vositalarining shu yo'lga kirishini taqiqlaydi. Rasmda belgi qaysi yo'l boshida turganiga e'tibor bering: undan keyingi burilishlar ham shu yo'l orqali bo'lsa, ular ham taqiqlangan bo'ladi.",
        ],
      },
      {
        h2: '4. Tezlik cheklovlari',
        paragraphs: [
          "Turar-joy dahalarida va hovlilarda harakat tezligi soatiga 20 km dan oshmasligi kerak va bu hududlarda piyodalar ustunlikka ega. Raqamlar bo'yicha savollarni yodlash emas, qaysi hududga tegishli ekanini tushunish muhim.",
        ],
      },
      {
        h2: "5. Yo'l chiziqlari",
        paragraphs: [
          "1.1 yaxlit va 1.3 qo'sh yaxlit chiziqni kesib o'tish taqiqlanadi, uzuq chiziqlarni esa kesib o'tish mumkin. 2026-yil 1-noyabrdan chorraha oldidagi 50 metr va qayrilish joyi oldidagi 20 metrda yengillik kiritildi, buni alohida maqolada yozdik.",
        ],
        note: "Rulio'da har bir xato savolingiz \"Xatolar\" bo'limiga tushadi. Ularni yopguncha takrorlang.",
      },
    ],
  },
  {
    slug: 'prava-testiga-tayyorgarlik-reja',
    title: "Prava testiga 14 kunda tayyorlanish rejasi",
    description:
      "Nazariy imtihonga 2 haftada tayyorlanish uchun kunlik reja: qancha bilet yechish, xatolar ustida ishlash va imtihon simulyatsiyasi.",
    keywords: ['prava testiga tayyorgarlik', 'prava test onlayn', 'avtotest', 'imtihonga tayyorlanish', 'prava test savollari'],
    date: '2026-11-02',
    readMinutes: 4,
    category: 'Maslahatlar',
    intro:
      "63 bilet ko'p tuyuladi, lekin kuniga 30–40 daqiqa ajratsangiz, ikki haftada bazani to'liq aylanib chiqib, xatolaringizni ham yopib ulgurasiz. Mana sinalgan reja.",
    sections: [
      {
        h2: '1–3-kun: tanishuv',
        paragraphs: [
          "Har kuni 3 ta bilet yeching, vaqtga qaramang. Maqsad baho emas, savollar uslubiga ko'nikish. Har bir xato javobdan keyin izohni o'qing.",
        ],
      },
      {
        h2: '4–9-kun: asosiy bosqich',
        paragraphs: [
          "Kuniga 6–8 ta bilet. Shu bosqichda 63 biletning hammasini kamida bir marta yechib chiqasiz. Kun oxirida 10 daqiqani \"Xatolar\" bo'limiga ajrating.",
        ],
      },
      {
        h2: '10–12-kun: xatolarni yopish',
        paragraphs: [
          "Yangi bilet emas, faqat xato qilgan savollaringiz va yiqilgan biletlaringiz. Har bir mavzu bo'yicha qoidaning o'zini YHQ'dan o'qib chiqing. Random test bilan biletni yodlab olmaganingizni tekshiring.",
        ],
      },
      {
        h2: '13–14-kun: imtihon simulyatsiyasi',
        paragraphs: [
          "Kuniga 3–4 marta to'liq imtihon rejimi: 20 savol, vaqt cheklovi, 2 ta xato chegarasi. Ketma-ket 5 marta o'tsangiz, haqiqiy imtihonga tayyorsiz.",
        ],
      },
      {
        h2: 'Imtihon kuni',
        list: [
          'Uyquga to\'ying, ertalab yangi narsa o\'qimang',
          "Har bir savolni oxirigacha o'qing",
          'Bilmagan savolni o\'tkazib yuboring va oxirida qayting',
        ],
        note: "Rejani Rulio'da bepul boshlang: birinchi 5 bilet bepul.",
      },
    ],
  },
];

export function getPost(slug: string) {
  return posts.find((p) => p.slug === slug);
}
