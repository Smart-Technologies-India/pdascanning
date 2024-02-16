"use server";
interface FormPayload {
  user_id: number;
  file_no: string;
  year: number;
  typeId: number;
  assignTo: number;
}

import { errorToString } from "@/utils/methods";
import prisma from "../../../prisma/database";
import { ApiResponseType } from "@/models/response";
import { file } from "@prisma/client";

const fileSubmit = async (
  payload: FormPayload
): Promise<ApiResponseType<file | null>> => {
  try {
    let data_to_update: any = {
      file_no: payload.file_no,
      year: payload.year,
      typeId: payload.typeId,
      userId: payload.user_id,
      assign: payload.assignTo,
    };

    const file: file = await prisma.file.create({
      data: data_to_update,
    });

    if (!file)
      return {
        status: false,
        data: null,
        message: "Something want wrong unable to add file.",
        functionname: "fileSubmit",
      };

    const fileid = 124567 + file.id;

    await prisma.file.update({
      where: {
        id: file.id,
      },
      data: {
        file_id: fileid.toString(),
      },
    });

    return {
      status: true,
      data: file,
      message: "File data get successfully",
      functionname: "fileSubmit",
    };
  } catch (e) {
    const response: ApiResponseType<null> = {
      status: false,
      data: null,
      message: errorToString(e),
      functionname: "fileSubmit",
    };
    return response;
  }
};

export default fileSubmit;
