// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CertificateVerification {
    struct Certificate {
        string studentName;
        string courseName;
        uint256 issueDate;
        bool isValid;
        address issuer;
        bytes32 imageHash;
    }

    mapping(bytes32 => Certificate) public certificates;
    mapping(address => bool) public authorizedIssuers;
    address public owner;

    event CertificateIssued(bytes32 indexed certificateId, string studentName, string courseName, bytes32 imageHash);
    event IssuerAuthorized(address issuer);
    event IssuerRevoked(address issuer);

    constructor() {
        owner = msg.sender;
        authorizedIssuers[msg.sender] = true;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier onlyAuthorizedIssuer() {
        require(authorizedIssuers[msg.sender], "Only authorized issuers can perform this action");
        _;
    }

    function authorizeIssuer(address issuer) public onlyOwner {
        authorizedIssuers[issuer] = true;
        emit IssuerAuthorized(issuer);
    }

    function revokeIssuer(address issuer) public onlyOwner {
        authorizedIssuers[issuer] = false;
        emit IssuerRevoked(issuer);
    }

    function issueCertificate(
        string memory studentName,
        string memory courseName,
        bytes32 certificateId,
        bytes32 imageHash
    ) public onlyAuthorizedIssuer {
        require(certificates[certificateId].issueDate == 0, "Certificate ID already exists");

        certificates[certificateId] = Certificate({
            studentName: studentName,
            courseName: courseName,
            issueDate: block.timestamp,
            isValid: true,
            issuer: msg.sender,
            imageHash: imageHash
        });

        emit CertificateIssued(certificateId, studentName, courseName, imageHash);
    }

    function verifyCertificate(bytes32 certificateId) 
        public 
        view 
        returns (
            string memory studentName,
            string memory courseName,
            uint256 issueDate,
            bool isValid,
            address issuer,
            bytes32 imageHash
        ) 
    {
        Certificate memory cert = certificates[certificateId];
        require(cert.issueDate != 0, "Certificate does not exist");
        
        return (
            cert.studentName,
            cert.courseName,
            cert.issueDate,
            cert.isValid,
            cert.issuer,
            cert.imageHash
        );
    }

    function verifyImage(bytes32 certificateId, bytes32 imageHash) 
        public 
        view 
        returns (bool) 
    {
        Certificate memory cert = certificates[certificateId];
        require(cert.issueDate != 0, "Certificate does not exist");
        return cert.imageHash == imageHash;
    }
}
