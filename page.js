/* eslint-disable no-plusplus, no-console, no-multiple-empty-lines, no-param-reassign,
   class-methods-use-this, no-unused-vars, prefer-template, no-continue */

class Hitori {
  constructor(source, sizX) {
    this.sizX = sizX;
    this.sizY = 0;
    this.def = [];
    this.sta = [];

    const cases = source.split(' ').map(col => parseInt(col, 10));
    while (cases.length) {
      this.def.push(cases.splice(0, sizX));
      this.sta.push(Array.from(Array(sizX), _ => null));
      this.sizY++;
    }
  }

  get(x, y) {
    if (x < 0 || x >= this.sizX || y < 0 || y >= this.sizY) {
      return null;
    }
    return this.def[y][x];
  }

  getRow(y) {
    if (y < 0 || y >= this.sizY) {
      return null;
    }
    return this.def[y];
  }

  render() {
    const table = document.querySelector('table.hit');
    let rows = this.def.map(row => row.map(col => `<td>${col}</td>`).join(''));
    rows = rows.map(row => `<tr>${row}</tr>`).join('');
    table.innerHTML = rows;
    for (let y = 1; y <= this.sizY; y++) {
      for (let x = 1; x <= this.sizX; x++) {
        const sta = this.sta[y - 1][x - 1];
        if (sta === true) {
          document.querySelector(`table.hit tr:nth-of-type(${y}) td:nth-of-type(${x})`).className = 'open';
        } else if (sta === false) {
          document.querySelector(`table.hit tr:nth-of-type(${y}) td:nth-of-type(${x})`).className = 'closed';
        }
      }
    }
  }

  // mark n ? n  -> n=open
  pass1() {
    for (let y = 0; y < this.sizY; y++) {
      for (let x = 1; x < this.sizX - 1; x++) {
        if (this.sta[y][x] !== null) { continue; }
        const h0 = this.def[y][x - 1];
        const h2 = this.def[y][x + 1];
        if (h0 === h2) {
          console.log(`3H consécutifs: (${x}, ${y}) -> open`);
          this.sta[y][x] = true;
        }
      }
    }

    for (let y = 1; y < this.sizY - 1; y++) {
      for (let x = 0; x < this.sizX; x++) {
        if (this.sta[y][x] !== null) { continue; }
        const v0 = this.def[y - 1][x];
        const v2 = this.def[y + 1][x];
        if (v0 === v2) {
          console.log(`3V consécutifs: (${x}, ${y}) -> open`);
          this.sta[y][x] = true;
        }
      }
    }
  }

  // mark closed if a number is already open in col/row
  pass2() {
    for (let y = 0; y < this.sizY; y++) {
      for (let x = 0; x < this.sizX; x++) {
        if (this.sta[y][x] !== true) { continue; }
        const ref = this.def[y][x];

        // search in row
        for (let x2 = 0; x2 < this.sizX; x2++) {
          if (x === x2 || this.sta[y][x2] !== null) { continue; }
          if (ref === this.def[y][x2]) {
            console.log(`row ${y}: ${ref} is open : (${x2}, ${y}) -> close`);
            this.sta[y][x2] = false;
          }
        }

        // search in col
        for (let y2 = 0; y2 < this.sizY; y2++) {
          if (y === y2 || this.sta[y2][x] !== null) { continue; }
          if (ref === this.def[y2][x]) {
            console.log(`col ${x}: ${ref} is open : (${x}, ${y2}) -> close`);
            this.sta[y2][x] = false;
          }
        }
      }
    }
  }

  // for a closed cell, mark open the 4 adjacent cells
  pass3() {
    for (let y = 0; y < this.sizY; y++) {
      for (let x = 0; x < this.sizX; x++) {
        if (this.sta[y][x] !== false) { continue; }
        const h0 = x - 1;
        const h2 = x + 1;
        const v0 = y - 1;
        const v2 = y + 1;
        if (h0 >= 0 && this.sta[y][h0] === null) {
          console.log(`(${x}, ${y})=close -> left is open`);
          this.sta[y][h0] = true;
        }
        if (h2 < this.sizX && this.sta[y][h2] === null) {
          console.log(`(${x}, ${y})=close -> right is open`);
          this.sta[y][h2] = true;
        }
        if (v0 >= 0 && this.sta[v0][x] === null) {
          console.log(`(${x}, ${y})=close -> up is open`);
          this.sta[v0][x] = true;
        }
        if (v2 < this.sizY && this.sta[v2][x] === null) {
          console.log(`(${x}, ${y})=close -> down is open`);
          this.sta[v2][x] = true;
        }
      }
    }
  }
}
