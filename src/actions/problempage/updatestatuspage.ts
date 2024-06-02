"use server";
import { ApiResponseType } from "@/models/response";
import { errorToString } from "@/utils/methods";
import { ProblemStatus, problem_pages } from "@prisma/client";
import prisma from "../../../prisma/database";

interface UpdateStatusPagePayload {
  status: string;
  id: number;
  fileid: number;
  fromUserId: number;
  toUserId: number;
  map_count: number;
  page_count: number;
  wrong_file_id: boolean;
  file_not_found: boolean;
  full_rescan: boolean;
  filter: boolean;
  crop: boolean;
  meta_improper: boolean;
}

const updateStatusPage = async (
  payload: UpdateStatusPagePayload
): Promise<ApiResponseType<problem_pages | null>> => {
  try {
    const problem_page_response = await prisma.problem_pages.findFirst({
      where: { id: payload.id },
    });

    if (problem_page_response) {
      const problempage = await prisma.problem_pages.update({
        where: {
          id: problem_page_response.id,
        },
        data: {
          status: payload.status as ProblemStatus,
          map_count: payload.map_count,
          page_count: payload.page_count,
          wrong_file_id: payload.wrong_file_id,
          file_not_found: payload.file_not_found,
          full_rescan: payload.full_rescan,
          filter: payload.filter,
          crop: payload.crop,
          meta_improper: payload.meta_improper,
        },
      });

      if (!problempage)
        return {
          status: false,
          data: null,
          message: "Problem page not found",
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
        data: problempage,
        message: "Problem pages status updated successfully",
        functionname: "updateStatus",
      };
    } else {
      const createsolvedproblem = await prisma.problem_pages.create({
        data: {
          fileId: parseInt(payload.fileid.toString()),
          fromUserId: payload.fromUserId,
          scannerUserId: payload.toUserId,
          status: "COMPLETED",
          map_count: payload.map_count,
          page_count: payload.page_count,
          wrong_file_id: payload.wrong_file_id,
          file_not_found: payload.file_not_found,
          full_rescan: payload.full_rescan,
          filter: payload.filter,
          crop: payload.crop,
          meta_improper: payload.meta_improper,
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
        message: "Problem page status updated successfully",
        functionname: "updateStatusPage",
      };
    }
  } catch (e) {
    const response: ApiResponseType<null> = {
      status: false,
      data: null,
      message: errorToString(e),
      functionname: "updateStatusPage",
    };
    return response;
  }
};

export default updateStatusPage;
