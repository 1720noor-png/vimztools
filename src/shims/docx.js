export const Document = class {};
export const Paragraph = class {};
export const TextRun = class {};
export const HeadingLevel = { HEADING_1: 'Heading 1', HEADING_2: 'Heading 2', TITLE: 'Title' };
export const AlignmentType = { CENTER: 'center', LEFT: 'left', RIGHT: 'right', JUSTIFIED: 'both' };
export const Packer = {
  toBlob: async () => new Blob([''], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
};
export default { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer };
