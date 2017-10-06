/* eslint-disable no-console */

/*
"[[false,true,false,true,true,true,true,null,true,true,false,true,true,false,true,true,true,false],[true,true,true,true,true,false,true,true,true,false,true,true,false,true,false,true,false,true],[false,true,true,true,false,true,true,false,true,true,true,false,true,true,true,true,true,true],[true,false,true,false,true,false,true,true,false,true,true,true,false,true,false,true,false,true],[true,true,false,true,true,true,true,false,true,false,true,false,true,true,true,false,true,false],[false,true,true,true,false,true,true,true,true,true,null,true,false,true,false,true,true,true],[true,true,true,false,true,true,false,true,true,true,true,false,true,true,true,true,false,true],[true,false,true,true,true,true,true,false,true,false,true,true,true,false,true,false,true,true],[false,true,true,true,false,true,true,true,false,true,true,false,true,true,false,true,false,true],[true,false,true,false,true,true,false,true,true,false,true,true,true,false,true,true,true,false],[true,true,false,true,true,true,true,null,true,true,false,true,true,true,true,false,true,true],[true,false,true,true,true,false,true,null,true,false,true,false,true,true,false,true,true,true],[true,true,true,false,true,true,false,true,true,true,true,true,false,true,true,false,true,false],[true,false,true,true,false,true,true,false,true,true,false,true,true,false,true,true,false,true],[false,true,false,true,true,true,false,true,true,false,true,true,false,true,true,true,true,true],[true,true,true,true,false,true,true,false,true,true,true,false,true,true,false,true,false,true],[false,true,true,false,true,true,false,true,false,true,false,true,true,false,true,false,true,true],[true,true,true,true,false,true,true,true,true,false,true,true,false,true,true,true,true,false]]"
*/

class Hitori {
  constructor(source) {
    this.sizX = 0;
    this.sizY = 0;
    this.def = [];
    this.sta = [];
    this.savsta = [];
    this.hypos = [];
    this.savhypos = [];

    const cases = source.split(' ').map(col => parseInt(col, 10));

    for (let i = 4; i < 50; i++) {
      if (i * i === cases.length) {
        this.sizX = i;
        break;
      }
    }
    if (!this.sizX) {
      throw Error('Cannot guess size');
    }

    while (cases.length) {
      this.def.push(cases.splice(0, this.sizX));
      this.sta.push(Array.from(Array(this.sizX), _ => null));
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
    let rows = this.def.map(row => row.map(col => `<td><span>${col}</span></td>`).join(''));
    rows = rows.map(row => `<tr>${row}</tr>`).join('');
    table.innerHTML = rows;
    for (let y = 1; y <= this.sizY; y++) {
      for (let x = 1; x <= this.sizX; x++) {
        const sta = this.sta[y - 1][x - 1];
        const def = this.def[y - 1][x - 1];
        const cell = document.querySelector(`table.hit tr:nth-of-type(${y}) td:nth-of-type(${x})`);
        if (sta === true) {
          cell.className = 'open';
          cell.innerHTML = `<i class="fa fa-circle-thin fa-stack-2x"></i>${def}`;
        } else if (sta === false) {
          cell.className = 'closed';
        }
      }
    }

    const hyphtml = document.querySelector('.hypos');
    hyphtml.innerHTML = '';
    let index = 0;
    this.hypos.forEach((hypo) => {
      const tpl = hypo.join(', ');
      hyphtml.innerHTML += `<div data-index='${index++}'>${tpl}</div>`;
    });
  }

  // mark n ? n  -> n=open
  initPass1() {
    let res = false;
    for (let y = 0; y < this.sizY; y++) {
      for (let x = 1; x < this.sizX - 1; x++) {
        const h0 = this.def[y][x - 1];
        const h2 = this.def[y][x + 1];
        if (h0 === h2) {
          if (this.sta[y][x] === true) { continue; }
          if (this.sta[y][x] === false) { return 'ERR'; }
          console.log(`3H center: (${x}, ${y}) -> open`);
          res = this.openAndCheck(x, y);
          if (res === 'ERR') { return res; }
        }
      }
    }

    for (let y = 1; y < this.sizY - 1; y++) {
      for (let x = 0; x < this.sizX; x++) {
        const v0 = this.def[y - 1][x];
        const v2 = this.def[y + 1][x];
        if (v0 === v2) {
          if (this.sta[y][x] === true) { continue; }
          if (this.sta[y][x] === false) { return 'ERR'; }
          console.log(`3V center: (${x}, ${y}) -> open`);
          res = this.openAndCheck(x, y);
          if (res === 'ERR') { return res; }
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

  // mark nn -> other N is close
  initPass2() {
    let res = false;
    // horiz check

    for (let y = 0; y < this.sizY; y++) {
      for (let x = 0; x < this.sizX; x++) {
        const def = this.def[y][x];
        if (x + 1 < this.sizX && this.def[y][x + 1] === def) {
          if (x + 2 < this.sizX && this.def[y][x + 2] === def) {
            // ignore 3 same
            x += 3;
            continue;
          }
          for (let x2 = 0; x2 < this.sizX; x2++) {
            // ignore those 2
            if (x2 === x || x2 === x + 1) { continue; }
            if (this.def[y][x2] !== def || this.sta[y][x2] === false) { continue; }
            if (this.sta[y][x2] === true) { return 'ERR'; }
            console.log(`2H consécutifs: (${x2}, ${y}) -> close`);
            this.sta[y][x2] = false;
            res = true;
          }
        }
      }
    }

    // vertical check
    for (let x = 0; x < this.sizX; x++) {
      for (let y = 0; y < this.sizY; y++) {
        const def = this.def[y][x];
        if (y + 1 < this.sizY && this.def[y + 1][x] === def) {
          if (y + 2 < this.sizY && this.def[y + 2][x] === def) {
            // ignore 3 same
            y += 3;
            continue;
          }
          for (let y2 = 0; y2 < this.sizY; y2++) {
            // ignore those 2
            if (y2 === y || y2 === y + 1) { continue; }
            if (this.def[y2][x] !== def || this.sta[y2][x] === false) { continue; }
            if (this.sta[y2][x] === true) { return 'ERR'; }
            console.log(`2V consécutifs: (${x}, ${y2}) -> close`);
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
          res = this.openAndCheck(h0, y);
        }
        if (h2 < this.sizX && this.sta[y][h2] === null) {
          console.log(`(${x}, ${y})=close -> right is open`);
          res = this.openAndCheck(h2, y);
        }
        if (v0 >= 0 && this.sta[v0][x] === null) {
          console.log(`(${x}, ${y})=close -> up is open`);
          res = this.openAndCheck(x, v0);
        }
        if (v2 < this.sizY && this.sta[v2][x] === null) {
          console.log(`(${x}, ${y})=close -> down is open`);
          res = this.openAndCheck(x, v2);
        }
        if (res === 'ERR') { return res; }
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
          // open case found
          break row;
        }
      }
    }
    if (y === this.sizY) {
      // no open case
      return true;
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
    if (!this.testfill(this.sta)) {
      return 'ERR';
    }
    let res = false;
    row: for (let y = 0; y < this.sizY; y++) {
      for (let x = 0; x < this.sizX; x++) {
        if (this.sta[y][x] === null) {
          // une case est vide, on essaie de la noircir
          const sta2 = JSON.parse(JSON.stringify(this.sta));
          sta2[y][x] = false;
          if (this.testfill(sta2) === false) {
            console.log(`(${x}, ${y}) ne peut être close (séparation) (${x}, ${y}) -> open`);
            res = this.openAndCheck(x, y);
            break row;
          }
        }
      }
    }
    if (this.testfinished()) {
      return 'END';
    }
    return res;
  }

  openAndCheck(x, y) {
    const def = this.def[y][x];
    for (let x2 = 0; x2 < this.sizX; x2++) {
      if (x2 !== x && this.def[y][x2] === def && this.sta[y][x2] === true) {
        return 'ERR';
      }
    }
    for (let y2 = 0; y2 < this.sizY; y2++) {
      if (y2 !== y && this.def[y2][x] === def && this.sta[y2][x] === true) {
        return 'ERR';
      }
    }
    this.sta[y][x] = true;
    return true;
  }

  pushHypo(x, y) {
    // todo vérifier pas déjà ni cellule adjacente
    this.hypos.push([x, y, true]);
    this.hypos.push([x, y, false]);
    return true;
  }

  // trouve deux cases identiques adjacentes, indeterminées
  pass5() {
    let res = false;
    for (let x = 0; x < this.sizX; x++) {
      for (let y = 0; y < this.sizY; y++) {
        if (this.sta[y][x] !== null) { continue; }
        const def = this.def[y][x];
        if (x + 1 < this.sizX && this.sta[y][x + 1] === null && this.def[y][x + 1] === def) {
          if (this.pushHypo(x, y)) {
            res = true;
          }
        } else if (y + 1 < this.sizY && this.sta[y + 1][x] === null && this.def[y + 1][x] === def) {
          if (this.pushHypo(x, y)) {
            res = true;
          }
        } else {
          // compte le nombre de rond autour de la case
          let n = 0;
          if (x - 1 >= 0 && this.sta[y][x - 1] === true) { n++; }
          if (y - 1 >= 0 && this.sta[y - 1][x] === true) { n++; }
          if (x + 1 < this.sizX && this.sta[y][x + 1] === true) { n++; }
          if (y + 1 < this.sizY && this.sta[y + 1][x] === true) { n++; }
          if (n >= 2) {
            if (this.pushHypo(x, y)) {
              res = true;
            }
          }
        }
      }
    }
    // todo ajouter case qui touche deux ronds
    return true;
  }

  clear() {
    this.hypos = [];
  }

  tryhypo(index) {
    // const hypo = this.hypos.splice(index, 1)[0];
    const hypo = this.hypos[index];
    this.try(...hypo);
  }

  try(x, y, val) {
    this.save();
    this.sta[y][x] = val;
  }

  tryall() {
    this.hypos.forEach((hypo) => {
      if (hypo[3] !== undefined) { return; }
      this.try(...hypo);
      const res = this.auto();
      this.back();
      hypo.push(res);
    });
  }

  auto() {
    let res = true;
    let didSomething = false;
    let r;
    let init = false;
    while (res === true) {
      res = false;
      if (!init) {
        r = this.initPass1();
        if (r !== false) { res = r; }
        if (r === 'END' || r === 'ERR') { break; }
        r = this.initPass2();
        if (r !== false) { res = r; }
        if (r === 'END' || r === 'ERR') { break; }
        init = true;
      }
      r = this.pass2();
      if (r !== false) { res = r; }
      if (r === 'END' || r === 'ERR') { break; }
      r = this.pass3();
      if (r !== false) { res = r; }
      if (r === 'END' || r === 'ERR') { break; }
      r = this.pass4();
      if (r !== false) { res = r; }
      if (r === 'END' || r === 'ERR') { break; }
      if (res === true) {
        didSomething = true;
      }
    }
    if (r === 'END' || r === 'ERR') { return r; }
    return didSomething;
  }

  save() {
    this.savsta.push(this.sta);
    this.savhypos.push(this.hypos);
    this.sta = JSON.parse(JSON.stringify(this.sta));
    this.hypos = [];
  }

  back() {
    if (this.savsta.length) {
      this.sta = this.savsta.pop();
      this.hypos = this.savhypos.pop();
    } else {
      console.log('cannot go back further');
    }
  }

}
