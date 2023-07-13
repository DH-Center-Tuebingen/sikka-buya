export default class CsvReader {

    constructor(file, { delimiter = ',', rowDelimiter = '\n' } = {}) {
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
        const lines = text.split(this.rowDelimiter)
        lines.shift()

        // Remove emptylines from the end of the file
        while (lines[lines.length - 1] === '') {
            lines.pop()
        }

        const rows = []
        lines.forEach((line, idx) => {
            const columns = line.split(this.delimiter)
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
        const lines = text.split(this.rowDelimiter)

        if (lines.length === 0) {
            throw new Error('Empty file')
        }
        const header = lines[0]
        return header.split(this.delimiter).map(h => h.trim())
    }

}