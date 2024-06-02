"use client";

import GetFile from "@/actions/file/getfile";
import GetUser from "@/actions/user/getuser";
import logout from "@/actions/logout";
import { Fa6SolidArrowLeftLong } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Role, problem_file, problem_pages } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import Link from "next/link";
import getProblemPageFromFileId from "@/actions/problempage/getproblempage";
import updateStatusPage from "@/actions/problempage/updatestatuspage";
import ProblemPage from "@/actions/problempage/createupdateproblempage";
import { ApiResponseType } from "@/models/response";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { handleNumberChange } from "@/utils/methods";

interface ViewFileProps {
  id: number;
  fileid: number;
}
const ViewFile = (props: ViewFileProps) => {
  const router = useRouter();

  const [isLoading, setLoading] = useState<boolean>(true);
  const [userdata, setUserData] = useState<any | null>(null);
  const [filedata, setFileData] = useState<any>(null);

  const [problemPage, setProblemPage] = useState<any>(null);

  const pagesRef = useRef<HTMLTextAreaElement>(null);
  const mapcountRef = useRef<HTMLInputElement>(null);
  const pagecountRef = useRef<HTMLInputElement>(null);
  const [wrongFileId, setWrongFileId] = useState<boolean>(false);
  const [fileNotFount, setFileNotFound] = useState<boolean>(false);
  const [fullScan, setFullScan] = useState<boolean>(false);
  const [filter, setFilter] = useState<boolean>(false);
  const [crop, setCrop] = useState<boolean>(false);
  const [metaImproper, setMetaImproper] = useState<boolean>(false);

  const init = async () => {
    setLoading(true);

    const responseuser = await GetUser({ id: props.id });
    if (responseuser.status) {
      setUserData((val: any) => responseuser.data);
    } else {
      toast.error(responseuser.message);
    }

    const response = await GetFile({ id: props.fileid });
    if (response.status) {
      setFileData((val: any) => response.data);
    } else {
      toast.error(response.message);
    }

    const problempageresponse: ApiResponseType<problem_pages | null> =
      await getProblemPageFromFileId({
        fileid: props.fileid.toString(),
      });
    if (problempageresponse.status) {
      setProblemPage((val: any) => problempageresponse.data);

      console.log(problempageresponse.data);
      if (problempageresponse.data?.status != "COMPLETED") {
        setTimeout(() => {
          pagesRef.current!.value = problempageresponse.data?.pages ?? "";
          mapcountRef.current!.value =
            problempageresponse.data?.map_count?.toString() ?? "";
          pagecountRef.current!.value =
            problempageresponse.data?.page_count.toString() ?? "";
          setWrongFileId(problempageresponse.data?.wrong_file_id ?? false);
          setFileNotFound(problempageresponse.data?.file_not_found ?? false);
          setFullScan(problempageresponse.data?.full_rescan ?? false);
          setFilter(problempageresponse.data?.filter ?? false);
          setCrop(problempageresponse.data?.crop ?? false);
          setMetaImproper(problempageresponse.data?.meta_improper ?? false);
        }, 500);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    init();
  }, []);

  const logoutbtn = async () => {
    const response = await logout({});
    if (response.status) {
      router.push("/");
    } else {
      toast.error(response.message);
    }
  };

  const solved = async () => {
    const updatestatus = await updateStatusPage({
      status: "COMPLETED",
      id: problemPage == null ? 0 : parseInt(problemPage.id ?? "0"),
      fileid: props.fileid,
      fromUserId: props.id,
      toUserId: filedata.assignTo.id,
      map_count: parseInt(mapcountRef.current?.value! ?? "0"),
      page_count: parseInt(pagecountRef.current?.value! ?? "0"),
      wrong_file_id: wrongFileId,
      file_not_found: fileNotFount,
      full_rescan: fullScan,
      filter: filter,
      crop: crop,
      meta_improper: metaImproper,
    });
    if (updatestatus.status) {
      init();
      toast.success(updatestatus.message);
    } else {
      toast.error(updatestatus.message);
    }
  };

  const addproblem = async () => {
    const response = await ProblemPage({
      pages: pagecountRef.current?.value! ?? "",
      fileid: props.fileid.toString(),
      fromUserId: props.id,
      toUserId: filedata.assignTo.id,
      map_count: parseInt(mapcountRef.current?.value! ?? "0"),
      page_count: parseInt(pagecountRef.current?.value! ?? "0"),
      wrong_file_id: wrongFileId,
      file_not_found: fileNotFount,
      full_rescan: fullScan,
      filter: filter,
      crop: crop,
      meta_improper: metaImproper,
    });
    if (response.status) {
      toast.success(response.message);
      init();
    } else {
      toast.error(response.message);
    }
  };

  if (isLoading)
    return (
      <div className="h-screen w-full grid place-items-center text-3xl text-gray-600 bg-gray-200">
        Loading...
      </div>
    );

  return (
    <>
      <div className="min-h-screen p-2 mx-auto w-5/6">
        <Card>
          <CardHeader className="py-2 px-4 flex flex-row items-center gap-4">
            <Fa6SolidArrowLeftLong
              className="text-2xl cursor-pointer"
              onClick={() => router.back()}
            />
            <h1 className="text-xl">
              {userdata?.username}-{userdata.role}
            </h1>
            <p className="text-2xl grow text-center">PDA Scanning</p>
            <Button onClick={logoutbtn}>Logout</Button>
          </CardHeader>
        </Card>

        <Card className=" h-full p-2 mt-4 px-6">
          <div className="flex">
            <h1 className="text-center text-2xl font-medium">
              Search File Details
            </h1>
            <div className="grow"></div>
            <Link
              className="text-white bg-black py-2 px-4 rounded-md"
              target="_blank"
              href={`/file/${filedata.file_id}`}
            >
              View File
            </Link>
          </div>
          <div className="flex gap-2 items-center mt-4">
            <label htmlFor="fileid" className="w-60">
              File Id :
            </label>
            <p>{filedata.file_id}</p>
          </div>
          <div className="flex gap-2 items-center mt-4">
            <label htmlFor="fileid" className="w-60">
              File No :
            </label>
            <p>{filedata.file_no}</p>
          </div>
          <div className="flex gap-2 items-center mt-4">
            <label htmlFor="fileid" className="w-60">
              File Type :
            </label>
            <p>{filedata.type.name}</p>
          </div>
          <div className="flex gap-2 items-center mt-4">
            <label htmlFor="fileid" className="w-60">
              Scanner :
            </label>
            <p>{filedata.assignTo.username}</p>
          </div>

          {filedata.village && filedata.village.name && (
            <div className="flex gap-2 items-center mt-4">
              <label htmlFor="fileid" className="w-60">
                Village :
              </label>
              <p>{filedata.village.name}</p>
            </div>
          )}
          {filedata.applicant_name && (
            <div className="flex gap-2 items-center  mt-4">
              <label htmlFor="name" className="w-60">
                Applicant Name :
              </label>
              <p>{filedata.applicant_name}</p>
            </div>
          )}

          {filedata.applicant_address && (
            <div className="flex gap-2 items-center  mt-4">
              <label htmlFor="address" className="w-60">
                Applicant Address :
              </label>
              <p>{filedata.applicant_address}</p>
            </div>
          )}

          {filedata.survey_number && (
            <div className="flex gap-2 items-center  mt-4">
              <label htmlFor="survey" className="w-60">
                Survey Number :
              </label>
              <p>{filedata.survey_number}</p>
            </div>
          )}

          <div className="flex gap-2 items-center  mt-4">
            <label htmlFor="year" className="w-60">
              Year :
            </label>
            <p>{filedata.year}</p>
          </div>

          {filedata.aadhar && (
            <div className="flex gap-2 items-center mt-4">
              <label htmlFor="adhar" className="w-60">
                Aadhar/Pan/GST :
              </label>
              <p>{filedata.aadhar}</p>
            </div>
          )}

          {filedata.remarks && (
            <div className="flex gap-2 items-start  mt-4">
              <label htmlFor="remark" className="w-60">
                Remarks :
              </label>
              <p>{filedata.remarks}</p>
            </div>
          )}

          {filedata.verifiedAt && (
            <div className="flex gap-2 items-start  mt-4">
              <label htmlFor="remark" className="w-60">
                Verified At:
              </label>
              <p>{new Date(filedata.verifiedAt).toDateString()}</p>
            </div>
          )}

          {problemPage == null || problemPage.status != "COMPLETED" ? (
            <>
              <div className="h-10"></div>
              <Label htmlFor="problempages" className="text-sm font-normal">
                Problem Pages
              </Label>
              <Textarea
                ref={pagesRef}
                id="problempages"
                className="resize-none focus-visible:ring-transparent h-20 mt-1"
                placeholder="Type your problem page with , ex: 1,4,56,75"
              />
              <div className="flex gap-4 mt-1">
                <div className="flex-1">
                  <Label htmlFor="mapcount" className="text-sm font-normal">
                    Map Count
                  </Label>
                  <Input
                    ref={mapcountRef}
                    type="text"
                    id="mapcount"
                    name="mapcount"
                    className="px-2 py-1  focus-visible:ring-transparent h-8 placeholder:text-xs rounded-sm mt-1"
                    placeholder="Map count"
                    onChange={handleNumberChange}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="pagecount" className="text-sm font-normal">
                    Page Count
                  </Label>
                  <Input
                    ref={pagecountRef}
                    type="text"
                    id="pagecount"
                    name="pagecount"
                    className="px-2 py-1  focus-visible:ring-transparent h-8 placeholder:text-xs rounded-sm mt-1"
                    placeholder="Page count"
                    onChange={handleNumberChange}
                  />
                </div>
              </div>
              <div className="flex mt-2">
                <div className="flex flex-1 items-center gap-2 border p-2">
                  <Label htmlFor="wrongfileid" className="text-sm font-normal">
                    Wrong File Id
                  </Label>
                  <div className="grow"></div>
                  <Switch
                    id="wrongfileid"
                    onCheckedChange={(e: boolean) => {
                      setWrongFileId(e);
                    }}
                    checked={wrongFileId}
                  />
                </div>
                <div className="flex flex-1 items-center gap-2 border p-2">
                  <Label htmlFor="filenotfound" className="text-sm font-normal">
                    File Not Found
                  </Label>
                  <div className="grow"></div>

                  <Switch
                    id="filenotfound"
                    onCheckedChange={(e: boolean) => {
                      setFileNotFound(e);
                    }}
                    checked={fileNotFount}
                  />
                </div>
                <div className="flex flex-1 items-center gap-2 border p-2">
                  <Label htmlFor="fullscan" className="text-sm font-normal">
                    Full Scan
                  </Label>
                  <div className="grow"></div>

                  <Switch
                    id="fullscan"
                    onCheckedChange={(e: boolean) => {
                      setFullScan(e);
                    }}
                    checked={fullScan}
                  />
                </div>
              </div>
              <div className="flex">
                <div className="flex flex-1 items-center gap-2 border p-2">
                  <Label htmlFor="filter" className="text-sm font-normal">
                    Filter
                  </Label>
                  <div className="grow"></div>

                  <Switch
                    id="filter"
                    onCheckedChange={(e: boolean) => {
                      setFilter(e);
                    }}
                    checked={filter}
                  />
                </div>

                <div className="flex flex-1 items-center gap-2 border p-2">
                  <Label htmlFor="crop" className="text-sm font-normal">
                    Crop
                  </Label>
                  <div className="grow"></div>

                  <Switch
                    id="crop"
                    onCheckedChange={(e: boolean) => {
                      setCrop(e);
                    }}
                    checked={crop}
                  />
                </div>

                <div className="flex flex-1 items-center gap-2 border p-2">
                  <Label htmlFor="metaimproper" className="text-sm font-normal">
                    Meta Improper
                  </Label>
                  <div className="grow"></div>

                  <Switch
                    id="metaimproper"
                    onCheckedChange={(e: boolean) => {
                      setMetaImproper(e);
                    }}
                    checked={metaImproper}
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-4">
                <Button className="flex-1" onClick={addproblem}>
                  Add Problem
                </Button>
                <Button className="flex-1 bg-green-500" onClick={solved}>
                  Solved
                </Button>
              </div>
            </>
          ) : (
            <></>
          )}
        </Card>

        {userdata.role == "ENTRY" || userdata.role == "SCANNER" ? (
          <></>
        ) : (
          <div className="flex gap-4 mt-4 w-full flex-wrap">
            <Card className="p-2 min-w-60 flex-1">
              <h1 className="text-center text-xl font-semibold">Names</h1>
              {filedata.file_name.length > 0 ? (
                <div>
                  {filedata.file_name.map((val: any, index: number) => (
                    <h1 key={index}>
                      {index + 1}. {val.name}
                    </h1>
                  ))}
                </div>
              ) : (
                <h1 className="text-center mt-2">No File Name</h1>
              )}
            </Card>

            <Card className="p-2 min-w-60 flex-1">
              <h1 className="text-center text-xl font-semibold">File survey</h1>
              {filedata.file_survey.length > 0 ? (
                <div>
                  {filedata.file_survey.map((val: any, index: number) => (
                    <h1 key={index}>
                      {index + 1}. {val.survey_number}
                    </h1>
                  ))}
                </div>
              ) : (
                <h1 className="text-center mt-2">No File survey</h1>
              )}
            </Card>
          </div>
        )}
      </div>
    </>
  );
};

export default ViewFile;
