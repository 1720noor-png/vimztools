export class jsPDF {
  constructor() {
    this.internal = { pageSize: { getWidth: () => 210, getHeight: () => 297 } };
  }
  text() { return this; }
  save(filename = 'document.pdf') {}
  output(type) { return new Blob([''], { type: 'application/pdf' }); }
  addImage() { return this; }
  addPage() { return this; }
}
export default jsPDF;
