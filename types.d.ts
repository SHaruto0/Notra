declare module "*.css";
declare module "*.svg";
declare module "better-sqlite3";

interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

type EventPayloadMapping = {};
