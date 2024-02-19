"use server";

import { errorToString } from "@/utils/methods";
import prisma from "../../../prisma/database";
import { ApiResponseType } from "@/models/response";
import { file } from "@prisma/client";

interface GetMetaFilePayload {
  id: number;
}

const GetMetaFile = async (
  payload: GetMetaFilePayload
): Promise<ApiResponseType<file[] | null>> => {
  try {
    const file = await prisma.file.findMany({
      where: {
        village: null,
        NOT: [{ endAt: null }],
        OR: [{ meta: null }, { meta: payload.id }],
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
        functionname: "GetMetaFile",
      };

    return {
      status: true,
      data: file,
      message: "File data get successfully",
      functionname: "GetMetaFile",
    };
  } catch (e) {
    const response: ApiResponseType<null> = {
      status: false,
      data: null,
      message: errorToString(e),
      functionname: "GetMetaFile",
    };
    return response;
  }
};

export default GetMetaFile;
