"use server";
interface ProblemPagePayload {
  pages: string;
  fileid: string;
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

import { errorToString } from "@/utils/methods";
import prisma from "../../../prisma/database";
import { ApiResponseType } from "@/models/response";
import { problem_pages } from "@prisma/client";

const ProblemPage = async (
  payload: ProblemPagePayload
): Promise<ApiResponseType<problem_pages | null>> => {
  try {
    const pageresponse = await prisma.problem_pages.findFirst({
      where: {
        fileId: parseInt(payload.fileid),
      },
    });

    if (pageresponse) {
      const response = await prisma.problem_pages.update({
        where: {
          id: pageresponse.id,
        },
        data: {
          pages: payload.pages,
          status: "PENDING",
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

      if (!response) {
        return {
          status: false,
          data: null,
          message: "Problem not updated",
          functionname: "ProblemPage",
        };
      }
      return {
        status: true,
        data: response,
        message: "Problem updated successfully",
        functionname: "ProblemPage",
      };
    } else {
      const response = await prisma.problem_pages.create({
        data: {
          pages: payload.pages,
          fileId: parseInt(payload.fileid),
          fromUserId: payload.fromUserId,
          scannerUserId: payload.toUserId,
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
      if (!response) {
        return {
          status: false,
          data: null,
          message: "Problem not created",
          functionname: "ProblemPage",
        };
      }
      return {
        status: true,
        data: response,
        message: "Problem created successfully",
        functionname: "ProblemPage",
      };
    }
  } catch (e) {
    const response: ApiResponseType<null> = {
      status: false,
      data: null,
      message: errorToString(e),
      functionname: "ProblemPage",
    };
    return response;
  }
};

export default ProblemPage;
