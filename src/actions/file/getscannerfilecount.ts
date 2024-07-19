"use server";

import { errorToString } from "@/utils/methods";
import prisma from "../../../prisma/database";
import { ApiResponseType } from "@/models/response";
import { file } from "@prisma/client";

interface GetScannerFileCountPayload {
  id: number;
}

const GetScannerFileCount = async (
  payload: GetScannerFileCountPayload
): Promise<ApiResponseType<file[] | null>> => {
  try {
    const file = await prisma.file.findMany({
      where: { assign: parseInt(payload.id.toString()) },
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
        functionname: "GetScannerFileCount",
      };

    return {
      status: true,
      data: file,
      message: "File data get successfully",
      functionname: "GetScannerFileCount",
    };
  } catch (e) {
    const response: ApiResponseType<null> = {
      status: false,
      data: null,
      message: errorToString(e),
      functionname: "GetScannerFileCount",
    };
    return response;
  }
};

export default GetScannerFileCount;
