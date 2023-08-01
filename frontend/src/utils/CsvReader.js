export default class CsvReader {

    constructor(file, { delimiter = ';', rowDelimiter = '\n' } = {}) {
        this.file = file;
        this.data = null
        this.delimiter = delimiter
        this.rowDelimiter = rowDelimiter
    }

    async read() {
        const headers = await this.readHeader()
        const rows = await this.readRows(headers)
        return { headers, rows }
    }

    async readRows(headers) {
        if (!headers) {
            throw new Error('Headers are required')
        }

        const text = await this.readText()
        return CsvReader.rowsFromText(text, headers, {
            delimiter: this.delimiter,
            rowDelimiter: this.rowDelimiter
        })
    }

    static rowsFromText(text, headers, { delimiter = ";", rowDelimiter = "\n" } = {}) {
        const lines = text.split(rowDelimiter)
        lines.shift()

        // Remove emptylines from the end of the file
        while (lines[lines.length - 1] === '') {
            lines.pop()
        }

        const rows = []
        lines.forEach((line, idx) => {
            const columns = line.split(delimiter)
            const row = {}

            headers.forEach((header, index) => {
                row[header] = columns[index]
            })
            rows.push(row)
        })
        return rows
    }

    async readText() {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result)
            reader.onerror = () => reject(reader.error)
            reader.readAsText(this.file)
        })
    }

    async readHeader() {
        const text = await this.readText()
        return CsvReader.headerFromText(text, {
            delimiter: this.delimiter,
            rowDelimiter: this.rowDelimiter
        })
    }

    static fromText(text, { delimiter = ";", rowDelimiter = "\n" } = {}) {
        const headers = this.headerFromText(text, { delimiter, rowDelimiter })
        const rows = this.rowsFromText(text, headers, {
            delimiter,
            rowDelimiter
        })
        return { headers, rows }
    }

    static headerFromText(text, { delimiter = ";", rowDelimiter = "\n" } = {}) {
        const lines = text.split(rowDelimiter)

        while (lines.length > 0 && lines[0].trim() === "") {
            lines.shift()
        }

        if (lines.length === 0) {
            throw new Error('Empty file')
        }
        const header = lines[0]
        return header.split(delimiter).map(h => h.trim())
    }

}