import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Buy Notice Modal (Blueprint Section 7: Buy Buttons While Payments Are Not Connected)
 * Renders an unhurried, plain explanation pop-up when any buy or locked feature is tapped.
 */
export default function BuyNoticeModal({ isOpen, onClose, toolName, plannedPrice = '$19.00' }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        color: '#1E293B',
        borderRadius: '12px',
        maxWidth: '480px',
        width: '100%',
        padding: '1.75rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: '1px solid #E2E8F0',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        {/* Header Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#FEF3C7', color: '#92400E', padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          <span>ℹ️</span> PAYMENTS NOT CONNECTED
        </div>

        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: '#0F172A' }}>
          Payments Coming Soon
        </h3>

        {toolName && (
          <div style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '0.75rem' }}>
            Feature: <strong>{toolName}</strong> (Planned Price: <strong>{plannedPrice}</strong>)
          </div>
        )}

        {/* Blueprint mandated plain text */}
        <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.5, margin: '0 0 1.5rem 0' }}>
          Payments are not available yet; the payment account has not been connected. Prices shown are planned prices and may change; all basic tools stay 100% free forever.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            onClick={() => {
              onClose();
              navigate('/tools');
            }}
            style={{
              padding: '0.6rem 1rem',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              background: '#F8FAFC',
              color: '#334155',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            Browse Free Tools
          </button>

          <button
            onClick={onClose}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '6px',
              border: 'none',
              background: '#1F9D6B',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
