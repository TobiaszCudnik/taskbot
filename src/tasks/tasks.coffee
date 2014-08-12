asyncmachine = require 'asyncmachine'
AsyncMachine = asyncmachine.AsyncMachine

class Auth extends AsyncMachine
  Authorized:
    blocks: ['Authorizing']
    
  Authorizing:
    blocks: ['Authorized']
  
  Discovered:
    blocks: ['Discovering']
    
  Discovering:
    blocks: ['Discovered']
    
  ClientAuthGained:
    blocks: ['ClientAuthGaining']
    
  ClientAuthGaining:
    blocks: ['ClientAuthGained']
    
  Ready:
    blocks: ['Connectiong']
    
  
class List
  
class Task
  
class QueryMapper
  
class RecordMapper
  
class GmailMapper
  query: null # new gtd.Query
  record: null # new gtd.Record
  
  #  onChechek