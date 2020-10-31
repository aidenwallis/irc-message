# irc-message-ts

> Performant, streaming IRC message parser - a fork of [sigkell/irc-message](https://github.com/sigkell/irc-message) with a more simplified feature set and TypeScript support.

**There are some breaking changes between the original library and this one, namely the lack of stream options, and the `tags` property will only ever be an object with string values.**

This is important to note because there were times when `irc-message` returned `true` on a key within the `tags` object, I have however removed this behaviour in favour of keeping tag types more consistent. This however has the breaking impact that it falls back to an empty string, which is considered falsy in JavaScript. So this means where you may have gotten something like `message.tags["my-key"] === true`, it will now be `message.tags["my-key"] === ""`, and this equates to a falsy value, if for example used in an if statement. I believe this is a reasonable compromise over supporting two different types in the object.

irc-message-ts provides an object stream capable of parsing [RFC1459-compliant IRC messages](http://tools.ietf.org/html/rfc2812#section-2.3.1), with support for [IRCv3 message tags](https://github.com/ircv3/ircv3-specifications/blob/master/specification/message-tags-3.2.md). This also includes server-to-server protocols such as TS6, Spanning Tree, and the UnrealIRCd protocol.

## Installation

    yarn add irc-message-ts

## Usage

### `createStream()`

Returns an object stream, taking in `Buffer`s/`String`s of raw IRC data. Data should not be line-buffered, this stream handles splitting and buffering automatically. and pushing objects containing the following keys.

* `raw` - unparsed IRC message (string)
* `tags` - IRCv3 message tags
* `prefix` - message prefix/source
* `command` - message command/verb
* `params` - an array of middle and trailing parameters

We don't support options like the [irc-message](https://github.com/sigkell/irc-message) library does right now. I felt like these added un-needed bulk and didn't think it was worth adding two extra packages, as it's pretty easy to abstract this on your own. It would also probably involve overloads on the types which I didn't want to add, the goal is to keep the types extremely simple.

```ts

import * as net from "net";
import {createStream, IRCMessage} from "irc-message-ts";

net.connect(6667, "irc.freenode.net")
    .pipe(createStream())
    .on('data', (message: IRCMessage) => {
        console.log(message)
    });
```

### `parse(data)`

You can also access the message parser directly. The parser function expects a string without any CRLF sequences. If the string is malformed, `null` is returned. Otherwise, an object representing the message is returned (see `createStream()` for format).

```ts
import {parse} from "irc-message-ts";

console.log(parse(':hello!sir@madam PRIVMSG #test :Hello, world!'))
/* {
 *   raw: ':hello!sir@madam PRIVMSG #test :Hello, world!',
 *   tags: {},
 *   prefix: 'hello!sir@madam',
 *   command: 'PRIVMSG',
 *   params: ['#test', 'Hello, world!']
 * }
 */
```
