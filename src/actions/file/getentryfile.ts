"use server";

import { errorToString } from "@/utils/methods";
import prisma from "../../../prisma/database";
import { ApiResponseType } from "@/models/response";
import { file } from "@prisma/client";

interface GetEntryFilePayload {
  id: number;
}

const GetEntryFile = async (
  payload: GetEntryFilePayload
): Promise<ApiResponseType<file[] | null>> => {
  try {
    const file = await prisma.file.findMany({
      where: {
        startAt: null,
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
        functionname: "GetEntryFile",
      };

    return {
      status: true,
      data: file,
      message: "File data get successfully",
      functionname: "GetEntryFile",
    };
  } catch (e) {
    const response: ApiResponseType<null> = {
      status: false,
      data: null,
      message: errorToString(e),
      functionname: "GetEntryFile",
    };
    return response;
  }
};

export default GetEntryFile;
