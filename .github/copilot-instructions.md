# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is an eSIM Platform Admin Dashboard built with Next.js, TypeScript, and Tailwind CSS.

## Project Context

- **Purpose**: Admin dashboard for managing eSIM platform operations
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **API Integration**: Fetches country data from external API with CORS handling
- **Backend URL**: https://mongoliansgo.hustler.mn/ (for CORS proxy)
- **Countries API**: https://mongoliansgo.hustler.mn/api/roamwifi/get-sku-list

## Key Features

- Display list of countries from API
- Popular countries section (China, Japan, Korea, Thailand, Vietnam, etc.)
- Admin dashboard layout with responsive design
- CORS handling for external API calls

## Code Style Preferences

- Use TypeScript for all components and utilities
- Follow Next.js App Router conventions
- Use Tailwind CSS for styling with component-based approach
- Implement proper error handling for API calls
- Use modern React patterns (hooks, functional components)
- Keep components modular and reusable

## API Integration Guidelines

- Use fetch API or axios for HTTP requests
- Implement proper loading states
- Handle errors gracefully with user-friendly messages
- Use the backend URL for CORS proxy when needed
- Cache API responses appropriately

## UI/UX Guidelines

- Follow modern admin dashboard design patterns
- Use consistent spacing and typography
- Implement responsive design for mobile and desktop
- Add loading indicators for async operations
- Use appropriate color schemes for admin interfaces
