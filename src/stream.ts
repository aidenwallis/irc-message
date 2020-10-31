import * as stream from "stream";
import * as through from "through2";
import { parse } from "./parser";

const newlineRx = /\r\n/;

export function createStream(): stream.Transform {
  let buffer = "";

  return through.obj(function (chunk, _, done) {
    buffer += chunk.toString();
    const messages = buffer.split(newlineRx);
    buffer = messages.pop() || "";

    for (let i = 0; i < messages.length; ++i) {
      const message = messages[i];
      const parsed = parse(message);

      if (parsed === null) {
        this.emit("error", new Error("Invalid IRC message"));
        continue;
      }

      this.push(parsed);
    }

    done();
  });
}
