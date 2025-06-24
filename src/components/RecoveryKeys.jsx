import React, { useState } from 'react';
import { Copy, CheckCircle, AlertTriangle, Download } from 'lucide-react';
import './RecoveryKeys.css';

const RecoveryKeys = ({ keys, onContinue }) => {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [allCopied, setAllCopied] = useState(false);

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const copyAllKeys = async () => {
    const allKeysText = keys.map((key, index) => `${index + 1}. ${key}`).join('\n');
    try {
      await navigator.clipboard.writeText(allKeysText);
      setAllCopied(true);
      setTimeout(() => setAllCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy all keys: ', err);
    }
  };

  const downloadKeys = () => {
    const allKeysText = `Wellness Tracker Recovery Keys\n\nPlease store these keys in a safe place. You will need them to recover your account if you forget your password.\n\n${keys.map((key, index) => `${index + 1}. ${key}`).join('\n')}\n\nNote: These keys can be used multiple times for password recovery. Keep these keys secure and private.`;
    
    const blob = new Blob([allKeysText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'wellness-tracker-recovery-keys.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="recovery-keys-overlay">
      <div className="recovery-keys-modal">
        <div className="recovery-keys-header">
          <div className="warning-icon">
            <AlertTriangle size={32} />
          </div>
          <h2>Your Recovery Keys</h2>
          <p className="recovery-keys-subtitle">
            Store these keys in a safe place - you'll need them to recover your account
          </p>
        </div>

        <div className="recovery-keys-content">
          <div className="recovery-keys-warning">
            <div className="warning-content">
              <AlertTriangle size={20} />
              <div>
                <strong>Important:</strong> These recovery keys can be used multiple times. 
                Save these keys securely and never share them with anyone.
              </div>
            </div>
          </div>

          <div className="recovery-keys-actions">
            <button 
              className="copy-all-btn"
              onClick={copyAllKeys}
              disabled={allCopied}
            >
              {allCopied ? (
                <>
                  <CheckCircle size={18} />
                  All Keys Copied!
                </>
              ) : (
                <>
                  <Copy size={18} />
                  Copy All Keys
                </>
              )}
            </button>

            <button 
              className="download-btn"
              onClick={downloadKeys}
            >
              <Download size={18} />
              Download as Text File
            </button>
          </div>

          <div className="recovery-keys-list">
            {keys.map((key, index) => (
              <div key={index} className="recovery-key-item">
                <div className="key-number">{index + 1}</div>
                <div className="key-value">{key}</div>
                <button
                  className="copy-key-btn"
                  onClick={() => copyToClipboard(key, index)}
                  disabled={copiedIndex === index}
                >
                  {copiedIndex === index ? (
                    <CheckCircle size={18} />
                  ) : (
                    <Copy size={18} />
                  )}
                </button>
              </div>
            ))}
          </div>

          <div className="recovery-keys-info">
            <div className="info-box">
              <h4>How to use recovery keys:</h4>
              <ul>
                <li>Keep these keys in a secure location (password manager, safe, etc.)</li>
                <li>If you forget your password, use any recovery key to reset it</li>
                <li>Keys can be used multiple times - any key will work for password recovery</li>
                <li>Never share these keys with anyone</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="recovery-keys-footer">
          <button 
            className="continue-btn"
            onClick={onContinue}
          >
            I have saved my recovery keys safely
          </button>
          <p className="footer-warning">
            You won't be able to see these keys again. Make sure to save them now!
          </p>
        </div>
      </div>
    </div>
  );
};

export default RecoveryKeys; 