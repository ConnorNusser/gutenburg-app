const getContentUrl = (bookId: string) => `https://www.gutenberg.org/files/${bookId}/${bookId}-0.txt`;
//noticed for instances like `6` the link failed so i created a fall back link
const getAlternativeContent = (bookId: string) => `https://www.gutenberg.org/cache/epub/${bookId}/pg${bookId}.txt`
const getMetadataUrl = (bookId: string) => `https://www.gutenberg.org/ebooks/${bookId}`;
export { getContentUrl, getMetadataUrl, getAlternativeContent};