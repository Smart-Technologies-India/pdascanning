"use server";
interface GetScannerPayload {}

import { errorToString } from "@/utils/methods";
import prisma from "../../../prisma/database";
import { ApiResponseType } from "@/models/response";
import { user } from "@prisma/client";

const GetScanners = async (
  payload: GetScannerPayload
): Promise<ApiResponseType<user[] | null>> => {
  try {
    const user = await prisma.user.findMany({
      where: { role: "SCANNER", status: "ACTIVE" },
    });

    if (!user)
      return {
        status: false,
        data: null,
        message: "No Scanners found. Please try again.",
        functionname: "GetScanners",
      };

    return {
      status: true,
      data: user,
      message: "Scanners data get successfully",
      functionname: "GetScanners",
    };
  } catch (e) {
    const response: ApiResponseType<null> = {
      status: false,
      data: null,
      message: errorToString(e),
      functionname: "GetScanners",
    };
    return response;
  }
};

export default GetScanners;
