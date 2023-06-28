// This mixin is used to only allow text to be pasted into input fields
// It is initialized in the component by calling this.initPasteUnformattedFields(this.$refs)
// And needs to be cleaned up by calling this.cleanupPasteUnformattedFields(this.$refs) in the beforeDestroy hook!
// The onPaste callback may be overwritten to catch the paste event.

export default {
    methods: {
        /**
        * This method is called when the user pastes text into the input field.
        * It is called with the node and text that was pasted.
        * 
        * @param { Object } node - The node that was created from the pasted text
        * @param { String } text - The text that was pasted
        */
        onPaste({ node, text } = {}) {
            // Override this method in the component
            console.log('Pasted text: ', text)
        },
        /**
         * 
         * Initializes the paste event listener for all input fields
         * 
         * @param { HTMLElement } ref - The ref of the input field
         */
        initPastePlainText(ref) {
            ref.addEventListener('paste', this.pastePlainText);
        },
        /**
         * Cleans up the paste event listener. 
         * Usually called in the beforeDestroy hook.
         * 
         * @param { HTMLElement } ref - The ref of the input field
         */
        cleanupPastePlainText(ref) {
            ref.removeEventListener('paste', this.pastePlainText);
        },
        /**
         *  This method is called when the user pastes text into the input field.
         * 
         * 
         * @typedef { Object } TextAndNode - The node that was created from the pasted text
         * @property { String } text - The text that was pasted
         * @property { Object } node - The node that was created from the pasted text
         * 
         * @param {*} event - The paste event
         * @returns { TextAndNode } - The text and node that was pasted
         */
        pastePlainText: function (event) {
            console.log("PASTED PLAIN TEXT")
            event.preventDefault();
            let pastedText = (event.clipboardData || window.clipboardData).getData('text/plain');
            const selection = window.getSelection();
            if (!selection.rangeCount) return false;
            selection.deleteFromDocument();
            const node = document.createTextNode(pastedText)
            selection.getRangeAt(0).insertNode(node);
            selection.removeAllRanges();
            this.onPaste({ node, text: pastedText })
        },
    }
}