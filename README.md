# Data Integration Manager

A Next.js application for managing data integration connections between BigQuery and marketing platforms (Meta Marketing and Google Ads).
This is it.

## Features

- 🔄 Create and manage data integration connections
- 📊 BigQuery integration as a data source
- 🎯 Support for multiple marketing platforms as destinations:
  - Meta Marketing
  - Google Ads
- ⏰ Flexible scheduling options:
  - Hourly sync
  - Daily sync with custom time
  - Weekly sync with day and time selection
- 🔐 Secure credential management
- 📱 Responsive design with Tailwind CSS

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16.8 or higher)
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/data-integration-manager.git
cd data-integration-manager
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
data-integration-manager/
├── app/
│   ├── components/
│   │   ├── ConnectionForm.tsx    # Form for creating new connections
│   │   └── ConnectionList.tsx    # List view of existing connections
│   ├── types.ts                  # TypeScript type definitions
│   ├── page.tsx                  # Main application page
│   └── layout.tsx               # Root layout component
├── public/
├── package.json
└── README.md
```

## Configuration

### BigQuery Setup

1. Create a service account in Google Cloud Console
2. Download the credentials JSON file
3. Configure the following in your connection:
   - Credentials JSON
   - Dataset ID
   - Table ID

### Meta Marketing Setup

1. Create an app in Meta Business Manager
2. Generate access tokens
3. Configure the following:
   - App credentials
   - Access token

### Google Ads Setup

1. Create API credentials in Google Ads
2. Configure the following:
   - API credentials
   - Access token

## Usage

1. **Creating a New Connection**
   - Click "New Connection" button
   - Fill in the connection details:
     - Connection name
     - Source configuration (BigQuery)
     - Destination configuration (Meta or Google Ads)
     - Schedule settings

2. **Managing Connections**
   - View all connections in the main dashboard
   - Monitor connection status
   - View sync schedule details

## Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

### Adding New Features

1. **New Source Types**
   - Add new source type to `SourceType` in `types.ts`
   - Update `ConnectionForm.tsx` with new source configuration fields

2. **New Destination Types**
   - Add new destination type to `DestinationType` in `types.ts`
   - Update `ConnectionForm.tsx` with new destination configuration fields

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.

## Roadmap

- [ ] Add connection testing functionality
- [ ] Implement real-time sync status monitoring
- [ ] Add support for more data sources
- [ ] Add support for more marketing platforms
- [ ] Implement user authentication
- [ ] Add connection logs and history
- [ ] Add data transformation capabilities
- [ ] Implement error handling and retry mechanisms

## Acknowledgments

- Next.js
- Tailwind CSS
- Lucide React Icons
- TypeScript