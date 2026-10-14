import { useState } from 'react'
import { Field, Msg, CopyBtn, download } from '../../components/ui.jsx'
import { useAutoFillParams } from '@hooks/useAutoFillParams.js'
import { calculateSubnet } from '@tool-core/networking/subnetCalculator.js'

export default function SubnetCalculator() {
  const autoParams = useAutoFillParams({
    ip: '192.168.1.1',
    cidr: '24'
  })

  const [ip, setIp] = useState(autoParams.ip || '192.168.1.1')
  const [cidr, setCidr] = useState(autoParams.cidr || '24')
  const [res, setRes] = useState(null)
  const [err, setErr] = useState('')

  const handleCalculate = () => {
    try {
      if (!ip) return setErr('Enter a valid IPv4 address.')
      setErr('')

      const calculation = calculateSubnet({
        ip,
        cidr: Number(cidr)
      })
      setRes(calculation)
    } catch (e) {
      setErr(e.message || 'Error calculating subnet.')
    }
  }

  const reportText = res ? `IPv4 Subnet Calculation Report
-----------------------------------------
Input: ${res.ip}/${res.cidr}

Network Address:   ${res.networkAddress}
Subnet Mask:       ${res.netmask}
Wildcard Mask:     ${res.wildcard}
Broadcast Address: ${res.broadcastAddress}
First Usable Host: ${res.firstUsableIp}
Last Usable Host:  ${res.lastUsableIp}
Total Hosts:       ${res.totalHosts.toLocaleString()}
Usable Hosts:      ${res.usableHosts.toLocaleString()}
Network Class:     Class ${res.ipClass}
Scope:             ${res.isPrivate ? 'Private (RFC 1918)' : 'Public Internet'}` : ''

  return (
    <div className="tool-body">
      <div className="row">
        <Field label="IPv4 Address">
          <input
            type="text"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            placeholder="e.g. 192.168.1.1 or 10.0.0.1/16"
          />
        </Field>
        <Field label="CIDR Prefix (/0 to /32)">
          <select value={cidr} onChange={(e) => setCidr(e.target.value)}>
            {Array.from({ length: 33 }, (_, i) => (
              <option key={i} value={i}>
                /{i} ({Math.pow(2, 32 - i).toLocaleString()} addresses)
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="actions" style={{ marginTop: '1rem' }}>
        <button className="btn" onClick={handleCalculate}>Calculate Subnet</button>
      </div>

      <Msg>{err}</Msg>

      {res && (
        <div className="out" role="status" style={{ marginTop: '1.2rem' }}>
          <h3>Subnet: <strong>{res.networkAddress}/{res.cidr}</strong></h3>
          <p className="hint">
            Class <strong>{res.ipClass}</strong> · <strong>{res.isPrivate ? 'Private (RFC 1918)' : 'Public'}</strong>
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginTop: '1rem' }}>
            <div style={{ padding: '10px', background: 'var(--bg-sub, #f8fafc)', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted, #64748b)' }}>Subnet Mask</div>
              <div style={{ fontSize: '0.98rem', fontWeight: 600 }}>{res.netmask}</div>
            </div>
            <div style={{ padding: '10px', background: 'var(--bg-sub, #f8fafc)', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted, #64748b)' }}>Wildcard Mask</div>
              <div style={{ fontSize: '0.98rem', fontWeight: 600 }}>{res.wildcard}</div>
            </div>
            <div style={{ padding: '10px', background: 'var(--bg-sub, #f8fafc)', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted, #64748b)' }}>Broadcast IP</div>
              <div style={{ fontSize: '0.98rem', fontWeight: 600 }}>{res.broadcastAddress}</div>
            </div>
            <div style={{ padding: '10px', background: 'var(--bg-sub, #f8fafc)', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted, #64748b)' }}>Usable Hosts</div>
              <div style={{ fontSize: '0.98rem', fontWeight: 600 }}>{res.usableHosts.toLocaleString()}</div>
            </div>
            <div style={{ gridColumn: '1 / -1', padding: '10px', background: 'var(--bg-sub, #f8fafc)', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted, #64748b)' }}>Usable IP Host Range</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary, #4f46e5)' }}>
                {res.firstUsableIp} &nbsp;–&nbsp; {res.lastUsableIp}
              </div>
            </div>
          </div>

          <div className="actions" style={{ marginTop: '1.2rem' }}>
            <CopyBtn text={reportText} label="Copy Subnet Details" />
            <button type="button" className="btn ghost" onClick={() => download('subnet-details.txt', reportText)}>
              Download (.txt)
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
