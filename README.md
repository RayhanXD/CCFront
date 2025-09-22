# Rork Campus Connect

A comprehensive campus connection app built with Expo and React Native, featuring event management, organization discovery, scholarship tracking, and more.

Created by Rork

## Features

- 📅 **Calendar & Events** - View and manage campus events
- 🏛️ **Organizations** - Discover and connect with campus organizations
- 💰 **Scholarships** - Track and apply for scholarships
- 🤖 **AI Chatbot** - Get instant help and information
- 👤 **Profile Management** - Personalized user experience
- 🔍 **Explore** - Discover new opportunities on campus

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (version 18 or higher)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Git](https://git-scm.com/)

For mobile development:
- **iOS**: [Xcode](https://developer.apple.com/xcode/) (macOS only)
- **Android**: [Android Studio](https://developer.android.com/studio)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rork-campus-connect
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

3. **Install Expo CLI globally** (if not already installed)
   ```bash
   npm install -g @expo/cli
   ```

## Getting Started

### Development Server

Start the development server:

```bash
npm start
```

This will:
- Start the Expo development server
- Open the Expo DevTools in your browser
- Generate a QR code for mobile testing

### Running on Different Platforms

**Web Development:**
```bash
npm run start-web
```

**Web Development with Debug Mode:**
```bash
npm run start-web-dev
```

### Mobile Testing

**iOS Simulator:**
- Press `i` in the terminal after running `npm start`
- Or scan the QR code with the Expo Go app

**Android Emulator:**
- Press `a` in the terminal after running `npm start`
- Or scan the QR code with the Expo Go app

**Physical Device:**
- Install [Expo Go](https://expo.dev/client) on your device
- Scan the QR code displayed in the terminal or browser

## Project Structure

```
rork-campus-connect/
├── app/                    # App screens and navigation
│   ├── (tabs)/            # Tab-based navigation screens
│   ├── onboarding/        # User onboarding flow
│   └── modals/            # Modal components
├── components/            # Reusable UI components
├── constants/             # App constants (colors, typography, etc.)
├── lib/                   # Utility libraries and configurations
├── mocks/                 # Mock data for development
├── store/                 # State management (Zustand stores)
├── types/                 # TypeScript type definitions
└── backend/               # Backend API and tRPC setup
```

## Technology Stack

- **Framework**: Expo (React Native)
- **Navigation**: Expo Router
- **State Management**: Zustand
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Backend**: Hono + tRPC
- **Icons**: Lucide React Native
- **Type Safety**: TypeScript

## Development

### Available Scripts

- `npm start` - Start the development server with tunnel
- `npm run start-web` - Start web development server
- `npm run start-web-dev` - Start web development server with debug mode

### Key Dependencies

- **Expo Router** - File-based routing
- **tRPC** - End-to-end typesafe APIs
- **NativeWind** - Utility-first styling
- **Zustand** - Lightweight state management
- **React Query** - Data fetching and caching

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary to Rork.

## Support

For support and questions, please contact the development team.
