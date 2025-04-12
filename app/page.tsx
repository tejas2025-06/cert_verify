'use client';

import { useState, useRef } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './config';

export default function Home() {
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const [certificateId, setCertificateId] = useState('');
  const [certificate, setCertificate] = useState<any>(null);
  const [verificationImage, setVerificationImage] = useState<File | null>(null);
  const [issuanceForm, setIssuanceForm] = useState({
    studentName: '',
    courseName: '',
    certificateId: ''
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageVerificationResult, setImageVerificationResult] = useState<boolean | null>(null);

  async function connectWallet() {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        setConnected(true);
      } else {
        alert('Please install MetaMask!');
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
    }
  }

  async function authorizeNewIssuer() {
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      const tx = await contract.authorizeIssuer("0xD78FAd2a14Bf775E9FB002460EB62AEC9960dB6e");
      await tx.wait();
      alert('Issuer authorized successfully!');
    } catch (error: any) {
      console.error('Error authorizing issuer:', error);
      alert('Error authorizing issuer. Make sure you are the contract owner.');
    }
    setLoading(false);
  }

  const calculateImageHash = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  };

  async function issueCertificate(e: React.FormEvent) {
    e.preventDefault();
    if (!issuanceForm.studentName || !issuanceForm.courseName || !issuanceForm.certificateId || !selectedImage) {
      alert('Please fill all fields and select an image');
      return;
    }
    
    setLoading(true);
    try {
      const imageHash = await calculateImageHash(selectedImage);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      // Calculate and display the certificate ID hash
      const certIdHash = ethers.keccak256(ethers.toUtf8Bytes(issuanceForm.certificateId));
      console.log('Certificate ID Hash:', certIdHash);
      
      const tx = await contract.issueCertificate(
        issuanceForm.studentName,
        issuanceForm.courseName,
        certIdHash,
        imageHash
      );
      
      await tx.wait();
      alert(`Certificate issued successfully!\nCertificate ID: ${issuanceForm.certificateId}\nPlease save this ID for verification.`);
      setIssuanceForm({ studentName: '', courseName: '', certificateId: '' });
      setSelectedImage(null);
    } catch (error: any) {
      console.error('Error issuing certificate:', error);
      alert('Error issuing certificate. Make sure you are an authorized issuer.');
    }
    setLoading(false);
  }

  async function verifyCertificate() {
    if (!certificateId || !verificationImage) {
      alert('Please provide both certificate ID and image');
      return;
    }
    
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      // Calculate certificate ID hash for verification
      const certIdHash = ethers.keccak256(ethers.toUtf8Bytes(certificateId));
      console.log('Verifying Certificate ID Hash:', certIdHash);
      
      // Get certificate details
      const certDetails = await contract.verifyCertificate(certIdHash);
      
      // Format the date
      const date = new Date(Number(certDetails[2]) * 1000);
      
      setCertificate({
        studentName: certDetails[0],
        courseName: certDetails[1],
        issueDate: date.toLocaleString(),
        isValid: certDetails[3],
        issuer: certDetails[4],
        imageHash: certDetails[5]
      });
      
      // Verify the image
      const uploadedImageHash = await calculateImageHash(verificationImage);
      const imageVerified = await contract.verifyImage(certIdHash, uploadedImageHash);
      setImageVerificationResult(imageVerified);
      
    } catch (error: any) {
      console.error('Error verifying certificate:', error);
      if (error.message?.includes('Certificate does not exist')) {
        alert('Certificate not found. Please check the Certificate ID.');
      } else {
        alert('Error verifying certificate. Please try again.');
      }
      setCertificate(null);
      setImageVerificationResult(null);
    }
    setLoading(false);
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-4xl font-bold mb-8">Certificate Verification System</h1>
      
      {!connected ? (
        <button
          onClick={connectWallet}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="w-full max-w-md">
          <div className="mb-4">
            <p className="text-sm text-gray-500">Connected Account:</p>
            <p className="font-mono">{account}</p>
            <button
              onClick={authorizeNewIssuer}
              className="mt-2 bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
              disabled={loading}
            >
              Authorize New Issuer
            </button>
          </div>
          
          {/* Issue Certificate Form */}
          <div className="mb-8 p-4 border rounded">
            <h2 className="text-xl font-bold mb-4">Issue Certificate</h2>
            <form onSubmit={issueCertificate}>
              <div className="mb-4">
                <input
                  type="text"
                  value={issuanceForm.studentName}
                  onChange={(e) => setIssuanceForm(prev => ({ ...prev, studentName: e.target.value }))}
                  placeholder="Student Name"
                  className="w-full p-2 border rounded mb-2"
                />
                <input
                  type="text"
                  value={issuanceForm.courseName}
                  onChange={(e) => setIssuanceForm(prev => ({ ...prev, courseName: e.target.value }))}
                  placeholder="Course Name"
                  className="w-full p-2 border rounded mb-2"
                />
                <input
                  type="text"
                  value={issuanceForm.certificateId}
                  onChange={(e) => setIssuanceForm(prev => ({ ...prev, certificateId: e.target.value }))}
                  placeholder="Certificate ID (e.g., CERT-2025-001)"
                  className="w-full p-2 border rounded mb-2"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
              >
                {loading ? 'Issuing...' : 'Issue Certificate'}
              </button>
            </form>
          </div>
          
          {/* Verify Certificate Section */}
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-4">Verify Certificate</h2>
            <input
              type="text"
              value={certificateId}
              onChange={(e) => setCertificateId(e.target.value)}
              placeholder="Enter Certificate ID"
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setVerificationImage(e.target.files?.[0] || null)}
              className="w-full p-2 border rounded mb-2"
            />
          </div>
          
          <button
            onClick={verifyCertificate}
            disabled={loading || !certificateId || !verificationImage}
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify Certificate'}
          </button>
          
          {certificate && (
            <div className="mt-8 p-4 border rounded">
              <h2 className="text-xl font-bold mb-4">Certificate Details</h2>
              <div className="space-y-2">
                <p><strong>Student Name:</strong> {certificate.studentName}</p>
                <p><strong>Course Name:</strong> {certificate.courseName}</p>
                <p><strong>Issue Date:</strong> {certificate.issueDate}</p>
                <p><strong>Status:</strong> {certificate.isValid ? 'Valid' : 'Invalid'}</p>
                <p><strong>Issuer:</strong> {certificate.issuer}</p>
                <p><strong>Image Verification:</strong> {
                  imageVerificationResult === null ? 'Pending' :
                  imageVerificationResult ? 'Image Verified ' : 'Image Mismatch '
                }</p>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
