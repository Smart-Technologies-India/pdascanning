"use server";
interface UserProblemFilePayload {
  id: string;
}

import { errorToString } from "@/utils/methods";
import prisma from "../../../prisma/database";
import { ApiResponseType } from "@/models/response";
import { problem_file } from "@prisma/client";

const UserProblemFile = async (
  payload: UserProblemFilePayload
): Promise<ApiResponseType<problem_file[] | null>> => {
  try {
    const problemfile = await prisma.problem_file.findMany({
      where: {
        NOT: [{ status: "COMPLETED" }],
        scannerUserId: parseInt(payload.id),
      },
      include: {
        scanneruser: true,
        file: true,
      },
    });

    if (!problemfile)
      return {
        status: false,
        data: null,
        message: "NO problem file for this user.",
        functionname: "UserProblemFile",
      };

    return {
      status: true,
      data: problemfile,
      message: "Problem file list get successfully",
      functionname: "UserProblemFile",
    };
  } catch (e) {
    const response: ApiResponseType<null> = {
      status: false,
      data: null,
      message: errorToString(e),
      functionname: "UserProblemFile",
    };
    return response;
  }
};

export default UserProblemFile;
