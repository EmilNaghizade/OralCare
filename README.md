<div align="center">

# 🦷 OralCare

### Full-Stack Mobile Learning Application

A React Native mobile app for exploring oral health topics, managing a personal profile, and testing knowledge through interactive quizzes.

**React Native · Expo · Node.js · Express.js · MongoDB**

[View Repository](https://github.com/EmilNaghizade/OralCare)

</div>

---

## Overview

**OralCare** is an independently developed full-stack mobile application focused on oral health education. I built both the mobile application and its backend, combining authentication, user profiles, and interactive quizzes in one experience.

The application is **completed as a personal project** but has **not been published** to the App Store or Google Play.

## Features

- **Account creation and sign-in:** Registration and login flows.
- **Google authentication:** An additional way for users to authenticate.
- **User profiles:** Create and manage a personal profile.
- **Interactive quizzes:** Test oral health knowledge.
- **Mobile navigation:** Navigate between app screens with a React Native-based interface.
- **Backend integration:** Connect mobile features to a Node.js/Express API backed by MongoDB.

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Mobile | React Native 0.76, Expo SDK 52, JavaScript |
| Navigation | Expo Router, React Navigation |
| HTTP client | Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Additional mobile dependencies | Expo SecureStore, AsyncStorage, React Native Reanimated, Gesture Handler |
| Testing tooling | Jest, jest-expo |

> The additional mobile libraries and testing tools are listed in the frontend dependencies. Their inclusion here does not imply that every library is used in production code or that automated tests have been completed.

## Architecture

```text
┌──────────────────────────┐
│ OralCare Mobile App      │
│ React Native + Expo      │
│ Screens · Navigation     │
└────────────┬─────────────┘
             │ HTTP requests
             ▼
┌──────────────────────────┐
│ Backend API              │
│ Node.js + Express.js     │
│ Auth · Profiles · Quizzes│
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ MongoDB                  │
└──────────────────────────┘
```

*This is a conceptual overview, not an audited diagram of the repository's exact modules or deployment.*

## Screenshots

Add real screenshots to a `screenshots/` directory and replace the placeholders below. Suggested screens:

| Welcome / Login | Quiz | Profile |
| --- | --- | --- |

A short walkthrough video or GIF is also recommended for recruiters reviewing the project.

## Getting Started

### Prerequisites

- Node.js and npm
- Expo-compatible development environment
- Android emulator, iOS simulator, or a compatible development device
- A running backend API and MongoDB connection
- Authentication provider configuration for Google sign-in

### Mobile app

Clone the repository:

```bash
git clone https://github.com/EmilNaghizade/OralCare.git
cd OralCare
```

Locate the directory containing the frontend `package.json` shared for this project, then run:

```bash
npm install
npm start
```

The frontend also defines these scripts:

```bash
npm run android
npm run ios
npm run lint
npm test
```

> The `android` and `ios` scripts use `expo run:android` and `expo run:ios`, which require the appropriate native development setup. Expo SDK 52 is an older SDK; check compatible tooling before running the project.

### Backend setup

The backend was developed with Node.js, Express.js, and MongoDB. Before running it, configure the required database connection, authentication secrets, and Google sign-in credentials using the backend's actual configuration files.

**To complete this section:** Add the verified backend directory path, exact start command, and an `.env.example` containing variable **names only**, with no real credentials.

### Configuration

The frontend includes an `env-cmd` development script:

```bash
npm run dev
```

This script reads a local `.env` file and starts Expo with a development client. The exact variable names and API base URL should be documented after checking the source code. Never commit secrets, production credentials, or private signing keys.

## What I Built

As the independent developer, I worked on:

- React Native mobile interface and screen flows
- Registration, login, and Google authentication features
- User profile and quiz functionality
- Node.js/Express backend development
- MongoDB-backed application functionality
- Mobile-to-backend API integration

## Project Status

**Completed personal project · Not published to app stores**

This repository is presented as a portfolio project. Installation and configuration steps may require adjustment for your local environment.

## 📱 Application Demo

Watch the OralCare mobile application in action:

[▶ Watch OralCare Demo on YouTube](https://youtu.be/zbWj8zQaB7Y)

## Author

**Emil Naghizade**

- [GitHub](https://github.com/EmilNaghizade)
- [LinkedIn](https://www.linkedin.com/in/emil-naghizade-98166521a/)

---

<div align="center">
  Built to explore full-stack mobile development and make oral health learning more interactive.
</div>
