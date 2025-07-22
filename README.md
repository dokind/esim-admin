# eSIM Platform Admin Dashboard

A modern admin dashboard for managing eSIM platform operations, built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

- **Country Management**: Display and manage eSIM availability across different countries organized by continents
- **Package Management**: View and manage eSIM packages with real-time pricing
- **Price Management**: Full CRUD operations for setting and managing selling prices
- **Currency Integration**: Real-time USD to MNT conversion using Khanbank API
- **Responsive Design**: Mobile-first responsive design with modern UI components
- **Popular Countries**: Quick access to frequently used countries

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios (for currency API), Fetch API (for other endpoints)
- **Backend**: Integration with mongoliansgo.hustler.mn API

## API Integration

- **Countries API**: `https://mongoliansgo.hustler.mn/api/roamwifi/get-sku-list-continent`
- **Packages API**: `https://mongoliansgo.hustler.mn/api/roamwifi/get-packages`
- **Price Management**: `https://mongoliansgo.hustler.mn/api/user/page/price`
- **Currency API**: `https://api.khanbank.com/v1/rates`

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd esim-admin
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── api/countries/          # API route for countries data
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page
├── components/
│   ├── AdminLayout.tsx         # Main admin layout wrapper
│   ├── CountriesList.tsx       # Countries display and navigation
│   └── PackagesView.tsx        # Package management with pricing
└── types/
    └── country.ts              # TypeScript type definitions
```

## Key Components

### CountriesList
- Displays countries organized by continents
- Popular countries section for quick access
- Country selection and navigation

### PackagesView
- Package details display
- Real-time currency conversion
- Price setting modal with CRUD operations
- Selling price management

### AdminLayout
- Responsive sidebar navigation
- Header with notifications
- Consistent layout wrapper

## Deployment

This project is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically with zero configuration

Alternatively, you can deploy using Vercel CLI:

```bash
npx vercel --prod
```

## Environment Variables

No environment variables are required for basic functionality. All API endpoints are configured to use public APIs.

## Development Guidelines

- Use TypeScript for all components and utilities
- Follow Next.js App Router conventions
- Use Tailwind CSS for styling
- Implement proper error handling for API calls
- Use modern React patterns (hooks, functional components)
- Keep components modular and reusable

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is private and proprietary.
