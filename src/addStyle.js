/**
 * Add a new CSS style
 */
export const addStyle = (() => {
    let styleElement = null;
    let styleContent = null;

    return (/** @type {string} */styleText) => {
        if (styleElement === null) {
            styleElement = document.createElement('style');
            styleContent = "";
            document.head.appendChild(styleElement);
        } else {
            styleContent += "\n";
        }

        styleContent += styleText;
        styleElement.innerText = styleContent;
    };
})();
 
