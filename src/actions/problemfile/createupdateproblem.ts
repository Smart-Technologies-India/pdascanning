"use server";
interface ProfileFilePayload {
  pages: string;
  fileid: string;
  fromUserId: number;
  toUserId: number;
}

import { errorToString } from "@/utils/methods";
import prisma from "../../../prisma/database";
import { ApiResponseType } from "@/models/response";
import { problem_file } from "@prisma/client";

const ProblemFile = async (
  payload: ProfileFilePayload
): Promise<ApiResponseType<problem_file | null>> => {
  try {
    const fileresponse = await prisma.problem_file.findFirst({
      where: {
        fileId: parseInt(payload.fileid),
      },
    });

    if (fileresponse) {
      const response = await prisma.problem_file.update({
        where: {
          id: fileresponse.id,
        },
        data: {
          pages: payload.pages,
          status: "PENDING",
        },
      });

      if (!response) {
        return {
          status: false,
          data: null,
          message: "Problem not updated",
          functionname: "ProblemFile",
        };
      }
      return {
        status: true,
        data: response,
        message: "Problem updated successfully",
        functionname: "ProblemFile",
      };
    } else {
      const response = await prisma.problem_file.create({
        data: {
          pages: payload.pages,
          fileId: parseInt(payload.fileid),
          fromUserId: payload.fromUserId,
          scannerUserId: payload.toUserId,
        },
      });
      if (!response) {
        return {
          status: false,
          data: null,
          message: "Problem not created",
          functionname: "ProblemFile",
        };
      }
      return {
        status: true,
        data: response,
        message: "Problem created successfully",
        functionname: "ProblemFile",
      };
    }
  } catch (e) {
    const response: ApiResponseType<null> = {
      status: false,
      data: null,
      message: errorToString(e),
      functionname: "ProblemFile",
    };
    return response;
  }
};

export default ProblemFile;
