"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

import { file, user, village } from "@prisma/client";
import GetUser from "@/actions/user/getuser";
import getVillage from "@/actions/getvillage";
import GetFile from "@/actions/file/getfile";
import logout from "@/actions/logout";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Fa6SolidCircleMinus, Fa6SolidCirclePlus } from "@/components/icons";
import { capitalcase } from "@/utils/methods";
import { safeParse } from "valibot";
import { AddFileSchema } from "@/schemas/adddata";
import { ApiResponseType } from "@/models/response";
import AddFile from "@/actions/file/addfile";
import updateFile from "@/actions/file/updatefile";

interface AddMetaDataProps {
  id: number;
  fileid: number;
}

const AddMetaData = (props: AddMetaDataProps) => {
  const router = useRouter();
  const [isLoading, setLoading] = useState<boolean>(true);
  const [userdata, setUserData] = useState<user | null>(null);
  const [filedata, setFiledata] = useState<any>(null);

  const [villages, setVillages] = useState<village[]>([]);

  const init = async () => {
    setLoading(true);
    const response = await GetUser({ id: props.id });
    if (response.status) {
      setUserData((val) => response.data);
    } else {
      toast.error(response.message);
    }

    const villages_response = await getVillage({});
    if (villages_response.status) {
      setVillages(villages_response.data!);
    }
    const fileresponse = await GetFile({ id: props.fileid });
    if (fileresponse.status) {
      setFiledata(fileresponse.data);
    } else {
      toast.error(fileresponse.message);
    }

    if (
      fileresponse.data?.meta == null ||
      fileresponse.data.meta == undefined
    ) {
      const filemetaadd = await updateFile({
        id: props.fileid,
        meta: props.id,
      });
      if (!filemetaadd.status) {
        router.back();
      }
    } else {
      if (fileresponse.data?.meta != props.id) {
        router.back();
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    init();
  }, []);

  const [village, setVillage] = useState<number>(0);

  const pagenumber = useRef<HTMLInputElement>(null);
  const applicant_name = useRef<HTMLInputElement>(null);
  const survey = useRef<HTMLInputElement>(null);
  const adhar = useRef<HTMLInputElement>(null);
  const remark = useRef<HTMLTextAreaElement>(null);
  const [names, setNames] = useState<string[]>([]);
  const [surveyNumbers, setSurveyNumbers] = useState<string[]>([]);

  const submit = async () => {
    const result = safeParse(AddFileSchema, {
      applicant_name: applicant_name.current!.value,
      survey_number: survey.current!.value,
      villageId: village,
      names: names,
      surveyNumbers: surveyNumbers,
    });
    if (result.success) {
      const nameset = new Set(names);
      const surveyset = new Set(surveyNumbers);

      const filesubmit: ApiResponseType<file | null> = await AddFile({
        id: props.fileid,
        applicant_name: result.output.applicant_name,
        survey_number: result.output.survey_number,
        aadhar: adhar.current!.value,
        remarks: remark.current!.value,
        villageId: result.output.villageId,
        names: Array.from(nameset),
        surveyNumbers: Array.from(surveyset),
        page: parseInt(pagenumber.current?.value ?? "0"),
        meta: props.id,
      });
      if (filesubmit.status) {
        toast.success("File Submitted Successfully");
        router.replace(`/home`);
      } else {
        toast.error(filesubmit.message);
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

  const logoutbtn = async () => {
    const response = await logout({});
    if (response.status) {
      router.push("/");
    } else {
      toast.error(response.message);
    }
  };

  type YearProps = {
    value: string;
    label: string;
  };
  const options: YearProps[] = Array.from({ length: 65 }, (_, i) => ({
    value: (i + 1960).toString(),
    label: (i + 1960).toString(),
  }));

  if (isLoading)
    return (
      <div className="h-screen w-full grid place-items-center text-3xl text-gray-600 bg-gray-200">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen p-2 mx-auto w-5/6">
      <Card>
        <CardHeader className="py-2 px-4 flex flex-row items-center">
          <h1 className="text-xl">{userdata?.username}</h1>
          <p className="text-2xl grow text-center">Land Records</p>
          <Button onClick={logoutbtn}>Logout</Button>
        </CardHeader>
      </Card>
      <Card className=" h-full p-2 mt-4 px-6">
        <h1 className="text-center text-2xl font-medium">File Details</h1>
        <div className="flex gap-2 items-center mt-4">
          <label htmlFor="fileid" className="w-60">
            File Id :
          </label>
          <p>{filedata!.file_id}</p>
        </div>
        <div className="flex gap-2 items-center mt-4">
          <label htmlFor="fileid" className="w-60">
            File No :
          </label>
          <p>{filedata!.file_no}</p>
        </div>
        <div className="flex gap-2 items-center mt-4">
          <label htmlFor="fileid" className="w-60">
            File Type :
          </label>
          <p>{filedata!.type.name}</p>
        </div>
        <div className="flex gap-2 items-center  mt-4">
          <label htmlFor="year" className="w-60">
            Year :
          </label>
          <p>{filedata!.year}</p>
        </div>
        <div className="flex gap-2 items-center mt-4">
          <label htmlFor="fileid" className="w-60">
            Village :
          </label>
          <Select
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
          <label htmlFor="applicant_name" className="w-60">
            Applicant Name :
          </label>
          <Input
            placeholder="Enter Applicant Name"
            id="applicant_name"
            name="applicant_name"
            ref={applicant_name}
          />
        </div>
        <div className="flex gap-2 items-center  mt-4">
          <label htmlFor="applicant_name" className="w-60">
            Page Number :
          </label>
          <Input
            placeholder="Enter page number"
            id="page_number"
            name="page_number"
            ref={pagenumber}
          />
        </div>
        <div className="flex gap-2 items-center  mt-4">
          <label htmlFor="Enter Details" className="w-60">
            Survey Number :
          </label>
          <Input placeholder="survey" id="survey" name="survey" ref={survey} />
        </div>

        <div className="flex gap-2 items-center mt-4">
          <label htmlFor="adhar" className="w-60">
            Aadhar/Pan/GST :
          </label>
          <Input
            placeholder="Enter Details"
            id="adhar"
            name="adhar"
            ref={adhar}
          />
        </div>
        <div className="flex gap-2 items-start  mt-4">
          <label htmlFor="remark" className="w-60">
            Remarks :
          </label>
          <Textarea
            placeholder="Enter Details"
            id="remark"
            name="remark"
            className="h-24 resize-none"
            ref={remark}
          />
        </div>
      </Card>
      <div className="flex gap-4 mt-4 w-full flex-wrap">
        <InputCard title="Name" values={names} setvalue={setNames} />
        <InputCard
          title="Survey Numbers"
          values={surveyNumbers}
          setvalue={setSurveyNumbers}
        />
      </div>
      <Button className="w-full mt-4" onClick={submit}>
        Submit
      </Button>
    </div>
  );
};

export default AddMetaData;

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
