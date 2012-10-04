spawn = require('child_process').spawn
#console.log arg for arg in process.argv

_proc = null
_args = process.argv

_exec_args = ''
_exec_name = ''

COLOR_BLUE = "\u001b[34m"
COLOR_RED = "\u001b[31m"
COLOR_NEUTRAL = "\u001b[00m"

interval = null
_time_secs = 30

SHOULD_KILL = true

main = ->
  
  _time_secs = parseInt(_args[2])
  if _time_secs.toString() isnt 'NaN'
    _exec_name = _args[3]
    _args.shift() for i in [0..3] #cut all of the args off
    interval = setInterval killCallback, _time_secs * 1000
    SHOULD_KILL = true
  else #no time passed in, never kill process, but keep it alive forever
    console.log 'no time'
    _exec_name = _args[2]
    _args.shift() for i in [0..2]
    SHOULD_KILL = false 

  _exec_args += ae + ' ' for ae in _args 
  _exec_args = _exec_args.trim()
  #console.log "Executing: #{_exec_name} #{_exec_args}..."

  console.log _time_secs
  startItUp()

startItUp = ->
  console.log blueString("\nStarting #{_exec_name} #{_exec_args}...")
  _proc = spawn(_exec_name, _args)
  _proc.stdout.on 'data', stdoutCallback
  _proc.stderr.on 'data', stderrCallback
  _proc.on 'exit', exitCallback

blueString = (str) -> COLOR_BLUE + str + COLOR_NEUTRAL
redString = (str) -> COLOR_RED + str + COLOR_NEUTRAL

stderrCallback = (data) -> console.log(redString(data.toString('utf8').trim()))
stdoutCallback = (data) -> console.log(data.toString('utf8').trim())
exitCallback = (code) -> 
  console.log redString("<=== EXIT: DIED or KILLED ===>");
  startItUp()
  if SHOULD_KILL
    clearInterval(interval)
    interval = setInterval killCallback, _time_secs*1000 #resets kill clock, not completely necessary, but if
    # ^--- Not completey necessary, but resets kill clock. e.g. If the kill clock was set to 3 mins, and the program
    #died at 1.0 mins, the freshly started up version would be killed 2.0 mins later. Resetting it make sure that
    #it is always killed at a predictable time (As predictable as setTimeout can be)
  

killCallback = ->
  console.log blueString("Killling #{_proc.pid}...")
  _proc.kill() 

main()