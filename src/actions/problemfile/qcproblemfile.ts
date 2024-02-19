"use server";
interface QCProblemFilePayload {
  id: string;
}

import { errorToString } from "@/utils/methods";
import prisma from "../../../prisma/database";
import { ApiResponseType } from "@/models/response";
import { problem_file } from "@prisma/client";

const QCProblemFile = async (
  payload: QCProblemFilePayload
): Promise<ApiResponseType<problem_file[] | null>> => {
  try {
    const problemfile = await prisma.problem_file.findMany({
      where: {
        fromUserId: parseInt(payload.id),
        NOT: [{ status: "COMPLETED" }],
      },
      include: {
        scanneruser: true,
        fromuser: true,
        file: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!problemfile)
      return {
        status: false,
        data: null,
        message: "NO problem file for this qc.",
        functionname: "QCProblemFile",
      };

    return {
      status: true,
      data: problemfile,
      message: "Problem file list get successfully",
      functionname: "QCProblemFile",
    };
  } catch (e) {
    const response: ApiResponseType<null> = {
      status: false,
      data: null,
      message: errorToString(e),
      functionname: "QCProblemFile",
    };
    return response;
  }
};

export default QCProblemFile;
