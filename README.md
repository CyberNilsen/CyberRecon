# 🔍 CyberRecon

**Advanced WHOIS, IP lookup & DNS reconnaissance tool for security research**

A powerful Chrome extension designed for cybersecurity professionals, researchers, and enthusiasts to quickly gather intelligence on domains and IP addresses directly from their browser.


## ✨ Features

### 🌐 IP Geolocation Intelligence
- **Real-time IP lookup** with multiple fallback APIs
- **Geographic location** data (city, region, country)
- **ISP and organization** information
- **ASN (Autonomous System Number)** details
- **Timezone and coordinates** data
- **Multiple data sources** for reliability (ipapi.co, ip-api.com)

### 🏷️ Domain Analysis
- **DNS resolution** of domains to IP addresses
- **Current tab analysis** - instantly analyze the site you're browsing
- **Automatic protocol stripping** for clean domain extraction
- **Domain validation** and error handling

### 📝 DNS Records Lookup
- **Comprehensive DNS record types**: A, AAAA, MX, NS, TXT, CNAME
- **TTL information** for each record
- **Bulk DNS analysis** with parallel queries
- **Google DNS API** integration for reliable results

### 🛠️ User Experience
- **Modern cybersecurity-themed UI** with dark mode design
- **One-click copying** of IP addresses, domains, and DNS records
- **Real-time status updates** with loading animations
- **Error handling** with fallback mechanisms
- **Responsive design** optimized for extension popup

## 🚀 Installation

### Manual Installation (Developer Mode)

1. **Download the extension files**
   ```bash
   git clone https://github.com/yourusername/CyberRecon.git
   cd CyberRecon
   ```

2. **Enable Developer Mode in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Toggle "Developer mode" in the top right corner

3. **Load the extension**
   - Click "Load unpacked"
   - Select the CyberRecon folder containing `manifest.json`

4. **Pin the extension**
   - Click the Extensions icon in Chrome toolbar
   - Pin CyberRecon for easy access

## 📋 Usage

### Quick Start
1. **Click the CyberRecon icon** in your Chrome toolbar
2. **Enter a domain or IP** in the input field (e.g., `google.com` or `8.8.8.8`)
3. **Click "🔍 Lookup Info"** to start reconnaissance

### Available Actions

| Button | Function | Description |
|--------|----------|-------------|
| 🔍 **Lookup Info** | Main analysis | Performs comprehensive IP/domain lookup |
| 📄 **Current Tab** | Tab analysis | Analyzes the domain of your current tab |
| 🌐 **My IP** | IP detection | Discovers your public IP address |
| 📝 **DNS Records** | DNS lookup | Retrieves all DNS record types |
| 🗑️ **Clear** | Reset | Clears results and input field |

### Advanced Features

#### Automatic Detection
- **IP vs Domain**: Automatically detects input type and uses appropriate lookup method
- **Current Tab Integration**: Instantly analyze any website you're visiting
- **Protocol Handling**: Automatically strips `http://`, `https://`, and paths

#### Data Export
- **Copy Individual Values**: Click 📋 buttons next to any result
- **Copy All DNS Records**: Export complete DNS information
- **Formatted Output**: Clean, organized data ready for reports

## 🔧 Technical Details

### Architecture
- **Manifest V3** Chrome extension
- **Service Worker** background script for API calls
- **Modern JavaScript** with async/await patterns
- **CSS Grid & Flexbox** responsive layout
- **No external dependencies** - pure vanilla JS

### API Integrations
- **ipapi.co** - Primary IP geolocation service
- **ip-api.com** - Fallback IP geolocation service
- **Google DNS API** - DNS record resolution
- **Chrome Tabs API** - Current tab analysis

### Permissions Required
- `activeTab` - Access current tab hostname
- `host_permissions` for API endpoints:
  - `https://ipapi.co/*`
  - `https://dns.google/*`
  - `http://ip-api.com/*`

## 🎨 UI/UX Design

### Color Palette
- **Dark Navy Base** (`#0a0e27`, `#1a1f3a`) - Professional cyber aesthetic
- **Blue Accents** (`#3b82f6`) - Primary focus elements
- **Green Highlights** (`#10b981`) - Terminal-style data values
- **Purple Actions** (`#7c3aed`) - Main lookup button
- **Cyan DNS** (`#06b6d4`) - Network operations
- **Red Warnings** (`#dc2626`) - Error states

### Visual Elements
- **Glassmorphism effects** with backdrop blur
- **Gradient buttons** with hover animations
- **Glowing focus states** for better UX
- **Terminal-inspired code blocks** for technical data
- **Smooth transitions** throughout the interface

## 🔒 Security & Privacy

### Data Handling
- **No data storage** - all information is session-based
- **No user tracking** - extension operates locally
- **API calls only** when user initiates lookup
- **No sensitive data collection** - only public DNS/IP information

### API Security
- **HTTPS-only APIs** where possible
- **Error handling** prevents information leakage
- **Rate limiting** through natural user interaction
- **No credentials required** - uses public APIs

## 🛠️ Development

### File Structure
```
CyberRecon/
├── manifest.json        # Extension configuration
├── popup.html           # Main UI interface
├── popup.js             # Frontend logic
├── background.js        # Service worker
├── icons/               # Extension icons
└── README.md            # This file
```

### Key Functions

#### Core Lookup Functions
- `lookupInfo()` - Main analysis coordinator
- `lookupIP(ip)` - IP geolocation with fallbacks
- `lookupDomain(domain)` - Domain to IP resolution
- `getDNSRecords()` - Comprehensive DNS analysis

#### UI Management
- `displayResults()` - Render IP/domain information
- `displayDNSResults()` - Render DNS records
- `showMessage(message, type)` - Status updates
- `copyToClipboard(text)` - Data export functionality

### Extension Points
The codebase is designed for easy extension:
- **Add new APIs** by modifying the `apis` array in lookup functions
- **New record types** can be added to the `recordTypes` array
- **UI themes** can be modified through CSS custom properties
- **Additional data sources** can be integrated through the service worker

## 🤝 Contributing

### Getting Started
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly with various domains and IPs
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines
- **Follow existing code style** and formatting
- **Test with multiple domains and IPs** before submitting
- **Update documentation** for any new features
- **Ensure error handling** for all new functionality
- **Maintain compatibility** with Manifest V3

## 📄 License

This project is licensed under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **API Providers**: ipapi.co, ip-api.com, Google DNS
- **Icon Design**: Custom cybersecurity-themed iconography
- **UI Inspiration**: Modern dark mode interfaces and terminal aesthetics
- **Security Community**: For feedback and testing

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/CyberRecon/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/CyberRecon/discussions)
- **Security**: For security-related issues, please email security@yourproject.com

---

**⚠️ Disclaimer**: CyberRecon is intended for legitimate security research and educational purposes only. Users are responsible for complying with applicable laws and terms of service when using this tool.
