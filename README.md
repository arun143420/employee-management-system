# Employee Management System

A modern, responsive web application built with Angular for managing employee information. The system allows users to add, view, edit, and delete employee records with a clean and intuitive interface.

## Features

- **Employee Management**
  - Add new employees with detailed information
  - View current and previous employees in separate tables
  - Edit existing employee details
  - Delete employees with confirmation dialog
  - Responsive design for both desktop and mobile devices

- **User Interface**
  - Clean and modern UI using PrimeNG components
  - Responsive grid layout for mobile devices
  - Floating Action Button (FAB) for mobile view
  - Smooth animations and transitions
  - Intuitive date selection for employee tenure

- **Data Management**
  - Efficient data storage using IndexedDB
  - Real-time updates and synchronization
  - Pagination support for large datasets
  - Search and filter capabilities

## Technologies Used

- **Frontend Framework**: Angular 16
- **UI Components**: PrimeNG 16.4.1
- **Icons**: PrimeIcons
- **State Management**: RxJS
- **ID Generation**: UUID
- **Testing**: Jasmine, Karma

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Angular CLI (v16 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/employee-management-system.git
   cd employee-management-system
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   ng serve
   ```

4. Open your browser and navigate to `http://localhost:4200`

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   └── employee/
│   │       ├── employee-list/
│   │       └── employee-add/
│   │   ├── services/
│   │   └── models/
│   ├── assets/
│   └── styles/
```

## Development

### Available Scripts

- `ng serve`: Start the development server
- `ng build`: Build the project for production
- `ng test`: Run unit tests
- `ng build --watch`: Build and watch for changes

### Code Style

The project follows Angular's style guide and uses:
- TypeScript for type safety
- SCSS for styling
- PrimeNG components for UI elements
- RxJS for reactive programming

## Responsive Design

The application features a responsive design that adapts to different screen sizes:
- Desktop: Two-column layout with tables
- Mobile: Single-column layout with card-based design
- Floating Action Button (FAB) for mobile view
- Optimized touch targets for mobile devices
