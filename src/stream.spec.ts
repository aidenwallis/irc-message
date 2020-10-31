import { IRCMessage } from "./types";
import { createStream } from "./stream";

describe("stream", () => {
  describe("createStream", () => {
    function assertMsg(
      msg: IRCMessage,
      tags: Record<string, string>,
      prefix: string | null,
      command: string | null,
      params: string[]
    ) {
      expect(msg.tags).toEqual(tags);
      expect(msg.prefix).toEqual(prefix);
      expect(msg.command).toEqual(command);
      expect(msg.params).toEqual(params);
      expect(msg.param).toEqual(params[0] || "");
      expect(msg.trailing).toEqual(
        params.length > 1 ? params[params.length - 1] : ""
      );
    }

    it("should parse a single IRC message", (done) => {
      const stream = createStream();

      stream.once("data", (msg: IRCMessage) => {
        assertMsg(msg, {}, "user", "HOW", ["are", "you doing?"]);
        done();
      });

      stream.write(":user HOW are :you doing?\r\n");
    });

    it("should correctly buffer messages before parsing", function (done) {
      const stream = createStream();
      let gotFirst = false;

      stream.on("data", function (m) {
        if (!gotFirst) {
          gotFirst = true;
          return assertMsg(m, {}, "user", "HOW", ["are", "you doing?"]);
        }

        assertMsg(m, {}, null, "ERROR", ["Link closed (bad!)"]);
        done();
      });

      stream.write(":user H");
      stream.write("OW are :you doi");
      stream.write("ng?\r\nERROR :Link closed (bad!)");
      stream.write("\r\n");
    });

    it("should handle null values correctly", function (done) {
      const stream = createStream();

      stream.on("error", function () {
        done();
      });

      stream.write(":::\r\n");
    });
  });
});
