# FuelGo Nigeria

A web-based solution for real-time fuel price tracking, online ordering, and delivery of fuel to homes, offices, or roadside locations.

## Features

- Real-time fuel price tracking from vendors
- Online ordering and delivery of fuel
- Emergency fuel services
- Multiple user roles (Customers, Vendors, Drivers, Admin)
- Real-time order tracking
- Payment integration with Paystack
- Vendor and driver ratings system

## Tech Stack

- **Frontend:** React.js + Tailwind CSS
- **Backend:** Node.js + Express.js
- **Database:** PostgreSQL (primary), Redis (session/cache)
- **Real-time Location:** Google Maps API + Socket.IO
- **Authentication:** JWT + bcrypt
- **Payment:** Paystack
- **Notifications:** Email (Nodemailer), SMS (Termii/Infobip), Push (OneSignal)

## Project Structure

```
fuelgo-nigeria/
├── frontend/           # React frontend application
├── backend/           # Node.js + Express backend
├── shared/            # Shared types and utilities
└── docs/             # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL
- Redis
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/fuelgo-nigeria.git
   cd fuelgo-nigeria
   ```

2. Install dependencies:
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install

   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env` in both frontend and backend directories
   - Fill in the required environment variables

4. Start the development servers:
   ```bash
   # Start backend server
   cd backend
   npm run dev

   # Start frontend server
   cd frontend
   npm run dev
   ```

## Development

- Frontend runs on: http://localhost:3000
- Backend API runs on: http://localhost:5000

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 