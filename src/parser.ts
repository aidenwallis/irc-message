import { IRCMessage } from "./types";

export function parse(line: string): IRCMessage | null {
  const message: IRCMessage = {
    raw: line,
    tags: {},
    command: null,
    prefix: null,
    params: [],
  };

  // position and nextspace are used by the parser as a reference.
  let position = 0;
  let nextspace = 0;

  // The first thing we check for is IRCv3.2 message tags.
  // http://ircv3.atheme.org/specification/message-tags-3.2

  if (line.charCodeAt(0) === 64) {
    const nextspace = line.indexOf(" ");

    if (nextspace === -1) {
      // Malformed IRC message.
      return null;
    }

    // Tags are split by a semi colon.
    const rawTags = line.slice(1, nextspace).split(";");

    for (let i = 0; i < rawTags.length; ++i) {
      // Tags delimited by an equals sign are key=value tags.
      // If there's no equals, we assign the tag a value of true.
      const tag = rawTags[i];
      const pair = tag.split("=");
      message.tags[pair[0]] = pair[1] || "";
    }

    position = nextspace + 1;
  }

  // Skip any trailing whitespace.
  while (line.charCodeAt(position) === 32) {
    ++position;
  }

  // Extract the message's prefix if present. Prefixes are prepended
  // with a colon.

  if (line.charCodeAt(position) === 58) {
    nextspace = line.indexOf(" ", position);

    // If there's nothing after the prefix, deem this message to be
    // malformed.
    if (nextspace === -1) {
      // Malformed IRC message.
      return null;
    }

    message.prefix = line.slice(position + 1, nextspace);
    position = nextspace + 1;

    // Skip any trailing whitespace.
    while (line.charCodeAt(position) === 32) {
      ++position;
    }
  }

  nextspace = line.indexOf(" ", position);

  // If there's no more whitespace left, extract everything from the
  // current position to the end of the string as the command.
  if (nextspace === -1) {
    if (line.length > position) {
      message.command = line.slice(position);
      return message;
    }

    return null;
  }

  // Else, the command is the current position up to the next space. After
  // that, we expect some parameters.
  message.command = line.slice(position, nextspace);

  position = nextspace + 1;

  // Skip any trailing whitespace.
  while (line.charCodeAt(position) === 32) {
    ++position;
  }

  while (position < line.length) {
    nextspace = line.indexOf(" ", position);

    // If the character is a colon, we've got a trailing parameter.
    // At this point, there are no extra params, so we push everything
    // from after the colon to the end of the string, to the params array
    // and break out of the loop.
    if (line.charCodeAt(position) === 58) {
      message.params.push(line.slice(position + 1));
      break;
    }

    // If we still have some whitespace...
    if (nextspace !== -1) {
      // Push whatever's between the current position and the next
      // space to the params array.
      message.params.push(line.slice(position, nextspace));
      position = nextspace + 1;

      // Skip any trailing whitespace and continue looping.
      while (line.charCodeAt(position) === 32) {
        ++position;
      }

      continue;
    }

    // If we don't have any more whitespace and the param isn't trailing,
    // push everything remaining to the params array.
    if (nextspace === -1) {
      message.params.push(line.slice(position));
      break;
    }
  }

  return message;
}
