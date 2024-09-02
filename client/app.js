import { Web3 } from 'web3';
import contractJson from '../build/contracts/AuditTrail.json';

const abi = contractJson.abi;
console.log(abi);

const networkId = 5777; // Ganache network ID
const deployNetwork = contractJson.networks[networkId];


const contractABI = abi;
const contractAddress = deployNetwork.address;
const web3 = new Web3('http://localhost:8545');
const privateKey = "0xb2c488b68a775c823263a436bbb8876c4ba64c4b21a0713c5fede5ad369ef89b";

// Create account from private key
const account = web3.eth.accounts.privateKeyToAccount(privateKey);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;

const auditTrailContract = new web3.eth.Contract(contractABI, contractAddress);

async function addAuditEntry(action, details) {
    const userAddress = account.address;
    console.log(userAddress);

    try {
        const gasEstimate = await auditTrailContract.methods.addAuditEntry(action, details).estimateGas({ from: userAddress });
        const result = await auditTrailContract.methods.addAuditEntry(action, details).send({
            from: userAddress,
            gas: gasEstimate,
            gasPrice: await web3.eth.getGasPrice()
        });
        console.log('Transaction hash:', result.transactionHash);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

async function loadAuditEntries() {
    const entryCount = await auditTrailContract.methods.getAuditEntryCount().call();
    const entries = [];

    for (let i = 0; i < entryCount; i++) {
        const entry = await auditTrailContract.methods.getAuditEntry(i).call();
        const formattedTimestamp = new Date(entry[2].toString() * 1000).toISOString().slice(0, 19).replace('T', ' ');

        entries.push({
            action: entry[0],
            details: entry[1],
            timestamp: formattedTimestamp,
            address: entry[3]
        });
    }

    return entries;
}


// UI Interaction Code
document.getElementById('auditForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const action = document.getElementById('action').value;
    const details = document.getElementById('details').value;

    const success = await addAuditEntry(action, details);
    if (success) {
        alert('Audit entry added successfully!');
        updateAuditTable();
    } else {
        alert('Failed to add audit entry.');
    }
});

async function updateAuditTable() {
    const entries = await loadAuditEntries();
    const auditBody = document.getElementById('auditBody');
    auditBody.innerHTML = '';

    entries.forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><span class="action-link" onclick="openPopup('${entry.action}', '${entry.address}', '${entry.timestamp}', '${entry.details.replace(/'/g, "&apos;")}')">${entry.action}</span></td>
            <td>${entry.address}</td>
            <td>${entry.timestamp}</td>
            <td><button class="view-details-btn" onclick="openPopup('${entry.address}', '${entry.action}', '${entry.timestamp}', '${entry.details.replace(/'/g, "&apos;")}')">View Details</button></td>
        `;
        auditBody.appendChild(row);
    });
}

// Load audit entries on page load
window.addEventListener('load', updateAuditTable);