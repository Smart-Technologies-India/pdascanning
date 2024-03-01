"use server";

import { errorToString } from "@/utils/methods";
import prisma from "../../../prisma/database";
import { ApiResponseType } from "@/models/response";
import { file } from "@prisma/client";

interface GetFilePayload {
  id: number;
}

const GetScannerFile = async (
  payload: GetFilePayload
): Promise<ApiResponseType<file[] | null>> => {
  try {
    const file = await prisma.file.findMany({
      where: { assign: parseInt(payload.id.toString()), endAt: null },
      include: {
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
        message: "Invalid file id. Please try again.",
        functionname: "GetScannerFile",
      };

    return {
      status: true,
      data: file,
      message: "File data get successfully",
      functionname: "GetScannerFile",
    };
  } catch (e) {
    const response: ApiResponseType<null> = {
      status: false,
      data: null,
      message: errorToString(e),
      functionname: "GetScannerFile",
    };
    return response;
  }
};

export default GetScannerFile;
