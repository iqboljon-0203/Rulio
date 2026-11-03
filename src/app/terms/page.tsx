import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { ADMIN_USERNAME } from '@/lib/p2p';

export const metadata: Metadata = {
  title: 'Foydalanish shartlari',
  description: 'Rulio xizmatidan foydalanish va Premium tariflar shartlari.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <LegalPage title="Foydalanish shartlari" updated="3-noyabr 2026">
      <h2>Xizmat haqida</h2>
      <p>
        Rulio haydovchilik guvohnomasi nazariy imtihoniga tayyorgarlik uchun mashq platformasi. Rulio davlat organi emas va
        imtihon natijasini kafolatlamaydi. Savollar va izohlar o&apos;quv maqsadida beriladi; rasmiy qoidalar uchun Yo&apos;l
        harakati qoidalarining amaldagi matniga (lex.uz) tayaning.
      </p>
      <h2>Hisob</h2>
      <p>Hisobga Telegram orqali kirasiz. Hisobingizni boshqalarga berish va xizmatdan avtomatlashtirilgan usulda ko&apos;chirib olish taqiqlanadi.</p>
      <h2>Tariflar va to&apos;lov</h2>
      <ul>
        <li>Bepul tarifda 1–5 biletlar ochiq. Premium tarif (2 hafta, 1 oy, 3 oy) barcha 63 biletni ochadi.</li>
        <li>To&apos;lov bir martalik. Pul avtomatik qayta yechilmaydi; muddat tugagach tarif bepul holatga qaytadi.</li>
        <li>Yangi tarif sotib olinsa, u amaldagi muddat ustiga qo&apos;shiladi.</li>
        <li>
          To&apos;lov o&apos;tgan, lekin tarif ochilmagan bo&apos;lsa, chekni Telegram&apos;da{' '}
          <a href={`https://t.me/${ADMIN_USERNAME}`}>@{ADMIN_USERNAME}</a> ga yuboring — har bir holat alohida ko&apos;rib chiqiladi.
        </li>
      </ul>
      <h2>O&apos;zgarishlar</h2>
      <p>Shartlar yangilansa, shu sahifada sana bilan e&apos;lon qilinadi.</p>
    </LegalPage>
  );
}
