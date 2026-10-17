// Lightweight shims for optional external dependencies to ensure fast, zero-failure Vite builds

export const removeBackground = async (image) => image;
export default { removeBackground };
