import Database from 'better-sqlite3';

export class DB {

    constructor(dbName) {
        this.db = new Database(`src/db/${dbName}.db`, {
            fileMustExist: true
        });
    };

    async getCol(col) {
        const data = this.db.prepare(`SELECT ${col} FROM users`).all();
        return data.map(e => e[col]);
    };

    getRow(col, row) {
        return this.db.prepare(`SELECT * FROM users WHERE ${col}='${row}'`).get();
    };

    set(col, row, val) {
        for (const prop in val) {
          this.db.prepare(`UPDATE users SET ${prop}='${val[prop]}' WHERE ${col}='${row}'`).run();
        }
    }
};