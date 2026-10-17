export const GlobalWorkerOptions = { workerSrc: '' };
export const getDocument = () => ({
  promise: Promise.resolve({
    numPages: 1,
    getPage: () => Promise.resolve({
      getViewport: () => ({ width: 600, height: 800 }),
      render: () => ({ promise: Promise.resolve() }),
      getTextContent: () => Promise.resolve({ items: [] })
    })
  })
});
export default { GlobalWorkerOptions, getDocument };
