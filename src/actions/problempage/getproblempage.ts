"use server";
interface GetProblemPageFromFileIdPayload {
  fileid: string;
}

import { errorToString } from "@/utils/methods";
import prisma from "../../../prisma/database";
import { ApiResponseType } from "@/models/response";
import { problem_file, problem_pages } from "@prisma/client";

const getProblemPageFromFileId = async (
  payload: GetProblemPageFromFileIdPayload
): Promise<ApiResponseType<problem_pages | null>> => {
  try {
    const problempage = await prisma.problem_pages.findFirst({
      where: {
        fileId: parseInt(payload.fileid),
      },
    });

    if (!problempage)
      return {
        status: false,
        data: null,
        message: "Something want wrong. Please try again.",
        functionname: "getProblemPageFromFileId",
      };

    return {
      status: true,
      data: problempage,
      message: "Problem Page get successfully",
      functionname: "getProblemPageFromFileId",
    };
  } catch (e) {
    const response: ApiResponseType<null> = {
      status: false,
      data: null,
      message: errorToString(e),
      functionname: "getProblemPageFromFileId",
    };
    return response;
  }
};

export default getProblemPageFromFileId;
