###
  irc-message
  Copyright (c) 2013 Fionn Kelleher. All rights reserved.
  Licensed under the BSD 2-Clause License (FreeBSD) - see LICENSE.md.
###

class Message
  constructor: (line) ->
    @tags = {}
    @prefix = ""
    @command = ""
    @params = []
    position = 0
    nextspace = 0

    if line[0] is "@"
      nextspace = line.indexOf " "
      throw new Error "Expected prefix; malformed IRC message." if nextspace is -1
      rawTags = line.substring(1, nextspace).split ";"

      for tag in rawTags
        pair = tag.split "="
        @tags[pair[0]] = pair[1] or yes

      position = nextspace + 1

    position++ while line.charAt(position) is " "

    if line.charAt(position) is ":"
      nextspace = line.indexOf " ", position
      throw new Error "Expected command; malformed IRC message." if nextspace is -1
      @prefix = line.substring position + 1, nextspace
      position = nextspace + 1
      position++ while line.charAt(position) is " "

    nextspace = line.indexOf " ", position

    if nextspace is -1
      if line.length > position
        @command = line.substring(position).toUpperCase()
      else return

    @command = line.substring(position, nextspace).toUpperCase()

    position = nextspace + 1
    position++ while line.charAt(position) is " "

    while position < line.length
      nextspace = line.indexOf " ", position
      if line.charAt(position) is ":"
        @params.push line.substring position + 1
        break

      if nextspace isnt -1
        @params.push line.substring position, nextspace
        position = nextspace + 1
        position++ while line.charAt(position) is " "
        continue

      if nextspace is -1
        @params.push line.substring position
        break
    return

  toString: ->
    string = ""
    if Object.keys(@tags).length isnt 0
      string += "@"
      for tag, value of @tags
        if value isnt null
          string += "#{tag}=#{value};"
        else string += "#{tag};"
      string = string.slice(0, -1) + " "

    if @prefix.length isnt 0
      string += ":#{@prefix} "

    if @command.length isnt 0
      string += "#{@command} "

    if @params.length isnt 0
      for param in @params
        if param.indexOf " " isnt -1
          string += "#{param} "
        else
          string += ":#{param} "

    string = string.slice 0, -1
    return string

  prefixIsUserHostmask: -> (@prefix.indexOf("@") isnt -1 and @prefix.indexOf("!") isnt -1)
  prefixIsServerHostname: -> (@prefix.indexOf("@") is -1 and @prefix.indexOf("!") is -1 and @prefix.indexOf(".") isnt -1)
  parseHostmask: ->
    [nickname, username, hostname] = @prefix.split /[!@]/
    parsed =
      nickname: nickname
      username: username
      hostname: hostname
    parsed

exports = module.exports = Message