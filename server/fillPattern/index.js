const PatternToEmail = require('../patternToEmail')

module.exports = fillPattern

function fillPattern(fname, lname, patterns) {
  return flatten(patterns.map(p => ({
    company: p.company,
    found: PatternToEmail(fname, lname, p.pattern)
  })))
}

function flatten(xs) {
  return [].concat(...xs);
}
