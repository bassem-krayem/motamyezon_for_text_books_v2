import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Author from './models/authorModel.js';
import Series from './models/seriesModel.js';
import Category from './models/categoryModel.js';
import Book from './models/bookModel.js';
import books from './books.js';
// Import other models here as needed

dotenv.config();

const DB = process.env.DB;

const connectDB = async () => {
  await mongoose.connect(DB, {
    dbName: 'motamyezon', // replace if needed
  });
  console.log('✅ DB connected');
};
connectDB();

const resources = {
  author: Author,
  series: Series,
  category: Category,
  book: Book,
  // Add other models like: book: Book, category: Category, etc.
};

// Example data to import (replace with your real data or use a JSON file)
const authors = [
  {
    name: 'نبيل فاروق',
    bio: 'كاتب مصري شهير، عُرف بكتاباته في أدب الخيال العلمي والمغامرات، أبرز أعماله سلسلة رجل المستحيل وملف المستقبل.',
  },
  {
    name: 'أحمد خالد توفيق',
    bio: 'طبيب وكاتب مصري، يُعد من أوائل الكتّاب في مجال أدب الرعب والخيال العلمي للشباب، أشهر أعماله سلسلة ما وراء الطبيعة وفانتازيا وسافاري.',
  },
];

const series = [
  {
    name: 'رجل المستحيل',
    description:
      'سلسلة مغامرات بوليسية تدور حول ضابط المخابرات المصري أدهم صبري، الذي يتمتع بقدرات خارقة وشخصية فريدة.',
    author: '6850ee38bcd060a7d25fb751',
  },
  {
    name: 'ملف المستقبل',
    description:
      'سلسلة خيال علمي تتناول مغامرات فريق علمي مصري في المستقبل بقيادة نور الدين محمود.',
    author: '6850ee38bcd060a7d25fb751',
  },
  {
    name: 'ما وراء الطبيعة',
    description:
      'سلسلة رعب تعتمد على الحكايات الغريبة والخارقة للطبيعة يرويها الدكتور رفعت إسماعيل بأسلوب ساخر وعميق.',
    author: '6850ee38bcd060a7d25fb752',
  },
  {
    name: 'فانتازيا',
    description:
      'سلسلة مغامرات خيالية تدور حول عبير عبد الرحمن، فتاة تعيش مغامرات داخل عوالم الأدب والتاريخ والفنون.',
    author: '6850ee38bcd060a7d25fb752',
  },
  {
    name: 'سافاري',
    description:
      'سلسلة طبية بوليسية بطلها الطبيب علاء عبد العظيم يعمل في مؤسسة سافاري في أدغال أفريقيا.',
    author: '6850ee38bcd060a7d25fb752',
  },
  {
    name: 'روايات عالمية للجيب',
    description:
      'سلسلة تُقدّم ترجمات مختصرة ومبسطة لأشهر الروايات العالمية بأسلوب شيّق للقارئ العربي.',
    author: '6850ee38bcd060a7d25fb752',
  },
];

const categories = [
  { name: 'روايات' },
  { name: 'تاريخ' },
  { name: 'علوم' },
  { name: 'أدب' },
  { name: 'فلسفة' },
  { name: 'دين' },
  { name: 'تنمية ذاتية' },
  { name: 'سيرة ذاتية' },
  { name: 'شعر' },
  { name: 'مجتمع' },
];

const action = process.argv[2]; // import or delete
const target = process.argv[3]; // e.g., author or all

async function importData(resource) {
  if (resource === 'all') {
    await Author.create(authors);
    await Series.create(series);
    await Category.create(categories);
    // Add other creates here if needed
  } else {
    const Model = resources[resource];
    if (!Model) throw new Error(`Unknown resource: ${resource}`);
    if (resource === 'author') {
      await Model.create(authors);
    } else if (resource === 'series') {
      await Model.create(series);
      // Add other import logic here if needed
    } else if (resource === 'category') {
      await Model.create(categories);
    } else if (resource === 'book') {
      await Model.create(books);
    } else {
      console.log(`⚠️ No import logic defined for ${resource}`);
    }
  }
  console.log(`✅ Data imported to ${resource}`);
  process.exit();
}

async function deleteData(resource) {
  if (resource === 'all') {
    await Promise.all(
      Object.values(resources).map((Model) => Model.deleteMany()),
    );
    console.log('🗑️ All data deleted');
  } else {
    const Model = resources[resource];
    if (!Model) throw new Error(`Unknown resource: ${resource}`);
    await Model.deleteMany();
    console.log(`🗑️ All ${resource}s deleted`);
  }
  process.exit();
}

const main = async () => {
  if (action === 'import') {
    await importData(target);
  } else if (action === 'delete') {
    await deleteData(target);
  } else {
    console.log('❌ Usage: node manageData.js [import|delete] [resource|all]');
    process.exit();
  }
};

main();
