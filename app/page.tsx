'use client'
import { TextField } from "@mui/material";
import { Eye, EyeClosed, EyeOff, User } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";


export default function Home() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)

  return (
    <>
      <div className="grid grid-cols-3 ">

        <div className="col-span-2 relative">
          <div className="absolute inset-0 bg-black/20 border-r-3 border-blue-950/50" />
          <Image
            src="/login-image-4.png"
            alt="Login Image"
            width="500"
            height="500"
            className="w-full h-screen"
            priority
          />
        </div>
        <div className="bg-[#03032c]">
          <div className="flex flex-col items-center justify-center h-screen w-full">
            <img
              src="/logo.png"
              alt="Login Image"
              className="w-50"
            />
            <h2 className="text-white/70 text-xl mt-10 font-medium">Welcome Back !</h2>
            <h3 className="text-white/70 text-md mt-2 font-light">Login to Access Your Dashboard</h3>
            <div className="space-y-2 mt-13">
              <div className="relative">
                <TextField id="outlined-basic" label="Email" autoComplete="off" variant="outlined" className="w-[20rem] " />
                <User className="absolute top-4 right-5 text-white/70" size={18} />
              </div>
              <div className="relative mt-6">
                <TextField id="outlined-basic" type={showPassword ? "text" : "password"}
                  label="Password" variant="outlined" autoComplete="off" className="w-[20rem] " />
                {
                  showPassword ?
                    <Eye onClick={() => setShowPassword(!showPassword)} className="absolute cursor-pointer top-5 right-4 text-white/70" size={18} />
                    :
                    <EyeClosed onClick={() => setShowPassword(!showPassword)} className="absolute cursor-pointer top-5 right-4 text-white/70" size={18} />
                }

              </div>
              <button className="w-full text-right text-xs text-blue-600 cursor-pointer hover:text-blue-700 transition-colors duration-300">
                Forgot Password?
              </button>
              <button onClick={() => router.push('/dashboard')} className="w-full mt-12 bg-blue-800/50 text-white text-md  py-2 rounded-xl cursor-pointer hover:bg-blue-800 transition-colors duration-300">Login</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
