/* Extracted JavaScript from index.html */
// Global State
let currentPortal = 'home';
let currentBeneficiary = null;
let beneficiaryChain = null;
let officerReliefTypeChart = null;
let officerDistrictChart = null;
let benReliefTypeChart = null;

// Blockchain Classes
class ReliefBlock {
    constructor(index, timestamp, data, previousHash = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
    }

    calculateHash() {
        const dataString = JSON.stringify({
            index: this.index,
            timestamp: this.timestamp,
            data: this.data,
            previousHash: this.previousHash
        });
        return CryptoJS.SHA256(dataString).toString();
    }
}

class ReliefBlockchain {
    constructor() {
        this.chain = this.loadChain();
    }

    loadChain() {
        const saved = localStorage.getItem('reliefChain');
        if (saved) {
            const parsed = JSON.parse(saved);
            return parsed.map(block => {
                const b = new ReliefBlock(block.index, block.timestamp, block.data, block.previousHash);
                b.hash = block.hash;
                return b;
            });
        }
        return [this.createGenesisBlock()];
    }

    saveChain() {
        localStorage.setItem('reliefChain', JSON.stringify(this.chain));
    }

    createGenesisBlock() {
        return new ReliefBlock(0, '2026-02-01T00:00:00', {
            reliefId: 'GENESIS',
            district: 'SYSTEM',
            reliefType: 'GENESIS_BLOCK',
            blockCode: 'INIT',
            quantity: 'N/A',
            notes: 'ReliefProof WB Genesis Block'
        }, '0');
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(data) {
        const newBlock = new ReliefBlock(
            this.chain.length,
            new Date().toISOString(),
            data,
            this.getLatestBlock().hash
        );
        this.chain.push(newBlock);
        this.saveChain();
        return newBlock;
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }

    findBlockByReliefId(reliefId) {
        return this.chain.find(block => block.data.reliefId === reliefId);
    }
}

class BeneficiaryBlock {
    constructor(index, timestamp, data, previousHash = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
    }

    calculateHash() {
        const dataString = JSON.stringify({
            index: this.index,
            timestamp: this.timestamp,
            data: this.data,
            previousHash: this.previousHash
        });
        return CryptoJS.SHA256(dataString).toString();
    }
}

class BeneficiaryBlockchain {
    constructor(beneficiaryId) {
        this.beneficiaryId = beneficiaryId;
        this.chain = this.loadChain();
    }

    loadChain() {
        const saved = localStorage.getItem(`benChain_${this.beneficiaryId}`);
        if (saved) {
            const parsed = JSON.parse(saved);
            return parsed.map(block => {
                const b = new BeneficiaryBlock(block.index, block.timestamp, block.data, block.previousHash);
                b.hash = block.hash;
                return b;
            });
        }
        return [this.createGenesisBlock()];
    }

    saveChain() {
        localStorage.setItem(`benChain_${this.beneficiaryId}`, JSON.stringify(this.chain));
    }

    createGenesisBlock() {
        return new BeneficiaryBlock(0, new Date().toISOString(), {
            reliefId: 'GENESIS',
            beneficiaryId: this.beneficiaryId,
            reliefType: 'GENESIS_BLOCK',
            district: 'SYSTEM',
            notes: 'Beneficiary Relief Chain Genesis Block'
        }, '0');
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(data) {
        const newBlock = new BeneficiaryBlock(
            this.chain.length,
            new Date().toISOString(),
            data,
            this.getLatestBlock().hash
        );
        this.chain.push(newBlock);
        this.saveChain();
        return newBlock;
    }

    hasReliefType(reliefType) {
        return this.chain.some(block => 
            block.data.reliefType === reliefType && block.index > 0
        );
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }

    findBlockByReliefId(reliefId) {
        return this.chain.find(block => block.data.reliefId === reliefId);
    }
}

const reliefChain = new ReliefBlockchain();

// PIN Code API Integration
async function fetchPinCodeDetails(pinCode, isOfficer = true) {
    const statusDiv = isOfficer ? document.getElementById('pinCodeStatus') : document.getElementById('benPinCodeStatus');
    
    statusDiv.innerHTML = `
        <div class="alert alert-info">
            <span class="loading"></span> Fetching location details...
        </div>
    `;

    try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pinCode}`);
        const data = await response.json();

        if (data[0].Status === "Success") {
            const postOffice = data[0].PostOffice[0];
            
            if (isOfficer) {
                document.getElementById('district').value = postOffice.District;
                document.getElementById('state').value = postOffice.State;
                document.getElementById('postOffice').value = postOffice.Name;
                document.getElementById('blockCode').value = postOffice.Block || postOffice.Division;
            } else {
                document.getElementById('benDistrict').value = postOffice.District;
                document.getElementById('benState').value = postOffice.State;
                document.getElementById('benPostOffice').value = postOffice.Name;
                document.getElementById('benBlockCode').value = postOffice.Block || postOffice.Division;
            }

            statusDiv.innerHTML = `
                <div class="alert alert-success">
                    Location verified: ${postOffice.Name}, ${postOffice.District}, ${postOffice.State}
                </div>
            `;
        } else {
            statusDiv.innerHTML = `
                <div class="alert alert-danger">
                    Invalid PIN code. Please enter a valid 6-digit PIN code.
                </div>
            `;
            if (isOfficer) {
                document.getElementById('district').value = '';
                document.getElementById('state').value = '';
                document.getElementById('postOffice').value = '';
                document.getElementById('blockCode').value = '';
            } else {
                document.getElementById('benDistrict').value = '';
                document.getElementById('benState').value = '';
                document.getElementById('benPostOffice').value = '';
                document.getElementById('benBlockCode').value = '';
            }
        }
    } catch (error) {
        statusDiv.innerHTML = `
            <div class="alert alert-danger">
                Error fetching PIN code details. Please try again.
            </div>
        `;
    }
}

// PIN Code change listeners
document.addEventListener('DOMContentLoaded', () => {
    const pinCodeInput = document.getElementById('pinCode');
    const benPinCodeInput = document.getElementById('benPinCode');

    if (pinCodeInput) {
        pinCodeInput.addEventListener('blur', (e) => {
            if (e.target.value.length === 6) {
                fetchPinCodeDetails(e.target.value, true);
            }
        });
    }

    if (benPinCodeInput) {
        benPinCodeInput.addEventListener('blur', (e) => {
            if (e.target.value.length === 6) {
                fetchPinCodeDetails(e.target.value, false);
            }
        });
    }
});

// Aadhaar Verification with API (Simulated)
async function verifyAadhaarWithAPI(aadhaar) {
    // Note: In production, this would call actual UIDAI API
    // For demonstration, we're simulating the API call
    
    // Simulated API call with delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Basic validation
    if (aadhaar.length !== 12 || !/^\d{12}$/.test(aadhaar)) {
        return { success: false, message: 'Invalid Aadhaar format' };
    }

    // Verhoeff algorithm for Aadhaar checksum (simplified)
    // In production, use actual UIDAI verification API
    return { 
        success: true, 
        message: 'Aadhaar verified successfully',
        name: 'Verified User', // In production, this would come from API
        dob: '01/01/1990' // Example data
    };
}

// Navigation Functions
function updateNavigation() {
    const navButtons = document.getElementById('navButtons');
    
    if (currentPortal === 'home') {
        navButtons.innerHTML = '';
    } else if (currentPortal === 'officer') {
        navButtons.innerHTML = `
            <button class="nav-btn active" onclick="showOfficerSection('officer-record')">Record Relief</button>
            <button class="nav-btn" onclick="showOfficerSection('officer-verify')">Verify Relief</button>
            <button class="nav-btn" onclick="showOfficerSection('officer-dashboard')">Dashboard</button>
            <button class="nav-btn" onclick="showOfficerSection('officer-audit')">Audit Trail</button>
            <button class="nav-btn" onclick="goToHome()">Home</button>
        `;
    } else if (currentPortal === 'beneficiary') {
        if (currentBeneficiary) {
            navButtons.innerHTML = `
                <button class="nav-btn active" onclick="showBeneficiarySection('beneficiary-dashboard')">My Dashboard</button>
                <button class="nav-btn" onclick="showBeneficiarySection('beneficiary-claim')">Claim Relief</button>
                <button class="nav-btn" onclick="showBeneficiarySection('beneficiary-verify')">Verify Relief</button>
                <button class="nav-btn" onclick="showBeneficiarySection('beneficiary-audit')">Audit Trail</button>
                <button class="nav-btn btn-danger" onclick="logoutBeneficiary()">Logout</button>
            `;
        } else {
            navButtons.innerHTML = `
                <button class="nav-btn" onclick="goToHome()">Home</button>
            `;
        }
    }
}

function goToHome() {
    currentPortal = 'home';
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById('home').classList.add('active');
    updateNavigation();
}

function goToOfficerPortal() {
    currentPortal = 'officer';
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById('officer-record').classList.add('active');
    updateNavigation();
}

function goToBeneficiaryPortal() {
    currentPortal = 'beneficiary';
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById('beneficiary-login').classList.add('active');
    updateNavigation();
}

function showOfficerSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    
    document.querySelectorAll('#navButtons .nav-btn').forEach(btn => btn.classList.remove('active'));
    const btn = document.querySelector(`#navButtons .nav-btn[onclick*="${sectionId}"]`);
    if (btn) btn.classList.add('active');

    if (sectionId === 'officer-dashboard') {
        updateOfficerDashboard();
    } else if (sectionId === 'officer-audit') {
        displayOfficerAuditTrail();
    }
}

function showBeneficiarySection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    
    document.querySelectorAll('#navButtons .nav-btn').forEach(btn => btn.classList.remove('active'));
    const btn = document.querySelector(`#navButtons .nav-btn[onclick*="${sectionId}"]`);
    if (btn) btn.classList.add('active');

    if (sectionId === 'beneficiary-dashboard') {
        updateBeneficiaryDashboard();
    } else if (sectionId === 'beneficiary-audit') {
        displayBeneficiaryAuditTrail();
    }
}

// Officer Portal Functions

function generateReliefId() {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const count = reliefChain.chain.length.toString().padStart(3, '0');
    return `RP-WB-${dateStr}-${count}`;
}

function submitRelief(event) {
    event.preventDefault();

    const reliefData = {
        reliefId: generateReliefId(),
        district: document.getElementById('district').value,
        state: document.getElementById('state').value,
        postOffice: document.getElementById('postOffice').value,
        blockCode: document.getElementById('blockCode').value || 'N/A',
        pinCode: document.getElementById('pinCode').value,
        reliefType: document.getElementById('reliefType').value,
        quantity: document.getElementById('quantity').value || 'N/A',
        notes: document.getElementById('notes').value || 'N/A'
    };

    const newBlock = reliefChain.addBlock(reliefData);

    document.getElementById('reliefForm').style.display = 'none';
    document.getElementById('reliefConfirmation').style.display = 'block';
    document.getElementById('generatedReliefId').textContent = reliefData.reliefId;
    document.getElementById('displayHash').textContent = newBlock.hash;

    document.getElementById('qrcode').innerHTML = '';
    new QRCode(document.getElementById('qrcode'), {
        text: reliefData.reliefId,
        width: 200,
        height: 200,
        colorDark: '#1e40af',
        colorLight: '#ffffff'
    });

    document.getElementById('reliefConfirmation').scrollIntoView({ behavior: 'smooth' });
}

function resetOfficerForm() {
    document.getElementById('reliefForm').reset();
    document.getElementById('reliefForm').style.display = 'block';
    document.getElementById('reliefConfirmation').style.display = 'none';
    document.getElementById('pinCodeStatus').innerHTML = '';
    document.getElementById('district').value = '';
    document.getElementById('state').value = '';
    document.getElementById('postOffice').value = '';
    document.getElementById('blockCode').value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function verifyOfficerRelief(event) {
    event.preventDefault();
    const reliefId = document.getElementById('officerVerifyReliefId').value.trim();
    const block = reliefChain.findBlockByReliefId(reliefId);

    const resultDiv = document.getElementById('officerVerificationResult');

    if (block) {
        const isValid = block.hash === block.calculateHash();
        resultDiv.innerHTML = `
            <div class="card">
                <div class="verification-result ${isValid ? 'verification-success' : 'verification-fail'}">
                    <div class="verification-icon ${isValid ? 'success-icon' : 'fail-icon'}">
                        ${isValid ? '&#10003;' : '&#10007;'}
                    </div>
                    <h2 style="color: ${isValid ? 'var(--success)' : 'var(--danger)'}; margin-bottom: 1rem;">
                        ${isValid ? 'Relief Record Verified' : 'Verification Failed'}
                    </h2>
                    <div class="relief-record" style="text-align: left; max-width: 600px; margin: 2rem auto;">
                        <div class="relief-record-header">
                            <span class="relief-record-id">${block.data.reliefId}</span>
                            <span class="badge badge-success">Verified</span>
                        </div>
                        <p><strong>District:</strong> ${block.data.district}</p>
                        <p><strong>State:</strong> ${block.data.state}</p>
                        <p><strong>Post Office:</strong> ${block.data.postOffice}</p>
                        <p><strong>Block/Area:</strong> ${block.data.blockCode}</p>
                        <p><strong>PIN Code:</strong> ${block.data.pinCode}</p>
                        <p><strong>Relief Type:</strong> ${block.data.reliefType}</p>
                        <p><strong>Quantity:</strong> ${block.data.quantity}</p>
                        <p><strong>Date:</strong> ${new Date(block.timestamp).toLocaleString()}</p>
                        <p><strong>Block Number:</strong> #${block.index}</p>
                    </div>
                    <h3 style="margin-top: 2rem; color: var(--dark-blue);">Blockchain Hash Proof</h3>
                    <div class="hash-display">${block.hash}</div>
                </div>
            </div>
        `;
    } else {
        resultDiv.innerHTML = `
            <div class="card">
                <div class="verification-result verification-fail">
                    <div class="verification-icon fail-icon">&#10007;</div>
                    <h2 style="color: var(--danger); margin-bottom: 1rem;">Relief ID Not Found</h2>
                    <p>The Relief ID does not exist in the blockchain.</p>
                </div>
            </div>
        `;
    }
}

function updateOfficerDashboard() {
    const totalRecords = reliefChain.chain.length - 1;
    const districts = new Set(reliefChain.chain.slice(1).map(block => block.data.district));
    const reliefTypes = {};
    const districtCounts = {};

    reliefChain.chain.slice(1).forEach(block => {
        const type = block.data.reliefType;
        const district = block.data.district;
        
        reliefTypes[type] = (reliefTypes[type] || 0) + 1;
        districtCounts[district] = (districtCounts[district] || 0) + 1;
    });

    document.getElementById('officerTotalRecords').textContent = totalRecords;
    document.getElementById('officerDistrictsCovered').textContent = districts.size;
    document.getElementById('officerIntegrityStatus').textContent = reliefChain.isChainValid() ? 'Verified' : 'Compromised';
    document.getElementById('officerLastUpdated').textContent = totalRecords > 0 ? 
        new Date(reliefChain.getLatestBlock().timestamp).toLocaleString() : '--';

    const reliefTypeCtx = document.getElementById('officerReliefTypeChart').getContext('2d');
    if (officerReliefTypeChart) officerReliefTypeChart.destroy();
    
    officerReliefTypeChart = new Chart(reliefTypeCtx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(reliefTypes),
            datasets: [{
                data: Object.values(reliefTypes),
                backgroundColor: ['#3b82f6', '#60a5fa', '#1e40af', '#93c5fd', '#2563eb', '#1e3a8a']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } }
        }
    });

    const districtCtx = document.getElementById('officerDistrictChart').getContext('2d');
    if (officerDistrictChart) officerDistrictChart.destroy();
    
    officerDistrictChart = new Chart(districtCtx, {
        type: 'bar',
        data: {
            labels: Object.keys(districtCounts),
            datasets: [{
                label: 'Relief Records',
                data: Object.values(districtCounts),
                backgroundColor: '#3b82f6'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
            plugins: { legend: { display: false } }
        }
    });
}

function displayOfficerAuditTrail() {
    const auditDiv = document.getElementById('officerAuditTrail');
    const blocks = reliefChain.chain.slice().reverse().slice(0, 20);

    auditDiv.innerHTML = blocks.map(block => `
        <div class="relief-record">
            <div class="relief-record-header">
                <span class="relief-record-id">${block.data.reliefId}</span>
                <span class="badge badge-info">Block #${block.index}</span>
            </div>
            <p><strong>District:</strong> ${block.data.district} | <strong>Type:</strong> ${block.data.reliefType}</p>
            <p><strong>PIN:</strong> ${block.data.pinCode} | <strong>Timestamp:</strong> ${new Date(block.timestamp).toLocaleString()}</p>
            <p style="font-family: 'Courier New', monospace; font-size: 0.8rem; color: var(--gray); word-break: break-all;">
                <strong>Hash:</strong> ${block.hash.substring(0, 32)}...
            </p>
        </div>
    `).join('');
}

function verifyOfficerBlockchainIntegrity() {
    const isValid = reliefChain.isChainValid();
    const resultDiv = document.getElementById('officerBlockchainIntegrityResult');

    resultDiv.innerHTML = `
        <div class="verification-result ${isValid ? 'verification-success' : 'verification-fail'}" style="margin-bottom: 2rem;">
            <div class="verification-icon ${isValid ? 'success-icon' : 'fail-icon'}">
                ${isValid ? '&#10003;' : '&#10007;'}
            </div>
            <h2 style="color: ${isValid ? 'var(--success)' : 'var(--danger)'};">
                Blockchain ${isValid ? 'Integrity Verified' : 'Integrity Compromised'}
            </h2>
            <p style="margin-top: 1rem;">
                ${isValid ? 
                    'All ' + reliefChain.chain.length + ' blocks verified. Chain is intact and tamper-proof.' :
                    'Chain integrity check failed. Some blocks may have been tampered with.'}
            </p>
        </div>
    `;
}

function exportOfficerAuditLog() {
    const data = reliefChain.chain.map(block => ({
        blockNumber: block.index,
        reliefId: block.data.reliefId,
        district: block.data.district,
        state: block.data.state,
        pinCode: block.data.pinCode,
        reliefType: block.data.reliefType,
        timestamp: block.timestamp,
        hash: block.hash,
        previousHash: block.previousHash
    }));

    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `officer-audit-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// Beneficiary Portal Functions

async function verifyAadhaar(event) {
    event.preventDefault();
    
    const aadhaar = document.getElementById('aadhaarNumber').value;
    const verifyBtn = document.getElementById('verifyAadhaarBtn');
    const btnText = document.getElementById('verifyBtnText');
    const statusDiv = document.getElementById('aadhaarVerificationStatus');

    // Disable button and show loading

    verifyBtn.disabled = true;
    btnText.innerHTML = '<span class="loading"></span> Verifying...';

    try {
        const verification = await verifyAadhaarWithAPI(aadhaar);

        if (verification.success) {
            const beneficiaryId = 'BEN-' + CryptoJS.SHA256(aadhaar).toString().substring(0, 12).toUpperCase();
            
            currentBeneficiary = {
                beneficiaryId: beneficiaryId,
                aadhaarHash: CryptoJS.SHA256(aadhaar).toString(),
                verifiedAt: new Date().toISOString(),
                name: verification.name
            };
            
            beneficiaryChain = new BeneficiaryBlockchain(beneficiaryId);
            
            document.getElementById('displayBeneficiaryId').textContent = beneficiaryId;
            
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            document.getElementById('beneficiary-dashboard').classList.add('active');
            
            updateNavigation();
            updateBeneficiaryDashboard();
        } else {
            statusDiv.innerHTML = `
                <div class="alert alert-danger" style="margin-top: 1rem;">
                    <strong>Verification Failed:</strong> ${verification.message}
                </div>
            `;
            verifyBtn.disabled = false;
            btnText.textContent = 'Verify Identity';
        }
    } catch (error) {
        statusDiv.innerHTML = `
            <div class="alert alert-danger" style="margin-top: 1rem;">
                <strong>Error:</strong> Unable to verify Aadhaar. Please try again.
            </div>
        `;
        verifyBtn.disabled = false;
        btnText.textContent = 'Verify Identity';
    }
}

function logoutBeneficiary() {
    if (confirm('Are you sure you want to logout?')) {
        currentBeneficiary = null;
        beneficiaryChain = null;
        document.getElementById('aadhaarForm').reset();
        document.getElementById('aadhaarVerificationStatus').innerHTML = '';
        document.getElementById('verifyAadhaarBtn').disabled = false;
        document.getElementById('verifyBtnText').textContent = 'Verify Identity';
        goToBeneficiaryPortal();
    }
}

function submitBeneficiaryClaim(event) {
    event.preventDefault();

    const reliefType = document.getElementById('benReliefType').value;
    if (!beneficiaryChain) {
        document.getElementById('claimResult').innerHTML = `
            <div class="alert alert-danger">
                <strong>Error:</strong> Please verify your identity before submitting a claim.
            </div>
        `;
        return;
    }

    if (beneficiaryChain.hasReliefType(reliefType)) {
        document.getElementById('claimResult').innerHTML = `
            <div class="alert alert-danger">
                <strong>Duplicate Claim Rejected:</strong> You have already received ${reliefType} relief. The blockchain prevents duplicate claims for the same relief type.
            </div>
        `;
        return;
    }

    const claimData = {
        reliefId: generateReliefId(),
        beneficiaryId: currentBeneficiary.beneficiaryId,
        district: document.getElementById('benDistrict').value,
        state: document.getElementById('benState').value,
        postOffice: document.getElementById('benPostOffice').value,
        blockCode: document.getElementById('benBlockCode').value || 'N/A',
        pinCode: document.getElementById('benPinCode').value,
        reliefType: reliefType,
        receiptDate: document.getElementById('benReceiptDate').value
    };

    const newBlock = beneficiaryChain.addBlock(claimData);

    reliefChain.addBlock({
        reliefId: claimData.reliefId,
        district: claimData.district,
        state: claimData.state,
        postOffice: claimData.postOffice,
        blockCode: claimData.blockCode,
        pinCode: claimData.pinCode,
        reliefType: claimData.reliefType,
        quantity: 'Beneficiary Claimed',
        notes: 'Citizen-initiated claim'
    });

    document.getElementById('claimResult').innerHTML = `
        <div class="card">
            <div class="verification-result verification-success">
                <div class="verification-icon success-icon">&#10003;</div>
                <h2 style="color: var(--success); margin-bottom: 1rem;">Relief Claim Submitted Successfully</h2>
                <p style="margin-bottom: 1rem;">Your claim has been recorded on the blockchain</p>
                <div class="relief-record-id" style="font-size: 1.5rem; margin: 1rem 0;">
                    Relief ID: ${claimData.reliefId}
                </div>
                <h3 style="margin-top: 2rem; color: var(--dark-blue);">Blockchain Hash</h3>
                <div class="hash-display">${newBlock.hash}</div>
            </div>
        </div>
    `;

    document.getElementById('beneficiaryClaimForm').reset();
    document.getElementById('benPinCodeStatus').innerHTML = '';
    document.getElementById('benDistrict').value = '';
    document.getElementById('benState').value = '';
    document.getElementById('benPostOffice').value = '';
    document.getElementById('benBlockCode').value = '';
    document.getElementById('claimResult').scrollIntoView({ behavior: 'smooth' });
}

function updateBeneficiaryDashboard() {
    if (!beneficiaryChain) return;

    const records = beneficiaryChain.chain.slice(1);
    const reliefTypes = {};
    const districts = new Set();

    records.forEach(block => {
        const type = block.data.reliefType;
        reliefTypes[type] = (reliefTypes[type] || 0) + 1;
        districts.add(block.data.district);
    });

    document.getElementById('benTotalRecords').textContent = records.length;
    document.getElementById('benReliefTypes').textContent = Object.keys(reliefTypes).length;
    document.getElementById('benDistrictsCovered').textContent = districts.size;
    document.getElementById('benIntegrityStatus').textContent = beneficiaryChain.isChainValid() ? 'Verified' : 'Compromised';

    const ctx = document.getElementById('benReliefTypeChart').getContext('2d');
    if (benReliefTypeChart) benReliefTypeChart.destroy();
    
    if (Object.keys(reliefTypes).length > 0) {
        benReliefTypeChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(reliefTypes),
                datasets: [{
                    data: Object.values(reliefTypes),
                    backgroundColor: ['#3b82f6', '#60a5fa', '#1e40af', '#93c5fd', '#2563eb', '#1e3a8a']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    }

    const timeline = document.getElementById('benReliefTimeline');
    if (records.length === 0) {
        timeline.innerHTML = '<p style="color: var(--gray);">No relief records found. Submit your first claim to get started.</p>';
    } else {
        timeline.innerHTML = records.reverse().map(block => `
            <div class="timeline-item">
                <div style="background: var(--white); padding: 1rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <strong style="color: var(--primary-blue);">${block.data.reliefId}</strong>
                        <span class="badge badge-success">Verified</span>
                    </div>
                    <p><strong>Relief Type:</strong> ${block.data.reliefType}</p>
                    <p><strong>District:</strong> ${block.data.district}, ${block.data.state}</p>
                    <p><strong>PIN Code:</strong> ${block.data.pinCode}</p>
                    <p><strong>Date:</strong> ${new Date(block.timestamp).toLocaleString()}</p>
                    <p style="font-size: 0.8rem; color: var(--gray); font-family: 'Courier New', monospace;">
                        <strong>Hash:</strong> ${block.hash.substring(0, 32)}...
                    </p>
                </div>
            </div>
        `).join('');
    }
}

function verifyBeneficiaryRelief(event) {
    event.preventDefault();
    const reliefId = document.getElementById('benVerifyReliefId').value.trim();
    const block = beneficiaryChain.findBlockByReliefId(reliefId);

    const resultDiv = document.getElementById('benVerificationResult');

    if (block) {
        const isValid = block.hash === block.calculateHash();
        resultDiv.innerHTML = `
            <div class="card">
                <div class="verification-result ${isValid ? 'verification-success' : 'verification-fail'}">
                    <div class="verification-icon ${isValid ? 'success-icon' : 'fail-icon'}">
                        ${isValid ? '&#10003;' : '&#10007;'}
                    </div>
                    <h2 style="color: ${isValid ? 'var(--success)' : 'var(--danger)'}; margin-bottom: 1rem;">
                        ${isValid ? 'Relief Record Verified' : 'Verification Failed'}
                    </h2>
                    <div class="relief-record" style="text-align: left; max-width: 600px; margin: 2rem auto;">
                        <div class="relief-record-header">
                            <span class="relief-record-id">${block.data.reliefId}</span>
                            <span class="badge badge-success">Verified</span>
                        </div>
                        <p><strong>District:</strong> ${block.data.district}</p>
                        <p><strong>State:</strong> ${block.data.state}</p>
                        <p><strong>PIN Code:</strong> ${block.data.pinCode}</p>
                        <p><strong>Relief Type:</strong> ${block.data.reliefType}</p>
                        <p><strong>Date:</strong> ${new Date(block.timestamp).toLocaleString()}</p>
                        <p><strong>Block Number:</strong> #${block.index}</p>
                    </div>
                    <h3 style="margin-top: 2rem; color: var(--dark-blue);">Blockchain Hash Proof</h3>
                    <div class="hash-display">${block.hash}</div>
                </div>
            </div>
        `;
    } else {
        resultDiv.innerHTML = `
            <div class="card">
                <div class="verification-result verification-fail">
                    <div class="verification-icon fail-icon">&#10007;</div>
                    <h2 style="color: var(--danger); margin-bottom: 1rem;">Relief ID Not Found</h2>
                    <p>The Relief ID does not exist in your records.</p>
                </div>
            </div>
        `;
    }
}

function displayBeneficiaryAuditTrail() {
    if (!beneficiaryChain) {
        document.getElementById('benAuditTrail').innerHTML = '<p style="color: var(--gray);">No beneficiary selected.</p>';
        return;
    }

    const auditDiv = document.getElementById('benAuditTrail');
    const blocks = beneficiaryChain.chain.slice().reverse();

    auditDiv.innerHTML = blocks.map(block => `
        <div class="relief-record">
            <div class="relief-record-header">
                <span class="relief-record-id">${block.data.reliefId}</span>
                <span class="badge badge-info">Block #${block.index}</span>
            </div>
            <p><strong>Relief Type:</strong> ${block.data.reliefType} | <strong>District:</strong> ${block.data.district}</p>
            <p><strong>Timestamp:</strong> ${new Date(block.timestamp).toLocaleString()}</p>
            <p style="font-family: 'Courier New', monospace; font-size: 0.8rem; color: var(--gray); word-break: break-all;">
                <strong>Hash:</strong> ${block.hash.substring(0, 32)}...
            </p>
            <p style="font-family: 'Courier New', monospace; font-size: 0.8rem; color: var(--gray); word-break: break-all;">
                <strong>Previous Hash:</strong> ${block.previousHash.substring(0, 32)}...
            </p>
        </div>
    `).join('');
}

function verifyBeneficiaryChainIntegrity() {
    if (!beneficiaryChain) {
        document.getElementById('benChainIntegrityResult').innerHTML = `
            <div class="alert alert-danger">Please verify your identity to check chain integrity.</div>
        `;
        return;
    }

    const isValid = beneficiaryChain.isChainValid();
    const resultDiv = document.getElementById('benChainIntegrityResult');

    resultDiv.innerHTML = `
        <div class="verification-result ${isValid ? 'verification-success' : 'verification-fail'}" style="margin-bottom: 2rem;">
            <div class="verification-icon ${isValid ? 'success-icon' : 'fail-icon'}">
                ${isValid ? '&#10003;' : '&#10007;'}
            </div>
            <h2 style="color: ${isValid ? 'var(--success)' : 'var(--danger)'};">
                Personal Blockchain ${isValid ? 'Integrity Verified' : 'Integrity Compromised'}
            </h2>
            <p style="margin-top: 1rem;">
                ${isValid ? 
                    'All ' + beneficiaryChain.chain.length + ' blocks have been verified. Your chain is intact and tamper-proof.' :
                    'Chain integrity check failed. Some blocks may have been tampered with.'}
            </p>
        </div>
    `;
}

function exportBeneficiaryAudit() {
    if (!beneficiaryChain) return;

    const data = beneficiaryChain.chain.map(block => ({
        blockNumber: block.index,
        reliefId: block.data.reliefId,
        beneficiaryId: block.data.beneficiaryId,
        district: block.data.district,
        state: block.data.state,
        pinCode: block.data.pinCode,
        reliefType: block.data.reliefType,
        timestamp: block.timestamp,
        hash: block.hash,
        previousHash: block.previousHash
    }));

    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `beneficiary-${currentBeneficiary.beneficiaryId}-audit-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// Footer Modal Functions
function showAboutModal() {
    alert('About the Portal\n\nReliefProof WB is a blockchain-based disaster relief transparency system designed for the Government of West Bengal. It ensures tamper-proof, verifiable records of relief distribution to beneficiaries during disaster recovery operations.\n\nKey Features:\n• Blockchain-secured records\n• Citizen-verifiable proof\n• Real-time transparency\n• Anti-duplicate protection');
}

function showCopyrightModal() {
    alert('Copyright Policy\n\n© 2026 ReliefProof WB. All rights reserved.\n\nThis portal and its contents are protected by copyright law. Unauthorized reproduction, distribution, or modification is prohibited.\n\nThe blockchain technology, design, and implementation are proprietary to the Government of West Bengal.');
}

function showSitemapModal() {
    alert('Site Map\n\nHome\n• Officer Portal\n  - Record Relief\n  - Verify Relief\n  - Dashboard\n  - Audit Trail\n\n• Beneficiary Portal\n  - Identity Verification\n  - My Dashboard\n  - Claim Relief\n  - Verify Relief\n  - Audit Trail');
}

function showTermsModal() {
    alert('Terms of Use\n\n1. This portal is for official disaster relief distribution only.\n\n2. All data entered must be accurate and truthful.\n\n3. Misuse of the system may result in legal action.\n\n4. Beneficiaries must verify their identity using Aadhaar.\n\n5. All relief records are stored on an immutable blockchain.\n\n6. The Government of West Bengal reserves the right to modify these terms.');
}

function showContactModal() {
    alert('Contact Us\n\nReliefProof WB Support\n\nEmail: soumabha241001001281@technoindiaeducation.com\n\nFor technical support, feedback, or inquiries, please email us.\n\nOffice Hours: Monday - Friday, 9:00 AM - 5:00 PM IST');
}

function showHelpModal() {
    alert('Help\n\nOfficer Portal:\n• Use PIN code to auto-fill location\n• Record relief distributions\n• Generate QR codes for beneficiaries\n• View blockchain analytics\n\nBeneficiary Portal:\n• Verify identity with Aadhaar\n• Claim relief with location details\n• View personal relief history\n• Download audit logs\n\nFor detailed help, contact: soumabha241001001281@technoindiaeducation.com');
}

function showFeedbackModal() {
    alert('Feedback\n\nWe value your feedback to improve ReliefProof WB.\n\nPlease email your suggestions, issues, or comments to soumabha241001001281@technoindiaeducation.com');
}

function showNewsModal() {
    window.open('https://cm.wb.gov.in/ncmo/Public/News.aspx', '_blank');
}

// Initialize
window.addEventListener('load', () => {
    updateNavigation();
});
