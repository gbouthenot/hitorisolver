/* eslint-disable no-plusplus, no-console, no-multiple-empty-lines, no-param-reassign,
   class-methods-use-this, no-unused-vars, prefer-template,
   no-continue, no-labels, no-restricted-syntax */

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
    let res = false;
    for (let y = 0; y < this.sizY; y++) {
      for (let x = 1; x < this.sizX - 1; x++) {
        if (this.sta[y][x] !== null) { continue; }
        const h0 = this.def[y][x - 1];
        const h2 = this.def[y][x + 1];
        if (h0 === h2) {
          console.log(`3H consécutifs: (${x}, ${y}) -> open`);
          this.sta[y][x] = true;
          res = true;
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
          res = true;
        }
      }
    }
    if (!this.testfill(this.sta)) {
      return 'ERR';
    }
    if (this.testfinished()) {
      return 'END';
    }
    return res;
  }

  // mark closed if a number is already open in col/row
  pass2() {
    let res = false;
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
            res = true;
          }
        }

        // search in col
        for (let y2 = 0; y2 < this.sizY; y2++) {
          if (y === y2 || this.sta[y2][x] !== null) { continue; }
          if (ref === this.def[y2][x]) {
            console.log(`col ${x}: ${ref} is open : (${x}, ${y2}) -> close`);
            this.sta[y2][x] = false;
            res = true;
          }
        }
      }
    }
    if (!this.testfill(this.sta)) {
      return 'ERR';
    }
    if (this.testfinished()) {
      return 'END';
    }
    return res;
  }

  // for a closed cell, mark open the 4 adjacent cells
  pass3() {
    let res = false;
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
          res = true;
        }
        if (h2 < this.sizX && this.sta[y][h2] === null) {
          console.log(`(${x}, ${y})=close -> right is open`);
          this.sta[y][h2] = true;
          res = true;
        }
        if (v0 >= 0 && this.sta[v0][x] === null) {
          console.log(`(${x}, ${y})=close -> up is open`);
          this.sta[v0][x] = true;
          res = true;
        }
        if (v2 < this.sizY && this.sta[v2][x] === null) {
          console.log(`(${x}, ${y})=close -> down is open`);
          this.sta[v2][x] = true;
          res = true;
        }
      }
    }
    if (!this.testfill(this.sta)) {
      return 'ERR';
    }
    if (this.testfinished()) {
      return 'END';
    }
    return res;
  }

  test1(x, y) {
    const copy = JSON.parse(JSON.stringify(this.sta));
    const self = this;
    // https://en.wikipedia.org/wiki/Flood_fill
    function ff(x1, y1) {
      if (copy[y1][x1] === false || copy[y1][x1] === 1) { return; }
      copy[y1][x1] = 1;
      if (y1 + 1 < self.sizY) { ff(x1, y1 + 1); }
      if (y1 - 1 >= 0) { ff(x1, y1 - 1); }
      if (x1 + 1 < self.sizX) { ff(x1 + 1, y1); }
      if (x1 - 1 >= 0) { ff(x1 - 1, y1); }
    }
    ff(x, y);

    const flattened = copy.reduce((a, b) => a.concat(b), []);
    let res = true;
    flattened.forEach((a) => {
      if (a !== false && a !== 1) { res = false; }
    });

    console.log(res, copy);
  }

  /**
   * trouve une case open
   * flood-fill alors cette case
   * si toutes les cases open ont été peintes, return true
   * sinon return false
   */
  testfill(sta) {
    const self = this;
    const copy = JSON.parse(JSON.stringify(sta));

    // https://en.wikipedia.org/wiki/Flood_fill
    function ff(x, y) {
      if (copy[y][x] === false || copy[y][x] === 1) { return; }
      copy[y][x] = 1;
      if (y + 1 < self.sizY) { ff(x, y + 1); }
      if (y - 1 >= 0) { ff(x, y - 1); }
      if (x + 1 < self.sizX) { ff(x + 1, y); }
      if (x - 1 >= 0) { ff(x - 1, y); }
    }

    let x = 0;
    let y = 0;
    row: for (y = 0; y < this.sizY; y++) {
      for (x = 0; x < this.sizX; x++) {
        if (copy[y][x] === true) {
          // on a trouvé une case open
          break row;
        }
      }
    }

    ff(x, y);

    const flattened = copy.reduce((a, b) => a.concat(b), []);
    let res = true;
    flattened.forEach((a) => {
      if (a !== false && a !== 1) { res = false; }
    });

    return res;
  }

  /**
   * return true if finished
   */
  testfinished() {
    const flattened = this.sta.reduce((a, b) => a.concat(b), []);
    let res = true;
    flattened.forEach((a) => {
      if (a === null) { res = false; }
    });
    return res;
  }

  // flood fill test chaque case
  pass4() {
    for (let y = 0; y < this.sizY; y++) {
      for (let x = 0; x < this.sizX; x++) {
        if (this.sta[y][x] === null) {
          // une case est vide, on essaie de la noircir
          const sta2 = JSON.parse(JSON.stringify(this.sta));
          sta2[y][x] = false;
          if (this.testfill(sta2) === false) {
            console.log(`(${x}, ${y}) ne peut être close (séparation) (${x}, ${y}) -> open`);
            this.sta[y][x] = true;
            return true;
          }
        }
      }
    }
    return false;
  }

  // trouve deux cases vides adjacentes
  pass5() {
    const hypos = [];
    for (let y = 0; y < this.sizY; y++) {
      for (let x = 0; x < this.sizX; x++) {
        if (this.sta[y][x] !== null) { continue; }
        const def = this.def[y][x];
        if (x + 1 < this.sizX && this.sta[y][x + 1] === null && this.def[y][x + 1] === def) {
          hypos.push([x, y, true]);
          hypos.push([x, y, false]);
        }
        if (y + 1 < this.sizY && this.sta[y + 1][x] === null && this.def[y + 1][x] === def) {
          hypos.push([x, y, true]);
          hypos.push([x, y, false]);
        }
      }
    }
    return hypos;
  }

  tryhypo(x, y, val) {
    const savdef = JSON.parse(JSON.stringify(this.def));
    const savsta = JSON.parse(JSON.stringify(this.sta));
    this.sta[y][x] = val;

    let res = true;
    let r;
    while (res === true) {
      res = false;
      r = this.pass2();
      if (r !== false) { res = r; }
      if (r === 'END' || r === 'ERR') { break; }
      r = this.pass3();
      if (r !== false) { res = r; }
      if (r === 'END' || r === 'ERR') { break; }
      r = this.pass4();
      if (r !== false) { res = r; }
      if (r === 'END' || r === 'ERR') { break; }
    }
    if (res === 'END') { console.log('Finished'); }
    if (res === 'ERR') { console.log('Invalid'); }
  }

}
