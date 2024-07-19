"use server";

import { errorToString } from "@/utils/methods";
import prisma from "../../../prisma/database";
import { ApiResponseType } from "@/models/response";
import { file } from "@prisma/client";

interface GetMetaFileCountPayload {
  id: number;
}

const GetMetaFileCount = async (
  payload: GetMetaFileCountPayload
): Promise<ApiResponseType<file[] | null>> => {
  try {
    const file = await prisma.file.findMany({
      where: {
        NOT: [{ village: null }, { endAt: null }],
        OR: [{ meta: null }, { meta: payload.id }],
      },
      include: {
        assignTo: true,
        user: true,
        village: true,
        type: true,
        file_name: true,
        file_survey: true,
      },
      orderBy: { file_id: "asc" },
    });

    if (!file)
      return {
        status: false,
        data: null,
        message: "No files found. Please try again.",
        functionname: "GetMetaFileCount",
      };

    return {
      status: true,
      data: file,
      message: "File data get successfully",
      functionname: "GetMetaFileCount",
    };
  } catch (e) {
    const response: ApiResponseType<null> = {
      status: false,
      data: null,
      message: errorToString(e),
      functionname: "GetMetaFileCount",
    };
    return response;
  }
};

export default GetMetaFileCount;
