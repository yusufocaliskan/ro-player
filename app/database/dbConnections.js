import Realm from "realm";
import { AdminSettings } from "../database/DatabaseShemas";

const connection = async () => {
  const realm = await Realm.open({
    schema: [AdminSettings],
    deleteRealmIfMigrationNeeded: true,
  });

  return realm;
};
