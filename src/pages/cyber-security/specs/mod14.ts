import {
  asSel,
  asStr,
  docres,
  res,
  sel,
  txt,
  type CyberSpec,
} from './cyberSpec'

export const SUBJECT = 'File Integrity & Forensics'

export const MOD14_SPECS: CyberSpec[] = [
  {
    id: 'magic-byte-mime-signature-identifier',
    name: 'Binary File Magic Byte & Extension Spoofing Analyzer',
    subject: SUBJECT,
    blurb: 'Inspect binary file header magic bytes to detect true file MIME types and unmask malicious executables disguised as benign PDF or JPEG files.',
    tip: 'Attackers frequently rename `.exe` or `.scr` files to `.pdf` or `.docx` to trick users; verifying initial file bytes unmasks the deception.',
    usage: [
      'Enter the leading hexadecimal bytes of the file (e.g. `4D 5A` or `89 50 4E 47`).',
      'Select claimed file extension.',
      'Check if the file magic signature matches the claimed extension.',
    ],
    method: [
      'Matches hex signatures against standard binary magic byte databases.',
    ],
    fields: [
      txt('hexHeader', 'Leading File Header Hex Bytes', '4D 5A 90 00 03 00 00 00 04 00 00 00', 1),
      sel('claimedExt', 'Claimed File Extension', ['.pdf (Adobe PDF Document)', '.jpg / .jpeg (JPEG Image)', '.png (PNG Image)', '.exe (Windows Executable)', '.zip (ZIP Archive)']),
    ],
    compute: (v) => {
      const hex = asStr(v, 'hexHeader', '').replace(/[^0-9a-fA-F]/g, '').toUpperCase()
      const ext = asSel(v, 'claimedExt', '.pdf')

      let trueType = 'Unknown Binary Format'
      let trueExt = ''
      let isExecutable = false

      if (hex.startsWith('89504E47')) {
        trueType = 'PNG Image (image/png)'
        trueExt = '.png'
      } else if (hex.startsWith('FFD8FF')) {
        trueType = 'JPEG Image (image/jpeg)'
        trueExt = '.jpg'
      } else if (hex.startsWith('25504446')) {
        trueType = 'PDF Document (application/pdf)'
        trueExt = '.pdf'
      } else if (hex.startsWith('4D5A')) {
        trueType = 'DOS / Windows PE Executable (application/x-dosexec)'
        trueExt = '.exe'
        isExecutable = true
      } else if (hex.startsWith('504B0304')) {
        trueType = 'ZIP Archive / Office Open XML (.zip, .docx, .xlsx)'
        trueExt = '.zip'
      } else if (hex.startsWith('7F454C46')) {
        trueType = 'Linux ELF Executable'
        trueExt = '.elf'
        isExecutable = true
      }

      const isSpoofed = trueExt !== '' && !ext.startsWith(trueExt)
      const tone = isSpoofed && isExecutable ? 'bad' : isSpoofed ? 'warn' : 'good'

      return [
        res('True File Signature', trueType, isExecutable ? 'bad' : 'good'),
        res('Claimed File Extension', ext.split(' ')[0], 'neutral'),
        res('Extension Spoofing Alert', isSpoofed ? `MALICIOUS SPOOFING: File is actually ${trueExt}` : 'Header matches extension', tone),
        docres('Forensic Hex Analysis', `Leading Hex: ${hex.slice(0, 16)}\nDetected MIME: ${trueType}\nSpoofing Risk: ${isSpoofed ? 'HIGH' : 'NONE'}`, 'Binary header forensic classification'),
      ]
    },
  },
]
