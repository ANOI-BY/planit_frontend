import style from "@/styles/index.module.css";
import logo from "@/public/logo.png"
import { Button, Image, Input } from "@nextui-org/react";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { AuthResponse } from "@/types/auth";
import { useRouter } from "next/router";
import { parseCookies, setCookie, destroyCookie } from 'nookies'
import { ApiConfig } from "@/config/api";
import { toast, Toaster } from 'react-hot-toast';


export default function RegistrationPage() {
  const [isLoading, setLoading] = useState(false)
  const usernameRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const registration = async () => {
    setLoading(true)
    const username = usernameRef.current?.value
    const password = passwordRef.current?.value
    try{
      const response = await axios.post(
        `${ApiConfig.baseUrl}/auth/username`, {
          username: username,
          password: password
        }
      )
      const data: AuthResponse = response.data
      localStorage.setItem('accessToken', data.token)
      setCookie(null, 'accessToken', data.token)
      router.push('/profile')
    }
    catch(error){
      toast.error(
        "Неправильный логин или пароль!",
        {
          position: 'bottom-center',
          duration: 1000
        }
      )
    }
    finally{
      setLoading(false)
    }
    
  }

  

  useEffect(() => {
    if (localStorage.getItem('accessToken') != undefined){
      router.push('/profile')
    }
  })

  return (
    <div className={style.main}>
      <div className={style.block}>
        <span className="flex flex-row items-center justify-center">
          <Image
            className={style.logo}
            src={logo.src}
            alt=""
          />

          <p className={style.logo_text}>PlanIt</p>
        </span>
        <p className={style.sign_in_text}>Войдите, чтобы продолжить</p>
        <Input 
          ref={usernameRef}
          type="text" 
          label="Username" 
          variant="bordered"
          classNames={{
            input: 'text-black',
            inputWrapper: [
              'border-2',
              'border-black',
              'group-data-[focus=true]:border-black'
            ]
          }}
        />
        <Input 
          ref={passwordRef}
          type="password" 
          label="Password" 
          variant="bordered"
          classNames={{
            base: 'mt-[20px]',
            input: 'text-black',
            inputWrapper: [
              'border-2',
              'border-black',
              'group-data-[focus=true]:border-black'
            ]
          }}
        />
        <Button
          className='mt-[20px] w-full'
          isLoading={isLoading}
          onClick={registration}
        >
          Войти
        </Button>

      </div>
      <Toaster/>
    </div>
  );
}
