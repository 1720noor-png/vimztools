import { describe, it, expect } from 'vitest';
import {
  calculateSubnet,
  ipToInt,
  intToIp,
  getIpClass,
  isPrivateIp
} from './subnetCalculator.js';

describe('IPv4 Subnet Calculator Engine (subnetCalculator.js)', () => {
  describe('Standard /24 Subnet Calculations', () => {
    it('calculates full subnet details for 192.168.1.100/24', () => {
      const res = calculateSubnet({ ip: '192.168.1.100', cidr: 24 });
      expect(res.netmask).toBe('255.255.255.0');
      expect(res.wildcard).toBe('0.0.0.255');
      expect(res.networkAddress).toBe('192.168.1.0');
      expect(res.broadcastAddress).toBe('192.168.1.255');
      expect(res.firstUsableIp).toBe('192.168.1.1');
      expect(res.lastUsableIp).toBe('192.168.1.254');
      expect(res.totalHosts).toBe(256);
      expect(res.usableHosts).toBe(254);
      expect(res.ipClass).toBe('C');
      expect(res.isPrivate).toBe(true);
      expect(res.summary).toContain('Subnet 192.168.1.0/24 (Mask: 255.255.255.0, Usable Hosts: 254)');
    });

    it('parses combined CIDR notation like "10.50.0.1/16"', () => {
      const res = calculateSubnet({ ip: '10.50.0.1/16' });
      expect(res.networkAddress).toBe('10.50.0.0');
      expect(res.netmask).toBe('255.255.0.0');
      expect(res.usableHosts).toBe(65534);
      expect(res.ipClass).toBe('A');
      expect(res.isPrivate).toBe(true);
    });
  });

  describe('Special Subnets & Edge Cases', () => {
    it('calculates point-to-point /31 subnet (RFC 3021)', () => {
      const res = calculateSubnet({ ip: '192.168.1.0', cidr: 31 });
      expect(res.usableHosts).toBe(2);
      expect(res.firstUsableIp).toBe('192.168.1.0');
      expect(res.lastUsableIp).toBe('192.168.1.1');
    });

    it('calculates single host /32 subnet', () => {
      const res = calculateSubnet({ ip: '8.8.8.8', cidr: 32 });
      expect(res.usableHosts).toBe(1);
      expect(res.firstUsableIp).toBe('8.8.8.8');
      expect(res.lastUsableIp).toBe('8.8.8.8');
      expect(res.isPrivate).toBe(false);
    });
  });

  describe('IP Conversion & Classes', () => {
    it('converts between IP strings and 32-bit unsigned integers accurately', () => {
      const intVal = ipToInt('192.168.1.1');
      expect(intToIp(intVal)).toBe('192.168.1.1');
    });

    it('identifies RFC 1918 private ranges correctly', () => {
      expect(isPrivateIp(ipToInt('10.20.30.40'))).toBe(true);
      expect(isPrivateIp(ipToInt('172.20.0.1'))).toBe(true);
      expect(isPrivateIp(ipToInt('192.168.10.1'))).toBe(true);
      expect(isPrivateIp(ipToInt('1.1.1.1'))).toBe(false);
    });

    it('categorizes IP classes accurately', () => {
      expect(getIpClass(10)).toBe('A');
      expect(getIpClass(172)).toBe('B');
      expect(getIpClass(192)).toBe('C');
      expect(getIpClass(224)).toBe('D (Multicast)');
    });
  });

  describe('Validation & Error Handling', () => {
    it('throws on invalid IP octet values', () => {
      expect(() => calculateSubnet({ ip: '256.1.1.1' })).toThrow('between 0 and 255');
      expect(() => calculateSubnet({ ip: '192.168.1' })).toThrow('Expected 4 octets');
    });

    it('throws on invalid CIDR prefix numbers', () => {
      expect(() => calculateSubnet({ ip: '192.168.1.1', cidr: 33 })).toThrow('between 0 and 32');
      expect(() => calculateSubnet({ ip: '192.168.1.1', cidr: -1 })).toThrow('between 0 and 32');
    });

    it('throws when IP is missing', () => {
      expect(() => calculateSubnet({})).toThrow('A valid IPv4 address is required');
    });
  });
});
