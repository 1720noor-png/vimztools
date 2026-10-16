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
      <div 
        className="buy-notice-modal-box"
        style={{
          backgroundColor: 'var(--neu-bg, #E8EAF2)',
          color: 'var(--neu-fg, #20213A)',
          borderRadius: '28px',
          maxWidth: '480px',
          width: '100%',
          padding: '2rem',
          boxShadow: 'var(--neu-extruded-lg)',
          border: 'none',
          animation: 'neu-modal-3d-enter 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Header Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--neu-bg, #E8EAF2)', boxShadow: 'var(--neu-inset-sm)', color: '#B45309', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.9rem' }}>
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
            className="btn sub"
            style={{
              padding: '0.65rem 1.25rem',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            Browse Free Tools
          </button>

          <button
            onClick={onClose}
            className="btn primary"
            style={{
              padding: '0.65rem 1.45rem',
              fontSize: '0.9rem',
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
