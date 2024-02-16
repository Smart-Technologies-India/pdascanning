"use client";
import GetUser from "@/actions/user/getuser";
import logout from "@/actions/logout";
import register from "@/actions/register";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
import { ApiResponseType } from "@/models/response";
import { RegisterSchema } from "@/schemas/register";
import { Role, user } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { safeParse } from "valibot";

export default function Admin() {
  const [isLoading, setLoading] = useState<boolean>(true);

  const router = useRouter();
  const username = useRef<HTMLInputElement>(null);
  const password = useRef<HTMLInputElement>(null);
  const repassword = useRef<HTMLInputElement>(null);
  const [role, setRole] = useState<string | null>(null);

  // const [userdata, setUserData] = useState<user | null>(null);

  const onSubmit = async () => {
    const result = safeParse(RegisterSchema, {
      username: username.current?.value,
      password: password.current?.value,
      repassword: repassword.current?.value,
      role: role,
    });

    if (result.success) {
      const registerrespone: ApiResponseType<user | null> = await register({
        password: result.output.password,
        username: result.output.username,
        role: role as Role,
      });
      if (registerrespone.status) {
        toast.success(registerrespone.message);
        username.current!.value = "";
        password.current!.value = "";
        repassword.current!.value = "";
      } else {
        toast.error(registerrespone.message);
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

  const init = async () => {
    setLoading(true);
    // const response = await GetUser({ id: parseInt(props.id) });
    // if (response.status) {
    //   setUserData((val) => response.data);
    // } else {
    //   toast.error(response.message);
    // }

    setLoading(false);
  };

  const logoutbtn = async () => {
    const response = await logout({});
    if (response.status) {
      router.push("/");
    } else {
      toast.error(response.message);
    }
  };

  useEffect(() => {
    init();
  }, []);

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
          {/* <CardHeader className="py-2 px-4 flex flex-row items-center">
            <h1 className="text-xl">{userdata?.username}</h1>
            <p className="text-2xl grow text-center">PDA Scanning</p>
            <Button onClick={logoutbtn}>Logout</Button>
          </CardHeader> */}
        </Card>
        <Card className="w-72 mx-auto mt-6">
          <CardHeader>
            <CardTitle className="text-center">Register</CardTitle>
            <CardDescription className="text-center">
              Register to start your sesstion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <label htmlFor="username">Username</label>
            <Input
              placeholder="username"
              id="password"
              name="password"
              ref={username}
            />
            <div className="h-4"></div>
            <label htmlFor="password">Password</label>
            <Input
              placeholder="password"
              id="password"
              name="password"
              ref={password}
            />
            <div className="h-4"></div>
            <label htmlFor="repassword">Re-Password</label>
            <Input
              placeholder="repassword"
              id="repassword"
              name="repassword"
              ref={repassword}
            />

            <div className="h-4"></div>
            <label htmlFor="role">Role</label>
            <Select
              onValueChange={(val) => {
                setRole(val);
              }}
            >
              <SelectTrigger className="">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Role</SelectLabel>
                  <SelectItem value={"ADMIN"}>ADMIN</SelectItem>
                  <SelectItem value={"ENTRY"}>ENTRY</SelectItem>
                  <SelectItem value={"SCANNER"}>SCANNER</SelectItem>
                  <SelectItem value={"QC"}>QC</SelectItem>
                  <SelectItem value={"META"}>META</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              variant={"default"}
              type="submit"
              onClick={onSubmit}
            >
              Register
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
