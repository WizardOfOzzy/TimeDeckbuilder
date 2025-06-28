// This plugin bolds a set of keywords
// TODOs
// - Pull keywords from a spreadsheet?
// - Dynamically load the font we're using from the page, instead of assuming Inter
// - Are there situations we do not want a keyword bolded?

let keywords: string[] = [
  "Ability:", 
  "On Sync:", 
  "Reaction:", 
  "Instant:",
  "Synced:",
  "Erase"];

const regularFont = {family: "Inter", style: "Regular"};
const boldFont = {family: "Inter", style: "Bold"};

console.clear();
BoldKeywords();

async function BoldKeywords() {
  // Load font familes
  // CBO - this will need to be updated if we ever change the font we're using
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });

  // Get all of the rules texts nodes
  const rulesTextNodes = figma.currentPage.findAll(node => {
    return node.type === "TEXT" && node.name === "#rulesText"
  })

  // Iterate through rules text
  for (const node of rulesTextNodes) {
    const textNode = node as TextNode;
    const text = textNode.characters;

    // Set the text to regular to clear out prior formatting
    textNode.fontName = regularFont;

    // Now check all of our keywords for this rules text
    // This is recursive to find multiple instances
    for (const keyword of keywords) {
        BoldKeywordRecursively(textNode, text, keyword, 0);
    }
  }

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  figma.closePlugin();
}

function BoldKeywordRecursively(textNode: TextNode, text: string, keyword: string, index: number) {
  // Check to see if we've found a match
  const start = text.indexOf(keyword, index);

  // If we've found a match, bold the keyword
  if (start !== -1)
  {
    const end = start + keyword.length;
    textNode.setRangeFontName(start, end, boldFont);

    // If there is text content left, recurse
    if (end <= text.length)
    {
      BoldKeywordRecursively(textNode, text, keyword, end);
    }
  }
}

