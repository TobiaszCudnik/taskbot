typedef = require 'tracery'

module.exports = (value, type, name) ->
  type = typedef type if Object.isArray type
  if not type value
    console.log value
    throw new TypeError name or ''
  value