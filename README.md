# ReliefProof WB - Static Web Demo

This is a front-end demo of ReliefProof WB — a blockchain-inspired, client-side proof-of-relief demo. The project has been restructured so styles and scripts are split into separate files.

Quick start
- Open `index.html` in a browser (no server required).

Project structure
- `index.html` — Main HTML page (references CDN libs + local CSS/JS).
- `css/styles.css` — Extracted stylesheet.
- `js/main.js` — Extracted JavaScript logic (uses LocalStorage for demo blockchain).

Notes
- Third-party libraries are loaded from CDNs in the `<head>` of `index.html` (CryptoJS, qrcodejs, Chart.js).
- This is a static, client-side demo. In production, server-side components and secure APIs are required for Aadhaar, user authentication, and persistent ledgers.
# ReliefProof WB - Blockchain-Based Disaster Relief Transparency System

## Project Overview
A blockchain-based transparency system for disaster relief distribution in West Bengal. The system provides tamper-proof records using SHA-256 cryptographic hashing and enables citizen verification.

## File Structure

```
reliefproof-wb/
│
├── index.html                 # Main HTML file
│
├── css/
│   └── styles.css            # All CSS styles and responsive design
│
├── js/
│   ├── app.js                # Global state and initialization
│   ├── blockchain.js         # Blockchain classes (ReliefBlock, ReliefBlockchain, BeneficiaryBlock, BeneficiaryBlockchain)
│   ├── pincode.js            # PIN code API integration for location auto-fill
│   ├── aadhaar.js            # Aadhaar verification (simulated API)
│   ├── navigation.js         # Navigation and routing functions
│   ├── officer.js            # Officer portal functions (record, verify, dashboard, audit)
│   └── beneficiary.js        # Beneficiary portal functions (login, claim, verify, audit)
│
└── README.md                 # This file
```

## Features

### Officer Portal
- **Record Relief Distribution**: Enter relief details with PIN code-based location auto-fill
- **Verify Relief Records**: Verify any relief record using Relief ID
- **Dashboard**: View analytics, charts, and statistics
- **Audit Trail**: Complete blockchain audit with integrity verification

### Beneficiary Portal
- **Identity Verification**: Aadhaar-based authentication
- **Claim Relief**: Submit relief claims with duplicate prevention
- **Verify Records**: Verify personal relief records
- **Personal Dashboard**: View relief history and statistics
- **Audit Trail**: Personal blockchain with integrity checks

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Blockchain**: Custom implementation with SHA-256 hashing (CryptoJS)
- **Data Visualization**: Chart.js
- **QR Code Generation**: QRCode.js
- **APIs**: 
  - Postal PIN Code API (https://api.postalpincode.in)
  - Simulated UIDAI Aadhaar API

## Setup Instructions

1. **Download/Clone the project**
   ```bash
   git clone <repository-url>
   cd reliefproof-wb
   ```

2. **Open in VS Code**
   ```bash
   code .
   ```

3. **Run with Live Server**
   - Install "Live Server" extension in VS Code
   - Right-click on `index.html`
   - Select "Open with Live Server"

4. **Or open directly in browser**
   - Simply open `index.html` in any modern web browser
   - No build process required!

## How to Use

### For Government Officers:
1. Click on "Officer Portal"
2. Navigate to "Record Relief"
3. Enter 6-digit PIN code (location auto-fills)
4. Fill relief details and submit
5. QR code and Relief ID generated for beneficiary

### For Beneficiaries:
1. Click on "Beneficiary Portal"
2. Enter 12-digit Aadhaar number for verification
3. Navigate to "Claim Relief" to submit claims
4. View your relief history in "My Dashboard"
5. Verify records in "Verify Relief"

## File Descriptions

### HTML Files
- **index.html**: Main HTML structure with all sections (home, officer portal, beneficiary portal)

### CSS Files
- **styles.css**: Complete styling including:
  - CSS variables for theming
  - Responsive design
  - Card layouts
  - Form styles
  - Charts and visualizations
  - Animations

### JavaScript Files

#### app.js
- Global state management
- Blockchain initialization
- Application entry point

#### blockchain.js
- `ReliefBlock`: Block structure for relief records
- `ReliefBlockchain`: Main blockchain for all relief records
- `BeneficiaryBlock`: Block structure for beneficiary records
- `BeneficiaryBlockchain`: Personal blockchain for each beneficiary
- SHA-256 hash calculation
- Chain validation

#### pincode.js
- PIN code API integration
- Location auto-fill functionality
- Error handling for invalid PIN codes

#### aadhaar.js
- Aadhaar verification simulation
- API integration ready (placeholder for production)

#### navigation.js
- Portal navigation (Home, Officer, Beneficiary)
- Section switching
- Dynamic navigation menu updates

#### officer.js
- Relief record creation
- Relief ID generation
- QR code generation
- Relief verification
- Dashboard with Chart.js integration
- Audit trail display
- Blockchain integrity verification
- Export functionality

#### beneficiary.js
- Aadhaar-based login
- Relief claim submission
- Duplicate prevention
- Personal dashboard
- Relief verification
- Audit trail
- Chain integrity checks
- Export functionality

## Data Storage

- **LocalStorage**: Used for persistent blockchain data
- Relief chain: `reliefChain`
- Beneficiary chains: `benChain_[beneficiaryId]`

## Security Features

1. **SHA-256 Cryptographic Hashing**: Tamper-proof records
2. **Blockchain Validation**: Verifies entire chain integrity
3. **Duplicate Prevention**: Prevents same beneficiary from claiming same relief type twice
4. **Aadhaar Verification**: Identity verification (simulated, production-ready structure)
5. **Privacy Protection**: Personal data hashed, only anonymized statistics public

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Any modern browser with ES6+ support

## External Dependencies

All external libraries are loaded via CDN:
- CryptoJS 4.1.1 (SHA-256 hashing)
- QRCode.js 1.0.0 (QR code generation)
- Chart.js (data visualization)

## Production Deployment

For production deployment:

1. **Replace simulated APIs**:
   - Integrate actual UIDAI Aadhaar API in `aadhaar.js`
   - Add proper authentication and authorization

2. **Backend Integration**:
   - Replace localStorage with proper database
   - Implement server-side blockchain validation
   - Add API endpoints for data persistence

3. **Security Enhancements**:
   - Add SSL/TLS
   - Implement proper session management
   - Add rate limiting
   - Implement CSRF protection

4. **Optimization**:
   - Minify CSS and JS files
   - Implement CDN for static assets
   - Add service worker for offline functionality

## License

This project is a demonstration of blockchain technology for disaster relief transparency.

## Support

For issues or questions, please create an issue in the repository.