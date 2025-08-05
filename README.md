# OneTeam Soccer Training Management

A modern, minimalist app for managing private soccer training sessions. Built with Next.js 14, TypeScript, and Tailwind CSS.

## ⚽ Features

- **Training Slot Management**: Create and manage 1-on-1 and group training sessions
- **Player Profiles**: Comprehensive player information with parent contacts
- **Booking System**: Easy session booking with automatic payment tracking
- **Progress Tracking**: Detailed feedback system for player development  
- **Real-time Chat**: Communication between coaches and parents
- **Dashboard**: Overview of sessions, bookings, and revenue
- **Local Storage**: All data persists locally without external dependencies

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/qa-karma/OneTeam.git
   cd OneTeam
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:3000
   ```

## 📱 How to Use

### Getting Started

1. **Dashboard**: View your training overview and quick stats
2. **Squad**: Add and manage player profiles with parent information
3. **Time Slots**: Create availability slots for training sessions
4. **Sessions**: Manage bookings and handle payments
5. **Progress**: Give feedback and track player development
6. **Chat**: Communicate with parents about sessions

### Creating Your First Session

1. Navigate to **Time Slots**
2. Click **"New Slot"** 
3. Set date, time, and session type (1-on-1 or group)
4. Set price and location
5. Save to make available for booking

### Managing Bookings

1. Go to **Sessions** tab
2. View available slots and pending bookings
3. Confirm/cancel bookings as needed
4. Mark payments as received
5. Complete sessions after they're finished

### Providing Feedback

1. Navigate to **Progress** tab
2. Click **"Give Feedback"** on completed sessions
3. Rate performance and select strengths/improvements
4. Add notes for parents and next session focus

## 🎨 Design Philosophy

- **Minimalist**: Clean interface focusing on essential features
- **Mobile-First**: Responsive design that works on all devices
- **Intuitive**: Simple navigation with personality in button labels
- **Professional**: Polished UI suitable for business use

## 🔧 Technical Details

### Tech Stack

- **Frontend**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom design system
- **Language**: TypeScript for type safety
- **Storage**: Local Storage with structured data management
- **Icons**: Lucide React for consistent iconography

### Project Structure

```
src/
├── app/                 # Next.js app router
├── components/          # React components
├── types/              # TypeScript type definitions
└── utils/              # Utility functions and storage
```

### Data Persistence

All data is stored locally using browser localStorage with:
- Automatic serialization/deserialization
- Type-safe storage utilities
- Data integrity checks
- No risk of data loss on page refresh

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically on every push

### Deploy to Other Platforms

The app is a standard Next.js application and can be deployed to:
- Vercel
- Netlify  
- Heroku
- AWS
- Any Node.js hosting platform

## 📊 Demo Data

The app includes demo data that gets automatically generated:
- Sample coach profile
- Demo players and training sessions
- Example bookings and feedback

## 🔮 Future Enhancements

- User authentication system
- Database integration (PostgreSQL/MongoDB)
- Payment processing (Stripe integration)
- Email notifications
- Calendar integration
- Mobile app version
- Multi-coach support
- Advanced analytics

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/qa-karma/OneTeam/issues) page
2. Create a new issue with detailed description
3. Include screenshots if relevant

## 🎯 About OneTeam

OneTeam simplifies soccer training management by providing coaches with an intuitive platform to:
- Organize training sessions efficiently
- Build stronger relationships with players and parents
- Track player development over time
- Manage the business side of private coaching

Built with modern web technologies and designed for simplicity and effectiveness.

---

**Happy Coaching! ⚽**