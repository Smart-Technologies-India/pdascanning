"use server";
import { ApiResponseType } from "@/models/response";
import { errorToString } from "@/utils/methods";
import { ProblemStatus, problem_file } from "@prisma/client";
import prisma from "../../../prisma/database";

interface UpdateStatusPayload {
  status: string;
  id: number;
  fileid: number;
  fromUserId: number;
  toUserId: number;
}

const updateStatus = async (
  payload: UpdateStatusPayload
): Promise<ApiResponseType<problem_file | null>> => {
  try {
    const problem_file_response = await prisma.problem_file.findFirst({
      where: { id: payload.id },
    });


    if (problem_file_response) {

      const problemfile = await prisma.problem_file.update({
        where: {
          id: problem_file_response.id,
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

      await prisma.file.update({
        where: { id: payload.id },
        data: {
          qc: payload.fromUserId,
        },
      });

      return {
        status: true,
        data: problemfile,
        message: "Problem file status updated successfully",
        functionname: "updateStatus",
      };
    } else {
      const createsolvedproblem = await prisma.problem_file.create({
        data: {
          fileId: parseInt(payload.fileid.toString()),
          fromUserId: payload.fromUserId,
          scannerUserId: payload.toUserId,
          status: "COMPLETED",
        },
      });

      if (!createsolvedproblem)
        return {
          status: false,
          data: null,
          message: "Unable to create add data, Try Again!",
          functionname: "updateStatus",
        };

      await prisma.file.update({
        where: { id: parseInt(payload.fileid.toString()) },
        data: {
          qc: payload.fromUserId,
        },
      });

      return {
        status: true,
        data: createsolvedproblem,
        message: "Problem file status updated successfully",
        functionname: "updateStatus",
      };
    }
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
