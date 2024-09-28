"use server";

import { errorToString } from "@/utils/methods";
import prisma from "../../../prisma/database";
import { ApiResponseType } from "@/models/response";

interface DashBoardCountPayload {}

const DashBoardCount = async (
  payload: DashBoardCountPayload
): Promise<ApiResponseType<{ [key: string]: number } | null>> => {
  try {
    const villagecout = await prisma.village.count();
    const typecout = await prisma.file_type.count();
    const filecout = await prisma.file.count();

    const totalPageCount = await prisma.file.aggregate({
      _sum: {
        pagecount: true,
      },
      where: {
        endAt: {
          not: null,
        },
        deletedAt: null,
      },
    });

    const totalMapCount = await prisma.file.aggregate({
      _sum: {
        mapcount: true,
      },
      where: {
        endAt: {
          not: null,
        },
        deletedAt: null,
      },
    });

    // const pagecount = 206739;
    const pagecount =
      (totalPageCount._sum.pagecount ?? 0) +
      (totalMapCount._sum.mapcount ?? 0) * 2;

    // const mapcount = 18328;
    const mapcount: number = totalMapCount._sum.mapcount ?? 0;

    const response = {
      village: villagecout,
      type: typecout,
      file: filecout,
      page: pagecount,
      map: mapcount,
    };

    return {
      status: true,
      data: response,
      message: "File data get successfully",
      functionname: "DashBoardCount",
    };
  } catch (e) {
    const response: ApiResponseType<null> = {
      status: false,
      data: null,
      message: errorToString(e),
      functionname: "DashBoardCount",
    };
    return response;
  }
};

export default DashBoardCount;
