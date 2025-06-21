const books = [
  {
    title: 'اللص والكلاب',
    description:
      'رواية نفسية عميقة تتناول قضايا الفساد والانتقام في المجتمع المصري.',
    author: '684fc8f7dab42dddc108b440',
    categories: ['68523859928ad3dfa738602c', '68523859928ad3dfa738602f'],
    fileFormats: {
      epub: 'http://example.com/books/lo_elkelab.epub',
      azw3: 'http://example.com/books/lo_elkelab.azw3',
    },
  },
  {
    title: 'الحرافيش',
    description:
      'ملحمة اجتماعية تاريخية ترصد حياة فتوات الحارة المصرية عبر الأجيال.',
    author: '684fc8f7dab42dddc108b440',
    categories: [
      '68523859928ad3dfa738602c',
      '68523859928ad3dfa738602d',
      '68523859928ad3dfa7386035',
    ],
    fileFormats: {
      epub: 'http://example.com/books/harafish.epub',
      kfx: 'http://example.com/books/harafish.kfx',
    },
  },
  {
    title: 'الأيام',
    description:
      'سيرة ذاتية للعميد طه حسين، تسرد طفولته ونشأته في الريف المصري.',
    author: '684fc8f7dab42dddc108b443',
    categories: ['68523859928ad3dfa7386033', '68523859928ad3dfa738602f'],
    fileFormats: {
      epub: 'http://example.com/books/elayam.epub',
      azw3: 'http://example.com/books/elayam.azw3',
    },
  },
  {
    title: 'دعاء الكروان',
    description: 'رواية اجتماعية تُبرز قضايا الثأر والشرف في المجتمع الصعيدي.',
    author: '684fc8f7dab42dddc108b443',
    categories: ['68523859928ad3dfa738602c', '68523859928ad3dfa7386035'],
    fileFormats: {
      epub: 'http://example.com/books/doaa_karawan.epub',
    },
  },
  {
    title: 'أرخص ليالي',
    description: 'مجموعة قصصية قصيرة تعكس الواقع الاجتماعي والاقتصادي في مصر.',
    author: '684fc8f7dab42dddc108b446',
    categories: ['68523859928ad3dfa738602f', '68523859928ad3dfa7386035'],
    fileFormats: {
      azw3: 'http://example.com/books/arkhas_layali.azw3',
    },
  },
  {
    title: 'رجل المستحيل: الرمز',
    description: 'أولى مغامرات أدهم صبري في عالم المخابرات والمخاطر الدولية.',
    author: '6850ee38bcd060a7d25fb751',
    categories: ['68523859928ad3dfa738602c'],
    series: '6850f2de00823d6145473327',
    fileFormats: {
      epub: 'http://example.com/books/rajul_mustaheel_ramz.epub',
    },
  },
  {
    title: 'رجل المستحيل: الاختفاء الغامض',
    description:
      'مغامرة جديدة لأدهم صبري لكشف سر اختفاء غامض يهدد الأمن القومي.',
    author: '6850ee38bcd060a7d25fb751',
    categories: ['68523859928ad3dfa738602c'],
    series: '6850f2de00823d6145473327',
    fileFormats: {
      epub: 'http://example.com/books/rajul_mustaheel_ikhtifaa.epub',
      azw3: 'http://example.com/books/rajul_mustaheel_ikhtifaa.azw3',
    },
  },
  {
    title: 'ما وراء الطبيعة: أسطورة مصاص الدماء',
    description:
      'قصة مرعبة للدكتور رفعت إسماعيل عن مواجهته الأولى مع الكائنات الخارقة.',
    author: '6850ee38bcd060a7d25fb752',
    categories: ['68523859928ad3dfa738602c', '68523859928ad3dfa738602e'],
    series: '6850f2de00823d6145473329',
    fileFormats: {
      epub: 'http://example.com/books/ma_wara_tabiaa_vampire.epub',
    },
  },
  {
    title: 'ما وراء الطبيعة: أسطورة رأس ميدوسا',
    description:
      'مغامرة أخرى لرفعت إسماعيل حيث يواجه لعنة قديمة مرتبطة بأساطير اليونان.',
    author: '6850ee38bcd060a7d25fb752',
    categories: ['68523859928ad3dfa738602c', '68523859928ad3dfa738602d'],
    series: '6850f2de00823d6145473329',
    fileFormats: {
      azw3: 'http://example.com/books/ma_wara_tabiaa_medusa.azw3',
    },
  },
  {
    title: 'ذاكرة الجسد',
    description:
      'رواية رومانسية تاريخية تدور أحداثها حول الثورة الجزائرية وقضايا الهوية.',
    author: '684fc8f8dab42dddc108b45b',
    categories: ['68523859928ad3dfa738602c', '68523859928ad3dfa738602d'],
    fileFormats: {
      epub: 'http://example.com/books/dthakirat_aljasad.epub',
      kfx: 'http://example.com/books/dthakirat_aljasad.kfx',
    },
  },
  {
    title: 'فوضى الحواس',
    description: 'تكملة لذاكرة الجسد، تستكشف عمق المشاعر الإنسانية والفقد.',
    author: '684fc8f8dab42dddc108b45b',
    categories: ['68523859928ad3dfa738602c', '68523859928ad3dfa738602f'],
    fileFormats: {
      epub: 'http://example.com/books/fawdha_hawas.epub',
    },
  },
  {
    title: 'المرايا',
    description: 'رواية للروائي إحسان عبد القدوس تتناول تفكك الأسرة المصرية.',
    author: '684fc8f8dab42dddc108b44c',
    categories: ['68523859928ad3dfa738602c', '68523859928ad3dfa7386035'],
    fileFormats: {
      azw3: 'http://example.com/books/maraya.azw3',
    },
  },
  {
    title: 'في بيتنا رجل',
    description: 'قصة درامية عن مقاومة الاحتلال والإيمان بالوطن.',
    author: '684fc8f8dab42dddc108b44c',
    categories: ['68523859928ad3dfa738602c', '68523859928ad3dfa738602d'],
    fileFormats: {
      epub: 'http://example.com/books/fi_baitina_rajul.epub',
      kfx: 'http://example.com/books/fi_baitina_rajul.kfx',
    },
  },
  {
    title: 'بيروت 75',
    description:
      'رواية تستشرف بدايات الحرب الأهلية اللبنانية وانعكاساتها الاجتماعية.',
    author: '684fc8f8dab42dddc108b452',
    categories: [
      '68523859928ad3dfa738602c',
      '68523859928ad3dfa7386035',
      '68523859928ad3dfa738602d',
    ],
    fileFormats: {
      epub: 'http://example.com/books/beirut75.epub',
    },
  },
  {
    title: 'مدن الملح: التيه',
    description:
      'الجزء الأول من ملحمة مدن الملح، يصف التحولات الاجتماعية في الخليج العربي.',
    author: '684fc8f8dab42dddc108b452',
    categories: ['68523859928ad3dfa738602c', '68523859928ad3dfa738602d'],
    fileFormats: {
      azw3: 'http://example.com/books/mudun_elmelh_teih.azw3',
    },
  },
  {
    title: 'كتاب التحولات والهجرة في أقاليم النهار والليل',
    description: 'ديوان شعري يعبر عن فلسفة الشاعر وتأملاته في الوجود.',
    author: '684fc8f8dab42dddc108b455',
    categories: ['68523859928ad3dfa7386034', '68523859928ad3dfa7386030'],
    fileFormats: {
      epub: 'http://example.com/books/kutub_tahawwulat.epub',
    },
  },
  {
    title: 'أنشودة المطر',
    description: 'قصيدة من روائع بدر شاكر السياب، تعبر عن الحنين والأمل.',
    author: '684fc8f8dab42dddc108b458',
    categories: ['68523859928ad3dfa7386034', '68523859928ad3dfa738602f'],
    fileFormats: {
      kfx: 'http://example.com/books/anshudat_almatar.kfx',
    },
  },
  {
    title: 'فانتازيا: عالم الكتب',
    description: 'رحلة عبير عبد الرحمن إلى عوالم الأدب الكلاسيكي.',
    author: '6850ee38bcd060a7d25fb752',
    categories: ['68523859928ad3dfa738602c', '68523859928ad3dfa738602f'],
    series: '6850f2de00823d614547332a',
    fileFormats: {
      epub: 'http://example.com/books/fantazia_kutub.epub',
    },
  },
  {
    title: 'سافاري: الغابة المسحورة',
    description: 'إحدى مغامرات الدكتور علاء عبد العظيم في أدغال أفريقيا.',
    author: '6850ee38bcd060a7d25fb752',
    categories: ['68523859928ad3dfa738602c', '68523859928ad3dfa738602e'],
    series: '6850f2de00823d614547332b',
    fileFormats: {
      azw3: 'http://example.com/books/safari_ghaba.azw3',
    },
  },
  {
    title: 'ملف المستقبل: مدينة الروبوتات',
    description:
      'فريق نور الدين محمود يواجه تحديات جديدة في مدينة تحكمها الروبوتات.',
    author: '6850ee38bcd060a7d25fb751',
    categories: ['68523859928ad3dfa738602c', '68523859928ad3dfa738602e'],
    series: '6850f2de00823d6145473328',
    fileFormats: {
      epub: 'http://example.com/books/malaf_mustaqbal_robots.epub',
    },
  },
  {
    title: 'روايات عالمية للجيب: الدكتور جيكل ومستر هايد',
    description: 'النسخة المبسطة لرواية روبرت لويس ستيفنسون الشهيرة.',
    author: '6850ee38bcd060a7d25fb752',
    categories: ['68523859928ad3dfa738602c'],
    series: '6850f2de00823d614547332c',
    fileFormats: {
      epub: 'http://example.com/books/rwiyat_alamiya_jekyll.epub',
    },
  },
  {
    title: 'رجل المستحيل: الوداع',
    description: 'إحدى المغامرات الأخيرة لأدهم صبري في السلسلة.',
    author: '6850ee38bcd060a7d25fb751',
    categories: ['68523859928ad3dfa738602c'],
    series: '6850f2de00823d6145473327',
    fileFormats: {
      azw3: 'http://example.com/books/rajul_mustaheel_wadaa.azw3',
    },
  },
  {
    title: 'ما وراء الطبيعة: أسطورة النداهة',
    description: 'رفعت إسماعيل يواجه ظاهرة النداهة الغامضة في الريف المصري.',
    author: '6850ee38bcd060a7d25fb752',
    categories: ['68523859928ad3dfa738602c'],
    series: '6850f2de00823d6145473329',
    fileFormats: {
      kfx: 'http://example.com/books/ma_wara_tabiaa_nadaaha.kfx',
    },
  },
  {
    title: 'روايات عالمية للجيب: شرلوك هولمز',
    description: 'مجموعة من أشهر قضايا المحقق شرلوك هولمز بصيغة مبسطة.',
    author: '6850ee38bcd060a7d25fb752',
    categories: ['68523859928ad3dfa738602c'],
    series: '6850f2de00823d614547332c',
    fileFormats: {
      epub: 'http://example.com/books/rwiyat_alamiya_sherlock.epub',
    },
  },
  {
    title: 'الخبز الحافي',
    description: 'سيرة ذاتية جريئة تصف حياة الفقر والمعاناة في المغرب.',
    author: '684fc8f7dab42dddc108b449',
    categories: ['68523859928ad3dfa7386033', '68523859928ad3dfa7386035'],
    fileFormats: {
      azw3: 'http://example.com/books/khobz_hafi.azw3',
    },
  },
  {
    title: 'أوراق حب',
    description: 'مجموعة من القصائد والخواطر الرومانسية.',
    author: '684fc8f7dab42dddc108b449',
    categories: ['68523859928ad3dfa7386034', '68523859928ad3dfa738602f'],
    fileFormats: {
      epub: 'http://example.com/books/awraq_hub.epub',
    },
  },
  {
    title: 'ظل الفراعنة',
    description: 'رواية تاريخية عن مصر القديمة وأسرارها.',
    author: '6850ee38bcd060a7d25fb751',
    categories: ['68523859928ad3dfa738602c', '68523859928ad3dfa738602d'],
    fileFormats: {
      kfx: 'http://example.com/books/dhil_faraana.kfx',
    },
  },
  {
    title: 'رجل المستحيل: الغواصة الرهيبة',
    description: 'مغامرة بحرية خطيرة لأدهم صبري في أعماق المحيطات.',
    author: '6850ee38bcd060a7d25fb751',
    categories: ['68523859928ad3dfa738602c'],
    series: '6850f2de00823d6145473327',
    fileFormats: {
      epub: 'http://example.com/books/rajul_mustaheel_ghawasa.epub',
    },
  },
  {
    title: 'ما وراء الطبيعة: أسطورة الموتى الأحياء',
    description: 'رفعت إسماعيل يواجه جحافل الموتى الأحياء في مغامرة مرعبة.',
    author: '6850ee38bcd060a7d25fb752',
    categories: ['68523859928ad3dfa738602c'],
    series: '6850f2de00823d6145473329',
    fileFormats: {
      azw3: 'http://example.com/books/ma_wara_tabiaa_amwat.azw3',
    },
  },
  {
    title: 'رجل المستحيل: قناع الشيطان',
    description:
      'أدهم صبري يتتبع منظمة إجرامية تستخدم قناع الشيطان لإخفاء هويتها.',
    author: '6850ee38bcd060a7d25fb751',
    categories: ['68523859928ad3dfa738602c'],
    series: '6850f2de00823d6145473327',
    fileFormats: {
      kfx: 'http://example.com/books/rajul_mustaheel_qinaa.kfx',
    },
  },
  {
    title: 'ما وراء الطبيعة: أسطورة البيت',
    description: 'قصة غامضة عن بيت مسكون يواجهه الدكتور رفعت إسماعيل.',
    author: '6850ee38bcd060a7d25fb752',
    categories: ['68523859928ad3dfa738602c'],
    series: '6850f2de00823d6145473329',
    fileFormats: {
      epub: 'http://example.com/books/ma_wara_tabiaa_bayt.epub',
    },
  },
  {
    title: 'الطنطورية',
    description: 'رواية تاريخية لأحلام مستغانمي تتناول قضية النكبة الفلسطينية.',
    author: '684fc8f8dab42dddc108b45b',
    categories: ['68523859928ad3dfa738602c', '68523859928ad3dfa738602d'],
    fileFormats: {
      azw3: 'http://example.com/books/tantouriya.azw3',
    },
  },
  {
    title: 'موسم الهجرة إلى الشمال',
    description: 'رواية اجتماعية فلسفية عن صراع الهويات في السودان.',
    author: '684fc8f7dab42dddc108b440',
    categories: [
      '68523859928ad3dfa738602c',
      '68523859928ad3dfa7386030',
      '68523859928ad3dfa7386035',
    ],
    fileFormats: {
      epub: 'http://example.com/books/mawsim_hijra.epub',
    },
  },
  {
    title: 'ألف ليلة وليلة',
    description: 'مجموعة من الحكايات الشرقية الشعبية.',
    author: '684fc8f7dab42dddc108b443',
    categories: ['68523859928ad3dfa738602c', '68523859928ad3dfa738602f'],
    fileFormats: {
      kfx: 'http://example.com/books/alf_layla.kfx',
    },
  },
  {
    title: 'نظرات',
    description:
      'مجموعة مقالات للكاتب مصطفى لطفي المنفلوطي، تتناول قضايا اجتماعية وأخلاقية.',
    author: '684fc8f8dab42dddc108b44f',
    categories: ['68523859928ad3dfa738602f', '68523859928ad3dfa7386035'],
    fileFormats: {
      epub: 'http://example.com/books/nadharat.epub',
    },
  },
  {
    title: 'رجل المستحيل: معركة الفضاء',
    description: 'أدهم صبري ينتقل إلى الفضاء في مواجهة جديدة.',
    author: '6850ee38bcd060a7d25fb751',
    categories: ['68523859928ad3dfa738602c', '68523859928ad3dfa738602e'],
    series: '6850f2de00823d6145473327',
    fileFormats: {
      azw3: 'http://example.com/books/rajul_mustaheel_fadaa.azw3',
    },
  },
  {
    title: 'ما وراء الطبيعة: أسطورة الكاهن',
    description: 'رفعت إسماعيل يكتشف أسرار كاهن قديم وقواه الخارقة.',
    author: '6850ee38bcd060a7d25fb752',
    categories: ['68523859928ad3dfa738602c', '68523859928ad3dfa738602d'],
    series: '6850f2de00823d6145473329',
    fileFormats: {
      epub: 'http://example.com/books/ma_wara_tabiaa_kahen.epub',
    },
  },
  {
    title: 'فن اللامبالاة',
    description:
      'كتاب في التنمية الذاتية يشجع على التركيز على ما يهم حقًا في الحياة.',
    author: '6850ee38bcd060a7d25fb752',
    categories: ['68523859928ad3dfa7386032', '68523859928ad3dfa7386030'],
    fileFormats: {
      kfx: 'http://example.com/books/fan_lamubalat.kfx',
    },
  },
  {
    title: '48 قانونا للقوة',
    description:
      'كتاب يتناول قوانين السيطرة والتأثير في العلاقات الإنسانية والاجتماعية.',
    author: '6850ee38bcd060a7d25fb752',
    categories: ['68523859928ad3dfa7386032', '68523859928ad3dfa7386035'],
    fileFormats: {
      epub: 'http://example.com/books/48_qawanin_quwa.epub',
    },
  },
  {
    title: 'الشخصية الكاريزمية',
    description: 'كتاب يساعد على تطوير الشخصية وبناء الكاريزما.',
    author: '6850ee38bcd060a7d25fb752',
    categories: ['68523859928ad3dfa7386032'],
    fileFormats: {
      azw3: 'http://example.com/books/shakhsiya_karizmya.azw3',
    },
  },
  {
    title: 'فن الحرب',
    description: 'كتاب صيني قديم في الاستراتيجية العسكرية والتكتيكات.',
    author: '6850ee38bcd060a7d25fb751',
    categories: [
      '68523859928ad3dfa738602d',
      '68523859928ad3dfa7386030',
      '68523859928ad3dfa7386032',
    ],
    fileFormats: {
      epub: 'http://example.com/books/fan_harb.epub',
    },
  },
  {
    title: 'العادات السبع للأشخاص الأكثر فعالية',
    description: 'كتاب كلاسيكي في التنمية الذاتية حول بناء عادات ناجحة.',
    author: '6850ee38bcd060a7d25fb752',
    categories: ['68523859928ad3dfa7386032'],
    fileFormats: {
      kfx: 'http://example.com/books/adadat_sabah.kfx',
    },
  },
  {
    title: 'قصة الحضارة',
    description: 'ملحمة تاريخية ضخمة تستعرض تاريخ الحضارات الإنسانية.',
    author: '684fc8f7dab42dddc108b443',
    categories: ['68523859928ad3dfa738602d', '68523859928ad3dfa738602e'],
    fileFormats: {
      epub: 'http://example.com/books/qisat_hadara.epub',
    },
  },
  {
    title: 'نظرية التطور: أصل الأنواع',
    description: 'كتاب أساسي يشرح نظرية التطور والانتخاب الطبيعي.',
    author: '6850ee38bcd060a7d25fb752',
    categories: ['68523859928ad3dfa738602e', '68523859928ad3dfa7386030'],
    fileFormats: {
      azw3: 'http://example.com/books/nadariyat_tatawur.azw3',
    },
  },
];

export default books;
