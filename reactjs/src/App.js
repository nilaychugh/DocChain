import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Container, Typography } from '@mui/material';
import Web3 from 'web3';
import ContractABI from './DocumentRegistry.json';
import VerificationSharing from './VerificationSharing';
import RetrieveDocuments from './RetrieveDocument';
import { Shield, Download } from 'lucide-react';
import { styles } from './styles/styles';

const App = () => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const contractAddress = '0x696462745a549906AD3F979926cC086e1775583A';

  useEffect(() => {
    const initWeb3AndContract = async () => {
      setIsLoading(true);
      try {
        // Check if Web3 is injected by MetaMask
        if (typeof window.ethereum !== 'undefined') {
          // Create Web3 instance
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);

          try {
            // Request account access
            const accounts = await window.ethereum.request({
              method: 'eth_requestAccounts'
            });
            setWalletAddress(accounts[0]);

            // Create contract instance
            if (ContractABI && ContractABI.abi) {
              const contractInstance = new web3Instance.eth.Contract(
                ContractABI.abi,
                contractAddress
              );
              setContract(contractInstance);
            } else {
              throw new Error('Contract ABI is not properly loaded');
            }
          } catch (err) {
            throw new Error(`Failed to initialize contract: ${err.message}`);
          }

          // Setup event listeners
          window.ethereum.on('accountsChanged', (accounts) => {
            setWalletAddress(accounts[0] || '');
          });

          window.ethereum.on('chainChanged', () => {
            window.location.reload();
          });

        } else {
          throw new Error('Please install MetaMask to use this application');
        }
      } catch (error) {
        console.error('Initialization Error:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    initWeb3AndContract();

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
        window.ethereum.removeListener('chainChanged', () => {});
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <Typography>Loading Web3 environment...</Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <Typography color="error">Error: {error}</Typography>
      </div>
    );
  }

  if (!web3 || !contract) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <Typography>
          Web3 or Contract not initialized. Please check your wallet connection.
        </Typography>
      </div>
    );
  }

  const sharedProps = {
    web3: web3,
    contract: contract,
    walletAddress: walletAddress,
    contractAddress: contractAddress
  };

  return (
    <Router>
      <div style={styles.container}>
        <div style={styles.backgroundAnimation} />
        <header style={styles.header}>
          <div style={styles.titleContainer}>
            <h1 style={styles.title}>DocChain</h1>
            <p style={styles.subtitle}>Securely verify and share your documents</p>
          </div>
          <nav style={styles.nav}>
            <Link to="/" style={styles.navButton}>
              <Shield style={{ marginRight: '8px' }} />
              Verify & Share
            </Link>
            <Link to="/retrieve" style={styles.navButton}>
              <Download style={{ marginRight: '8px' }} />
              Retrieve Documents
            </Link>
          </nav>
        </header>
        <Routes>
          <Route 
            path="/" 
            element={<VerificationSharing {...sharedProps} />} 
          />
          <Route 
            path="/retrieve" 
            element={<RetrieveDocuments {...sharedProps} />} 
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;