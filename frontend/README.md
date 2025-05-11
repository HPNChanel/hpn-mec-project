# HPN MEC Medical Health Web Application - Frontend

A comprehensive Vietnamese medical health web application built with React, Material-UI, and TypeScript.

## Features

- Patient registration and authentication
- Medical health forms for recording health metrics
- Health history timeline view
- Calendar visualization of health records
- Dashboard with health statistics
- Admin panel for hospital staff
- Analytics dashboard for administrators
- Export/import capabilities for health records
- Multi-language support (Vietnamese/English)
- Dark/Light theme modes
- Responsive design for all devices

## Installation

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build
```

## Project Structure

- `src/api`: API service integration with backend
- `src/assets`: Static assets and images
- `src/components`: Reusable UI components
- `src/context`: React context providers (auth, theme)
- `src/pages`: Application pages/views
- `src/theme`: Theme configuration
- `src/utils`: Helper functions and utilities

## Recent Updates

- Fixed Material UI v7 compatibility issues in all components
- Added proper TypeScript type annotations throughout the codebase
- Implemented responsive design for all screen sizes
- Added full support for exporting and importing health records
- Added comprehensive health statistics in the Analytics dashboard
- Connected all components to real backend API endpoints

## Dependencies

- React 19+
- Material UI 7.0+
- React Router 7.0+
- Recharts for data visualization
- FullCalendar for calendar views
- date-fns for date handling

## Development Guidelines

- Maintain consistent naming conventions
- Use TypeScript for all new components
- Follow the established component structure
- Use the Material UI theming system for styling
- Add comprehensive error handling
- Keep proper internationalization support
