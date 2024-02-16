"use server";
interface GetProblemFileFromFileIdPayload {
  fileid: string;
}

import { errorToString } from "@/utils/methods";
import prisma from "../../../prisma/database";
import { ApiResponseType } from "@/models/response";
import { file_type, problem_file } from "@prisma/client";

const getProblemFileFromFileId = async (
  payload: GetProblemFileFromFileIdPayload
): Promise<ApiResponseType<problem_file | null>> => {
  try {
    const problemfile = await prisma.problem_file.findFirst({
      where: {
        fileId: parseInt(payload.fileid),
      },
    });

    if (!problemfile)
      return {
        status: false,
        data: null,
        message: "Something want wrong. Please try again.",
        functionname: "getProblemFileFromFileId",
      };

    return {
      status: true,
      data: problemfile,
      message: "Problem file get successfully",
      functionname: "getProblemFileFromFileId",
    };
  } catch (e) {
    const response: ApiResponseType<null> = {
      status: false,
      data: null,
      message: errorToString(e),
      functionname: "getProblemFileFromFileId",
    };
    return response;
  }
};

export default getProblemFileFromFileId;
