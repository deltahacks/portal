// pdfjs-dist doesn't ship types for its worker bundle. It's only imported for
// its side effect of registering the worker on globalThis.
declare module "pdfjs-dist/build/pdf.worker.min.mjs";
