import type { InferSelectModel } from "drizzle-orm";
import type { characters } from "../../db/schemas/characters";

export type CharacterEntity =  InferSelectModel<typeof characters>;
