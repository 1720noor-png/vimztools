/**
 * Pure IPv4 CIDR Subnet Calculator Engine
 * Zero external dependencies. Node.js & Browser compatible.
 */

/**
 * Converts dotted-decimal IPv4 string to 32-bit unsigned integer
 * @param {string} ip
 * @returns {number}
 */
export function ipToInt(ip) {
  if (typeof ip !== 'string') throw new Error('IP address must be a string.');
  const octets = ip.trim().split('.');
  if (octets.length !== 4) throw new Error(`Invalid IPv4 address format: "${ip}". Expected 4 octets.`);

  let intVal = 0;
  for (let i = 0; i < 4; i++) {
    const octet = Number(octets[i]);
    if (isNaN(octet) || octet < 0 || octet > 255 || !Number.isInteger(octet)) {
      throw new Error(`Invalid octet value: "${octets[i]}" in IP "${ip}". Each octet must be between 0 and 255.`);
    }
    intVal = ((intVal << 8) | octet) >>> 0;
  }
  return intVal;
}

/**
 * Converts 32-bit unsigned integer to dotted-decimal IPv4 string
 * @param {number} intVal
 * @returns {string}
 */
export function intToIp(intVal) {
  return [
    (intVal >>> 24) & 255,
    (intVal >>> 16) & 255,
    (intVal >>> 8) & 255,
    intVal & 255
  ].join('.');
}

/**
 * Determines IPv4 network class (A, B, C, D, E)
 * @param {number} firstOctet
 * @returns {string}
 */
export function getIpClass(firstOctet) {
  if (firstOctet <= 126) return 'A';
  if (firstOctet === 127) return 'Loopback';
  if (firstOctet <= 191) return 'B';
  if (firstOctet <= 223) return 'C';
  if (firstOctet <= 239) return 'D (Multicast)';
  return 'E (Experimental)';
}

/**
 * Checks whether an IP address belongs to RFC 1918 private ranges
 * @param {number} ipInt
 * @returns {boolean}
 */
export function isPrivateIp(ipInt) {
  const o1 = (ipInt >>> 24) & 255;
  const o2 = (ipInt >>> 16) & 255;

  // 10.0.0.0/8
  if (o1 === 10) return true;
  // 172.16.0.0/12 (172.16 - 172.31)
  if (o1 === 172 && o2 >= 16 && o2 <= 31) return true;
  // 192.168.0.0/16
  if (o1 === 192 && o2 === 168) return true;
  // 127.0.0.0/8 (Loopback)
  if (o1 === 127) return true;

  return false;
}

/**
 * Calculates complete IPv4 subnet details from IP and CIDR prefix.
 *
 * @param {Object} params
 * @param {string} params.ip - IPv4 address (e.g. '192.168.1.100' or '192.168.1.100/24')
 * @param {number|string} [params.cidr] - CIDR prefix length (0-32)
 * @returns {{
 *   ip: string,
 *   cidr: number,
 *   netmask: string,
 *   wildcard: string,
 *   networkAddress: string,
 *   broadcastAddress: string,
 *   firstUsableIp: string,
 *   lastUsableIp: string,
 *   totalHosts: number,
 *   usableHosts: number,
 *   ipClass: string,
 *   isPrivate: boolean,
 *   summary: string
 * }}
 */
export function calculateSubnet({ ip, cidr }) {
  if (!ip || typeof ip !== 'string') {
    throw new Error('A valid IPv4 address is required.');
  }

  let cleanIp = ip.trim();
  let cleanCidr = cidr;

  // Handle combined '192.168.1.1/24' syntax
  if (cleanIp.includes('/')) {
    const [ipPart, cidrPart] = cleanIp.split('/');
    cleanIp = ipPart.trim();
    if (cleanCidr === undefined || cleanCidr === null || cleanCidr === '') {
      cleanCidr = cidrPart.trim();
    }
  }

  const cidrNum = Number(cleanCidr ?? 24);
  if (isNaN(cidrNum) || !Number.isInteger(cidrNum) || cidrNum < 0 || cidrNum > 32) {
    throw new Error(`Invalid CIDR prefix: "${cleanCidr}". CIDR must be an integer between 0 and 32.`);
  }

  const ipVal = ipToInt(cleanIp);
  const firstOctet = (ipVal >>> 24) & 255;

  // Compute 32-bit mask
  const maskInt = cidrNum === 0 ? 0 : ((0xFFFFFFFF << (32 - cidrNum)) >>> 0);
  const wildcardInt = (~maskInt) >>> 0;

  const networkInt = (ipVal & maskInt) >>> 0;
  const broadcastInt = (networkInt | wildcardInt) >>> 0;

  const totalHosts = Math.pow(2, 32 - cidrNum);
  let usableHosts = 0;
  let firstUsableInt = networkInt;
  let lastUsableInt = broadcastInt;

  if (cidrNum === 31) {
    // RFC 3021 point-to-point links
    usableHosts = 2;
    firstUsableInt = networkInt;
    lastUsableInt = broadcastInt;
  } else if (cidrNum === 32) {
    // Single host
    usableHosts = 1;
    firstUsableInt = networkInt;
    lastUsableInt = networkInt;
  } else {
    usableHosts = Math.max(0, totalHosts - 2);
    firstUsableInt = (networkInt + 1) >>> 0;
    lastUsableInt = (broadcastInt - 1) >>> 0;
  }

  const netmask = intToIp(maskInt);
  const wildcard = intToIp(wildcardInt);
  const networkAddress = intToIp(networkInt);
  const broadcastAddress = intToIp(broadcastInt);
  const firstUsableIp = intToIp(firstUsableInt);
  const lastUsableIp = intToIp(lastUsableInt);
  const ipClass = getIpClass(firstOctet);
  const isPrivate = isPrivateIp(ipVal);

  const summary = `Subnet ${networkAddress}/${cidrNum} (Mask: ${netmask}, Usable Hosts: ${usableHosts.toLocaleString()})`;

  return {
    ip: cleanIp,
    cidr: cidrNum,
    netmask,
    wildcard,
    networkAddress,
    broadcastAddress,
    firstUsableIp,
    lastUsableIp,
    totalHosts,
    usableHosts,
    ipClass,
    isPrivate,
    summary
  };
}
