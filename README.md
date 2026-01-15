# Void Admiral Builder 🛡️⚔️

A modern React TypeScript application for building and managing void admiral fleets from various factions. Built with Vite for fast development and optimized production builds.

## Features

- 🎯 **Faction Selection**: Choose from 22 different factions
- 🚢 **Ship Management**: Add ships to your army with detailed statistics
- ⚙️ **Weapon Configuration**: Customize prow and hull weapons for each ship
- 💰 **Points Tracking**: Real-time point cost calculation with special squadron rules
- 🎨 **Dark Theme**: Modern dark UI with responsive design
- 🧪 **Comprehensive Testing**: Full test coverage with Vitest and React Testing Library

## Special Rules

- **Squadrons**: Ships with "Squadron" size cost 3x points and have 3x weapon selections
- **Weapon Selection**: Choose from available prow and hull weapons for each ship
- **Army Sorting**: Ships automatically sorted by cost (highest first)

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Testing

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

## Project Structure

```
├── src/
│   ├── components/           # React components
│   │   ├── ArmyList.tsx     # Army management component
│   │   ├── ArmyShipCard.tsx # Individual army ship cards
│   │   ├── FactionSelector.tsx # Faction dropdown
│   │   ├── ShipCard.tsx     # Available ship cards
│   │   └── ShipsGrid.tsx    # Ship grid layout
│   ├── test/                # Test files and documentation
│   │   ├── setup.ts         # Test configuration
│   │   └── README.md        # Testing documentation
│   ├── App.tsx              # Main application component
│   ├── App.css              # App-specific styles
│   ├── index.css            # Global styles
│   └── main.tsx             # Application entry point
├── public/
│   └── data/
│       └── factions.json    # Game data and ship definitions
├── index.html               # HTML template
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite configuration with Vitest
└── README.md
```

## Technology Stack

- ⚡️ **Vite** - Fast build tool and development server
- ⚛️ **React 18** - Modern React with hooks and concurrent features
- 🔷 **TypeScript** - Type-safe JavaScript
- 🧪 **Vitest** - Fast unit testing framework
- 🐙 **React Testing Library** - Component testing utilities
- 🎨 **CSS3** - Modern styling with CSS Grid and Flexbox
- 🎯 **Font Awesome** - Icons and UI elements

## Testing Strategy

The application includes comprehensive testing covering:

- **Component Rendering**: All components render correctly with proper data
- **User Interactions**: Button clicks, form selections, and navigation
- **Business Logic**: Squadron cost calculations, weapon selection, army sorting
- **Integration**: Full user workflows from faction selection to army building
- **Edge Cases**: Empty states, loading states, and error conditions

See `src/test/README.md` for detailed testing documentation.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).
