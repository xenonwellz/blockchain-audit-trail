// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AuditTrail {
    struct AuditEntry {
        address user;
        string action;
        uint256 timestamp;
        string details;
    }

    AuditEntry[] public auditEntries;

    event AuditEntryCreated(address indexed user, string action, uint256 timestamp, string details);

    function addAuditEntry(string memory _action, string memory _details) public {
        AuditEntry memory newEntry = AuditEntry({
            user: msg.sender,
            action: _action,
            timestamp: block.timestamp,
            details: _details
        });
        auditEntries.push(newEntry);
        emit AuditEntryCreated(msg.sender, _action, block.timestamp, _details);
    }

    function getAuditEntryCount() public view returns (uint256) {
        return auditEntries.length;
    }

    function getAuditEntry(uint256 index) public view returns (address, string memory, uint256, string memory) {
        require(index < auditEntries.length, "Invalid index");
        AuditEntry memory entry = auditEntries[index];
        return (entry.user, entry.action, entry.timestamp, entry.details);
    }
}
