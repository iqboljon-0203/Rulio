import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("🌱 Rulio DB Seed: Savollar va Javoblarni yuklash boshlandi...");

const seedSqlPath = join(__dirname, 'seed.sql');

const seedSql = `
-- Seed initial questions
INSERT OR IGNORE INTO questions (id, ticket_number, question_number, category, text_uz_lat, text_uz_cyr, text_ru, correct_answer, explanation_uz_lat, difficulty)
VALUES 
('q-1-1', 1, 1, 'harakat', 'Chorrahada bir xil ahamiyatga ega bo''lgan yo''llar kesishgan bo''lsa, qaysi transport vositasi birinchi bo''lib o''tish huquqiga ega?', 'Чорраҳада бир хил аҳамиятга эга бўлган йўллар кесишган бўлса, қайси транспорт воситаси биринчи бўлиб ўтиш ҳуқуқига эга?', 'Кто имеет преимущество при проезде перекрестка равнозначных дорог?', 0, 'Teng ahamiyatli yo''llar kesishmasida o''ng tomondan kelayotgan transport vositasiga yo''l berish qoidasi amal qiladi.', 'easy'),
('q-1-2', 1, 2, 'belgilar', 'Aholi punktlarida yengil avtomobillarga ruxsat etilgan eng yuqori tezlik qancha?', 'Аҳоли пунктларида енгил автомобилларга рухсат этилган энг юқори тезлик қанча?', 'Какова максимальная разрешенная скорость для легковых автомобилей в населенных пунктах?', 1, 'O''zbekiston Respublikasi Yo''l harakati qoidalariga ko''ra, aholi punktlarida ruxsat etilgan eng yuqori tezlik 60 km/soatni tashkil etadi.', 'easy');

INSERT OR IGNORE INTO answers (id, question_id, answer_index, text_uz_lat, text_uz_cyr, text_ru)
VALUES
('a-1-1-0', 'q-1-1', 0, 'O''ng tomondan kelayotgan transport vositasi', 'Ўнг томондан келаётган транспорт воситаси', 'Транспортное средство, приближающееся справа'),
('a-1-1-1', 'q-1-1', 1, 'To''g''riga harakatlanayotgan transport vositasi', 'Тўғрига ҳаракатланаётган транспорт воситаси', 'Транспортное средство, движущееся прямо'),
('a-1-1-2', 'q-1-1', 2, 'Chap tomonga burilayotgan transport vositasi', 'Чап томонга бурилаётган транспорт воситаси', 'Транспортное средство, поворачивающее налево'),
('a-1-1-3', 'q-1-1', 3, 'Tezligi yuqori bo''lgan transport vositasi', 'Тезлиги юқори бўлган транспорт воситаси', 'Транспортное средство с высокой скоростью'),

('a-1-2-0', 'q-1-2', 0, '50 km/soat', '50 км/соат', '50 км/ч'),
('a-1-2-1', 'q-1-2', 1, '60 km/soat', '60 км/соат', '60 км/ч'),
('a-1-2-2', 'q-1-2', 2, '70 km/soat', '70 км/соат', '70 км/ч'),
('a-1-2-3', 'q-1-2', 3, '80 km/soat', '80 км/соат', '80 км/ч');
`;

writeFileSync(seedSqlPath, seedSql);
console.log(`✅ Seed SQL fayli yaratildi: ${seedSqlPath}`);
console.log("🚀 Wrangler D1 ga yuklash uchun: wrangler d1 execute DB --local --file=src/lib/db/seed.sql");
