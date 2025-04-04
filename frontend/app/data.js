// --- Dummy Data ---
export const dummyVideos = [
  {
    _id: "v1",
    title: "Guide for in-patient oral hygiene using OroClean complete",
    thumbnailUrl: require("../assets/images/VideoThumbnail1.png"),
    duration: "2 min 16 sec",
    tag: "Oral Care",
  },
  {
    _id: "v2",
    title: "Guide for in-patient oral hygiene using OroClean complete",
    thumbnailUrl: require("../assets/images/VideoThumbnail2.png"),
    duration: "3 min 05 sec",
    tag: "Oral Care",
  },
];
const quizzes = {
  q1: {
    // Bu ID'yi quiz/index.jsx'ten gelen ID ile eşleştireceğiz
    id: "q1",
    title: "Oral Health with OroCare", // Quiz başlığı
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
  // Başka quizler de buraya eklenebilir:
  // 'another_quiz_id': { ... }
};
// Quiz verisini ID'ye göre getiren fonksiyon
export const getQuizDataById = (quizId) => {
  return quizzes[quizId] || null; // Quiz'i bulamazsa null döndür
};

export const dummyQuizzes = [
  {
    _id: "q1",
    title: "Breathing Filters, HMEs and HMEFs",
    imageUrl: "https://picsum.photos/seed/q1/220/120",
    questionCount: 6,
  },
  {
    _id: "q2",
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
    facebookUrl: "https://www.facebook.com/profile.php?id=100009325839474"
  },
  {
    id: "2",
    name: "Alice Johnson",
    title: "Manager, United States",
    image: defaultProfilePic,
    countryCode: "USA"
  },
  {
    id: "3",
    name: "Satoshi Nakamoto",
    title: "Manager, Japan",
    image: defaultProfilePic,
    countryCode: "JP"

  },
  {
    id: "4",
    name: "Maria Garcia",
    title: "Manager, Spain",
    image: defaultProfilePic,
    countryCode: "SP"

  },
  {
    id: "5",
    name: "Liam Patel",
    title: "Manager, Canada",
    image: defaultProfilePic,
    countryCode: "CA"

  },
  {
    id: "6",
    name: "Anastasia Ivanova",
    title: "Manager, Russia",
    image: defaultProfilePic,
    countryCode: "RU"
  },
  // İhtiyaç halinde daha fazla kişi eklenebilir
];