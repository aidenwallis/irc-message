export interface IRCMessage {
  command: string | null;
  prefix: string | null;
  tags: Record<string, string>;
  params: string[];
  raw: string;
}
