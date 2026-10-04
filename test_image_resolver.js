import { resolveAbsolutePath } from './src/domains/editor/application/ImageResolver.js';
const imgPath = "/assets/images/System%20Design/types.png";
const currentFolder = "/Users/vikram/Notes-Vault";
console.log(resolveAbsolutePath(imgPath, null, currentFolder));
