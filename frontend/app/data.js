// --- Dummy Data ---
export const  dummyVideos = [
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

export  const dummyQuizzes = [
  {
    _id: "q1",
    title: "Breathing Filters, HMEs and HMEFs",
    imageUrl: "https://picsum.photos/seed/q1/220/120",
    questionCount: 12,
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
    image: "https://picsum.photos/seed/n1/180/90",
    readTime: "3min read",
    createdAt: new Date("2024-03-30").toISOString(),
  },
  {
    _id: "n2",
    title: "Community Health Initiative Update",
    image: "https://picsum.photos/seed/n2/180/90",
    readTime: "2min read",
    createdAt: new Date("2024-03-29").toISOString(),
  },
];
