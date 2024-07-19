"use server";

import { errorToString } from "@/utils/methods";
import prisma from "../../../prisma/database";
import { ApiResponseType } from "@/models/response";
import { file, file_type } from "@prisma/client";
import { number } from "valibot";

interface UpdateFilePayload {
  id: number;
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
  meta?: number;
  qc?: number;
  names?: string[];
  surveyNumbers?: string[];
  mapcount?: number;
  pagecount?: number;
  metaAt?: string;
}

const updateFile = async (
  payload: UpdateFilePayload
): Promise<ApiResponseType<file | null>> => {
  try {
    const isexist = await prisma.file.findFirst({
      where: { id: parseInt(payload.id.toString()) },
    });

    if (!isexist) {
      return {
        status: false,
        data: null,
        message: "Invalid id. Please try again.",
        functionname: "updateFile",
      };
    }
    const data_to_update: any = {};

    if (payload.file_id) data_to_update.file_id = payload.file_id;
    if (payload.file_no) data_to_update.file_no = payload.file_no;
    if (payload.applicant_name)
      data_to_update.applicant_name = payload.applicant_name;
    if (payload.survey_number)
      data_to_update.survey_number = payload.survey_number;
    if (payload.year) data_to_update.year = payload.year;
    if (payload.aadhar) data_to_update.aadhar = payload.aadhar;
    if (payload.remarks) data_to_update.remarks = payload.remarks;
    if (payload.typeId) data_to_update.typeId = payload.typeId;
    if (payload.villageId) data_to_update.villageId = payload.villageId;
    if (payload.file_location)
      data_to_update.file_location = payload.file_location;
    if (payload.userId) data_to_update.userId = payload.userId;
    if (payload.assign) data_to_update.assign = payload.assign;
    if (payload.startAt) data_to_update.startAt = new Date(payload.startAt);
    if (payload.metaAt) data_to_update.metaAt = new Date(payload.metaAt);
    if (payload.endAt) data_to_update.endAt = new Date(payload.endAt);
    if (payload.meta) data_to_update.meta = payload.meta;
    if (payload.qc) data_to_update.qc = payload.qc;
    if (payload.mapcount) data_to_update.mapcount = payload.mapcount;
    if (payload.pagecount) data_to_update.pagecount = payload.pagecount;

    const updatefile = await prisma.file.update({
      where: { id: parseInt(payload.id.toString()) },
      data: data_to_update,
    });

    if (payload.names) {
      await prisma.file_name.createMany({
        data: payload.names.map((name) => ({
          fileId: updatefile.id,
          name,
        })),
      });
    }
    if (payload.surveyNumbers) {
      await prisma.file_survey.createMany({
        data: payload.surveyNumbers.map((surveyNumber) => ({
          fileId: updatefile.id,
          survey_number: surveyNumber,
          villageId: updatefile.villageId!,
        })),
      });
    }

    if (!updatefile)
      return {
        status: false,
        data: null,
        message: "Invalid id. Please try again.",
        functionname: "updateFile",
      };

    return {
      status: true,
      data: updatefile,
      message: "File updated successfully",
      functionname: "updateFile",
    };
  } catch (e) {
    const response: ApiResponseType<null> = {
      status: false,
      data: null,
      message: errorToString(e),
      functionname: "updateFile",
    };
    return response;
  }
};

export default updateFile;
