import { QuestionWithAnswer } from '@/types/test';

export interface YHQQuestion extends QuestionWithAnswer {
  categoryKey: 'belgilar' | 'chorraha' | 'svetofor' | 'tezlik' | 'toxtash' | 'tibbiyot' | 'texnik' | 'qonun';
  difficulty?: 'easy' | 'medium' | 'hard';
  illustrationType?: 'sign' | 'crossroad' | 'parking' | 'none';
  signCode?: string;
}

export const YHQ_QUESTION_BANK: YHQQuestion[] = [
  // ==========================================
  // 1. YO'L BELGILARI VA CHIZIQLARI
  // ==========================================
  {
    questionId: 'yhq-sign-1',
    ticketNumber: 1,
    questionNumber: 1,
    categoryKey: 'belgilar',
    category: "Yo'l belgilari",
    text: "«Asosiy yo'l» belgisi (2.1) qaysi chorrahalarda imtiyoz beradi?",
    correctAnswer: 0,
    illustrationType: 'sign',
    signCode: '2.1',
    explanation: "«Asosiy yo'l» belgisi tartibga solinmagan chorrahalarda harakatlanishda birinchi bo'lib o'tish imtiyozini beradi.",
    answers: [
      { index: 0, text: "Tartibga solinmagan barcha chorrahalarda" },
      { index: 1, text: "Faqat svetofor bilan tartibga solingan chorrahalarda" },
      { index: 2, text: "Faqat aholi punktlaridan tashqarida" },
      { index: 3, text: "Faqat o'ng tomonga burilganda" },
    ],
  },
  {
    questionId: 'yhq-sign-2',
    ticketNumber: 1,
    questionNumber: 2,
    categoryKey: 'belgilar',
    category: "Yo'l belgilari",
    text: "«Kirish taqiqlangan» (3.1 - G'isht) belgisi kimlarga tatbiq etilmaydi?",
    correctAnswer: 1,
    illustrationType: 'sign',
    signCode: '3.1',
    explanation: "3.1 «Kirish taqiqlangan» belgisi belgilangan yo'nalishli transport vositalariga (avtobus, marshrutli taksi) tatbiq etilmaydi.",
    answers: [
      { index: 0, text: "Ushbu hududda yashovchi aholining shaxsiy avtomobillariga" },
      { index: 1, text: "Belgilangan yo'nalishli transport vositalariga (avtobus va h.k.)" },
      { index: 2, text: "Taksi xizmatlariga" },
      { index: 3, text: "Nogiron haydovchilarga" },
    ],
  },
  {
    questionId: 'yhq-sign-3',
    ticketNumber: 1,
    questionNumber: 3,
    categoryKey: 'belgilar',
    category: "Yo'l belgilari",
    text: "«Harakatlanish taqiqlangan» (3.2) belgisi ta'sir doirasiga kimlar kirishi mumkin?",
    correctAnswer: 2,
    illustrationType: 'sign',
    signCode: '3.2',
    explanation: "3.2 belgisi ta'sir doirasida yashovchi yoki ishlovchi fuqarolarga, ularga xizmat ko'rsatuvchi transportlarga va 1-2 guruh nogironlariga ruxsat beriladi.",
    answers: [
      { index: 0, text: "Faqat tez yordam va o't o'chirish mashinalariga" },
      { index: 1, text: "Har qanday yengil avtomobilga" },
      { index: 2, text: "Ushbu hududda yashovchi yoki ishlovchi fuqarolarning transport vositalariga" },
      { index: 3, text: "Hech kimga ruxsat berilmaydi" },
    ],
  },
  {
    questionId: 'yhq-sign-4',
    ticketNumber: 1,
    questionNumber: 4,
    categoryKey: 'belgilar',
    category: "Yo'l belgilari",
    text: "«To'xtamasdan harakatlanish taqiqlangan» (2.5 - STOP) belgisida haydovchi qayerda to'xtashi shart?",
    correctAnswer: 0,
    illustrationType: 'sign',
    signCode: '2.5',
    explanation: "STOP belgisi o'rnatilgan joyda to'xtash chizig'i (stop-liniya) oldida, agar u bo'lmasa, kesib o'tilayotgan qatnov qismi chetida to'xtash shart.",
    answers: [
      { index: 0, text: "To'xtash chizig'i (stop-liniya) oldida, u bo'lmasa kesib o'tilayotgan yo'l chetida" },
      { index: 1, text: "Faqat boshqa mashina ko'rinsa to'xtaydi" },
      { index: 2, text: "Belgidan 10 metr oldin" },
      { index: 3, text: "Svetofor ustuni tagida" },
    ],
  },
  {
    questionId: 'yhq-sign-5',
    ticketNumber: 1,
    questionNumber: 5,
    categoryKey: 'belgilar',
    category: "Yo'l belgilari",
    text: "«Aylanma harakat» (4.3) belgisi o'rnatilgan chorrahada kim ustunlikka ega?",
    correctAnswer: 1,
    illustrationType: 'sign',
    signCode: '4.3',
    explanation: "Amaldagi YHQ bo'yicha, agar boshqa belgilar bo'lmasa, aylanma harakatda (krug ichida) harakatlanayotgan transport vositasi aylanaga kirib kelayotganlarga nisbatan ustunlikka ega.",
    answers: [
      { index: 0, text: "Aylanaga kirib kelayotgan transport vositasi" },
      { index: 1, text: "Aylanma harakat ichida harakatlanayotgan transport vositasi" },
      { index: 2, text: "O'ng tomondan kelayotgan har qanday mashina" },
      { index: 3, text: "Tezligi yuqori bo'lgan transport vositasi" },
    ],
  },

  // ==========================================
  // 2. CHORRAHALAR VA HARAKATLANISH TARTIBI
  // ==========================================
  {
    questionId: 'yhq-cross-1',
    ticketNumber: 1,
    questionNumber: 6,
    categoryKey: 'chorraha',
    category: 'Chorrahalar',
    text: "Teng ahamiyatli yo'llar chorrahasida chapga burilayotgan haydovchi kimlarga yo'l berishi shart?",
    correctAnswer: 2,
    illustrationType: 'crossroad',
    explanation: "Teng ahamiyatli yo'llar chorrahasida chapga burilayotganda, qarama-qarshi tomondan to'g'riga va o'ngga harakatlanayotgan transport vositalariga yo'l berish shart.",
    answers: [
      { index: 0, text: "Faqat orqadan kelayotgan mashinalarga" },
      { index: 1, text: "Faqat piyodalarga" },
      { index: 2, text: "Qarama-qarshi tomondan to'g'riga va o'ngga harakatlanayotgan transport vositalariga" },
      { index: 3, text: "Hech kimga yo'l bermaydi" },
    ],
  },
  {
    questionId: 'yhq-cross-2',
    ticketNumber: 1,
    questionNumber: 7,
    categoryKey: 'chorraha',
    category: 'Chorrahalar',
    text: "Chorrahada o'ngga burilayotgan transport vositasi kimlarga yo'l berishi shart?",
    correctAnswer: 0,
    illustrationType: 'crossroad',
    explanation: "O'ngga yoki chapga burilayotganda haydovchi o'zi burilayotgan qatnov qismini kesib o'tayotgan piyodalar va velosipedchilarga yo'l berishi shart.",
    answers: [
      { index: 0, text: "Qatnov qismini kesib o'tayotgan piyodalar va velosipedchilarga" },
      { index: 1, text: "Faqat avtobuslarga" },
      { index: 2, text: "Faqat yuk avtomobillariga" },
      { index: 3, text: "Hech kimga yo'l berish talab qilinmaydi" },
    ],
  },
  {
    questionId: 'yhq-cross-3',
    ticketNumber: 1,
    questionNumber: 8,
    categoryKey: 'chorraha',
    category: 'Chorrahalar',
    text: "Maxsus tovush va ko'k rangli miltillovchi chiroq yoqilgan tez tibbiy yordam mashinasiga chorrahada qanday munosabatda bo'lish kerak?",
    correctAnswer: 1,
    illustrationType: 'crossroad',
    explanation: "Yoniq ko'k miltillovchi chiroq va maxsus tovushli ishorasi bo'lgan transport vositasi qaysi yo'ldan kelishidan qat'i nazar, barcha unga yo'l berishi shart.",
    answers: [
      { index: 0, text: "Faqat u asosiy yo'ldan kelayotgan bo'lsa yo'l beriladi" },
      { index: 1, text: "Qaysi yo'nalish va chiroq bo'lishidan qat'i nazar unga to'siqsiz yo'l beriladi" },
      { index: 2, text: "Faqat svetofor yashil bo'lsa yo'l beriladi" },
      { index: 3, text: "O'ng tomonga burilib to'xtab turish taqiqlanadi" },
    ],
  },

  // ==========================================
  // 3. SVETOFOR VA TARTIBGA SOLUVCHI
  // ==========================================
  {
    questionId: 'yhq-light-1',
    ticketNumber: 1,
    questionNumber: 9,
    categoryKey: 'svetofor',
    category: 'Svetofor',
    text: "Svetoforning sarg'ish chirog'i yonishi nimani bildiradi?",
    correctAnswer: 1,
    illustrationType: 'none',
    explanation: "Sarg'ish ishora harakatlanishni taqiqlaydi va ishoralar almashinuvidan ogohlantiradi (keskin tormozlanishsiz to'xtash imkoni bo'lmagan holatdan tashqari).",
    answers: [
      { index: 0, text: "Tezlikni oshirishga ruxsat beradi" },
      { index: 1, text: "Harakatlanishni taqiqlaydi va keyingi ishoraga tayyorlaydi" },
      { index: 2, text: "Faqat chapga burilishga ruxsat beradi" },
      { index: 3, text: "Asosiy yo'l boshlanganini bildiradi" },
    ],
  },
  {
    questionId: 'yhq-light-2',
    ticketNumber: 1,
    questionNumber: 10,
    categoryKey: 'svetofor',
    category: 'Svetofor',
    text: "Tartibga soluvchi (inspektor) qo'lini yuqoriga ko'targan holatda kimlarning harakatlanishi taqiqlanadi?",
    correctAnswer: 3,
    illustrationType: 'none',
    explanation: "Tartibga soluvchining qo'li yuqoriga ko'tarilgan holatda barcha yo'nalishdagi transport vositalari va piyodalar uchun harakatlanish taqiqlanadi.",
    answers: [
      { index: 0, text: "Faqat yuk avtomobillari uchun" },
      { index: 1, text: "Faqat chapga buriluvchilar uchun" },
      { index: 2, text: "Faqat piyodalar uchun" },
      { index: 3, text: "Barcha yo'nalishdagi transport vositalari va piyodalar uchun" },
    ],
  },
  {
    questionId: 'yhq-light-3',
    ticketNumber: 1,
    questionNumber: 11,
    categoryKey: 'svetofor',
    category: 'Svetofor',
    text: "Qizil chiroq bilan birga qo'shimcha yashil strelka yonganda harakatlanayotgan haydovchi qanday harakat qilishi kerak?",
    correctAnswer: 0,
    illustrationType: 'none',
    explanation: "Asosiy qizil chiroq vaqtida qo'shimcha yashil strelka bo'yicha harakatlanayotgan haydovchi boshqa yo'nalishlardan harakatlanayotgan barcha transportlarga yo'l berishi shart.",
    answers: [
      { index: 0, text: "Boshqa barcha yo'nalishdagi transport vositalariga yo'l berib, keyin buriladi" },
      { index: 1, text: "Mutlaq imtiyoz bilan birinchi bo'lib o'tadi" },
      { index: 2, text: "Faqat to'g'riga harakatlanadi" },
      { index: 3, text: "To'xtamasdan eng yuqori tezlikda o'tadi" },
    ],
  },

  // ==========================================
  // 4. TEZLIK VA QUVIB O'TISH
  // ==========================================
  {
    questionId: 'yhq-speed-1',
    ticketNumber: 1,
    questionNumber: 12,
    categoryKey: 'tezlik',
    category: 'Tezlik mezonlari',
    text: "Aholi punktlarida (shaharlar va qishloqlarda) barcha yengil avtomobillarga ruxsat etilgan maksimal tezlik qancha?",
    correctAnswer: 1,
    illustrationType: 'none',
    explanation: "O'zbekiston Respublikasi Yo'l harakati qoidalariga kiritilgan so'nggi o'zgarishlarga muvofiq, aholi punktlarida ruxsat etilgan maksimal tezlik soatiga 60 km etib belgilangan.",
    answers: [
      { index: 0, text: "50 km/soat" },
      { index: 1, text: "60 km/soat" },
      { index: 2, text: "70 km/soat" },
      { index: 3, text: "80 km/soat" },
    ],
  },
  {
    questionId: 'yhq-speed-2',
    ticketNumber: 1,
    questionNumber: 13,
    categoryKey: 'tezlik',
    category: 'Tezlik mezonlari',
    text: "Turar-joy dahalari (hovlilar) va «Turar-joy zonasi»da ruxsat etilgan yuqori tezlik qancha?",
    correctAnswer: 0,
    illustrationType: 'none',
    explanation: "Turar-joy dahalarida va hovlilarda harakatlanish tezligi soatiga 20 km dan oshmasligi kerak. Piyodalar ustunlikka ega.",
    answers: [
      { index: 0, text: "20 km/soat" },
      { index: 1, text: "30 km/soat" },
      { index: 2, text: "40 km/soat" },
      { index: 3, text: "50 km/soat" },
    ],
  },
  {
    questionId: 'yhq-speed-3',
    ticketNumber: 1,
    questionNumber: 14,
    categoryKey: 'tezlik',
    category: "Quvib o'tish",
    text: "Quyidagi joylarning qaysi birida quvib o'tish mutlaqo taqiqlanadi?",
    correctAnswer: 2,
    illustrationType: 'none',
    explanation: "Temir yo'l kesishmalarida va ulargacha 100 metrdan kam masofa qolganda, tartibga solinadigan chorrahalarda, piyodalar o'tish joylarida quvib o'tish taqiqlanadi.",
    answers: [
      { index: 0, text: "Faqat keng yo'llarda" },
      { index: 1, text: "Faqat yomg'irli havoda" },
      { index: 2, text: "Temir yo'l kesishmalarida va ulargacha 100 metr qolganda" },
      { index: 3, text: "Faqat soat 22:00 dan keyin" },
    ],
  },

  // ==========================================
  // 5. TO'XTASH VA TO'XTAB TURISH
  // ==========================================
  {
    questionId: 'yhq-park-1',
    ticketNumber: 1,
    questionNumber: 15,
    categoryKey: 'toxtash',
    category: "To'xtash va to'xtab turish",
    text: "Piyodalar o'tish joyida va undan oldin qancha masofada to'xtash taqiqlanadi?",
    correctAnswer: 1,
    illustrationType: 'parking',
    explanation: "Piyodalar o'tish joylarida va ulardan 5 metr oldinroqda to'xtash taqiqlanadi (piyodalar ko'rinishi to'silmasligi uchun).",
    answers: [
      { index: 0, text: "15 metr" },
      { index: 1, text: "5 metr" },
      { index: 2, text: "10 metr" },
      { index: 3, text: "20 metr" },
    ],
  },
  {
    questionId: 'yhq-park-2',
    ticketNumber: 1,
    questionNumber: 16,
    categoryKey: 'toxtash',
    category: "To'xtash va to'xtab turish",
    text: "Yo'nalishli transport vositalari (avtobus) bekatidan qancha masofada to'xtab turish taqiqlanadi?",
    correctAnswer: 2,
    illustrationType: 'parking',
    explanation: "Yo'nalishli transport vositalari to'xtash joylaridan (bekat belgisidan) har ikki tomonga 15 metrdan kam masofada to'xtash va to'xtab turish taqiqlanadi.",
    answers: [
      { index: 0, text: "5 metr" },
      { index: 1, text: "10 metr" },
      { index: 2, text: "15 metr" },
      { index: 3, text: "30 metr" },
    ],
  },

  // ==========================================
  // 6. BIRINCHI TIBBIY YORDAM
  // ==========================================
  {
    questionId: 'yhq-med-1',
    ticketNumber: 1,
    questionNumber: 17,
    categoryKey: 'tibbiyot',
    category: 'Birinchi yordam',
    text: "Arterial qon ketishida qon quyilishi qanday ko'rinishda bo'ladi va uni qanday to'xtatish kerak?",
    correctAnswer: 0,
    illustrationType: 'none',
    explanation: "Arterial qon yorqin qizil (alvon) rangda favvora bo'lib otilib chiqadi. Jarohatdan yuqoriroqqa zudlik bilan jgut (turniket) qo'yiladi.",
    answers: [
      { index: 0, text: "Yorqin qizil rangda favvora bo'lib otiladi; jarohatdan yuqoriga jgut bog'lanadi" },
      { index: 1, text: "To'q qizil rangda oqadi; jarohatdan pastga bog'lanadi" },
      { index: 2, text: "Faqat sovuq suv quyiladi" },
      { index: 3, text: "Yod surtib ochiq qoldiriladi" },
    ],
  },
  {
    questionId: 'yhq-med-2',
    ticketNumber: 1,
    questionNumber: 18,
    categoryKey: 'tibbiyot',
    category: 'Birinchi yordam',
    text: "Yurak-o'pka reanimatsiyasida (sun'iy nafas va yurakni bilvosita massaj qilish) bosishlar va nafas nisbati qanday?",
    correctAnswer: 1,
    illustrationType: 'none',
    explanation: "Kattalarda yurak-o'pka reanimatsiyasida xalqaro standart: 30 marta ko'krak qafasini bosish va 2 marta sun'iy nafas berish (30:2).",
    answers: [
      { index: 0, text: "15 marta bosish va 5 marta nafas" },
      { index: 1, text: "30 marta ko'krakni bosish va 2 marta sun'iy nafas (30:2)" },
      { index: 2, text: "Faqat sun'iy nafas beriladi" },
      { index: 3, text: "50 marta bosish va 10 marta nafas" },
    ],
  },

  // ==========================================
  // 7. TEXNIK HOLAT VA XAVFSIZLIK
  // ==========================================
  {
    questionId: 'yhq-tech-1',
    ticketNumber: 1,
    questionNumber: 19,
    categoryKey: 'texnik',
    category: 'Texnik holat',
    text: "Yengil avtomobillarning yozgi shinalari protektori naqshining qoldiq balandligi kamida qancha bo'lishi kerak?",
    correctAnswer: 1,
    illustrationType: 'none',
    explanation: "Yengil avtomobillar (M1 toifasi) uchun shina protektori naqshining ruxsat etilgan minimal qoldiq balandligi 1.6 mm ni tashkil etadi.",
    answers: [
      { index: 0, text: "1.0 mm" },
      { index: 1, text: "1.6 mm" },
      { index: 2, text: "2.0 mm" },
      { index: 3, text: "0.8 mm" },
    ],
  },

  // ==========================================
  // 8. QONUNCHILIK VA HUJJATLAR
  // ==========================================
  {
    questionId: 'yhq-law-1',
    ticketNumber: 1,
    questionNumber: 20,
    categoryKey: 'qonun',
    category: 'Hujjatlar va jarimalar',
    text: "Haydovchi transport vositasini boshqarayotganda yonida qaysi hujjatlarni olib yurishi shart?",
    correctAnswer: 0,
    illustrationType: 'none',
    explanation: "Haydovchilik guvohnomasi (yoki ID-karta orqali tekshirish imkoniyati), transport vositasi qayd etish guvohnomasi (texpasport) va majburiy sug'urta polisi (elektron yoki qog'oz).",
    answers: [
      { index: 0, text: "Haydovchilik guvohnomasi, texpasport va sug'urta polisi" },
      { index: 1, text: "Faqat pasport (ID-karta)" },
      { index: 2, text: "Faqat haydovchilik guvohnomasi" },
      { index: 3, text: "Avtomaktabni tugatganlik to'g'risidagi guvohnoma" },
    ],
  },
];
