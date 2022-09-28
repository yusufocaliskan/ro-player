import Realm from "realm";
import React, { createContext, useEffect } from "react";
import { AnonsShema } from "../database/DatabaseShemas";
export const DBContext = createContext();

export const AnonsDoc = async () => {
  return await Realm.open({
    schema: [AnonsShema],
  });
};
