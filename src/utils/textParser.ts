const cleanTitle = (title: string): string => {
    if (!title) return title;    
    const lastByIndex = title.toLowerCase().lastIndexOf(" by ");
    if (lastByIndex === -1) return title;
    return title.slice(0, lastByIndex).trim();
};

const cleanSummary = (summary: string): string => {
    return summary.replace(/\s*\(This is an automatically generated summary\.\)\s*$/, '').trim();
};


const cleanBookContent = (content: string) => {
    if (!content) return content;
    
    const startPattern = /\*{3}\s*START\s+OF\s+(?:THE\s+)?PROJECT\s+GUTENBERG\s+EBOOK[^*]+\*{3}/i;
    const endPattern = /\*{3}\s*END\s+OF\s+(?:THE\s+)?PROJECT\s+GUTENBERG\s+EBOOK/i;
    
    const startMatch = content.match(startPattern);
    const endMatch = content.match(endPattern);
    
    if (!startMatch) return content;
    
    const startIndex = startMatch.index !== undefined ? 
        (startMatch.index + startMatch[0].length) : 
        0;
    const endIndex = endMatch ? endMatch.index : content.length;
    
    const extractedContent = content.slice(startIndex, endIndex);
    
    return extractedContent
        .trim()
        .replace(/^\s*[\r\n]+/, '')  
        .replace(/^[^\w\[<]+/, '') 
        .trim();
};



export { cleanTitle, cleanSummary, cleanBookContent }