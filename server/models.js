const mongoose = require('mongoose')

const patternSchema = mongoose.Schema({
  company: {type: String},
  pattern: {type: String},
  city: {type: String},
  domain: {type: String},
  count: {type: Number, default: 1},
})

const Pattern = mongoose.model('Pattern', patternSchema)

module.exports = {
  Pattern
}
