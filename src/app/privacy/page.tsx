import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { ADMIN_USERNAME } from '@/lib/p2p';

export const metadata: Metadata = {
  title: 'Maxfiylik siyosati',
  description: "Rulio qanday ma'lumotlarni to'playdi va ulardan qanday foydalanadi.",
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Maxfiylik siyosati" updated="3-noyabr 2026">
      <p>
        Rulio (rulio.uz va Telegram&apos;dagi @ruliouzbot) haydovchilik guvohnomasi imtihoniga tayyorgarlik xizmati. Bu sahifa
        qaysi ma&apos;lumotlaringiz saqlanishi va nima uchun kerakligini tushuntiradi.
      </p>
      <h2>Qanday ma&apos;lumot olinadi</h2>
      <ul>
        <li>Telegram orqali kirganingizda: Telegram ID, ism va username (agar bo&apos;lsa). Telefon raqamingiz olinmaydi.</li>
        <li>Test natijalaringiz, xatolaringiz va saqlangan savollaringiz, qurilmalar o&apos;rtasida sinxronlash uchun.</li>
        <li>
          To&apos;lov ma&apos;lumoti: tanlangan tarif, summa, vaqt. Karta orqali to&apos;laganingizda bankning kirim SMS matni
          to&apos;lovni sizga bog&apos;lash uchun ishlatiladi. Karta raqamingizni biz so&apos;ramaymiz va saqlamaymiz.
        </li>
        <li>Sozlamalar (masalan, tanlangan til) faqat brauzeringizda saqlanadi.</li>
      </ul>
      <h2>Nima uchun ishlatiladi</h2>
      <ul>
        <li>Hisobingizga kirish va Premium tarifni yoqish.</li>
        <li>Natijalaringiz va xatolaringizni ko&apos;rsatish.</li>
        <li>To&apos;lov tasdig&apos;i va xizmat haqidagi xabarlarni Telegram orqali yuborish.</li>
      </ul>
      <p>Ma&apos;lumotlaringiz sotilmaydi va reklama maqsadida uchinchi shaxslarga berilmaydi.</p>
      <h2>Saqlash</h2>
      <p>
        Ma&apos;lumotlar xizmat ishlashi uchun bulutli serverlarda (hosting va ma&apos;lumotlar bazasi provayderlarida) saqlanadi.
        Hisobingizni va ma&apos;lumotlaringizni o&apos;chirishni so&apos;rasangiz, ular o&apos;chiriladi.
      </p>
      <h2>Bog&apos;lanish</h2>
      <p>
        Savollar va o&apos;chirish so&apos;rovlari uchun Telegram: <a href={`https://t.me/${ADMIN_USERNAME}`}>@{ADMIN_USERNAME}</a>.
      </p>
    </LegalPage>
  );
}
