// --- Dummy Data ---
export const dummyVideos = [
  {
    _id: 1,
    title: "Guide for in-patient oral hygiene using OroClean complete",
    thumbnailUrl: require("../assets/images/VideoThumbnail1.png"),
    duration: "2 min 16 sec",
    tag: "Oral Care",
  },
  {
    _id: 2,
    title: "Guide for in-patient oral hygiene using OroClean complete 2",
    thumbnailUrl: require("../assets/images/VideoThumbnail2.png"),
    duration: "3 min 05 sec",
    tag: "Oral Care",
  },
];

export const quizzes = {
  1: {
    // Bu ID'yi quiz/index.jsx'ten gelen ID ile eşleştireceğiz
    id: 1,
    title: "Oral Health with OroCare", // Quiz başlığı
    subtitle: "Test your knowledge about oral care products and techniques",
    questions: [
      // 1. Soru (Sizin verdiğiniz)
      {
        id: "q1",
        text: "How often should you brush your teeth to maintain good oral hygiene?",
        options: [
          "Once a day",
          "Twice a day",
          "Three times a day",
          "After every meal",
        ],
        correctAnswer: "Twice a day",
      },
      // 2. Soru (Sizin verdiğiniz)
      {
        id: "q2",
        text: "What is the purpose of flossing?",
        options: [
          "To clean the outer surfaces of the teeth",
          "To remove plaque and food particles between teeth",
          "To make teeth whiter",
          "To freshen breath",
        ],
        correctAnswer: "To remove plaque and food particles between teeth",
      },
      // 3. Soru (Yeni)
      {
        id: "q3",
        text: "What key ingredient in toothpaste helps prevent cavities?",
        options: ["Sugar", "Fluoride", "Whitening agents", "Flavoring"],
        correctAnswer: "Fluoride",
      },
      // 4. Soru (Yeni)
      {
        id: "q4",
        text: "What is the recommended minimum time for brushing your teeth?",
        options: ["30 seconds", "1 minute", "2 minutes", "5 minutes"],
        correctAnswer: "2 minutes",
      },
      // 5. Soru (Yeni)
      {
        id: "q5",
        text: "Which of these is generally NOT the primary purpose of using mouthwash?",
        options: [
          "Freshening breath",
          "Killing bacteria",
          "Removing plaque between teeth",
          "Reaching hard-to-brush areas",
        ],
        correctAnswer: "Removing plaque between teeth", // Plak temizliği için diş ipi daha etkilidir
      },
      // 6. Soru (Yeni)
      {
        id: "q6",
        text: "How often is it generally recommended to visit a dentist for a check-up and cleaning?",
        options: [
          "Only when you have pain",
          "Once every 2 years",
          "Once a year",
          "Twice a year",
        ],
        correctAnswer: "Twice a year",
      },
    ],
  },
  // --- YENİ QUIZ: q2 ---
  2: {
    id: 2, // Quiz ID'si
    title: "Advanced Oral Care Knowledge", // Quiz başlığı
    subtitle: "Test your knowledge about oral care products and techniques",
    questions: [
      // 1. Soru
      {
        id: "q2_1", // Soru ID'si (Quiz ID'si + Soru No)
        text: "What is the earliest stage of gum disease, characterized by red, swollen gums that may bleed easily?",
        options: [
          "Periodontitis", // İleri diş eti hastalığı
          "Gingivitis", // Diş eti iltihabı (Erken evre)
          "Cavity", // Çürük
          "Halitosis", // Ağız kokusu
        ],
        correctAnswer: "Gingivitis",
      },
      // 2. Soru
      {
        id: "q2_2",
        text: "How do sugary and acidic drinks primarily contribute to tooth decay?",
        options: [
          "By staining the teeth brown", // Dişleri kahverengiye boyayarak
          "By directly dissolving the tooth enamel", // Doğrudan diş minesini çözerek
          "By strengthening the gums", // Diş etlerini güçlendirerek
          "By promoting saliva production", // Tükürük üretimini artırarak
        ],
        correctAnswer: "By directly dissolving the tooth enamel",
      },
      // 3. Soru
      {
        id: "q2_3",
        text: "Besides food particles, what is a common cause of persistent bad breath (halitosis)?",
        options: [
          "Drinking too much water", // Çok fazla su içmek
          "Poor tongue hygiene (bacteria buildup)", // Kötü dil hijyeni (bakteri birikimi)
          "Brushing too hard", // Çok sert fırçalamak
          "Using fluoride toothpaste", // Florürlü diş macunu kullanmak
        ],
        correctAnswer: "Poor tongue hygiene (bacteria buildup)",
      },
      // 4. Soru
      {
        id: "q2_4",
        text: "What is a primary function of saliva in maintaining oral health?",
        options: [
          "Staining teeth", // Dişleri lekelemek
          "Hardening plaque", // Plağı sertleştirmek
          "Neutralizing acids and washing away food particles", // Asitleri nötralize etmek ve yiyecek artıklarını yıkamak
          "Causing gum inflammation", // Diş eti iltihabına neden olmak
        ],
        correctAnswer: "Neutralizing acids and washing away food particles",
      },
      // 5. Soru
      {
        id: "q2_5",
        text: "Tooth sensitivity (a sharp pain when consuming hot, cold, or sweet items) is often caused by:",
        options: [
          "Exposed dentin", // Açığa çıkmış dentin tabakası
          "Strong enamel", // Güçlü diş minesi
          "Healthy gums", // Sağlıklı diş etleri
          "Regular flossing", // Düzenli diş ipi kullanımı
        ],
        correctAnswer: "Exposed dentin",
      },
      // 6. Soru
      {
        id: "q2_6",
        text: "Which is a significant risk associated with smoking regarding oral health?",
        options: [
          "Whiter teeth", // Daha beyaz dişler
          "Fresher breath", // Daha ferah nefes
          "Increased risk of gum disease and oral cancer", // Diş eti hastalığı ve ağız kanseri riskinde artış
          "Stronger tooth enamel", // Daha güçlü diş minesi
        ],
        correctAnswer: "Increased risk of gum disease and oral cancer",
      },
      // 7. Soru
      {
        id: "q2_7",
        text: "Why is it important to take care of baby (primary) teeth even though they will eventually fall out?",
        options: [
          "They determine the adult tooth color", // Kalıcı diş rengini belirlerler
          "They have no impact on adult teeth", // Kalıcı dişler üzerinde etkileri yoktur
          "They hold space for permanent teeth and guide them into position", // Kalıcı dişler için yer tutar ve onlara rehberlik ederler
          "They are more resistant to cavities than adult teeth", // Kalıcı dişlere göre çürüğe daha dayanıklıdırlar
        ],
        correctAnswer:
          "They hold space for permanent teeth and guide them into position",
      },
      // 8. Soru
      {
        id: "q2_8",
        text: "Which dental professional primarily focuses on cleaning teeth, examining for signs of oral disease, and providing preventative care education?",
        options: [
          "Orthodontist", // Ortodontist (Diş teli uzmanı)
          "Oral Surgeon", // Ağız Cerrahı
          "Dental Hygienist", // Diş Hijyenisti
          "Endodontist", // Endodontist (Kanal tedavisi uzmanı)
        ],
        correctAnswer: "Dental Hygienist",
      },
      // 9. Soru
      {
        id: "q2_9",
        text: "What is the term for clenching or grinding your teeth, often during sleep?",
        options: [
          "Flossing", // Diş ipi kullanma
          "Gingivitis", // Diş eti iltihabı
          "Bruxism", // Bruksizm (Diş gıcırdatma)
          "Scaling", // Diş taşı temizliği
        ],
        correctAnswer: "Bruxism",
      },
      // 10. Soru
      {
        id: "q2_10",
        text: "What substance is produced by bacteria in the mouth when they consume sugars, leading to the breakdown of tooth enamel?",
        options: [
          "Saliva", // Tükürük
          "Acid", // Asit
          "Fluoride", // Florür
          "Plaque", // Plak
        ],
        correctAnswer: "Acid",
      },
    ],
  },
  // Başka quizler de buraya eklenebilir:
  // 'another_quiz_id': { ... }
};
// Quiz verisini ID'ye göre getiren fonksiyon

export const dummyQuizzes = [
  {
    _id: 1,
    title: "Breathing Filters, HMEs and HMEFs",
    imageUrl: "https://picsum.photos/seed/q1/220/120",
    questionCount: 6,
  },
  {
    _id: 2,
    title: "Guide for in-patient oral hygiene using OroClean complete",
    imageUrl: "https://picsum.photos/seed/q2/220/120",
    questionCount: 10,
  },
];

export const dummyArticles = [
  {
    _id: "a1",
    title: "New International Product Catalogue",
    image: require("../assets/images/Article1.png"),
    readTime: "5min read",
    createdAt: "30 March, 2024",
  },
  {
    _id: "a2",
    title: "Benefits of Regular Checkups",
    image: require("../assets/images/Article2.png"),
    readTime: "4min read",
    createdAt: "30 March, 2024",
  },
];

export const dummyNews = [
  {
    _id: "n1",
    title: "DuoFlow™ bi-lumen breathing system",
    image: require("../assets/images/Article2.png"),
    readTime: "3min read",
    createdAt: "30 March, 2024",
  },
  {
    _id: "n2",
    title: "Community Health Initiative Update",
    image: require("../assets/images/Article2.png"),
    readTime: "2min read",
    createdAt: "30 March, 2024",
  },
];

const defaultProfilePic = require("../assets/images/pp.png");

// --- Örnek Kişi Verileri ---
export const dummyContacts = [
  {
    id: "1",
    name: "Vuqar Mammadov",
    title: "Manager, Azerbaijan",
    image: defaultProfilePic,
    countryCode: "AZ",
    phone: "+9940517638223",
    facebookUrl: "https://www.facebook.com/profile.php?id=100009325839474",
  },
  {
    id: "2",
    name: "Alice Johnson",
    title: "Manager, United States",
    image: defaultProfilePic,
    countryCode: "USA",
  },
  {
    id: "3",
    name: "Satoshi Nakamoto",
    title: "Manager, Japan",
    image: defaultProfilePic,
    countryCode: "JP",
  },
  {
    id: "4",
    name: "Maria Garcia",
    title: "Manager, Spain",
    image: defaultProfilePic,
    countryCode: "SP",
  },
  {
    id: "5",
    name: "Liam Patel",
    title: "Manager, Canada",
    image: defaultProfilePic,
    countryCode: "CA",
  },
  {
    id: "6",
    name: "Anastasia Ivanova",
    title: "Manager, Russia",
    image: defaultProfilePic,
    countryCode: "RU",
  },
  // İhtiyaç halinde daha fazla kişi eklenebilir
];

export const dummyProducts = [
  // Her ürüne kendi image özelliğini ekleyin
  {
    id: "p1",
    name: "OroCare™ Mini toothbrush",
    image: require("../assets/images/Product2.png"),
    productLink:
      "https://www.intersurgical.com/products/airway-management/igel-supraglottic-airway#8204000",
  },
  {
    id: "p2",
    name: "OroCare™ Mini toothbrush",
    image: require("../assets/images/Product2.png"),
    productLink:
      "https://www.intersurgical.com/products/airway-management/igel-supraglottic-airway#8205000",
  }, // Farklı resim kullanın
  {
    id: "p3",
    name: "OroCare™ Mini toothbrush",
    image: require("../assets/images/Product2.png"),
    productLink:
      "https://www.intersurgical.com/products/airway-management/igel-supraglottic-airway#8203000",
  }, // Farklı resim kullanın
  {
    id: "p4",
    name: "OroCare™ Mini toothbrush",
    image: require("../assets/images/Product2.png"),
    productLink:
      "https://www.intersurgical.com/products/airway-management/igel-supraglottic-airway#8225000",
  }, // Farklı resim kullanın
];
