export const configure = () => {};
export const lock = async (doc, userPassword, ownerPassword) => doc;
export const unlockInPlace = async (doc, password) => true;
export const encryptPDF = async (bytes, userPass, ownerPass) => bytes;
export default { configure, lock, unlockInPlace, encryptPDF };
