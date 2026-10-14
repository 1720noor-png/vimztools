import TextTool from '../../components/TextTool.jsx'
import {
  encodeUrlText,
  encodeFullUrl,
  decodeUrl
} from '@tool-core/developer/urlEncoderDecoder.js'

export default function UrlEncoder() {
  return (
    <TextTool
      filename="url.txt"
      rows={5}
      placeholder="https://example.com/search?q=hello world"
      actions={[
        { label: 'Encode text', run: (t) => encodeUrlText(t) },
        { label: 'Encode full URL', run: (t) => encodeFullUrl(t) },
        { label: 'Decode', run: (t) => decodeUrl(t) },
      ]}
    />
  )
}
