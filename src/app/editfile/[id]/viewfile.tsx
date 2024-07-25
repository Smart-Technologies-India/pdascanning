"use client";

import GetFile from "@/actions/file/getfile";
import GetUser from "@/actions/user/getuser";
import logout from "@/actions/logout";
import {
  Fa6SolidArrowLeftLong,
  Fa6SolidCircleMinus,
  Fa6SolidCirclePlus,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { capitalcase } from "@/utils/methods";
import { Input } from "@/components/ui/input";
import { village } from "@prisma/client";
import getVillage from "@/actions/getvillage";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import updateFile from "@/actions/file/updatefile";
import { safeParse } from "valibot";
import { UpdateFileSchema } from "@/schemas/updatefile";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ProblemPage from "@/actions/problempage/createupdateproblempage";

interface ViewFileProps {
  id: number;
  fileid: number;
}
const ViewFile = (props: ViewFileProps) => {
  const router = useRouter();

  const [isLoading, setLoading] = useState<boolean>(true);
  const [userdata, setUserData] = useState<any | null>(null);
  const [filedata, setFileData] = useState<any>(null);

  const [names, setNames] = useState<string[]>([]);
  const [surveyNumbers, setSurveyNumbers] = useState<string[]>([]);

  const [villages, setVillages] = useState<village[]>([]);

  const [village, setVillage] = useState<number>(0);
  const filenumberRef = useRef<HTMLInputElement>(null);
  const aplicantRef = useRef<HTMLInputElement>(null);
  const surveyRef = useRef<HTMLInputElement>(null);
  const remarksRef = useRef<HTMLInputElement>(null);

  //problem files start here

  const [problemPage, setProblemPage] = useState<any>(null);

  const pagesRef = useRef<HTMLTextAreaElement>(null);
  const [wrongFileId, setWrongFileId] = useState<boolean>(false);
  const [fileNotFount, setFileNotFound] = useState<boolean>(false);
  const [fullScan, setFullScan] = useState<boolean>(false);
  const [filter, setFilter] = useState<boolean>(false);
  const [crop, setCrop] = useState<boolean>(false);
  const [metaImproper, setMetaImproper] = useState<boolean>(false);

  //problem files end here

  const init = async () => {
    setLoading(true);

    const responseuser = await GetUser({ id: props.id });
    if (responseuser.status) {
      setUserData((val: any) => responseuser.data);
    } else {
      toast.error(responseuser.message);
    }

    const responsefile: any = await GetFile({ id: props.fileid });
    console.log(props.fileid);
    console.log(responsefile);
    if (responsefile.status) {
      setFileData((val: any) => responsefile.data);
      console.log(responsefile.data);

      if (responsefile.data!.village) {
        setVillage(responsefile.data!.village.id);
      }

      setTimeout(() => {
        filenumberRef.current!.value = responsefile.data!.file_no;

        if (aplicantRef.current)
          aplicantRef.current!.value = responsefile.data!.applicant_name;
        if (surveyRef.current)
          surveyRef.current!.value = responsefile.data!.survey_number;
        if (remarksRef.current)
          remarksRef.current!.value = responsefile.data!.remarks;
      }, 2000);
    } else {
      toast.error(responsefile.message);
    }

    const villages_response = await getVillage({});
    if (villages_response.status) {
      setVillages(villages_response.data!);
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

  const upatefile = async () => {
    console.log({
      file_no: filenumberRef.current!.value,
      applicant_name: aplicantRef.current!.value,
      survey_number: surveyRef.current!.value,
      remark: remarksRef.current!.value,
      villageId: village,
      names: names,
      surveyNumbers: surveyNumbers,
    });
    const result = safeParse(UpdateFileSchema, {
      file_no: filenumberRef.current!.value,
      applicant_name: aplicantRef.current!.value,
      survey_number: surveyRef.current!.value,
      remark: remarksRef.current!.value,
      villageId: village,
      names: names,
      surveyNumbers: surveyNumbers,
    });

    if (result.success) {
      const nameset = new Set(names);
      const surveyset = new Set(surveyNumbers);

      const updateresponse = await updateFile({
        id: props.fileid,
        names: Array.from(nameset),
        surveyNumbers: Array.from(surveyset),
        file_no: result.output.file_no,
        villageId: result.output.villageId,
        applicant_name: result.output.applicant_name,
        survey_number: result.output.survey_number,
        ...(remarksRef.current!.value && { remark: remarksRef.current!.value }),
      });

      if (updateresponse.status) {
        const response = await ProblemPage({
          pages: pagesRef.current?.value! ?? "",
          fileid: props.fileid.toString(),
          fromUserId: props.id,
          toUserId: filedata.assignTo.id,
          map_count: parseInt(filedata.mapcount ?? "0"),
          page_count: parseInt(filedata.pagecount ?? "0"),
          wrong_file_id: wrongFileId,
          file_not_found: fileNotFount,
          full_rescan: fullScan,
          filter: filter,
          crop: crop,
          meta_improper: metaImproper,
        });
        if (response.status) {
          toast.success(response.message);
        } else {
          toast.error(response.message);
        }
        toast.success("File updated Successfully");
        router.back();
      } else {
        toast.error(updateresponse.message);
      }
    } else {
      let errorMessage = "";
      if (result.issues[0].input) {
        errorMessage = result.issues[0].message;
      } else {
        errorMessage = result.issues[0].path![0].key + " is required";
      }
      toast.error(errorMessage);
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
            <h1 className="text-center text-2xl font-medium">Update file</h1>
            <div className="grow"></div>
          </div>
          <div className="flex gap-2 items-center mt-4">
            <label htmlFor="fileid" className="w-60">
              File Id :
            </label>
            <p>{filedata.file_id}</p>
          </div>
          <div className="flex gap-2 items-center mt-4">
            <label htmlFor="fileid" className="w-60">
              File Type :
            </label>
            <p>{filedata.type.name}</p>
          </div>

          <div className="flex gap-2 items-center  mt-4">
            <label htmlFor="year" className="w-60">
              Year :
            </label>
            <p>{filedata.year}</p>
          </div>

          <div className="flex gap-2 items-center mt-4">
            <label htmlFor="fileid" className="w-60">
              Scanner :
            </label>
            <p>{filedata.assignTo.username}</p>
          </div>

          <div className="flex gap-2 items-start  mt-4">
            <label htmlFor="remark" className="w-60">
              Scanning Start At:
            </label>
            <p>{new Date(filedata.startAt).toLocaleString()}</p>
          </div>
          <div className="flex gap-2 items-start  mt-4">
            <label htmlFor="remark" className="w-60">
              Scanning End At:
            </label>
            <p>{new Date(filedata.endAt).toLocaleString()}</p>
          </div>
          <div className="flex gap-2 items-start  mt-4">
            <label htmlFor="remark" className="w-60">
              Self Number:
            </label>
            <p>
              {filedata.physical_file_location ? (
                <>
                  {filedata.physical_file_location.shelf_number}-
                  {filedata.physical_file_location.cupboard_numer}
                </>
              ) : (
                "Not assigned"
              )}
            </p>
          </div>

          <div className="flex gap-2 items-center mt-4">
            <label htmlFor="filenumber" className="w-60">
              File No :
            </label>
            <Input
              placeholder="Enter file number"
              id="filenumber"
              name="filenumber"
              ref={filenumberRef}
            />
          </div>

          <div className="flex gap-2 items-center mt-4">
            <label htmlFor="fileid" className="w-60">
              Village :
            </label>
            <Select
              value={village.toString()}
              onValueChange={(val) => {
                setVillage(parseInt(val));
              }}
            >
              <SelectTrigger className="">
                <SelectValue placeholder="Select Village" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Village</SelectLabel>
                  {villages.map((val) => (
                    <SelectItem key={val.id} value={val.id.toString()}>
                      {val.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 items-center  mt-4">
            <label htmlFor="name" className="w-60">
              Applicant Name :
            </label>
            <Input
              placeholder="Enter applicant name"
              id="name"
              name="name"
              ref={aplicantRef}
            />
          </div>

          <div className="flex gap-2 items-center  mt-4">
            <label htmlFor="survey" className="w-60">
              Survey Number :
            </label>
            <Input
              placeholder="Enter survey number"
              id="survey"
              name="survey"
              ref={surveyRef}
            />
          </div>

          <div className="flex gap-2 items-start  mt-4">
            <label htmlFor="remark" className="w-60">
              Remarks :
            </label>
            <Input
              placeholder="Enter remark ref"
              id="remark"
              name="remark"
              ref={remarksRef}
            />
          </div>
        </Card>

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
          </>
        ) : (
          <></>
        )}

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
        <div className="flex gap-4 mt-4 w-full flex-wrap">
          <InputCard title="Name" values={names} setvalue={setNames} />
          <InputCard
            title="File survey"
            values={surveyNumbers}
            setvalue={setSurveyNumbers}
          />
        </div>
        <div className="flex">
          <Button className="grow mt-4" onClick={upatefile}>
            Update
          </Button>
        </div>
      </div>
    </>
  );
};

export default ViewFile;

interface InputCardProps {
  title: string;
  values: string[];
  setvalue: React.Dispatch<React.SetStateAction<string[]>>;
}
const InputCard = (props: InputCardProps) => {
  return (
    <Card className="p-2 min-w-60 flex-1">
      <div className="flex items-center">
        <h1 className="text-center text-xl font-medium grow">{props.title}</h1>
        <Fa6SolidCirclePlus
          className="text-xl cursor-pointer text-green-500"
          onClick={() => {
            if (props.values.length > 10) {
              toast.error("You can add only 10 names");
              return;
            }

            if (props.values[props.values.length - 1] === "") {
              toast.error("Please fill the previous name");
              return;
            }
            props.setvalue((val) => [...val, ""]);
          }}
        />
      </div>
      <div className="flex flex-col mt-4 gap-2">
        {props.values.map((val, index) => (
          <div key={index} className="flex gap-2 text-center items-center">
            <Input
              value={val}
              onChange={(e) => {
                const temp = [...props.values];

                if (props.title == "Name") {
                  temp[index] = capitalcase(e.target.value);
                } else {
                  temp[index] = e.target.value;
                }
                props.setvalue((val) => temp);
              }}
              placeholder={props.title}
            />
            <Fa6SolidCircleMinus
              className="text-2xl text-rose-500 cursor-pointer"
              onClick={() => {
                const temp = [...props.values];
                temp.splice(index, 1);
                props.setvalue((val) => temp);
              }}
            />
          </div>
        ))}
      </div>
    </Card>
  );
};
