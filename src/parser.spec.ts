import { IRCMessage } from "./types";
import { parse } from "./parser";

describe("parser", () => {
  describe("parse()", () => {
    it("should parse irc messages properly", () => {
      const tests: Record<string, Omit<IRCMessage, "raw">> = {
        FOO: {
          tags: {},
          prefix: null,
          command: "FOO",
          params: [],
        },
        ":test FOO": {
          tags: {},
          prefix: "test",
          command: "FOO",
          params: [],
        },
        ":test FOO     ": {
          tags: {},
          prefix: "test",
          command: "FOO",
          params: [],
        },
        ":test!me@test.ing PRIVMSG #Test :This is a test": {
          tags: {},
          prefix: "test!me@test.ing",
          command: "PRIVMSG",
          params: ["#Test", "This is a test"],
        },
        "PRIVMSG #Test :This is a test": {
          tags: {},
          prefix: null,
          command: "PRIVMSG",
          params: ["#Test", "This is a test"],
        },
        ":test PRIVMSG foo :A string   with spaces   ": {
          tags: {},
          prefix: "test",
          command: "PRIVMSG",
          params: ["foo", "A string   with spaces   "],
        },
        ":test     PRIVMSG    foo     :bar": {
          tags: {},
          prefix: "test",
          command: "PRIVMSG",
          params: ["foo", "bar"],
        },
        ":test FOO bar baz quux": {
          tags: {},
          prefix: "test",
          command: "FOO",
          params: ["bar", "baz", "quux"],
        },
        "FOO bar baz quux": {
          tags: {},
          prefix: null,
          command: "FOO",
          params: ["bar", "baz", "quux"],
        },
        "FOO    bar      baz   quux": {
          tags: {},
          prefix: null,
          command: "FOO",
          params: ["bar", "baz", "quux"],
        },
        "FOO bar baz quux :This is a test": {
          tags: {},
          prefix: null,
          command: "FOO",
          params: ["bar", "baz", "quux", "This is a test"],
        },
        ":test PRIVMSG #fo:oo :This is a test": {
          tags: {},
          prefix: "test",
          command: "PRIVMSG",
          params: ["#fo:oo", "This is a test"],
        },
        "@test=super;single :test!me@test.ing FOO bar baz quux :This is a test": {
          tags: {
            test: "super",
            single: "",
          },
          prefix: "test!me@test.ing",
          command: "FOO",
          params: ["bar", "baz", "quux", "This is a test"],
        },
      };

      Object.keys(tests).forEach((test) => {
        const expected: IRCMessage = { ...tests[test], raw: test };
        expect(parse(test)).toEqual(expected);
      });
    });
  });
});
