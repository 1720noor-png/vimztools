export default function html2pdf() {
  const chain = {
    from: () => chain,
    set: () => chain,
    save: () => Promise.resolve(),
    output: () => Promise.resolve()
  };
  return chain;
}
