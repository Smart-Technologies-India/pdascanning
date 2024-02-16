"use server";
interface SearchFilePayload {
  id?: number;
  file_id?: string;
  file_no?: string;
  applicant_name?: string;
  survey_number?: string;
  year?: number;
  aadhar?: string;
  remarks?: string;
  typeId?: number;
  villageId?: number;
  file_location?: string;
  userId?: number;
  assign?: number;
  startAt?: string;
  endAt?: string;
}

import { errorToString } from "@/utils/methods";
import prisma from "../../../prisma/database";
import { ApiResponseType } from "@/models/response";
import { file } from "@prisma/client";

const fileSearch = async (
  payload: SearchFilePayload
): Promise<ApiResponseType<file[] | null>> => {
  try {
    let files: file[];

    let data_for_search: any = {};

    if (payload.id) data_for_search.id = payload.id;
    if (payload.file_id) data_for_search.file_id = payload.file_id;
    if (payload.file_no) data_for_search.file_no = payload.file_no;
    if (payload.applicant_name)
      data_for_search.applicant_name = payload.applicant_name;
    if (payload.survey_number)
      data_for_search.survey_number = payload.survey_number;
    if (payload.year) data_for_search.year = payload.year;
    if (payload.aadhar) data_for_search.aadhar = payload.aadhar;
    if (payload.remarks) data_for_search.remarks = payload.remarks;
    if (payload.typeId) data_for_search.typeId = payload.typeId;
    if (payload.villageId) data_for_search.villageId = payload.villageId;
    if (payload.file_location)
      data_for_search.file_location = payload.file_location;
    if (payload.userId) data_for_search.userId = payload.userId;
    if (payload.assign) data_for_search.assign = payload.assign;
    if (payload.startAt) data_for_search.startAt = new Date(payload.startAt);
    if (payload.endAt) data_for_search.endAt = new Date(payload.endAt);

    files = await prisma.file.findMany({
      where: {
        AND: { ...data_for_search },
      },
      include: {
        village: true,
        type: true,
      },
    });

    if (!files)
      return {
        status: false,
        data: null,
        message: "No data found",
        functionname: "fileSearch",
      };
    return {
      status: true,
      data: files,
      message: "File data get successfully",
      functionname: "fileSearch",
    };
  } catch (e) {
    const response: ApiResponseType<null> = {
      status: false,
      data: null,
      message: errorToString(e),
      functionname: "fileSearch",
    };
    return response;
  }
};

export default fileSearch;
