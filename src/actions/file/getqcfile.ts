"use server";

import { errorToString } from "@/utils/methods";
import prisma from "../../../prisma/database";
import { ApiResponseType } from "@/models/response";
import { file } from "@prisma/client";

interface GetQcFilePayload {
  id: number;
}

const GetQcFile = async (
  payload: GetQcFilePayload
): Promise<ApiResponseType<file[] | null>> => {
  try {
    const file = await prisma.file.findMany({
      where: {
        village: null,
        NOT: [{ endAt: null }],
        OR: [{ qc: null }, { qc: payload.id }],
      },
      include: {
        user: true,
        village: true,
        type: true,
        file_name: true,
        file_survey: true,
      },
    });

    if (!file)
      return {
        status: false,
        data: null,
        message: "No files found. Please try again.",
        functionname: "GetQcFile",
      };

    return {
      status: true,
      data: file,
      message: "File data get successfully",
      functionname: "GetQcFile",
    };
  } catch (e) {
    const response: ApiResponseType<null> = {
      status: false,
      data: null,
      message: errorToString(e),
      functionname: "GetQcFile",
    };
    return response;
  }
};

export default GetQcFile;
