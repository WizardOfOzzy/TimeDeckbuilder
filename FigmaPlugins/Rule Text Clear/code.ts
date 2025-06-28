const regularFont = {family: "Inter", style: "Regular"};
const boldFont = {family: "Inter", style: "Bold"};

console.clear();
ClearRuleTextFormatting();

async function ClearRuleTextFormatting() {
  // Load font families
  // CBO - this will need to be updated if we ever change the font we're using
  await figma.loadFontAsync(regularFont);
  await figma.loadFontAsync(boldFont);

    // Get all of the rules texts nodes
    const rulesTextNodes = figma.currentPage.findAll(node => {
      return node.type === "TEXT" && node.name === "#rulesText"
    })

    for (const node of rulesTextNodes) {
      const textNode = node as TextNode;
      textNode.fontName = regularFont;
    }

    // Make sure to close the plugin when you're done. Otherwise the plugin will
    // keep running, which shows the cancel button at the bottom of the screen.
    figma.closePlugin();
}


