"use server";

import { cookies } from "next/headers";
import { Role } from "@prisma/client";
import EntryForm from "./Entry";
import Admin from "./Admin";
import Qc from "./Qc";
import Scanner from "./Scanner";
import MetaPage from "./Meta";
import Verify from "./Verify";

const InexPage = () => {
  const id = cookies().get("id")?.value;
  const role = cookies().get("role")?.value as Role;

  switch (role) {
    case Role.SYSTEM:
      return <Admin id={id} />;
    case Role.ADMIN:
      return <Admin id={id} />;
    case Role.ENTRY:
      return <EntryForm id={id} />;
    case Role.SCANNER:
      return <Scanner id={id} />;
    case Role.QC:
      return <Qc id={id} />;
    case Role.VERIFY:
      return <Verify id={id} />;
    case Role.META:
      return <MetaPage id={id} />;
    default:
      return <EntryForm id={id} />;
  }
};
export default InexPage;
