const removeAccent = require('../email').RemoveDiacritics

const tokenSchema = {  
  '{Name}': Name,
  '{Name * Pn}': NamePn,
  '{Name * P1Pn}': NameP1Pn,
  '{Name * iP1Pn}': NameiP1Pn,
  '{Name * P1-Pn}': NameP1DashPn,
  '{Name * P1.Pn}': NameP1DotPn,
  '{InitName}': InitName,
  '{InitName * iP1}': InitNameiP1,
  '{InitName * iP1iPn}': InitNameiP1iPn
}

let tokens = {}
for (let k in tokenSchema) {
  tokens[k.replace('Name', 'Fname')] = tokenSchema[k]
  tokens[k.replace('Name', 'Lname')] = tokenSchema[k]
}

const keys = Object.keys(tokens)

module.exports = patternToEmail

function patternToEmail(fname, lname, pattern) {
  fname = removeAccent(fname.toLowerCase())
  lname = removeAccent(lname.toLowerCase())

  if (pattern.split('@').length !== 2) {
    return []
  }

  let foundKey
  let mails = [pattern]
  
  while (foundKey = foundExp(mails[0])) {
    const first = head(mails)
    const xs = tokens[foundKey](foundKey.includes('Fname') ? fname : lname)
    for (let x of xs) {
      mails.push(first.replace(foundKey, x))
    }
    mails.splice(0, 1)
  }
  return mails
}

function foundExp(str) {
  for (let key of keys) {
    if (str.includes(key)) {
      return key
    }
  }
  return false
}

function Name(name) {
  return [name];
}

function NamePn(name) {
  return splitSeparator(name)
}

function NameP1Pn(name) {
  return [splitSeparator(name).join('')]
}

function NameiP1Pn(name) {
  const [head, ...tail] = splitSeparator(name)
  return [`${head[0] + tail.join('')}`]
}

function NameP1DashPn(name) {
  return [splitSeparator(name).join('-')]
}

function NameP1DotPn(name) {
  return [splitSeparator(name).join('.')] 
}

function InitName(name) {
  return [head(name)]
}

function InitNameiP1(name) {
  return [head(head(splitSeparator(name)))]
}

function InitNameiP1iPn(name) {
  return [splitSeparator(name).map(head).join('')]
}

function splitSeparator(str) {
  return str.split(/[\s-_.]+/);
}

function head(xs) {
  return xs[0]
}
