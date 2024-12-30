/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { default as MulSelect } from "react-select";

import {
  file,
  file_type,
  physical_file_location,
  user,
  village,
} from "@prisma/client";
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
import {
  Fa6SolidArrowLeftLong,
  Fa6SolidCircleMinus,
  Fa6SolidCirclePlus,
} from "@/components/icons";
import { capitalcase } from "@/utils/methods";
import { safeParse } from "valibot";
import { AddFileSchema } from "@/schemas/adddata";
import { ApiResponseType } from "@/models/response";
import AddFile from "@/actions/file/addfile";
import updateFile from "@/actions/file/updatefile";
import Link from "next/link";
import GetAllCupboardNumber from "@/actions/location/getalllocation";
import GetCupboardNumber from "@/actions/location/getlocation";
import getFileType from "@/actions/getfiletype";

interface AddMetaDataProps {
  id: number;
  fileid: number;
}

const AddMetaData = (props: AddMetaDataProps) => {
  const router = useRouter();
  const [fileTypes, setFileTypes] = useState<file_type[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [userdata, setUserData] = useState<user | null>(null);
  const [filedata, setFiledata] = useState<any>(null);

  const [villages, setVillages] = useState<village[]>([]);

  const [cupboard_number, setCupboardNumber] = useState<
    physical_file_location[]
  >([]);
  const [shelf_number, setShelfNumber] = useState<physical_file_location[]>([]);

  const [locationId, setLocationid] = useState<number>(0);
  const [cupboardnumber, setcupboardnumber] = useState<string | null>(null);
  const [shelfnumber, setshelfnumber] = useState<string | null>(null);
  const [shelf_location, setShelfLocation] = useState<string | null>(null);

  const init = async () => {
    setLoading(true);

    const file_location = await GetCupboardNumber({});
    if (file_location.status) {
      setCupboardNumber(file_location.data!);
    }

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
    const file_type_response = await getFileType({});
    if (file_type_response.status) {
      setFileTypes(file_type_response.data!);
    }

    setLoading(false);
  };

  useEffect(() => {
    init();
  }, []);

  const [village, setVillage] = useState<number>(0);

  const [year, setYear] = useState<string>("2000");
  const [fileType, setFileType] = useState<number>(0);
  const file_no = useRef<HTMLInputElement>(null);

  const applicant_name = useRef<HTMLInputElement>(null);
  const survey = useRef<HTMLInputElement>(null);
  const adhar = useRef<HTMLInputElement>(null);
  const remark = useRef<HTMLTextAreaElement>(null);
  const [names, setNames] = useState<string[]>([]);
  const [surveyNumbers, setSurveyNumbers] = useState<string[]>([]);

  const submit = async () => {
    if (cupboardnumber === null || shelfnumber === null) {
      toast.error("Please select location");
      return;
    }

    const result = safeParse(AddFileSchema, {
      applicant_name: applicant_name.current!.value.trim(),
      survey_number: survey.current!.value.trim(),
      villageId: village,
      names: names,
      surveyNumbers: surveyNumbers,
      file_no: file_no.current!.value.trim(),
      year: parseInt(year),
      typeId: fileType,
    });
    if (result.success) {
      const nameset = new Set(names);
      const surveyset = new Set(surveyNumbers);

      const filesubmit: ApiResponseType<file | null> = await AddFile({
        id: props.fileid,
        applicant_name: result.output.applicant_name,
        survey_number: result.output.survey_number,
        aadhar: adhar.current!.value.trim(),
        remarks: remark.current!.value.trim(),
        villageId: result.output.villageId,
        names: Array.from(nameset),
        surveyNumbers: Array.from(surveyset),
        meta: props.id,
        location: locationId,
        file_no: result.output.file_no,
        typeId: result.output.typeId,
        year: result.output.year,
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
          <Fa6SolidArrowLeftLong
            className="text-2xl cursor-pointer"
            onClick={() => router.back()}
          />
          <div className="w-10"></div>
          <h1 className="text-xl">
            {userdata?.username}-{userdata?.role}
          </h1>
          <p className="text-2xl grow text-center">PDA Scanning</p>
          <Button onClick={logoutbtn}>Logout</Button>
        </CardHeader>
      </Card>
      <Card className=" h-full p-2 mt-4 px-6">
        <div className="flex">
          <h1 className="text-center text-2xl font-medium">File Details</h1>
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
          <p>{filedata!.file_id}</p>
        </div>
        <div className="flex gap-2 items-center mt-4">
          <label htmlFor="fileid" className="w-60">
            File No :
          </label>
          <Input
            placeholder="Enter File No"
            id="fileno"
            name="fileno"
            ref={file_no}
          />
        </div>
        <div className="flex gap-2 items-center mt-4">
          <label htmlFor="fileid" className="w-60">
            File Type :
          </label>
          <Select
            onValueChange={(val) => {
              setFileType(parseInt(val));
            }}
          >
            <SelectTrigger className="">
              <SelectValue placeholder="Select File Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>File Type</SelectLabel>
                {fileTypes.map((val) => (
                  <SelectItem key={val.id} value={val.id.toString()}>
                    {val.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 items-center  mt-4">
          <label htmlFor="year" className="w-60">
            Year :
          </label>
          <MulSelect
            isMulti={false}
            options={options}
            className="w-full accent-slate-900"
            onChange={(val) => {
              if (!val) return;
              setYear(val.value);
            }}
          />
        </div>
        {/* <div className="flex gap-2 items-center mt-4">
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
        </div> */}
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
          <label htmlFor="applicant_name" className="w-60 ">
            Cupboard Number :
          </label>
          <div className="flex-1">
            <Select
              onValueChange={async (val) => {
                if (val === null) return;
                setcupboardnumber(val);
                setshelfnumber(null);
                setShelfLocation(null);

                const alllocation = await GetAllCupboardNumber({});

                if (alllocation.status) {
                  const shelf_number = alllocation.data?.filter(
                    (value) =>
                      value.cupboard_numer?.toString() == val.toString()
                  );
                  setShelfNumber(shelf_number!);
                }
              }}
            >
              <SelectTrigger className="">
                <SelectValue placeholder="Select Cupboard Number" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Cupboard Number</SelectLabel>

                  {cupboard_number.map((val) => (
                    <SelectItem
                      key={val.id}
                      value={val.cupboard_numer!.toString()}
                    >
                      {val.cupboard_numer}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {cupboardnumber !== null && (
            <div className="flex-1">
              <Select
                onValueChange={async (val) => {
                  if (val === null) return;
                  setshelfnumber(val);
                  const shelf_location = shelf_number.filter(
                    (value) =>
                      value.shelf_number?.toString() == val.toString() &&
                      value.cupboard_numer?.toString() == cupboardnumber
                  );
                  setShelfLocation(shelf_location[0].shelf_location);
                  setLocationid(shelf_location[0].id);
                }}
              >
                <SelectTrigger className="">
                  <SelectValue placeholder="Select Shelf Number" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Shelf Number</SelectLabel>
                    {shelf_number.map((val) => (
                      <SelectItem
                        key={val.id}
                        value={val.shelf_number!.toString()}
                      >
                        {val.shelf_number}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex-1">
            {shelf_location && (
              <div>
                <p className="text-sm font-normal text-left">
                  Shelf Location: {shelf_location}
                </p>
              </div>
            )}
          </div>
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
