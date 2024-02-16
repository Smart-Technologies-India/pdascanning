"use server";
import { ApiResponseType } from "@/models/response";
import { errorToString } from "@/utils/methods";
import { ProblemStatus, problem_file } from "@prisma/client";
import prisma from "../../../prisma/database";

interface UpdateStatusPayload {
  status: string;
  id: number;
}

const updateStatus = async (
  payload: UpdateStatusPayload
): Promise<ApiResponseType<problem_file | null>> => {
  try {
    console.log("payload", payload);
    const problemfile = await prisma.problem_file.update({
      where: {
        id: payload.id,
      },
      data: {
        status: payload.status as ProblemStatus,
      },
    });

    if (!problemfile)
      return {
        status: false,
        data: null,
        message: "Problem file not found",
        functionname: "updateStatus",
      };

    return {
      status: true,
      data: problemfile,
      message: "Problem file status updated successfully",
      functionname: "updateStatus",
    };
  } catch (e) {
    const response: ApiResponseType<null> = {
      status: false,
      data: null,
      message: errorToString(e),
      functionname: "updateStatus",
    };
    return response;
  }
};

export default updateStatus;
