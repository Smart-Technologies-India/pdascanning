"use server";

import { cookies } from "next/headers";
import AddMetaData from "./addData";

const ViewFilePage = ({ params }: any) => {
  const fileid = params.id;

  const id = cookies().get("id")?.value;
  return <AddMetaData id={parseInt(id!)} fileid={fileid} />;
};
export default ViewFilePage;
